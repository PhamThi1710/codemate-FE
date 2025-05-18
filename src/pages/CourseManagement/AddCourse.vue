<script lang="ts" setup>
import type { VForm } from "vuetify/components"; // Import VForm type
import { CreateCourseRequest, GetAvailableCourses } from "@/types/Course";
import { GetAllUsersResponse } from "@/types/User";
import { coursesService } from "@/services/courseslistServices";
import { usersService } from "@/services/usersServices";
import * as XLSX from "xlsx";

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date | string | null | undefined): Date => {
  if (!date) return new Date(); // Default to today if invalid
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    // Check if it's a valid date object
    if (isNaN(d.getTime())) {
      return new Date(); // Default if parsing failed
    }
    return d;
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return new Date(); // Default on error
  }
};

// State
const course = ref<CreateCourseRequest>({
  id: 0, // Assuming this isn't needed for creation? If so, remove or handle appropriately
  name: "",
  professorID: "", // Use ms (string) from user object
  creditNumber: 0,
  studentIDs: [], // Array of strings (MSSV)
  nSemester: 0,
  courseID: "",
  startDate: formatDate(new Date()), // Use helper for initial format
  endDate: formatDate(new Date()), // Use helper for initial format
  class_name: "",
});

// *** Ref for the course form instance ***
const courseForm = ref<InstanceType<typeof VForm> | null>(null);

const availableCourses = ref<GetAvailableCourses[]>([]);
const professorInformation = ref<GetAllUsersResponse[]>([]);
const loading = ref(false); // Loading for course creation submit
const dataLoading = ref(false); // Separate loading for fetching initial data
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");
const excelFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const importLoading = ref(false); // Loading for student ID import processing
const importErrors = ref<string[]>([]);
const previewData = ref<string[]>([]); // Stores valid student IDs from the file for preview
const showPreview = ref(false);
const isDragging = ref(false);
const professorSearch = ref("");
const courseNameSearch = ref("");
const courseIdSearch = ref("");
const creditSearch = ref("");

// Injections
const showError = inject("showError") as (message: string) => void;
const showSuccess = inject("showSuccess") as (message: string) => void;

