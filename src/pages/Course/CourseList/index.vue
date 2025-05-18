<template>
  <v-app>
    <v-main class="pt-0 pb-2 pl-4 pr-4 bg-gray-50">
      <!-- <RecentCourses v-if="courses && courses.content.length > 0" :courses="courses?.content" /> -->
      <section>
        <h2 class="text-heading-4 font-semibold mb-6 mt-6">My Courses</h2>
        <v-text-field
          v-model="searchQuery"
          placeholder="You can search by course name and your professor's name here ... 🌸🎆"
          class="mt-4 w-full rounded-lg shadow-sm bg-on-primary"
          :loading="isLoading"
          solo
          append-inner-icon="mdi-magnify"
          outlined
          dense
          hide-details
          @input="handleSearch"
        >
          <template v-slot:append>
            <v-fade-transition>
              <v-icon
                v-if="searchQuery"
                color="gray"
                class="cursor-pointer"
                @click="clearSearch"
              >
                mdi-close
              </v-icon>
            </v-fade-transition>
          </template>
        </v-text-field>
        <div class="space-y-4 mt-6">
          <CourseItem v-if="courses" :courses="courses?.content" />
        </div>
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
        />
      </section>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { coursesService } from "@/services/courseslistServices";
import { CoursesListPaginatedResponse } from "@/types/Course";
import useDebounce from "@/composables/useDebounce";

const searchQuery = ref<string>("");
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const isLoading = ref<boolean>(false);
const courses = ref<CoursesListPaginatedResponse>();

const debouncedSearch = useDebounce.useDebounceFn(() => {
  fetchCourses();
}, 500);

const handleSearch = () => {
  currentPage.value = 1;
  debouncedSearch();
};

const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
  fetchCourses();
};

const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;
const fetchCourses = async () => {
  isLoading.value = true;

  const response = await coursesService.fetchCoursesList({
    showError,
    showSuccess,
    search_query: searchQuery.value,
  });

  if (response && "data" in response && response.data) {
    courses.value = response.data as CoursesListPaginatedResponse;
    console.log(courses.value);
    if (
      response.data &&
      typeof response.data === "object" &&
      "totalPages" in response.data
    ) {
      totalPages.value = response.data.totalPages as number;
    }
  }
  isLoading.value = false;
};

watch(currentPage, () => {
  fetchCourses();
});

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.icon {
  font-size: 1.5rem;
}
</style>
