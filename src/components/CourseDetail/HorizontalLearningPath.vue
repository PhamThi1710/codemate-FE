<template>
  <div class="timeline-scroll-wrapper">
    <v-skeleton-loader
      v-if="loading"
      type="card, card, card, card"
      class="horizontal-learning-path mb-6"
    ></v-skeleton-loader>
    <div v-else-if="orderedLessons.length > 0" class="horizontal-learning-path mb-6">
      <!-- Header Section -->
      <div class="flex flex-col mb-4">
        <div class="flex flex-row justify-between items-center mb-2">
          <h2 class="text-h5 font-weight-bold mb-4">
            Learning Path for
            <span class="text-secondary-variant">{{ course?.course_name }}</span>
          </h2>
          <div>
            <v-btn
              v-if="checkViewButton()"
              class="ml-2"
              color="primary"
              variant="outlined"
              @click="course && navigateToProgressTracking(course.course_id)"
            >
              View Your Progress
            </v-btn>
          </div>
        </div>
        <span v-if="student_goal" class="text-body-2">
          Goal: <span class="text-secondary">{{ student_goal }}</span>
        </span>
      </div>
      
      <!-- Timeline Container with Navigation -->
      <div class="timeline-container">
        <!-- Left Navigation Button -->
        <v-btn
          v-if="orderedLessons.length > 4"
          icon
          variant="text"
          color="primary"
          class="nav-button nav-left"
          :disabled="currentStartIndex === 0"
          @click="navigatePrev"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <div class="timeline-scroll-container" ref="scrollContainer">
          <div class="timeline-line"></div>

          <div class="timeline-items">
            <div
              v-for="(lesson, index) in visibleLessons"
              :key="lesson.lesson_id"
              class="timeline-item"
              :class="{
                'first-item': index === 0 && currentStartIndex === 0,
                'last-item': index === visibleLessons.length - 1 && 
                             currentStartIndex + visibleLessons.length === orderedLessons.length,
              }"
            >
              <div class="timeline-date-container">
                <div class="timeline-date">
                  {{ formatDate(lesson.start_date) }}
                </div>
                <div class="timeline-dot" :class="getStatusClass(lesson)">
                  <v-icon size="16" color="white">
                    mdi-numeric-{{ currentStartIndex + index + 1 }}-circle
                  </v-icon>
                </div>
                <div class="timeline-date">
                  {{ formatDate(lesson.end_date) }}
                </div>
              </div>

              <v-card class="timeline-card elevation-3">
                <div class="position-relative">
                  <v-icon
                    color="amber"
                    class="bookmark-star"
                    :icon="lesson.bookmark ? 'mdi-star' : 'mdi-star-outline'"
                    size="20"
                    @click.stop="toggleBookmark(lesson.id)"
                  ></v-icon>
                </div>

                <div class="d-flex flex-col align-center px-3 py-2">
                  <!-- Status Chip -->
                  <div>
                    <v-chip
                      :color="getStatusColor(lesson)"
                      size="small"
                      class="ml-2 status-chip"
                    >
                      {{ renderStatusLabel(lesson.status) }}
                    </v-chip>
                  </div>
                  <!-- Lesson Title -->
                  <div>
                    <h3
                      class="text-align-center cursor-pointer lesson-title"
                      @click="
                        navigateToRecommendLessonDetail(
                          lesson.id,
                          lesson.lesson_title
                        )
                      "
                    >
                      {{ lesson.lesson_title }}
                    </h3>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </div>
        
        <!-- Right Navigation Button -->
        <v-btn
          v-if="orderedLessons.length > 4"
          icon
          variant="text"
          color="primary"
          class="nav-button nav-right"
          :disabled="currentStartIndex + 4 >= orderedLessons.length"
          @click="navigateNext"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <!-- Navigation Dots -->
      <div v-if="orderedLessons.length > 4" class="navigation-dots">
        <span 
          v-for="(_, index) in pageCount" 
          :key="index" 
          class="dot" 
          :class="{ 'active': currentPage === index }"
          @click="goToPage(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-scroll-wrapper {
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

.horizontal-learning-path {
  width: 100%;
  padding: 0 16px;
}

