import router from "@/router";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { IResponseData } from "@/modals/apis/response";

/**
 * Interface for custom API response structure
 */
function isInternalResponse<T>(response: any): response is IResponseData<T> {
  return (
    response &&
    typeof response === "object" &&
    "isSuccess" in response &&
    "message" in response &&
    "data" in response
  );
}

/**
 * Public routes that do not require authentication
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/",
  "/forgot-password",
  "/reset-password",
];

/**
 * Custom error class for API-related errors
 * Extends standard Error with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly errorCode?: number,
    public readonly messageCode?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Extended configuration for API calls
 * Includes optional error/success handling and custom response parsing
 */
export interface ApiCallConfig extends AxiosRequestConfig {
  showError?: (message: string) => void;
  showSuccess?: (message: string) => void;
  parseResponse?: (response: AxiosResponse) => any;
}

class ApiServiceClass {
  /**
   * Token refresh management
   */
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  /**
   * Process queued requests after token refresh
   * @param error - Error during token refresh
   * @param token - New access token
   */
  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Initialize API service
   * Set base URL and configure request/response interceptors
   */
  init(): void {
    axios.defaults.baseURL = import.meta.env.VITE_APP_V1_API_URL;
    this.setupInterceptors();
  }

  /**
   * Configure axios request and response interceptors
   * Handles token injection, refresh, and error management
   */
  private setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();

        if (token && !this.isPublicRoute(config.url || "")) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 errors and token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || "";