// Methods
const showSnackbar = (text: string, color: string = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const resetForm = () => {
  // Use Vuetify's form reset - Resets models inside <v-form> AND validation
  courseForm.value?.reset();

  // Vuetify's reset() might set models to null/undefined.
  // We need to manually reset things not in the form or ensure our desired defaults.
  course.value.studentIDs = []; // Clear student array
  // Re-apply specific defaults if reset() cleared them or set to null
  course.value.startDate = formatDate(new Date());
  course.value.endDate = formatDate(new Date());
  course.value.creditNumber = course.value.creditNumber ?? 0; // Ensure it's 0 if reset() made it null
  course.value.nSemester = course.value.nSemester ?? 0; // Ensure it's 0 if reset() made it null

  // Reset non-form state
  excelFile.value = null;
  previewData.value = [];
  showPreview.value = false;
  importErrors.value = [];
  professorSearch.value = "";
  courseNameSearch.value = "";
  courseIdSearch.value = "";
  creditSearch.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const submitCourse = async () => {
  // Trigger validation
  const { valid } = await courseForm.value!.validate();
  if (!valid) {
    showSnackbar("Please fill in all required fields correctly", "error");
    return;
  }
  // Additional check for student IDs
  if (course.value.studentIDs.length === 0) {
    showSnackbar("Please import at least one Student ID", "error");
    return;
  }
  // Explicit Date Format Check before sending
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !dateRegex.test(String(course.value.startDate)) ||
    !dateRegex.test(String(course.value.endDate))
  ) {
    showSnackbar(
      "Invalid date format. Please ensure dates are YYYY-MM-DD.",
      "error"
    );
    console.warn("Invalid date format before submit:", {
      start: course.value.startDate,
      end: course.value.endDate,
    });
    // Optionally try reformatting one last time if you suspect Date objects slipped in
    course.value.startDate = formatDate(course.value.startDate);
    course.value.endDate = formatDate(course.value.endDate);
    // Re-validate after attempting format correction
    const { valid: datesValid } = await courseForm.value!.validate();
    if (!datesValid) return; // Stop if still invalid after format attempt
  }

  try {
    loading.value = true;

    const payload = {
      ...course.value,
      // Ensure dates are strings (already done by formatDate and v-text-field type="date")
    };
    // delete payload.id; // Uncomment if 'id' should not be sent for creation

    const response = await coursesService.createCourse(
      { showError, showSuccess },
      [payload] // API expects an array
    );

    // Adjust success check based on your actual API response structure
    if (response && response.isSuccess) {
      showSnackbar("Course created successfully"); // Show success message FIRST
      resetForm(); // THEN reset the form
    } else {
      // Handle potential API errors even if no exception was thrown
      showSnackbar(
        response?.message || "Failed to create course (API error)",
        "error"
      );
    }
  } catch (error) {
    console.error("Error creating course:", error);
    showSnackbar(
      `Failed to create course: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "error"
    );
  } finally {
    loading.value = false;
  }
};

const fetchAvailableCourses = async () => {
  dataLoading.value = true;
  try {
    const response = await coursesService.getAvailableCourses({
      showError,
      showSuccess,
    });
    if (response?.data && Array.isArray(response.data)) {
      availableCourses.value = response.data;
    } else {
      availableCourses.value = [];
      console.warn(
        "Received unexpected data format for available courses:",
        response
      );
    }
  } catch (error) {
    console.error("Failed to fetch available courses:", error);
    availableCourses.value = [];
  } finally {
    dataLoading.value = false;
  }
};

const fetchProfessorInfoList = async () => {
  dataLoading.value = true;
  try {
    const response = await usersService.getAllUsers(
      { role: "professor" },
      { showError, showSuccess }
    );
    if (response?.data && Array.isArray(response.data)) {
      professorInformation.value = response.data;
    } else {
      professorInformation.value = [];
      console.warn("Received unexpected data format for professors:", response);
    }
  } catch (error) {
    console.error("Failed to fetch professors:", error);
    professorInformation.value = [];
  } finally {
    dataLoading.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      excelFile.value = file;
      processExcelFile();
    } else {
      showSnackbar(
        "Invalid file type. Please upload an Excel file (.xlsx, .xls).",
        "error"
      );
      if (fileInput.value) fileInput.value.value = ""; // Reset input if invalid type
    }
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      excelFile.value = file;
      processExcelFile();
    } else {
      showSnackbar(
        "Invalid file type. Please upload an Excel file (.xlsx, .xls).",
        "error"
      );
    }
  }
};

const processExcelFile = async () => {
  importLoading.value = true;
  importErrors.value = [];
  previewData.value = []; // Clear previous preview
  showPreview.value = false;

  if (!excelFile.value) {
    importErrors.value.push("No file selected");
    importLoading.value = false;
    return;
  }

  const reader = new FileReader();
  reader.onerror = (err) => {
    console.error("FileReader error:", err);
    importErrors.value.push("Error reading the file.");
    showPreview.value = true; // Show errors
    importLoading.value = false;
  };
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        importErrors.value.push("Excel file does not contain any sheets.");
        showPreview.value = true;
        importLoading.value = false;
        return;
      }
      const firstSheet = workbook.Sheets[firstSheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: "",
      });

      if (jsonData.length < 2) {
        importErrors.value.push(
          "File must contain a header row ('StudentID') and at least one data row."
        );
        showPreview.value = true;
        importLoading.value = false;
        return;
      }

      const headers = jsonData[0].map((h) => String(h).trim());
      const studentIdIndex = headers.indexOf("StudentID");

      if (studentIdIndex === -1) {
        importErrors.value.push(
          "File must contain a 'StudentID' column header."
        );
        showPreview.value = true;
        importLoading.value = false;
        return;
      }

      const currentStudentIDs = new Set(course.value.studentIDs);
      const newStudentIDs: string[] = [];
      const fileDuplicateCheck = new Set<string>(); // Check duplicates *within* this file import
      const errors: string[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 1;
        if (
          row.every(
            (cell) =>
              cell === null || cell === undefined || String(cell).trim() === ""
          )
        )
          continue;

        const studentId = String(row[studentIdIndex] ?? "").trim();

        if (!studentId) {
          errors.push(`Row ${rowNum}: Missing StudentID`);
        } else if (currentStudentIDs.has(studentId)) {
          // Quietly ignore already added IDs, or add a warning:
          // errors.push(`Row ${rowNum}: StudentID ${studentId} is already in the course list.`);
        } else if (fileDuplicateCheck.has(studentId)) {
          errors.push(
            `Row ${rowNum}: Duplicate StudentID ${studentId} within this file.`
          );
        } else {
          // Basic validation example (adjust as needed)
            // Example: 8-10 digits
            newStudentIDs.push(studentId);
            fileDuplicateCheck.add(studentId);
        }
      }

      importErrors.value = errors;
      previewData.value = newStudentIDs; // Show only newly found valid IDs in preview
      showPreview.value = true; // Always show preview area after processing

      if (newStudentIDs.length > 0) {
        course.value.studentIDs = [...currentStudentIDs, ...newStudentIDs]; // Efficiently combine unique IDs
        showSnackbar(
          `${newStudentIDs.length} new Student IDs added to the list.`,
          "info"
        );
      } else if (errors.length === 0) {
        showSnackbar("No new valid Student IDs found in the file.", "warning");
      }
      // If only errors were found, the errors array will be populated and shown.
    } catch (err) {
      console.error("Error processing Student ID file:", err);
      importErrors.value.push(
        `Failed to process file: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      showPreview.value = true;
      previewData.value = [];
    } finally {
      importLoading.value = false;
    }
  };
  reader.readAsArrayBuffer(excelFile.value);
};

const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const headers = ["StudentID"];
  const sampleData = [["20191234"], ["20205678"]];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  XLSX.utils.book_append_sheet(wb, ws, "StudentIDs");
  XLSX.writeFile(wb, "student_ids_template.xlsx");
};

