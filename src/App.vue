<template>
  <v-app>
    <v-main :class="mainContentClass">
      <ErrorAlert ref="errorAlert" />
      <SuccessAlert ref="successAlert" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed, provide } from "vue";
// import { ref, computed } from "vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import SuccessAlert from "./components/SuccessAlert.vue";
const sidebarExpanded = ref(false);

const errorAlert = ref<InstanceType<typeof ErrorAlert> | null>(null);
const successAlert = ref<InstanceType<typeof SuccessAlert> | null>(null);

// Computed class for main content
const mainContentClass = computed(() => ({
  "transition-margin": true,
  "duration-300": true,
  "": !sidebarExpanded.value,
  "ml-64": sidebarExpanded.value,
}));

provide("showError", (message: string) => {
  if (errorAlert.value) {
    errorAlert.value.showError(message);
  }
});

provide("showSuccess", (message: string) => {
  if (successAlert.value) {
    successAlert.value.showSuccess(message);
  }
});
</script>

<style scoped>
.transition-margin {
  transition: margin-left 0.3s ease-in-out;
}
</style>
