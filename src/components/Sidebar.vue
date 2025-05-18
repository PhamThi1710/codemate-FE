<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="!expanded"
    @mouseenter="handleExpand(true)"
    @mouseleave="handleExpand(false)"
    permanent
    elevation="2"
    class="sidebar-navigation bg-background dark:bg-background text-text-primary dark:text-text-primary"
    width="300"
    rail-width="100"
  >
    <div class="d-flex flex-column h-100">
      <!-- Fixed Header -->
      <div class="flex-grow-0 pa-4">
        <v-list>
          <v-list-item
            :active="false"
            @click="handleNavigateToDashboard"
            prepend-avatar="@/assets/codemate.png"
            title="CODEMATE"
            class="text-heading-2 mb-2 text-text-primary dark:text-text-primary cursor-pointer"
          >
          </v-list-item>
        </v-list>

        <v-divider
          class="border-opacity-100 border-border dark:border-border"
        ></v-divider>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-grow-1 overflow-y-auto">
        <v-list density="comfortable" nav class="pa-3">
          <template v-for="item in filteredNavigationItems" :key="item.value">
            <!-- For items with children -->
            <v-list-group
              v-if="item.children"
              :value="item.value"
              class="rounded-lg mb-1"
            >
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  refclass="text-h6 font-weight-medium py-3 px-4"
                  rounded="lg"
                  active-class="bg-primary-subtle"
                >
                  <template v-slot:prepend>
                    <v-icon size="28" class="mr-3">{{ item.icon }}</v-icon>
                  </template>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in item.children"
                :key="child.value"
                :value="child.value"
                :prepend-icon="child.icon"
                :title="child.title"
                :to="child.to"
                class="pl-10 text-subtitle-1 font-weight-regular py-2 px-4"
                rounded="lg"
                active-class="bg-primary-subtle"
              >
                <template v-slot:prepend>
                  <v-icon size="24" class="mr-3">{{ child.icon }}</v-icon>
                </template>
              </v-list-item>
            </v-list-group>

            <!-- For items without children -->
            <v-list-item
              v-else
              :prepend-icon="item.icon"
              :title="item.title"
              :value="item.value"
              :to="item.to"
              class="text-h6 font-weight-medium py-3 px-4 mb-1"
              rounded="lg"
              active-class="bg-primary-subtle"
            >
              <template v-slot:prepend>
                <v-icon size="28" class="mr-3">{{ item.icon }}</v-icon>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <!-- Footer with Logout Button -->
      <div class="flex-grow-0 pa-4">
        <v-divider
          class="border-opacity-50 border-border dark:border-border mb-4"
        ></v-divider>
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          class="text-h6 font-weight-medium py-3 px-4"
          rounded="lg"
          active-class="bg-error-subtle"
          @click="handleLogout"
        >
          <template v-slot:prepend>
            <v-icon size="28" class="mr-3">mdi-logout</v-icon>
          </template>
        </v-list-item>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import feedbackManagement from "@/assets/icons/feedbackManagement.vue";
const authStore = useAuthStore;
const props = defineProps<{
  modelValue: boolean;
}>();
const router = useRouter();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "expand", value: boolean): void;
}>();
const { user } = authStore.getState();
const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
const showSuccess = inject("showSuccess") as (message: string) => void;
const expanded = ref(false);
const role = computed(() => user?.role);

const handleExpand = (value: boolean) => {
  expanded.value = value;
  emit("expand", value);
};

interface NavigationItem {
  icon: string | typeof feedbackManagement;
  title: string;
  value: string;
  to?: string;
  children?: NavigationItem[];
}
const authState = ref(useAuthStore.getState());
const handleLogout = async () => {
  authState.value.logout();
  router.push("/login");
  showSuccess("Logged out successfully");
};
const studentItems: NavigationItem[] = [
  {
    icon: "mdi-view-dashboard",
    title: "Dashboard",
    value: "dashboard",
    to: "/dashboard",
  },
  {
    icon: "mdi-school",
    title: "My Courses",
    value: "course",
    to: "/courselist",
  },
  {
    icon: "mdi-calendar-check",
    title: "Schedule",
    value: "schedule",
    to: "/schedule",
  }
  // {
  //   icon: "mdi-chart-pie",
  //   title: "My Progress",
  //   value: "progress-tracking",
  //   to: "/progress-tracking",
  // },
  // { icon: "mdi-calendar", title: "Schedule", value: "schedule", to: "/schedule" },
];

