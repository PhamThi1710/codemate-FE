import ApiService from "@/common/api.service";
import { AuthConfig } from "@/services/authenServices";
// import { IResponseData } from "@/modals/apis/response";
import {
  GetProfessorCoursesPaginatedResponse,
  GetCourseDetailProfessorResponse,
  ProfessorInformation,
  PutLearningOutcomesCoursesResponse,
} from "@/types/Course";
import { ExerciseCodeResponse, ExerciseQuizResponse, ExerciseQuizRequest } from "@/types/Exercise";
export const coursesService = {
  async fetchCoursesList({ showError, showSuccess, search_query }: AuthConfig & { search_query?: string }) {
    return await ApiService.query<GetProfessorCoursesPaginatedResponse>(
      "professors/courses",
      search_query ? { search_query } : undefined,
      { showError, showSuccess }
    );
  },
  async fetchCourseDetail(
    { showError, showSuccess }: AuthConfig,
    course_id: string
  ) {
    return await ApiService.get<GetCourseDetailProfessorResponse>(
      `professors/courses/${course_id}`,
      "",
      { showError, showSuccess }
    );
  },
  async getProfessorForCourse(
    { showError, showSuccess }: AuthConfig,
    course_id: string
  ) {
    return await ApiService.get<ProfessorInformation>(
      `courses/${course_id}/professor`,
      "",
      { showError, showSuccess }
    );
  },
  async putLearningOutcomesCourse(
    { showError, showSuccess }: AuthConfig,
    course_id: string,
    payload: PutLearningOutcomesCoursesResponse
  ) {
    return await ApiService.put<PutLearningOutcomesCoursesResponse>(
      `professors/courses/${course_id}/learning_outcomes`,
      payload,
      { showError, showSuccess }
    );
  },

  async postExerciseQuiz(
    { showError, showSuccess }: AuthConfig,
    payload: ExerciseQuizResponse
  ) {
    return await ApiService.post<ExerciseQuizResponse>(
      `exercises/quizzes`,
      payload,
      { showError, showSuccess }
    );
  },
  async editExerciseQuiz(
    { showError, showSuccess }: AuthConfig,
    exercise_id: string,
    payload: ExerciseQuizRequest
  ) {
    return await ApiService.put<ExerciseQuizResponse>(
      `exercises/${exercise_id}/quizzes`,
      payload,
      { showError, showSuccess }
    );
  },
  async postExerciseCode(
    { showError, showSuccess }: AuthConfig,
    payload: ExerciseCodeResponse
  ) {
    return await ApiService.post<ExerciseCodeResponse>(
      `exercises/code`,
      payload,
      { showError, showSuccess }
    );
  }
};
