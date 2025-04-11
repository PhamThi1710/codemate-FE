<template>
  <v-container fluid class="px-12" v-if="moduleQuizzes">
    <!-- Breadcrumbs -->
    <v-breadcrumbs
      class="ma-0 pa-0 mb-4"
      :items="breadcrumbs"
      divider="/"
    ></v-breadcrumbs>

    <!-- Main Header Card -->
    <v-card class="border-card mb-6 overflow-hidden" elevation="3">
      <div class="card-header pa-6 d-flex align-center">
        <v-icon color="primary" size="x-large" class="mr-4"
          >mdi-book-education-outline</v-icon
        >
        <div>
          <h2 class="text-h5 font-weight-bold">{{ moduleQuizzes.title }}</h2>
          <p class="text-subtitle-2 text-medium-emphasis mb-0">
            {{ moduleQuizzes.quizzes.length }} quizzes to complete
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-chip
          class="px-4 py-2"
          color="primary"
          prepend-icon="mdi-school"
          elevation="1"
        >
          Quiz
        </v-chip>
      </div>

      <v-card-text class="px-6 pt-4 pb-6">
        <v-row>
          <v-col cols="6">
            <!-- Introduction Section -->
            <div class="mb-6">
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2"
                  >mdi-lightbulb-outline</v-icon
                >
                <h3 class="text-subtitle-1 font-weight-bold mb-0">
                  Introduction
                </h3>
              </div>
              <v-sheet
                rounded="lg"
                elevation="0"
                class="pa-4 bg-grey-lighten-4 border-left-primary"
              >
                <p class="text-body-1 mb-2">
                  Welcome to the
                  <span class="text-error font-weight-bold"
                    >'{{ moduleQuizzes.title }}'</span
                  >
                  module!
                </p>
                <p class="text-body-1 mb-2">
                  This module uses interactive quizzes to help you test your
                  knowledge. Work through each quiz at your own speed, and check
                  your answers along the way.
                </p>
                <p class="text-body-1 mb-0">
                  You can retake any quiz for better understanding.
                </p>
              </v-sheet>
            </div>
          </v-col>

          <!-- Learning Outcomes Section -->
          <v-col cols="6">
            <div class="d-flex align-center mb-2">
              <v-icon color="error" class="mr-2"
                >mdi-certificate-outline</v-icon
              >
              <h3 class="text-subtitle-1 font-weight-bold mb-0 text-error">
                Learning Outcomes
              </h3>
            </div>
            <v-sheet
              rounded="lg"
              elevation="1"
              class="pa-4 bg-error-lighten-5 border-left-error learning-outcomes-sheet"
            >
              <v-list density="compact" class="bg-transparent pa-0">
                <v-list-item
                  v-for="(outcome, index) in moduleQuizzes.objectives"
                  :key="index"
                  prepend-icon="mdi-check-circle"
                  class="px-0 py-1"
                  :class="{
                    'mb-2': index !== moduleQuizzes.objectives.length - 1,
                  }"
                >
                  <v-list-item-title
                    class="text-body-1 learning-outcome-text"
                    >{{ outcome }}</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <ReadingMaterial :module-id="moduleId" />
    <!-- Quizzes Section -->
    <div class="mb-4 d-flex align-center">
      <v-icon color="primary" size="large" class="mr-2"
        >mdi-help-circle-outline</v-icon
      >
      <h2 class="text-h5 font-weight-bold mb-0">Quizzes</h2>
      <v-spacer></v-spacer>
      <v-btn
        @click="generateQuiz"
        color="primary"
        :loading="isLoading"
        :disabled="isLoading"
      >
        {{ isLoading ? "Generating..." : "Generate New Quiz" }}
      </v-btn>
      <QuizGenerationModal
        ref="quizGenerationModalRef"
        :module-id="moduleId"
        :lesson-id="lessonId"
        @quiz-generated="handleQuizGenerated"
      />
    </div>

    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(quiz, index) in moduleQuizzes.quizzes"
        :key="quiz.id"
      >
        <v-card class="module-card rounded-xl border-card h-100" elevation="2">
          <div class="module-header pa-4">
            <div class="d-flex align-center">
              <v-avatar
                :color="`primary-${(index % 3) + 1}`"
                class="mr-3"
                size="42"
              >
                <span class="text-h6 font-weight-bold white--text">{{
                  index + 1
                }}</span>
              </v-avatar>
              <!-- <v-chip
                size="small"
                :color="getDifficultyColor(quiz.difficulty)"
                class="ml-auto"
              >
                {{ quiz.difficulty }}
              </v-chip> -->
            </div>
          </div>

          <v-card-text class="pa-4">
            <h3 class="text-subtitle-1 font-weight-medium mb-2">
              {{ quiz.name }}
            </h3>
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon size="small" class="mr-1"
                >mdi-clipboard-check-outline</v-icon
              >
              <span>Status: </span>
              <v-chip
                size="x-small"
                class="ml-2"
                :color="
                  quiz.status === 'completed'
                    ? 'success'
                    : quiz.status === 'in Progress'
                    ? 'warning'
                    : 'grey'
                "
              >
                {{ quiz.status }}
              </v-chip>
            </div>
            <div
              v-if="quiz.status === 'completed'"
              class="d-flex align-center mt-2 text-caption"
            >
              <v-icon size="small" color="error" class="mr-1">mdi-star</v-icon>
              <span class="text-error font-weight-medium"
                >Score: {{ quiz.score }}</span
              >
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn
              v-if="
                quiz.status === 'completed' || quiz.status === 'in Progress'
              "
              color="secondary"
              variant="outlined"
              class="text-none rounded-lg mr-2"
              @click="viewAgain(quiz.id)"
            >
              View Again
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              class="text-none rounded-lg"
              @click="doQuiz(quiz.id, quiz.status)"
              prepend-icon="mdi-play-circle-outline"
              :block="
                !(quiz.status === 'completed' || quiz.status === 'in Progress')
              "
            >
              Start Quiz
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-5" />

    <!-- Code Exercises Section -->
    <div class="mb-4 d-flex align-center">
      <v-icon color="primary" size="large" class="mr-2">mdi-code-tags</v-icon>
      <h2 class="text-h5 font-weight-bold mb-0">Code Exercises</h2>
      <v-spacer />
      <v-btn
        @click="handleGenerateCodeExercise"
        color="primary"
        :loading="isExerciseLoading"
        :disabled="isExerciseLoading"
      >
        {{ isExerciseLoading ? "Generating..." : "Generate New Exercise" }}
      </v-btn>
    </div>

      <v-expansion-panels variant="accordion" class="elevation-1 rounded-lg">
        <v-expansion-panel
          v-for="exercise in codeExercises"
          :key="exercise.id"
        >
          <v-expansion-panel-title>
            {{ exercise.name }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-btn color="primary" @click="goToExercise(exercise.id)">Practice</v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>


  </v-container>
</template>

<script lang="ts" setup>
import { moduleService } from "@/services/module";
import { ModuleQuizResponse, ClearAnswerResponse } from "@/types/Exercise";
import { useBreadcrumbsStore } from "@/stores/breadcrumbs";
import { Breadcrumbs } from "@/types/Breadcrumbs";
import ReadingMaterial from "@/components/ReadingMaterial/ReadingMaterial.vue";
import { useTimeSpentStore } from "@/stores/timeSpentStore";
import { dashboardService } from "@/services/dashboardService";
import { useGeneratedCodeExerciseStore } from "@/stores/generatedCodeExerciseStore";
interface RouteParams {
  moduleId: string;
  lessonId: string;
}

const moduleQuizzes = ref<ModuleQuizResponse>({
  module_id: "",
  title: "",
  objectives: [],
  quizzes: [],
});

const clearSuccess = ref<ClearAnswerResponse | null>(null);
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const { moduleId, lessonId } = route.params as RouteParams;
const breadcrumbsStore = useBreadcrumbsStore();
const routeState = computed(() => {
  const state = (route as any & { state?: { breadcrumbs?: Breadcrumbs[] } })
    .state;
  return state?.breadcrumbs ? { breadcrumbs: state.breadcrumbs } : {};
});

if (routeState.value.breadcrumbs) {
  breadcrumbsStore.setBreadcrumbs(routeState.value.breadcrumbs);
}

const breadcrumbs = computed(() => breadcrumbsStore.breadcrumbs);
const quizGenerationModalRef = ref(null);
async function generateQuiz() {
  openQuizGenerationModal();
}
async function doQuiz(quizId: string, status: string): Promise<void> {
  const path = `/lessonRecommend/${lessonId}/module/${moduleId}/Quiz/${quizId}`;
  const addActivity = await dashboardService.addActivity(
    { showError, showSuccess },
    {
      type: "do_quiz",
      description: "Took Quiz: " + moduleQuizzes.value.title,
    }
  );
  if (addActivity) {
    console.log("Activity added successfully:", addActivity);
    showSuccess("Took Quiz: " + moduleQuizzes.value.title);
  } else {
    console.error("Failed to add activity");
  }
  if (status === "completed") {
    await clearQuizAnswers(quizId);
  }
  router.push(path);
}
async function handleQuizGenerated() {
  // Set loading state
  isLoading.value = true;

  try {
    // Refresh the module quizzes
    await fetchModuleQuizzes();
  } catch (error) {
    console.error("Failed to refresh quizzes:", error);
    showError("Failed to update quiz list");
  } finally {
    // Reset loading state
    isLoading.value = false;
  }
}
function openQuizGenerationModal() {
  if (quizGenerationModalRef.value) {
    (quizGenerationModalRef.value as any).openDialog();
  }
}
function viewAgain(quizId: string) {
  const path = `/lessonRecommend/${lessonId}/module/${moduleId}/Quiz/${quizId}`;
  router.push(path);
}

// function getDifficultyColor(difficulty: string) {
//   switch (difficulty) {
//     case "easy":
//       return "success";
//     case "medium":
//       return "warning";
//     case "hard":
//       return "error";
//     default:
//       return "grey";
//   }
// }

const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;

const fetchModuleQuizzes = async () => {
  const response = await moduleService.fetchModuleQuizzes(
    { showError, showSuccess },
    moduleId
  );
  if (response && "data" in response && response.data) {
    moduleQuizzes.value = response.data as ModuleQuizResponse;
  }
};

const clearQuizAnswers = async (quizId: string) => {
  clearSuccess.value =
    (await moduleService.clearQuizAnswers(
      { showError, showSuccess },
      moduleId,
      quizId
    )) || "";
};

onMounted(() => {
  fetchModuleQuizzes();
});

const timeSpentStore = useTimeSpentStore();

onMounted(() => {
  timeSpentStore.startTracking();
});

onBeforeUnmount(async () => {
  timeSpentStore.stopTracking();
  await timeSpentStore.updateTimeSpent({ showError, showSuccess }, lessonId);
  console.log("Time spent:", timeSpentStore.timeSpentInSeconds, "seconds");
  console.log("Formatted time:", timeSpentStore.formattedTimeSpent);
});

const codeExerciseStore = useGeneratedCodeExerciseStore();
const codeExercises = computed(() => codeExerciseStore.exercises);
const isExerciseLoading = computed(() => codeExerciseStore.loading);

const handleGenerateCodeExercise = async () => {
  await codeExerciseStore.generateExercise(moduleId);
};

const goToExercise = (exerciseId: string) => {
  router.push(`/exercise-code/${exerciseId}`);
};

onMounted(async () => {
  await codeExerciseStore.loadExercises(moduleId);
});
</script>

<style scoped>
.border-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.border-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  background: linear-gradient(
    to right,
    rgba(var(--v-theme-primary), 0.05),
    transparent
  );
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.05);
}

.module-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-header {
  background: linear-gradient(
    to right,
    rgba(var(--v-theme-primary), 0.05),
    transparent
  );
}

.primary-1 {
  background-color: var(--v-theme-primary) !important;
}

.primary-2 {
  background-color: #6200ea !important;
}

.primary-3 {
  background-color: #3949ab !important;
}

.border-left-primary {
  border-left: 4px solid var(--v-theme-primary);
}

.border-left-error {
  border-left: 4px solid var(--v-theme-error);
}

.learning-outcomes-sheet {
  max-height: 100%;
  overflow-y: auto;
}

.learning-outcome-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

:deep(.v-list-item__prepend) {
  padding-right: 8px !important;
}

:deep(.v-list-item__prepend .v-icon) {
  color: var(--v-theme-error) !important;
  opacity: 0.7;
}

:deep(.v-list-item__content) {
  overflow: visible;
  white-space: normal;
}

:deep(.v-list-item-title) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
</style>