.timeline-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.timeline-scroll-container {
  position: relative;
  padding: 20px 0;
  width: 100%;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.timeline-line {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #e0e0e0;
  z-index: 0;
}

.timeline-items {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 1;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(25% - 24px);
  margin: 0 12px;
  position: relative;
  transition: all 0.3s ease;
}

.timeline-date-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  z-index: 1;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1976d2;
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.timeline-dot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.timeline-dot.dot-current {
  background-color: #1976d2;
}

.timeline-dot.dot-completed {
  background-color: #4caf50;
}

.timeline-dot.dot-upcoming {
  background-color: #9e9e9e;
}

.timeline-date {
  font-size: 12px;
  color: #757575;
  text-align: center;
  font-weight: 500;
  margin: 2px 0;
}

.timeline-card {
  width: 100%;
  border-radius: 12px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.bookmark-star {
  position: absolute;
  top: 0;
  right: 0;
  margin: 8px;
  z-index: 2;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.bookmark-star:hover {
  transform: scale(1.2);
}

.first-item,
.last-item {
  margin-left: 0;
  margin-right: 0;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-left {
  left: -12px;
}

.nav-right {
  right: -12px;
}

.status-chip {
  margin-bottom: 8px;
  font-weight: 500;
}

.lesson-title {
  font-size: 16px;
  margin: 0;
  padding: 0 8px;
  text-align: center;
  color: #333;
  transition: color 0.2s ease;
  line-height: 1.3;
}

.lesson-title:hover {
  color: #1976d2;
}

.navigation-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: #1976d2;
  width: 10px;
  height: 10px;
}

/* Animation for page transitions */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>

<script lang="ts" setup>
import { format as dateFnsFormat, parseISO } from "date-fns";
import {
  CourseDetailResponse,
  GetRecommendedLessonsResponse,
} from "@/types/Course";
import { coursesService } from "@/services/courseslistServices";
import { dashboardService } from "@/services/dashboardService";
import { reloadManager } from "@/modals/manager/reload";
import { renderStatusLabel } from "@/utils/functions/render";

const props = defineProps<{
  course: CourseDetailResponse | null;
}>();

const router = useRouter();
const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;

const loading = ref(true);
const error = ref<string | null>(null);
const recommendedLessons = ref<GetRecommendedLessonsResponse[]>([]);
const student_goal = ref<string | null>(null);
const currentStartIndex = ref(0);
const itemsPerPage = 4;
const scrollContainer = ref<HTMLElement | null>(null);

// Calculated properties
const orderedLessons = computed(() => {
  return [...recommendedLessons.value].sort((a, b) => a.order - b.order);
});

const visibleLessons = computed(() => {
  const start = currentStartIndex.value;
  const end = Math.min(start + itemsPerPage, orderedLessons.value.length);
  return orderedLessons.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(orderedLessons.value.length / itemsPerPage);
});

const currentPage = computed(() => {
  return Math.floor(currentStartIndex.value / itemsPerPage);
});

// Navigation methods
const navigateNext = () => {
  if (currentStartIndex.value + itemsPerPage < orderedLessons.value.length) {
    currentStartIndex.value += 1;
  }
};

const navigatePrev = () => {
  if (currentStartIndex.value > 0) {
    currentStartIndex.value -= 1;
  }
};

const goToPage = (pageIndex: number) => {
  currentStartIndex.value = pageIndex * itemsPerPage;
};

const checkViewButton = () => {
  if (
    orderedLessons.value.length > 0 &&
    props.course?.course_id &&
    !router.currentRoute.value.name.includes("ProgressTracking")
  ) {
    return true;
  } else {
    return false;
  }
};

const fetchRecommendedLessons = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (props.course?.course_id) {
      const response = await coursesService.getRecommendedLessons(
        { showError, showSuccess },
        props.course.course_id
      );

      if (response && "data" in response && response.data) {
        recommendedLessons.value = response.data.lessons;
        student_goal.value = response.data.student_goal;
        // Reset to first page when data changes
        currentStartIndex.value = 0;
      } else {
        error.value = "Failed to fetch recommended lessons";
      }
    }
  } catch (err) {
    error.value = "You haven't had any learning paths for this course yet.";
  } finally {
    loading.value = false;
  }
};

const toggleBookmark = async (lessonId: string) => {
  try {
    // Find the lesson and toggle its bookmark status in the UI first for immediate feedback
    const lessonIndex = recommendedLessons.value.findIndex(
      (lesson) => lesson.id === lessonId
    );
    if (lessonIndex !== -1) {
      // Create a new array with the updated lesson
      const updatedLessons = [...recommendedLessons.value];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        bookmark: !updatedLessons[lessonIndex].bookmark,
      };
      recommendedLessons.value = updatedLessons;
    }

    // Call the API to update the bookmark status
    const response = await coursesService.bookmarkRecommendedLessons(
      { showError, showSuccess },
      lessonId
    );

    if (response && "data" in response && response.data) {
      showSuccess("Bookmark updated successfully");
    } else {
      // If the API call fails, revert the change
      fetchRecommendedLessons();
      error.value = "Failed to update bookmark";
    }
  } catch (err) {
    // If there's an error, revert the change by refetching
    fetchRecommendedLessons();
    error.value = "Failed to update bookmark";
  }
};

const navigateToRecommendLessonDetail = async (
  lessonId: string,
  lesson_title: string
) => {
  const addActivity = async (lesson_title: string) => {
    try {
      const add_feedback = await dashboardService.addActivity(
        { showError, showSuccess },
        {
          type: "access_recommend_lesson",
          description: "Accessed Recommend Lesson: " + lesson_title,
        }
      );
      if (add_feedback) {
        await reloadManager.trigger("activities");
      }
    } catch (error) {
      showError("Failed to add activity");
    }
  };
  await addActivity(lesson_title);
  router.push({
    path: `/lessonRecommend/${lessonId}`,
  });
};

const navigateToProgressTracking = (courseId: string) => {
  router.push({
    path: `/progress-tracking/${courseId}`,
  });
};

const formatDate = (dateString: string) => {
  try {
    return dateFnsFormat(parseISO(dateString), "MMM dd");
  } catch (error) {
    return dateString;
  }
};

const getStatusColor = (lesson: GetRecommendedLessonsResponse): string => {
  const today = new Date("2025-06-20");
  const start = new Date(lesson.start_date);
  const end = new Date(lesson.end_date);

  if (today < start) return "grey";
  if (today > end) return "success";
  return "primary";
};

const getStatusClass = (lesson: GetRecommendedLessonsResponse): string => {
  const today = new Date("2025-06-20");
  const start = new Date(lesson.start_date);
  const end = new Date(lesson.end_date);

  if (today < start) return "dot-upcoming";
  if (today > end) return "dot-completed";
  return "dot-current";
};

// Lifecycle hooks
onMounted(() => {
  fetchRecommendedLessons();
});

watch(() => props.course, () => {
  fetchRecommendedLessons();
}, { deep: true });
</script>
