<template>
  <div class="timeline-scroll-wrapper">
    <v-skeleton-loader
      v-if="loading"
      type="card, card, card"
      class="horizontal-learning-path mb-6"
    ></v-skeleton-loader>
    <div v-else-if="orderedLessons.length > 0" class="horizontal-learning-path mb-6">
      <div class="flex flex-col mb-4">
        <div class="flex flex-row justify-between items-center mb-2">
          <h2 class="text-h5 font-weight-bold mb-4">
            Learning Path for
            <span class="text-secondary-variant">{{
              course?.course_name
            }}</span>
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
      <div class="timeline-container">
        <div class="timeline-scroll-container">
          <div class="timeline-line"></div>

          <div class="timeline-items">
            <div
              v-for="(lesson, index) in orderedLessons"
              :key="lesson.lesson_id"
              class="timeline-item"
              :class="{
                'first-item': index === 0,
                'last-item': index === orderedLessons.length - 1,
              }"
            >
              <div class="timeline-date-container">
                <div class="timeline-date">
                  {{ formatDate(lesson.start_date) }}
                </div>
                <div class="timeline-dot" :class="getStatusClass(lesson)">
                  <v-icon size="16" color="white">
                    mdi-numeric-{{ index + 1 }}-circle
                  </v-icon>
                </div>
                <div class="timeline-date">
                  {{ formatDate(lesson.end_date) }}
                </div>
              </div>

              <v-card class="timeline-card elevation-2">
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
                  <!-- display the status above the title -->
                  <div>
                    <v-chip
                      :color="getStatusColor(lesson)"
                      size="small"
                      class="ml-2"
                    >
                      {{ renderStatusLabel(lesson.status) }}
                    </v-chip>
                  </div>
                  <div>
                    <h3
                      class="text-align-center cursor-pointer"
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

.horizontal-learning-path {
  width: 100%;
  padding: 0 16px;
}

.timeline-container {
  position: relative;
  width: 100%;
}

.timeline-scroll-container {
  position: relative;
  padding: 20px 0;
  min-width: 100%;
}

.timeline-line {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.timeline-items {
  display: flex;
  justify-content: center;
  min-width: 100%;
  position: relative;
  z-index: 1;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 240px;
  margin: 0 16px;
  position: relative;
}

.timeline-date-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  z-index: 1;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1976d2;
  margin: 8px 0;
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
}

.timeline-card {
  width: 100%;
  border-radius: 8px;
  position: relative;
}

.bookmark-star {
  position: absolute;
  top: 0;
  right: 0;
  margin: 6px;
  z-index: 2;
  cursor: pointer;
}

.first-item,
.last-item {
  margin-left: 0;
  margin-right: 0;
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
const scrollPosition = ref(0);
const maxScroll = ref(0);

const checkViewButton = () => {
  if (
    orderedLessons.value.length > 0 &&
    props.course?.course_id &&
    !router.currentRoute.value.name.includes("ProgressTracking")
  ) {
    console.log("checkViewButton", orderedLessons.value.length, props.course?.course_id, router.currentRoute.value.name);
    return true;
  } else {
    return false;
  }
};

const orderedLessons = computed(() => {
  return [...recommendedLessons.value].sort((a, b) => a.order - b.order);
});

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
      } else {
        error.value = "Failed to fetch recommended lessons";
      }
    }
  } catch (err) {
    error.value = "You haven't had any learning paths for this course yet.";
  } finally {
    loading.value = false;

    // Initialize max scroll after DOM update
    nextTick(() => {
      updateMaxScroll();
    });
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

const updateMaxScroll = () => {
  const container = document.querySelector(".timeline-scroll-container");
  if (container) {
    maxScroll.value = container.scrollWidth - container.clientWidth;
  }
};

// Watch for container scroll events
onMounted(() => {
  const container = document.querySelector(".timeline-scroll-wrapper");
  console.log("onMounted", container);
  if (container) {
    console.log("Container found", container);
    container.addEventListener("scroll", () => {
      scrollPosition.value = container.scrollLeft;
    });

    // Initialize
    updateMaxScroll();
    fetchRecommendedLessons();
    console.log("fetchRecommendedLessons called");
  }
});

onUnmounted(() => {
  const container = document.querySelector(".timeline-scroll-wrapper");
  if (container) {
    container.removeEventListener("scroll", () => {});
  }
});

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

// const getStatusText = (lesson: GetRecommendedLessonsResponse): string => {
//   const today = new Date("2025-06-20");
//   const start = new Date(lesson.start_date);
//   const end = new Date(lesson.end_date);

//   if (today < start) return "Upcoming";
//   if (today > end) return "Completed";
//   return "In Progress";
// };

// Resize handler
const handleResize = () => {
  updateMaxScroll();
};

window.addEventListener("resize", handleResize);
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