// Computed properties
const filteredProfessors = computed(() => {
  if (!professorSearch.value) return professorInformation.value;
  const search = professorSearch.value.toLowerCase().trim();
  if (!search) return professorInformation.value;
  return professorInformation.value.filter(
    (prof) =>
      prof.fullname?.toLowerCase().includes(search) ||
      prof.email?.toLowerCase().includes(search) ||
      prof.ms?.toLowerCase().includes(search)
  );
});

const filterCourses = (
  courses: GetAvailableCourses[],
  search: string,
  field: "name" | "courseID"
): GetAvailableCourses[] => {
  const searchTerm = search.toLowerCase().trim();
  if (!searchTerm) return courses;
  return courses.filter((c) => c[field]?.toLowerCase().includes(searchTerm));
};

const filteredCourses = computed(() => {
  let result = availableCourses.value;
  if (courseIdSearch.value) {
    result = filterCourses(result, courseIdSearch.value, "courseID");
  }
  if (courseNameSearch.value) {
    result = filterCourses(result, courseNameSearch.value, "name");
  }
  // Use !!course.value.creditNumber to check if it's a non-zero number
  if (!!course.value.creditNumber && course.value.creditNumber > 0) {
    // Ensure comparison with number
    const creditNum = Number(course.value.creditNumber);
    result = result.filter((c) => c.nCredit === creditNum);
  }
  return result;
});

const filteredCredits = computed(() => {
  let coursesForCreditFilter = availableCourses.value;
  if (courseIdSearch.value) {
    coursesForCreditFilter = filterCourses(
      coursesForCreditFilter,
      courseIdSearch.value,
      "courseID"
    );
  }
  if (courseNameSearch.value) {
    coursesForCreditFilter = filterCourses(
      coursesForCreditFilter,
      courseNameSearch.value,
      "name"
    );
  }
  const uniqueCredits = [
    ...new Set(coursesForCreditFilter.map((c) => c.nCredit)),
  ]
    .filter((c) => c > 0)
    .sort((a, b) => a - b);

  if (!creditSearch.value) return uniqueCredits;
  const creditSearchTerm = creditSearch.value.trim();
  if (!creditSearchTerm) return uniqueCredits;

  return uniqueCredits.filter((c) => c.toString().includes(creditSearchTerm));
});

// Update other fields when selecting from Autocomplete
const updateFromName = (name: string | null) => {
  if (!name) return;
  // Find based on the currently filtered list
  const selectedCourse = filteredCourses.value.find((c) => c.name === name);
  if (selectedCourse) {
    if (course.value.courseID !== selectedCourse.courseID) {
      course.value.courseID = selectedCourse.courseID;
      courseIdSearch.value = ""; // Clear search field model
    }
    if (course.value.creditNumber !== selectedCourse.nCredit) {
      course.value.creditNumber = selectedCourse.nCredit;
      creditSearch.value = ""; // Clear search field model
    }
  }
};

