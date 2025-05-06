<template>
  <v-app>
     <v-main class="pt-0 pb-2 pl-4 pr-4 bg-gray-50">
       <!-- <RecentCourses v-if="courses" :courses="courses?.content" /> -->
       <h1 class="text-3xl font-bold gradient-text mt-8">Courses List</h1>
       <section>
         <v-text-field
           v-model="searchQuery"
           placeholder="You can search by course name ... 🌸🎆"
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
           <CourseItemProfessor v-if="courses" :courses="courses?.content" />
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
 import { ref, watch, inject, onMounted } from 'vue';
 import { coursesService } from "@/services/Professor/CourseServices";
 import { GetProfessorCoursesPaginatedResponse } from "@/types/Course";
 import useDebounce from "@/composables/useDebounce";
 
 const searchQuery = ref<string>("");
 const currentPage = ref<number>(1);
 const totalPages = ref<number>(1);
 const isLoading = ref<boolean>(false);
 const courses = ref<GetProfessorCoursesPaginatedResponse | null>(null);
 
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
   
   try {
     // Create query parameters object with pagination and search
     const queryParams: Record<string, any> = {
       page: currentPage.value - 1, // Adjust if your API uses 0-based indexing
       size: 10 // Add your desired page size
     };
     
     // Only add search_query if it's not empty
     if (searchQuery.value.trim()) {
       queryParams.search_query = searchQuery.value;
     }
     
     const response = await coursesService.fetchCoursesList({
       showError,
       showSuccess,
       ...queryParams
     });
 
     if (response && "data" in response && response.data) {
       courses.value = response.data as GetProfessorCoursesPaginatedResponse;
       if (
         response.data &&
         typeof response.data === "object" &&
         "totalPages" in response.data
       ) {
         totalPages.value = response.data.totalPages as number;
       }
     }
   } catch (error) {
     console.error("Error fetching courses:", error);
     showError("Failed to fetch courses. Please try again.");
     courses.value = null;
   } finally {
     isLoading.value = false;
   }
 };
 
 watch(currentPage, () => {
   fetchCourses();
 });
 
 onMounted(() => {
   fetchCourses();
 });
 </script>