<template>
  <v-dialog v-model="internalDialog" max-width="800" class="rounded-lg">
    <div
      v-if="!isLearningPath"
      class="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <!-- Left Panel -->
      <div class="w-full md:w-1/2 p-6 border-r border-gray-200">
        <div class="flex items-center mb-4">
          <div class="p-2 rounded-full bg-primary-50 text-primary-600 mr-2">
            <CheckCircle size="24" />
          </div>
          <h3 class="text-heading-4 font-bold">Tell Us About Your Goals</h3>
        </div>

        <p class="text-gray-600 text-body-small-3 mb-6">
          Help us understand your learning goals so we can recommend the best lessons for
          you.
        </p>

        <v-alert
          v-if="learningGoal.length > 200"
          type="error"
          class="mb-4 font-medium"
          border="start"
          density="compact"
        >
          Please enter a learning goal that is less than 200 characters.
        </v-alert>

        <v-textarea
          v-model="learningGoal"
          label="What is your main learning goal?"
          placeholder="E.g., Master data analysis, Become proficient in machine learning..."
          class="mb-6 rounded-lg border-2 text-body-base-4 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          hide-details
          rows="3"
          maxlength="200"
          counter
          :disabled="isLoading || isLearningPath"
        />

        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex gap-4 w-full sm:w-auto sm:ml-auto">
            <v-btn
              variant="outlined"
              class="flex-1 sm:flex-none text-body-base-4"
              @click="cancel"
              :disabled="isLearningPath"
            >
              Cancel
            </v-btn>

            <v-btn
              color="primary"
              class="flex-1 sm:flex-none rounded-lg text-white text-body-base-4"
              :disabled="learningGoal.length > 200 || isLoading || isLearningPath"
              @click="submitGoal"
              :loading="isLearningPath"
            >
              <span v-if="!isLearningPath">Get Recommendations</span>
              <span v-else>Creating Path...</span>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="w-full md:w-1/2 p-6 bg-gray-50">
        <div v-if="isLoading" class="h-full flex flex-col items-center justify-center">
          <div class="loading-container">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4 loading-spinner"
            />
            <p class="loading-text">{{ loadingMessage }}</p>
            <!-- <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div> -->
          </div>
        </div>

        <div
          v-else-if="suggestGoal && suggestGoal.length > 0"
          class="h-full overflow-y-auto pr-2"
        >
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4"
          >
            <h4 class="text-heading-5 font-semibold text-gray-800">Suggested Goals</h4>
            <v-btn
              variant="outlined"
              color="primary"
              class="font-medium text-body-base-4 w-full sm:w-auto"
              :disabled="isLoading"
              :loading="isLoading"
              @click="fetchSuggestGoals"
              prepend-icon="mdi-lightbulb-outline"
            >
              Re-suggest Goals
            </v-btn>
          </div>
          <div
            v-for="(goal, index) in suggestGoal"
            :key="index"
            class="bg-white p-5 rounded-lg mb-4 last:mb-0 shadow-sm border border-gray-100 goal-card"
          >
            <p class="text-body-base-4 text-gray-800 mb-3 font-semibold">
              {{ goal.goal }}
            </p>

            <v-chip
              size="small"
              class="mb-3"
              :color="getProficiencyColor(goal.proficiency_level)"
              text-color="white"
              variant="flat"
            >
              {{ goal.proficiency_level }}
            </v-chip>

            <p class="text-body-small-3 text-gray-700 mb-4">
              {{ goal.explanation }}
            </p>

            <div class="mb-4">
              <p class="text-body-small-3 text-gray-800 font-medium mb-2">Key Lessons:</p>
              <div class="flex flex-wrap gap-2">
                <v-chip
                  v-for="(lesson, i) in goal.key_lessons"
                  :key="i"
                  size="small"
                  :color="getLessonChipColor(i)"
                  variant="flat"
                  class="font-medium"
                >
                  {{ lesson }}
                </v-chip>
              </div>
            </div>

            <v-btn
              variant="outlined"
              color="primary"
              class="font-medium"
              @click="learningGoal = goal.goal"
              size="small"
            >
              Use This Goal
            </v-btn>
          </div>
        </div>

        <div
          v-else
          class="h-full flex flex-col items-center justify-center text-gray-500"
        >
          <v-icon
            icon="mdi-lightbulb-outline"
            size="48"
            class="mb-4 text-gray-400"
          ></v-icon>
          <p class="text-center">Click "Suggest Goals" to see recommendations</p>
          <v-btn
            variant="outlined"
            color="primary"
            class="font-medium text-body-base-4 w-full sm:w-auto mt-4"
            :disabled="isLoading"
            :loading="isLoading"
            @click="fetchSuggestGoals"
            prepend-icon="mdi-lightbulb-outline"
          >
            Suggest Goals
          </v-btn>
        </div>
      </div>
    </div>
    <div
      v-if="isLearningPath"
      class="flex flex-col items-center justify-center bg-white p-8 rounded-lg"
    >
      <div class="loading-path-container text-center">
        <div class="pulse-container mb-6">
          <!-- <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="loading-spinner"
          /> -->
          <div class="orbit-circle"></div>
        </div>
        
        <h3 class="text-heading-5 font-semibold text-gray-800 mb-4">Creating Your Learning Path</h3>
        <p class="text-gray-600 loading-text mb-6">{{ loadingLearningPath }}</p>
        
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">This may take a moment</p>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import CheckCircle from "@/assets/icons/check-circle.vue";
import { aiGenerateServices } from "@/services/aiGenerateServices";
import { useCourseStore } from "@/stores/courseStore";
import { SuggestedGoal } from "@/types/AI_generate";
import { ref, watch, inject, computed } from "vue";
const props = defineProps<{ dialog: boolean }>();
const emit = defineEmits<{
  (e: "update:dialog", value: boolean): void;
  (e: "submitGoal", value: string): void;
}>();
const suggestGoal = ref<SuggestedGoal[] | null>(null);
const internalDialog = ref(props.dialog);
const courseStore = useCourseStore.getState();
const learningGoal = ref("");
const isLoading = ref(false);
const isLearningPath = ref(false);
const progressValue = ref(0);
const pathCreationTime = ref(45); // Estimated seconds to create path