const updateFromId = (id: string | null) => {
  if (!id) return;
  const selectedCourse = filteredCourses.value.find((c) => c.courseID === id);
  if (selectedCourse) {
    if (course.value.name !== selectedCourse.name) {
      course.value.name = selectedCourse.name;
      courseNameSearch.value = "";
    }
    if (course.value.creditNumber !== selectedCourse.nCredit) {
      course.value.creditNumber = selectedCourse.nCredit;
      creditSearch.value = "";
    }
  }
};

const updateFromCredit = (credit: number | string | null) => {
  // Handle string input from search potentially
  const creditNum = typeof credit === "string" ? parseInt(credit, 10) : credit;
  if (creditNum === null || isNaN(creditNum) || creditNum <= 0) return;

  // If name and ID are already filled, don't override
  if (course.value.name && course.value.courseID) return;

  const matchingCourse = filteredCourses.value.find(
    (c) => c.nCredit === creditNum
  );
  if (matchingCourse) {
    if (!course.value.name) {
      course.value.name = matchingCourse.name;
      courseNameSearch.value = "";
    }
    if (!course.value.courseID) {
      course.value.courseID = matchingCourse.courseID;
      courseIdSearch.value = "";
    }
  }
};

// Lifecycle Hook
onMounted(() => {
  fetchAvailableCourses();
  fetchProfessorInfoList();
});
</script>

