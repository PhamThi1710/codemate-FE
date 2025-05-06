<template>
  <v-container fluid class="px-12" v-if="moduleQuizzes">
    <!-- Breadcrumbs -->
    <v-skeleton-loader v-if="isLoading" type="text" class="mb-4" />
    <v-breadcrumbs
      v-else
      class="ma-0 pa-0 mb-4"
      :items="breadcrumbs"
      divider="/"
    ></v-breadcrumbs>

    <!-- Main Header Card -->
    <v-skeleton-loader v-if="isLoading" type="card-heading" class="mb-6" />
    <v-card v-else class="border-card mb-6 overflow-hidden" elevation="3">
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
                  You can view your completed quizzes to review your answers.
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
    
    <!-- Reading Material with skeleton loader -->
    <v-skeleton-loader v-if="isLoading" type="article" class="mb-6" />
    <ReadingMaterial v-else :module-id="moduleId" />
    
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

    <!-- Loading state for quizzes -->
    <v-row v-if="isLoading">
      <v-col cols="12" sm="6" md="4" v-for="i in 3" :key="i">
        <v-skeleton-loader type="card" class="w-full" />
      </v-col>
    </v-row>

    <!-- Empty state when no quizzes are available -->
    <v-card
      v-else-if="moduleQuizzes.quizzes.length === 0"
      class="border-card mb-6 empty-state-card"
    >
      <v-card-text class="pa-6 text-center">
        <v-icon color="primary" size="x-large" class="mb-4"
          >mdi-information-outline</v-icon
        >
        <h3 class="text-h6 font-weight-medium mb-2">
          No quizzes available yet
        </h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          There are no quizzes available for this module. Generate a new quiz to
          start practicing your knowledge.
        </p>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus-circle"
          @click="generateQuiz"
          :loading="isLoading"
          :disabled="isLoading"
        >
          {{ isLoading ? "Generating..." : "Generate Your First Quiz" }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Quiz cards (only shown when quizzes exist) -->
    <v-row v-else>
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(quiz, index) in moduleQuizzes.quizzes"
        :key="quiz.id"
      >
        <v-card class="module-card rounded-xl border-card h-100" elevation="2">
          <!-- Card Header -->
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
              <v-chip
                size="small"
                :color="getQuizTypeColor(quiz.name)"
                class="ml-auto"
              >
                {{ getQuizType(quiz.name) }}
              </v-chip>
            </div>
          </div>

          <!-- Card Content -->
          <v-card-text class="pa-4">
            <h3
              class="text-subtitle-1 font-weight-medium mb-2 text-truncate"
              :title="quiz.name"
            >
              {{ quiz.name }}
            </h3>

            <div class="d-flex flex-column gap-2">
              <!-- Status indicator -->
              <div
                class="d-flex align-center text-caption text-medium-emphasis"
              >
                <v-icon size="small" class="mr-1"
                  >mdi-clipboard-check-outline</v-icon
                >
                <span>Status:</span>
                <v-chip
                  size="x-small"
                  class="ml-2"
                  :color="getStatusColor(quiz.status)"
                >
                  {{ formatStatus(quiz.status) }}
                </v-chip>
              </div>

              <!-- Question count -->
              <div
                class="d-flex align-center text-caption text-medium-emphasis"
              >
                <v-icon size="small" class="mr-1"
                  >mdi-help-circle-outline</v-icon
                >
                <span>Questions: {{ quiz.question_count || "?" }}</span>
              </div>

              <!-- Time limit -->
              <div
                v-if="quiz.time_limit"
                class="d-flex align-center text-caption text-medium-emphasis"
              >
                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                <span>Time Limit: {{ quiz.time_limit }} min</span>
              </div>

              <!-- Score (if completed) -->
              <div
                v-if="quiz.status === 'completed' && quiz.score !== undefined"
                class="d-flex align-center mt-2"
              >
                <v-icon
                  size="small"
                  :color="getScoreColor(quiz.score, 100)"
                  class="mr-1"
                >
                  {{ getScoreIcon(quiz.score, 100) }}
                </v-icon>
                <span
                  :class="getScoreTextClass(quiz.score, 100)"
                  class="font-weight-medium"
                >
                  Score: {{ formatScore(quiz.score) }}/{{                     formatScore(100)                  }}
                </span>
              </div>

              <!-- Progress bar (if in progress or completed) -->
              <div v-if="quiz.status !== 'new'" class="mt-2">
                <v-progress-linear
                  v-if="quiz.score"
                  :model-value="getProgressValue(quiz.score, 100)"
                  :color="getScoreColor(quiz.score, 100)"
                  height="6"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </v-card-text>

          <!-- Card Actions -->
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              v-if="quiz.status === 'completed'"
              color="secondary"
              variant="outlined"
              class="text-none rounded-lg mr-2"
              @click="viewAgain(quiz.id)"
              block
            >
              <v-icon class="mr-1">mdi-eye</v-icon>
              View Results
            </v-btn>
            <v-btn
              v-else
              color="primary"
              :variant="quiz.status === 'new' ? 'elevated' : 'tonal'"
              class="text-none rounded-lg"
              @click="doQuiz(quiz.id, quiz.status)"
              :prepend-icon="
                quiz.status === 'new'
                  ? 'mdi-play-circle-outline'
                  : 'mdi-play-circle'
              "
              block
            >
              {{ quiz.status === "new" ? "Start Quiz" : "Continue" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-5" />

    <!-- Code Exercises Section -->
    <div v-if="isCodeCourse">
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
    </div>
    
    <!-- Loading state for code exercises -->
    <v-skeleton-loader v-if="isExerciseLoading" type="card" class="w-full mb-6" />
    
    <!-- Empty state for code exercises -->
    <v-card
      v-else-if="codeExercises.length === 0"
      class="border-card mb-6 empty-state-card"
    >
      <v-card-text class="pa-6 text-center">
        <v-icon color="primary" size="x-large" class="mb-4"
          >mdi-code-braces</v-icon
        >
        <h3 class="text-h6 font-weight-medium mb-2">
          No code exercises available
        </h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          There are no code exercises yet for this module. Generate a new
          exercise to start practicing your coding skills.
        </p>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus-circle"
          @click="handleGenerateCodeExercise"
          :loading="isExerciseLoading"
          :disabled="isExerciseLoading"
        >
          {{
            isExerciseLoading ? "Generating..." : "Generate Your First Exercise"
          }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Code exercises list (only shown when exercises exist) -->
    <v-expansion-panels
      v-else
      variant="accordion"
      class="elevation-1 rounded-lg"
    >
      <v-expansion-panel v-for="exercise in codeExercises" :key="exercise.id">
        <v-expansion-panel-title>
          {{ exercise.name }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-btn color="primary" @click="goToExercise(exercise.id)"
            >Practice</v-btn
          >
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts" setup>
import { moduleService } from "@/services/module";
import { ModuleQuizResponse } from "@/types/Exercise";
import { useBreadcrumbsStore } from "@/stores/breadcrumbs";
import { Breadcrumbs } from "@/types/Breadcrumbs";
import ReadingMaterial from "@/components/ReadingMaterial/ReadingMaterial.vue";
import { useTimeSpentStore } from "@/stores/timeSpentStore";
import { dashboardService } from "@/services/dashboardService";
import { useGeneratedCodeExerciseStore } from "@/stores/generatedCodeExerciseStore";
import { useCourseStore } from "@/stores/courseStore";
import { coursesService } from "@/services/courseslistServices";
import { GetAvailableCourses } from "@/types/Course";
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
const availableCourse = ref<GetAvailableCourses[] | null>(null);
const router = useRouter();
const route = useRoute();
const isLoading = ref(true); // Set loading to true initially
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

const fetchAvailableCourses = async () => {
  try {
    const response = await coursesService.getAvailableCourses({
      showError,
      showSuccess,
    });
    if (response && "data" in response) {
      availableCourse.value = response.data;
      return availableCourse.value;
    }
  } catch (error) {
    console.error("Error fetching available courses:", error);
    showError("Failed to fetch available courses");
  }
};

const isCodeCourse = computed(() => {
  if (!availableCourse.value) return false;
  const getCourseId = useCourseStore.getState().courseDetails;
  if (getCourseId && "courseID" in getCourseId) {
    // find the current course in the availableCourses list
    return (
      availableCourse.value.find(
        (course) => course.courseID === getCourseId.courseID
      )?.have_code || false
    );
  } else if (getCourseId && "course_courseID" in getCourseId) {
    // find the current course in the availableCourses list
    return (
      availableCourse.value.find(
        (course) => course.courseID === getCourseId.course_courseID
      )?.have_code || false
    );
  }
});
const breadcrumbs = computed(() => breadcrumbsStore.breadcrumbs);
const quizGenerationModalRef = ref(null);
async function generateQuiz() {
  openQuizGenerationModal();
}
function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "in Progress":
      return "warning";
    default:
      return "grey";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "in Progress":
      return "In Progress";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getQuizType(name: string) {
  if (name.toLowerCase().includes("coding")) return "Coding";
  if (name.toLowerCase().includes("matching")) return "Matching";
  if (name.toLowerCase().includes("multiple choice")) return "Multiple Choice";
  return "Quiz";
}

function getQuizTypeColor(name: string) {
  if (name.toLowerCase().includes("coding")) return "indigo";
  if (name.toLowerCase().includes("matching")) return "teal";
  if (name.toLowerCase().includes("multiple choice")) return "blue";
  return "purple";
}

function getScoreColor(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return "success";
  if (percentage >= 70) return "info";
  if (percentage >= 60) return "warning";
  return "error";
}

function getScoreIcon(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return "mdi-star";
  if (percentage >= 70) return "mdi-star-half-full";
  return "mdi-star-outline";
}

function getScoreTextClass(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return "text-success";
  if (percentage >= 70) return "text-info";
  if (percentage >= 60) return "text-warning";
  return "text-error";
}

function formatScore(score: number) {
  return typeof score === "number" ? score.toFixed(1) : score;
}

function getProgressValue(score: number, maxScore: number) {
  if (score === undefined || maxScore === 0) return 0;
  return (score / maxScore) * 100;
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

  // Removed the clear quiz answers step for completed quizzes

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

const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;

const fetchModuleQuizzes = async () => {
  isLoading.value = true; // Set loading to true before fetching
  try {
    const response = await moduleService.fetchModuleQuizzes(
      { showError, showSuccess },
      moduleId
    );
    if (response && "data" in response && response.data) {
      moduleQuizzes.value = response.data as ModuleQuizResponse;
    }
  } catch (error) {
    console.error("Error fetching module quizzes:", error);
    showError("Failed to load quizzes");
  } finally {
    isLoading.value = false; // Set loading to false when done
  }
};

onMounted(async () => {
  await Promise.all([
    fetchModuleQuizzes(),
    fetchAvailableCourses()
  ]);
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

.empty-state-card {
  background-color: #fafafa;
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
}

.empty-state-card:hover {
  border: 1px dashed rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.02);
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
.border-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.border-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.15);
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

.gap-2 {
  gap: 8px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.w-full {
  width: 100%;
}
</style>