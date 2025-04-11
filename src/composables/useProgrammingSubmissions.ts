// useSubmissions.ts
import { ref } from 'vue';
import type { ProgrammingSubmission, ProgrammingSubmissionStat } from '@/types/ProgrammingSubmission';
import { programmingSubmissionService } from '@/services/programmingSubmissionService';

export function useProgrammingSubmissions(useMock: boolean = false) {
  const submissions = ref<ProgrammingSubmissionStat[]>([]);
  const submissionDetails = ref<Record<string, ProgrammingSubmission>>({});
  const pollingTimers = new Map<string, number>();

  const fetchSubmissionStats = async (programmingExerciseId: string) => {
    if (useMock) {
      console.log(submissions);
      submissions.value = [
        {
          id: 'mock-1',
          user_id: 'u1',
          exercise_id: 'ex1',
          judge0_language_id: 63,
          status: 'completed',
          passed_testcases: 2,
          total_testcases: 2
        }
      ];
      return;
    }
    const res = await programmingSubmissionService.getSubmissionsOfACodeExercise(programmingExerciseId);
    console.log(res);

    if (res.data != null) {
      console.log(res.data);
      submissions.value = res.data;
    }
  };

  const fetchSubmissionDetail = async (id: string) => {
    if (useMock) {
      submissionDetails.value[id] = {
        id: 'mock-1',
        user_id: 'u1',
        exercise_id: 'ex1',
        judge0_language_id: 63,
        status: 'completed',
        code: 'console.log("hello world")',
        score: 100,
        test_results: [
          {
            id: 't1',
            submission_id: 'mock-1',
            testcase_id: 'tc1',
            judge0_token: 'abc123',
            status: 'Accepted',
            stdout: 'Hello',
            stderr: null,
            time: 0.1,
            memory: 1000,
            testcase: {
              input: 'input 1',
              expected_output: 'Hello',
              is_public: true,
            },
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      };
      return submissionDetails.value[id];
    }

    const res = await programmingSubmissionService.getSubmissionDetails(id);
    return res.data;
  };

  const submitCodeWithPolling = async (
    programmingExerciseID: string,
    judge0LangID: number,
    code: string,
    {
      onComplete,
      onError,
      pollingInterval = 3000
    }: {
      onComplete: (submission: ProgrammingSubmission) => void;
      onError?: (err: any) => void;
      pollingInterval?: number;
    }
  ) => {
    try {
      const res = await programmingSubmissionService.createProgrammingSubmission(
        programmingExerciseID,
        judge0LangID,
        code
      );

      const { id, status } = res.data;

    const finalizeSubmission = async () => {
      const detailResponse = await programmingSubmissionService.getSubmissionDetails(id);
      const statResponse = await programmingSubmissionService.getSubmissionStat(id);

      const newSubmission = detailResponse.data;
      const newStat = statResponse.data;

      const alreadyExists = submissions.value.some(s => s.id === newStat.id);
      if (!alreadyExists) {
        submissions.value.unshift(newStat);
      }

      onComplete(newSubmission);
    };

      if (status === 'pending') {
        const poll = async () => {
          try {
            const statusRes = await programmingSubmissionService.getSubmissionStatus(id);
            const currentStatus = statusRes.data;

            if (currentStatus === 'completed' || currentStatus === 'failed') {
              await finalizeSubmission();
            } else {
              const timer = setTimeout(poll, pollingInterval);
              pollingTimers.set(id, timer);
            }
          } catch (pollErr) {
            console.error("Polling error:", pollErr);
            onError?.(pollErr);
          }
        };

        poll();
      } else {
        await finalizeSubmission();
      }

    } catch (err) {
      console.error("Submission error:", err);
      onError?.(err);
    }
  };


  const pollSubmissionStatus = async (id: string, interval = 3000) => {
    if (pollingTimers.has(id)) return; // already polling

    const poll = async () => {
      const detail = await fetchSubmissionDetail(id);

      if (detail && detail.status === 'completed') {
        clearTimeout(pollingTimers.get(id));
        pollingTimers.delete(id);
        return;
      }

      const timer = setTimeout(poll, interval);
      pollingTimers.set(id, timer);
    };

    poll();
  };

  onUnmounted(() => {
    // Clean up all polling on unmount
    pollingTimers.forEach(timer => clearTimeout(timer));
    pollingTimers.clear();
  });

  return {
    submissions,
    fetchSubmissionStats,
    fetchSubmissionDetail,
    submitCodeWithPolling
  };
}