const professorItems: NavigationItem[] = [
  {
    icon: "mdi-view-dashboard",
    title: "Professor Dashboard",
    value: "dashboard",
    to: "/professor-dashboard",
  },
  {
    icon: "mdi-school",
    title: "My Courses",
    value: "courselist",
    to: "/professor-courselist",
  },
  {
    icon: "mdi-account-details",
    title: "Feedback Management",
    value: "professor-feedback",
    to: "/professor-feedback",
  },
  {
    icon: "mdi-chart-pie",
    title: "Progress",
    value: "professor-progress",
    to: "/professor-progress",
  },
  // {
  //   icon: "mdi-invoice-text-clock",
  //   title: "Schedule",
  //   value: "professor-schedule",
  //   to: "/professor-schedule",
  // },
];

const adminItems: NavigationItem[] = [
  {
    icon: "mdi-view-dashboard",
    title: "Admin Dashboard",
    value: "admin-dashboard",
    to: "/admin-dashboard",
  },
  {
    icon: "mdi-account-details",
    title: "Feedback Management",
    value: "feedback-management",
    to: "/feedback-management",
  },
  {
    icon: "mdi-account-group",
    title: "User Management",
    value: "user-management",
    to: "/user-management",
  },
  {
    icon: "mdi-code-tags",
    title: "Course Management",
    value: "course-management",
    to: "/course-management",
  },
  {
    icon: "mdi-account-cog",
    title: "Add User",
    value: "add-user",
    to: "/add-user",
  },
  {
    icon: "mdi-account-details",
    title: "Add Course",
    value: "add-course",
    to: "/add-course",
  },
  // {
  //   icon: "mdi-cog",
  //   title: "Settings",
  //   value: "settings",
  //   children: [
  //     {
  //       icon: "mdi-account-cog",
  //       title: "Add User",
  //       value: "add-user",
  //       to: "/add-user",
  //     },
      // {
      //   icon: "mdi-account-details",
      //   title: "Add Course",
      //   value: "add-course",
      //   to: "/add-course",
      // },
  //   ],
  // },
  // {
  //   icon: "mdi-chart-pie",
  //   title: "Statistics",
  //   value: "statistics",
  //   children: [
  //     {
  //       icon: "mdi-chart-bar",
  //       title: "Feedback Statistics",
  //       value: "feedback-statistics",
  //       to: "/feedback-statistics",
  //     },
  //     {
  //       icon: "mdi-chart-line",
  //       title: "System Usage Statistics",
  //       value: "system-usage-statistics",
  //       to: "/system-usage-statistics",
  //     },
  //   ],
  // },
];

// Add a computed property to filter navigation items based on role
const filteredNavigationItems = computed(() => {
  switch (role.value) {
    case "student":
      return studentItems;
    case "professor":
      return professorItems;
    case "admin":
      return adminItems;
    default:
      return [];
  }
});
const handleNavigateToDashboard = () => {
  console.log(role.value);
  if (role.value === "student") {
    router.push("/dashboard");
  } else if (role.value === "professor") {
    router.push("/professor-dashboard");
  } else if (role.value === "admin") {
    router.push("/admin-dashboard");
  }
};
</script>

<style scoped>
.sidebar-navigation {
  height: 100vh !important;
  position: fixed !important;
  z-index: 100;
}

:deep(.v-navigation-drawer__content) {
  height: 100vh !important;
  overflow: hidden !important;
}

.overflow-y-auto {
  overflow-y: auto !important;
  height: calc(100vh - 80px) !important;
}

:deep(.v-navigation-drawer--rail) {
  width: 80px !important;
}

:deep(.v-navigation-drawer) {
  width: 256px !important;
}

/* Optional: Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
.sidebar-navigation {
  transition: all 0.3s ease-in-out;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transition: background-color 0.2s ease;
}

.v-list-group .v-list-item {
  transition: all 0.2s ease;
}

/* Ensure rail mode looks clean */
.v-navigation-drawer--rail .v-list-item__title {
  display: none; /* Hide titles in rail mode */
}

.v-navigation-drawer--rail .v-chip {
  display: none; /* Hide chip in rail mode */
}
</style>
