import { defineStore } from "pinia";
import { GeneratedCodeExerciseBrief } from "@/types/CodingExercise";
import { CodeExerciseService } from "@/services/CodeExerciseService";

export const useGeneratedCodeExerciseStore = defineStore("generatedCodeExercise", {
  state: () => ({
    exercises: [] as GeneratedCodeExerciseBrief[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async loadExercises(moduleId: string, lessonId: string) {
      this.loading = true;
      try {
        const response = await CodeExerciseService.getListGeneratedCodeExercisesBrief(moduleId, {showError: () => {}, showSuccess: () => {}});
        this.exercises = response.data || [];
      } catch (err) {
        this.error = "Failed to fetch exercises";
      } finally {
        this.loading = false;
      }
    },
    async generateExercise(moduleId: string) {
      this.loading = true;
      try {
        const response = await CodeExerciseService.generateCodeExercise(moduleId, {showError: () => {}, showSuccess: () => {}});
        if (response.data) {
          this.exercises.push(response.data);
        }
      } catch (err) {
        this.error = "Failed to generate exercise";
      } finally {
        this.loading = false;
      }
    },
  },
});

