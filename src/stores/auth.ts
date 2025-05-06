import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import ApiService from '@/common/api.service'

// Define UserInfo interface
interface UserInfo {
  role: string
  email: string
  name: string
  avatar?: string
  ms?: string
  rememberMe: string
}

// Define AuthStore interface
interface AuthStore {
  user: UserInfo | null
  isAuthenticated: boolean
  setUser: (userInfo: UserInfo) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  checkAuth: () => void
  setAvatar: (avatar: string) => void
  setMs: (ms: string) => void
  updateUserInfo: (updates: Partial<UserInfo>) => void
}

// Create auth store with improved type safety and error handling
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (userInfo: UserInfo) => {
        const storage = userInfo.rememberMe === 'true' 
          ? localStorage 
          : sessionStorage;
        
        try {
          storage.setItem('user', JSON.stringify(userInfo));
          localStorage.setItem('rememberMe', userInfo.rememberMe);

          set({
            user: userInfo,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Error setting user:', error);
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        try {
          const rememberMe = get().user?.rememberMe === 'true';
          ApiService.setTokens(accessToken, refreshToken);
          localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        } catch (error) {
          console.error('Error setting tokens:', error);
        }
      },

      logout: () => {
        try {
          set({
            user: null,
            isAuthenticated: false
          });
          ApiService.clearAuthData();
          localStorage.removeItem('user');
          sessionStorage.clear();
          window.location.href = '/login';
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },

      checkAuth: () => {
        try {
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const userJson = rememberMe 
            ? localStorage.getItem('user') 
            : sessionStorage.getItem('user');

          if (userJson) {
            const user: UserInfo = JSON.parse(userJson);
            set({
              user,
              isAuthenticated: true
            });
          } else {
            set({
              user: null,
              isAuthenticated: false
            });
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          set({
            user: null,
            isAuthenticated: false
          });
        }
      },

      setAvatar: (avatar: string) => {
        const user = get().user;
        if (user) {
          const updatedUser = {
            ...user,
            avatar
          };
          
          const rememberMe = user.rememberMe === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));
          
          set({
            user: updatedUser
          });
        }
      },

      setMs: (ms: string) => {
        const user = get().user;
        if (user) {
          const updatedUser = {
            ...user,
            ms
          };
          
          const rememberMe = user.rememberMe === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));
          
          set({
            user: updatedUser
          });
        }
      },
      
      // New method to update user info fields
      updateUserInfo: (updates: Partial<UserInfo>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...updates
          };
          
          const rememberMe = currentUser.rememberMe === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));
          
          set({
            user: updatedUser
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);