<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-8">
          <h1 class="text-h4 font-weight-bold gradient-text">
            Course Management
          </h1>
          <v-spacer></v-spacer>
          <v-chip color="primary" variant="outlined" class="px-4">
            <v-icon start>mdi-book-open-variant</v-icon>
            <span class="text-body-1">Admin Portal</span>
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-row class="gutter-xl">
      <!-- Left Section: Single Course Creation -->
      <v-col cols="12" md="6">
        <v-card elevation="3" class="rounded-xl border-card d-flex flex-column">
          <div class="card-header pa-6">
            <v-icon color="primary" size="x-large" class="mb-3"
              >mdi-book-plus</v-icon
            >
            <h2 class="text-h5 font-weight-bold">Create Course</h2>
            <p class="text-subtitle-2 text-medium-emphasis mb-0">
              Add a new course with details
            </p>
          </div>
          <v-divider></v-divider>

          <!-- *** Add ref="courseForm" here *** -->
          <v-form
            ref="courseForm"
            @submit.prevent="submitCourse"
            class="d-flex flex-column flex-grow-1"
          >
            <v-card-text class="pa-6 flex-grow-1">
              <!-- Course ID Autocomplete -->
              <v-autocomplete
                v-model="course.courseID"
                :items="filteredCourses"
                :loading="dataLoading"
                item-title="courseID"
                item-value="courseID"
                label="Course ID*"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-format-list-numbered"
                :rules="[(v) => !!v || 'Course ID is required']"
                required
                hide-details="auto"
                clearable
                :search-input.sync="courseIdSearch"
                @update:modelValue="updateFromId"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.courseID"
                    :subtitle="item.raw.name"
                  ></v-list-item>
                </template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        dataLoading
                          ? "Loading courses..."
                          : "No matching courses found"
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <!-- Course Name Autocomplete -->
              <v-autocomplete
                v-model="course.name"
                :items="filteredCourses"
                :loading="dataLoading"
                item-title="name"
                item-value="name"
                label="Course Name*"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-book-open-page-variant"
                :rules="[(v) => !!v || 'Course name is required']"
                required
                hide-details="auto"
                clearable
                :search-input.sync="courseNameSearch"
                @update:modelValue="updateFromName"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="item.raw.courseID"
                  ></v-list-item>
                </template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        dataLoading
                          ? "Loading courses..."
                          : "No matching courses found"
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <!-- Credit Number Autocomplete -->
              <v-autocomplete
                v-model.number="course.creditNumber"
                :items="filteredCredits"
                :loading="dataLoading"
                label="Credit Number*"
                type="number"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-numeric"
                :rules="[
                  (v) =>
                    (v !== null && v !== undefined && v !== '') ||
                    'Credit number is required', // Check for empty string too if type=number allows it
                  (v) =>
                    Number(v) > 0 || 'Credit number must be greater than 0',
                ]"
                required
                hide-details="auto"
                clearable
                :search-input.sync="creditSearch"
                @update:modelValue="updateFromCredit"
              >
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        dataLoading
                          ? "Loading credits..."
                          : "No matching credits found"
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <!-- Professor Autocomplete (Corrected #item slot) -->
              <v-autocomplete
                v-model="course.professorID"
                :items="filteredProfessors"
                :loading="dataLoading"
                item-value="ms"
                item-title="fullname"
                label="Assign Professor*"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-account-tie"
                :rules="[(v) => !!v || 'Professor is required']"
                required
                hide-details="auto"
                clearable
              >
                <template #item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.fullname || 'N/A'"
                    :subtitle="`${item.raw.email} (${item.raw.ms})`"
                    lines="two"
                  />
                </template>
                <template v-slot:selection="{ item }">
                  <span>{{ item.raw.fullname }} ({{ item.raw.ms }})</span>
                </template>
                <template #prepend-item>
                  <v-list-item class="pb-0">
                    <v-text-field
                      v-model="professorSearch"
                      placeholder="Search by name, email, or ID..."
                      variant="underlined"
                      density="compact"
                      hide-details
                      autofocus
                      prepend-inner-icon="mdi-magnify"
                      @click.stop
                    />
                  </v-list-item>
                  <v-divider class="mt-2 mb-0"></v-divider>
                </template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        dataLoading
                          ? "Loading professors..."
                          : "No professors found."
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <!-- Semester Number -->
              <v-text-field
                v-model.number="course.nSemester"
                label="Semester Number*"
                variant="outlined"
                type="number"
                min="1"
                step="1"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-calendar-range"
                :rules="[
                  (v) =>
                    (v !== null && v !== undefined && v !== '') ||
                    'Semester number is required',
                  (v) => Number(v) > 0 || 'Semester number must be positive',
                ]"
                required
                hide-details="auto"
              ></v-text-field>

              <!-- Class Name -->
              <v-text-field
                v-model="course.class_name"
                label="Class Name / Code*"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-school"
                placeholder="e.g., L01"
                :rules="[(v) => !!v || 'Class name/code is required']"
                required
                hide-details="auto"
              ></v-text-field>

              <!-- Start Date -->
              <v-text-field
                v-model="course.startDate"
                label="Start Date*"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-calendar-start"
                :rules="[(v) => !!v || 'Start date is required']"
                required
                hide-details="auto"
              ></v-text-field>

              <!-- End Date -->
              <v-text-field
                v-model="course.endDate"
                label="End Date*"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4 rounded-lg"
                prepend-inner-icon="mdi-calendar-end"
                :rules="[
                  (v) => !!v || 'End date is required',
                  (v) =>
                    !v ||
                    !course.startDate ||
                    v >= course.startDate ||
                    'End date cannot be before start date',
                ]"
                required
                hide-details="auto"
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="d-flex justify-end pa-6 mt-auto">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-refresh"
                class="rounded-lg mr-4"
                @click="resetForm"
              >
                Reset
              </v-btn>
              <!-- *** Use type="submit" and remove @click *** -->
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                class="rounded-lg"
                variant="elevated"
                prepend-icon="mdi-check-circle"
                :disabled="loading || course.studentIDs.length === 0"
              >
                Create Course ({{ course.studentIDs.length }} Student{{
                  course.studentIDs.length !== 1 ? "s" : ""
                }})
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>

      <!-- Right Section: Student IDs Import -->
      <v-col cols="12" md="6">
        <v-card elevation="3" class="rounded-xl border-card d-flex flex-column">
          <div class="card-header pa-6">
            <v-icon color="primary" size="x-large" class="mb-3"
              >mdi-account-group-outline</v-icon
            >
            <h2 class="text-h5 font-weight-bold">Import Student IDs</h2>
            <p class="text-subtitle-2 text-medium-emphasis mb-0">
              Upload or drag & drop an Excel file with a 'StudentID' column.
            </p>
          </div>
          <v-divider></v-divider>
          <v-card-text class="pa-6 flex-grow-1 d-flex flex-column">
            <!-- Template Section -->
            <div class="template-section mb-6">
              <div
                class="d-flex align-center justify-space-between mb-3 flex-wrap gap-2"
              >
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2"
                    >mdi-file-document-outline</v-icon
                  >
                  <h3 class="text-subtitle-1 font-weight-bold mb-0">
                    Template Format
                  </h3>
                </div>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-file-download-outline"
                  class="rounded-lg px-4"
                  @click="downloadTemplate"
                  size="small"
                >
                  Download Template
                </v-btn>
              </div>
              <v-sheet
                rounded="lg"
                elevation="1"
                class="pa-2 mb-4 bg-grey-lighten-4"
              >
                <v-table density="compact" class="rounded-lg">
                  <thead>
                    <tr class="bg-grey-lighten-3">
                      <th class="text-left text-primary font-weight-bold">
                        StudentID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>20191234</td>
                    </tr>
                    <tr>
                      <td>20205678</td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">...</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-sheet>
            </div>

            <!-- Student ID Count -->
            <div class="mb-4 text-center">
              <v-chip
                :color="
                  course.studentIDs.length > 0
                    ? 'success'
                    : 'blue-grey-lighten-1'
                "
                variant="elevated"
                size="large"
                label
              >
                <v-icon start>mdi-account-check-outline</v-icon>
                {{ course.studentIDs.length }} Student{{
                  course.studentIDs.length !== 1 ? "s" : ""
                }}
                Added
              </v-chip>
              <v-btn
                v-if="course.studentIDs.length > 0"
                icon="mdi-delete-sweep-outline"
                variant="text"
                color="error"
                size="small"
                class="ml-2"
                @click="course.studentIDs = []"
                title="Clear Student List"
              />
            </div>

            <!-- Upload Section -->
            <div class="import-section mt-auto">
              <!-- Push upload to bottom if content above is short -->
              <div class="d-flex align-center mb-3">
                <v-icon color="primary" class="mr-2"
                  >mdi-cloud-upload-outline</v-icon
                >
                <h3 class="text-subtitle-1 font-weight-bold mb-0">
                  Upload Student IDs File
                </h3>
              </div>
              <div
                class="drop-zone pa-8 text-center rounded-lg"
                :class="{ dragging: isDragging, 'has-file': excelFile }"
                @dragenter.prevent="isDragging = true"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <v-icon
                  size="40"
                  class="mb-3"
                  :color="excelFile ? 'success' : 'primary'"
                >
                  {{
                    excelFile
                      ? "mdi-file-check-outline"
                      : "mdi-cloud-upload-outline"
                  }}
                </v-icon>
                <p class="mb-3 text-body-2">
                  {{
                    excelFile
                      ? `Selected: ${excelFile.name}`
                      : "Drag and drop Excel file here or click below"
                  }}
                </p>
                <v-btn
                  :color="excelFile ? 'grey' : 'primary'"
                  variant="elevated"
                  class="rounded-lg px-4"
                  prepend-icon="mdi-file-excel-outline"
                  @click="triggerFileInput"
                  :disabled="importLoading"
                  size="small"
                >
                  {{ excelFile ? "Change File" : "Select Excel" }}
                </v-btn>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  style="display: none"
                  @change="handleFileChange"
                />
              </div>

              <v-progress-linear
                v-if="importLoading"
                indeterminate
                color="primary"
                class="mt-4 rounded-xl"
                height="6"
              ></v-progress-linear>

              <v-alert
                v-if="importErrors.length && !importLoading && showPreview"
                type="error"
                variant="tonal"
                class="mt-4 rounded-lg"
                border="start"
                closable
                density="compact"
                @update:modelValue="importErrors = []"
              >
                <div class="font-weight-bold mb-1 text-caption">
                  Import Issues Found:
                </div>
                <ul class="pl-4 text-caption" style="list-style-type: disc">
                  <li
                    v-for="(error, index) in importErrors.slice(0, 5)"
                    :key="`err-${index}`"
                  >
                    {{ error }}
                  </li>
                </ul>
                <div
                  v-if="importErrors.length > 5"
                  class="mt-1 text-caption font-italic"
                >
                  ... and {{ importErrors.length - 5 }} more issues.
                </div>
              </v-alert>

              <v-expand-transition>
                <div
                  v-if="showPreview && !importLoading && previewData.length > 0"
                  class="mt-4"
                >
                  <div
                    class="d-flex align-center justify-space-between mb-2 flex-wrap gap-2"
                  >
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-2" size="small"
                        >mdi-clipboard-list-outline</v-icon
                      >
                      <h3 class="text-subtitle-2 font-weight-bold mb-0">
                        Preview New Valid IDs
                      </h3>
                    </div>
                    <v-chip color="success" size="x-small" label
                      >{{ previewData.length }} new valid ID(s)</v-chip
                    >
                  </div>
                  <v-sheet
                    rounded="lg"
                    elevation="1"
                    class="pa-1 mb-2 bg-grey-lighten-4"
                  >
                    <v-table
                      density="compact"
                      class="rounded-lg bg-transparent"
                    >
                      <thead>
                        <tr class="bg-grey-lighten-3">
                          <th
                            class="text-left text-primary font-weight-bold text-caption"
                          >
                            New StudentID
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(id, i) in previewData.slice(0, 5)"
                          :key="`preview-id-${i}`"
                        >
                          <td class="text-caption">{{ id }}</td>
                        </tr>
                        <tr v-if="previewData.length > 5">
                          <td
                            class="text-center text-caption text-medium-emphasis"
                          >
                            + {{ previewData.length - 5 }} more IDs
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-sheet>
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="rounded-lg text-caption"
                  >
                    These {{ previewData.length }} new IDs were added to the
                    main list. Submit the course on the left to save.
                  </v-alert>
                </div>
                <div
                  v-else-if="
                    showPreview &&
                    !importLoading &&
                    importErrors.length > 0 &&
                    previewData.length === 0
                  "
                  class="mt-4"
                >
                  <v-alert
                    type="warning"
                    variant="tonal"
                    class="rounded-lg text-caption"
                    density="compact"
                  >
                    No new valid Student IDs were found in the file due to the
                    issues listed above. Please correct the file and re-upload.
                  </v-alert>
                </div>
              </v-expand-transition>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="4000"
      location="top right"
      multi-line
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">{{
          snackbarColor === "success"
            ? "mdi-check-circle-outline"
            : snackbarColor === "error"
            ? "mdi-alert-circle-outline"
            : snackbarColor === "warning"
            ? "mdi-alert-outline"
            : "mdi-information-outline"
        }}</v-icon>
        <span class="text-body-2">{{ snackbarText }}</span>
      </div>
      <template #actions>
        <v-btn
          :color="snackbarColor === 'error' ? 'white' : 'primary'"
          variant="text"
          @click="snackbar = false"
          size="small"
          >Close</v-btn
        >
      </template>
    </v-snackbar> -->
  </v-container>