const progressWidth = computed(() => {
  return Math.min(progressValue.value, 95); // Cap at 95% until completion
});

watch(
  () => props.dialog,
  (newVal: boolean) => {
    internalDialog.value = newVal;
  }
);

watch(internalDialog, (newVal: boolean) => {
  emit("update:dialog", newVal);
});

const cancel = () => {
  internalDialog.value = false;
  resetState();
};

const resetState = () => {
  isLoading.value = false;
  isLearningPath.value = false;
  progressValue.value = 0;
  if (!suggestGoal.value) {
    learningGoal.value = "";
  }
};

const submitGoal = () => {
  if (learningGoal.value.length <= 200) {
    isLearningPath.value = true;
    progressValue.value = 0;

    // Start progress animation
    const totalSteps = pathCreationTime.value;
    const increment = 95 / totalSteps;
    const progressInterval = setInterval(() => {
      if (progressValue.value < 95) {
        progressValue.value += increment;
      } else {
        clearInterval(progressInterval);
      }
    }, 1000);

    // Rotate through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      loadingLearningPath.value =
        statusLearningPathMessages[messageIndex % statusLearningPathMessages.length];
      messageIndex++;
    }, 4000);

    // Emit the goal to parent
    emit("submitGoal", learningGoal.value);
    
    // Return intervals for cleanup
    return { progressInterval, messageInterval };
  }
};

const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;

const statusMessages = [
  "Starting to request AI...",
  "Generating sample goals...",
  "Almost done...",
  "Initializing AI framework...",
  "Fetching data for analysis...",
  "Processing request...",
  "AI is learning...",
  "Fine-tuning models...",
  "Verifying results...",
  "Completion in progress...",
];

const statusLearningPathMessages = [
  "Starting to create learning path...",
  "Gathering educational resources...",
  "Analyzing your learning goal...",
  "Collecting relevant content...",
  "Organizing course materials...",
  "Mapping out learning modules...",
  "Identifying key learning objectives...",
  "Assessing knowledge requirements...",
  "Designing personalized curriculum...",
  "Optimizing learning flow...",
  "Adding supporting exercises...",
  "Curating practice activities...",
  "Setting learning milestones...",
  "Tailoring path to your preferences...",
  "Preparing assessment materials...",
  "Customizing feedback mechanisms...",
  "Finalizing resource recommendations...",
  "Building progression tracking...",
  "Aligning with learning standards...",
  "Learning path almost ready...",
];
const loadingLearningPath = ref(statusLearningPathMessages[0]);
const loadingMessage = ref(statusMessages[0]);

const fetchSuggestGoals = async () => {
  isLoading.value = true;
  let messageIndex = 0;

  const interval = setInterval(() => {
    loadingMessage.value = statusMessages[messageIndex % statusMessages.length];
    messageIndex++;
  }, 4000);

  courseStore.loadCourseDetails();

  if (courseStore.courseDetails && "course_id" in courseStore.courseDetails) {
    try {
      const response = await aiGenerateServices.generateStudentGoals(
        {
          showError,
          showSuccess,
        },
        courseStore.courseDetails.course_id
      );
      if (response && "data" in response && response.data) {
        suggestGoal.value = (response.data.suggested_goals as unknown) as SuggestedGoal[];
        console.log("Suggested goals:", suggestGoal.value);
      }
    } catch (error) {
      console.error("Error fetching suggested goals:", error);
      showError("Failed to fetch suggested goals. Please try again later.");
    } finally {
      clearInterval(interval);
      isLoading.value = false;
    }
  } else {
    clearInterval(interval);
    isLoading.value = false;
    showError("Course details not available");
  }
};

const getProficiencyColor = (level: "Struggling" | "Average" | "Advanced") => {
  const colors: Record<string, string> = {
    Advanced: "deep-purple",
    Struggling: "red",
    Average: "orange",
  };
  return colors[level] || "blue";
};
const getLessonChipColor = (index: number) => {
  const colors = [
    "blue-lighten-1",
    "purple-lighten-1",
    "green-lighten-1",
    "amber-darken-2",
    "deep-orange-lighten-1",
    "cyan-darken-1",
  ];
  return colors[index % colors.length];
};
</script>

<style scoped>
.overflow-y-auto {
  max-height: 400px;
}

.goal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-path-container {
  width: 100%;
  max-width: 500px;
}

.loading-spinner {
  animation: pulse 1.5s infinite ease-in-out;
}

.pulse-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.orbit-circle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(79, 70, 229, 0.2);
  border-radius: 50%;
  animation: orbit 5s infinite linear;
}

.loading-text {
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: textFade 8s infinite;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.loading-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6366f1;
}

.loading-dots span:nth-child(1) {
  animation: bounce 1.4s infinite 0s;
}

.loading-dots span:nth-child(2) {
  animation: bounce 1.4s infinite 0.2s;
}

.loading-dots span:nth-child(3) {
  animation: bounce 1.4s infinite 0.4s;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

@keyframes orbit {
  0% {
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(0.8) rotate(360deg);
  }
}

@keyframes textFade {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}
</style>