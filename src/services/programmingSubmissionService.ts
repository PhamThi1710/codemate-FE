import ApiService from "@/common/api.service";
import { IResponseData } from "@/modals/apis/response";
import { ProgrammingSubmission, ProgrammingSubmissionCreateResponse, ProgrammingSubmissionStat } from "@/types/ProgrammingSubmission";

export const programmingSubmissionService = {
    async getSubmissionsOfACodeExercise(
        exerciseID: string
    ) {
        return await ApiService.query<IResponseData<ProgrammingSubmissionStat[]>>(
            `/programming-submissions?exercise_id=${exerciseID}`
        );
    },

    async getSubmissionStat(
      submissionID: string
    ) {

        const response = await ApiService.get<IResponseData<ProgrammingSubmissionStat>>(
            `/programming-submissions/${submissionID}/stat`
        );
        console.log("Submission Stat: ", response.data);
        return response;
    },

    async getSubmissionDetails(
        submissionID: string
    ) {
        const response = await ApiService.get<IResponseData<ProgrammingSubmission>>(
            `/programming-submissions/${submissionID}`
        );

        console.log("Submission Details: ", response.data);
        return response;
    },

    async createProgrammingSubmission(
      programmingExerciseID: string,
      judge0LangID: number,
      code: string
    ) {
        const response = await ApiService.post<IResponseData<ProgrammingSubmissionCreateResponse>>(
          `/exercises/${programmingExerciseID}/programming-submissions`,
          {
            judge0_language_id: judge0LangID,
            code: code
          },
        );

        console.log("Programming Submission Created: ", response.data);
        return response;
    },

    async getSubmissionStatus(submissionID: string) {
      // Used for polling submission status.
      // status can be pending | completed | failed
      const response = await ApiService.get<IResponseData<string>>(
        `/programming-submissions/${submissionID}/status`
      );

      console.log("Submission Status: ", response.data);
      return response;
    }
};