</template>

<style scoped>
.border-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%; /* Make cards in the same row equal height */
}

.border-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    transparent 50%
  );
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.drop-zone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  background-color: rgba(var(--v-theme-primary), 0.02);
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.dragging {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: scale(1.02);
}

.drop-zone.has-file {
  border-color: rgb(var(--v-theme-success));
  border-style: solid;
  background-color: rgba(var(--v-theme-success), 0.05);
}

.gutter-xl {
  margin: 0 -12px; /* Adjusted gutter */
}

.gutter-xl > [class*="col-"] {
  padding: 12px 12px; /* Added vertical padding too */
}

.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Ensure consistent rounded corners for fields */
:deep(.v-field) {
  border-radius: 8px !important;
}
:deep(.v-field__outline__start) {
  border-radius: 8px 0 0 8px !important;
}
:deep(.v-field__outline__end) {
  border-radius: 0 8px 8px 0 !important;
}

/* Custom Autocomplete Item Styling */
:deep(.v-list-item-title) {
  font-size: 0.95rem;
  line-height: 1.3;
}
:deep(.v-list-item-subtitle) {
  font-size: 0.8rem;
  line-height: 1.2;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.gradient-text {
  background: -webkit-linear-gradient(45deg, #1e88e5, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gap-2 {
  gap: 0.5rem; /* 8px */
}
.gap-4 {
  gap: 1rem; /* 16px */
}

/* Style the search field inside autocomplete */
:deep(.v-list-item .v-text-field .v-field__input) {
  font-size: 0.9em;
  padding-top: 4px;
  padding-bottom: 4px;
}
:deep(.v-table--density-compact > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table--density-compact > .v-table__wrapper > table > thead > tr > th),
:deep(.v-table--density-compact > .v-table__wrapper > table > tfoot > tr > td) {
  height: 36px; /* Adjust compact table row height */
}

.bg-transparent {
  background-color: transparent !important;
}
</style>