        // Handle unauthorized errors for protected routes
        if (!this.isPublicRoute(url) && error.response?.status === 401) {
          // Skip token refresh if we're already trying to refresh the token
          // This prevents infinite loops when the refresh token itself is invalid
          if (url === "/auth/refresh-token") {
            this.clearAuthData();
            if (router.currentRoute.value.path !== "/") {
              router.push("/");
            }
            return Promise.reject(error);
          }

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const refreshed = await this.refreshToken();
              if (refreshed) {
                this.processQueue(null, this.getToken());
                return axios(originalRequest);
              } else {
                // Clear tokens and redirect if refresh fails
                this.processQueue(new Error("Refresh failed"));
                this.clearAuthData();
                if (router.currentRoute.value.path !== "/") {
                  router.push("/");
                }
              }
            } catch (refreshError) {
              this.processQueue(new Error("Refresh failed"));
              this.clearAuthData();
              if (router.currentRoute.value.path !== "/") {
                router.push("/");
              }
            } finally {
              this.isRefreshing = false;
            }
            return Promise.reject(error);
          }

          // Queue additional requests during refresh
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => axios(originalRequest))
            .catch(() => {
              // If refresh ultimately fails, ensure redirect happens
              if (router.currentRoute.value.path !== "/") {
                router.push("/");
              }
              return Promise.reject(error);
            });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic request method with error handling
   * @param method - HTTP method
   * @param url - Request URL
   * @param config - Request configuration
   */
  private async request<T>(
    method: string,
    url: string,
    config: ApiCallConfig = {}
  ): Promise<T> {
    const { showError, showSuccess, parseResponse, ...axiosConfig } = config;

    try {
      const response = await axios({
        method,
        url,
        ...axiosConfig,
      });

      // Custom response parsing
      const responseData = parseResponse
        ? parseResponse(response)
        : response.data;

      // Handle internal response format
      if (isInternalResponse<T>(responseData)) {
        if (!responseData.isSuccess) {
          throw new ApiError(
            responseData.message,
            responseData.errorCode,
            responseData.messageCode
          );
        }

        // Optional success notification
        // if (showSuccess) {
        //   showSuccess(responseData.message || "Operation successful");
        // }

        return responseData as T;
      }

      return responseData;
    } catch (error) {
      const apiError = this.handleRequestError(error);

      // Optional error notification
      // if (showError) {
      //   showError(apiError.message);
      // }
      throw apiError;
    }
  }

  /**
   * Standardize error handling across different error types
   * @param error - Original error object
   */
  private handleRequestError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof AxiosError) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (isInternalResponse(responseData)) {
          return new ApiError(
            responseData.message || "Request failed",
            responseData.errorCode,
            responseData.messageCode,
            error
          );
        }
        return new ApiError(
          typeof responseData === "string"
            ? responseData
            : JSON.stringify(responseData),
          error.response.status,
          undefined,
          error
        );
      }
      return new ApiError(
        error.message || "Network error",
        error.response?.status,
        undefined,
        error
      );
    }

    return new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      undefined,
      undefined,
      error
    );
  }

  /**
   * Check if route is public
   */
  isPublicRoute(url: string): boolean {
    return url in PUBLIC_ROUTES;
  }

  /**
   * Retrieve token from appropriate storage
   */
  getToken(): string | null {
    try {

      const localToken = localStorage.getItem("access_token");
      const sessionToken = sessionStorage.getItem("access_token");

      const rememberMe = localStorage.getItem("rememberMe") === "true";
      return rememberMe ? localToken : sessionToken;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    const storage =
      localStorage.getItem("rememberMe") === "true"
        ? localStorage
        : sessionStorage;
    return storage.getItem("refresh_token");
  }

  setTokens(accessToken: string, refreshToken: string): void {
    const storage =
      localStorage.getItem("rememberMe") === "true"
        ? localStorage
        : sessionStorage;
    storage.setItem("access_token", accessToken);
    storage.setItem("refresh_token", refreshToken);
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await this.request<IResponseData<{
        access_token: string
        name: string
        email: string
        is_email_verified: boolean
        role: string
      }> | null>(
        "POST",
        "/auth/refresh-token",
        { data: { refresh_token: refreshToken } }
      );
      if (response && "data" in response) {
        if (response.data?.access_token)
          this.setTokens(response.data?.access_token, refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  checkTokenExpiration(): boolean {
    const token = this.getToken()
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp;

      return Date.now() / 1000 >= expirationTime;
    } catch {
      return true;
    }
  }

  clearAuthData(): void {
    [localStorage, sessionStorage].forEach((storage) => {
      ["access_token", "refresh_token", "role", "rememberMe", "user"].forEach((key) => {
        storage.removeItem(key);
      });
    });
  }

  handleTokenExpiration(): void {
    if (router.currentRoute.value.path !== "/login") {
      sessionStorage.setItem("redirectUrl", router.currentRoute.value.fullPath);
      this.clearAuthData();
      alert("Your session has expired. Please log in again.");
      router.push("/login");
    }
  }

  query<T>(
    resource: string,
    params?: object,
    config?: ApiCallConfig
  ): Promise<T> {
    let queryString = "";
    if (params) {
      queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
    }
    const fullUrl = queryString ? `${resource}?${queryString}` : resource;
    return this.request<T>("GET", fullUrl, { ...config });
  }

  get<T>(resource: string, slug = "", config?: ApiCallConfig): Promise<T> {
    return this.request<T>("GET", `${resource}/${slug}`, config);
  }

  post<T>(resource: string, data: object, config?: ApiCallConfig): Promise<T> {
    return this.request<T>("POST", resource, { ...config, data });
  }

  update<T>(
    resource: string,
    slug: string,
    data: object,
    config?: ApiCallConfig
  ): Promise<T> {
    return this.request<T>("PATCH", `${resource}/${slug}`, { ...config, data });
  }

  put<T>(resource: string, data: object, config?: ApiCallConfig): Promise<T> {
    return this.request<T>("PUT", resource, { ...config, data });
  }

  delete<T>(resource: string, config?: ApiCallConfig): Promise<T> {
    return this.request<T>("DELETE", resource, config);
  }
}

const ApiService = new ApiServiceClass();
export default ApiService;

let expirationTimer: number;

export const startExpirationTimer = () => {
  clearInterval(expirationTimer);

  if (!ApiService.isPublicRoute(router.currentRoute.value.path)) {
    expirationTimer = window.setInterval(() => {
      if (ApiService.checkTokenExpiration()) {
        ApiService.refreshToken().catch(() => {
          ApiService.handleTokenExpiration();
        });
      }
    }, 60000);
  }
};

export const manageExpirationTimer = () => {
  if (ApiService.isPublicRoute(router.currentRoute.value.path)) {
    clearInterval(expirationTimer);
  } else {
    startExpirationTimer();
  }
};

export const clearExpirationTimer = () => {
  clearInterval(expirationTimer);
};

export async function streamFromApi(
  url: string,
  onChunk: (chunk: string) => void,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE"; // Extend as needed
    body?: Record<string, any>;
    headers?: Record<string, string>;
  }
): Promise<void> {
  const {
    method = "GET",
    body,
    headers = {},
  } = options || {};

  const token = ApiService.getToken();

  if (body) {
    console.log("content:", body.content);
  }

  const response = await fetch(import.meta.env.VITE_APP_V1_API_URL + url, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "text/event-stream",
      "Content-Type": body ? "application/json" : "",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (err) {
    console.error("Error while reading stream:", err);
    throw err;
  } finally {
    reader.releaseLock();
  }
}

