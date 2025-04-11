<template>
  <v-container fluid class="pa-0" style="height: 100vh; overflow: auto;">
    <v-row no-gutters class="fill-height">

      <!-- Problem Description Panel -->
      <div
        :style="{ width: sidebarWidth + 'px', minWidth: '400px', maxWidth: '50vw' }"
        class="resizable-sidebar fill-height"
      >
        <ProblemDescription
          :initial-tab="descriptionTab"
          @update:tab="descriptionTab = $event"
        />
        <div class="resize-handle" @mousedown="startResize" />
      </div>

      <!-- Code Editor Panel -->
      <v-col class="fill-height d-flex flex-column" style="min-width: 420px;">
        <div class="d-flex flex-column fill-height">
          <CodeEditor
            modelValue="// Your code here\n"
            onUpdate:modelValue=fn
            language="javascript"
            @run-result="handleRunResult"
            @submit-result="handleSubmitResult"
            @update:loading="isLoading = $event"
            :testInput="{ nums: [2, 7, 11, 15], target: 9 }"
            :style="codeEditorStyle"
          />
          <Testcase
            :initial-tab="testTab"
            :result="testResult"
            :public-testcases="publicTestcases"
            @update:tab="testTab = $event"
            @update:input="testInput = $event"
            @toggle="handleTestcaseToggle"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { CodeExerciseService } from '@/services/CodeExerciseService';
import { DEFAULT_TEST_INPUT } from '@/constants/templateProblem';
import ProblemDescription from '@/components/Code/ProblemDescription.vue';
import CodeEditor from '@/components/Code/CodeEditor.vue';
import Testcase from '@/components/Code/Testcase.vue';

const route = useRoute();
const exerciseId = route.params.exerciseId as string;

// UI States
const descriptionTab = ref('description');
const testTab = ref('testcase');
const testResult = ref('');
const testInput = ref({ ...DEFAULT_TEST_INPUT });
const isLoading = ref(false);
const testcaseExpanded = ref(true);
const publicTestcases = ref([]);

// Fetch public testcases
const fetchPublicTestcases = async () => {
  try {
    const res = await CodeExerciseService.getPublicTestcasesOfAnExercise(exerciseId, {
      showError: true,
      showSuccess: false,
    });
    publicTestcases.value = res.data;
  } catch (err) {
    console.error('Failed to fetch public testcases:', err);
  }
};

onMounted(fetchPublicTestcases);

// Computed dynamic height for CodeEditor
const codeEditorStyle = computed(() => ({
  height: testcaseExpanded.value ? '60%' : 'calc(100% - 36px)',
  minHeight: testcaseExpanded.value ? '300px' : '500px',
  maxHeight: testcaseExpanded.value ? 'calc(100vh - 300px)' : 'calc(100vh - 100px)',
  overflow: 'auto',
  transition: 'height 0.2s ease-in-out',
}));

// Handlers
const handleRunResult = (result: string) => {
  testResult.value = result;
  testTab.value = 'result';
  testcaseExpanded.value = true;
};

const handleSubmitResult = (result: string) => {
  testResult.value = result;
  testTab.value = 'result';
  descriptionTab.value = 'submission';
  testcaseExpanded.value = true;
};

const handleTestcaseToggle = (expanded: boolean) => {
  testcaseExpanded.value = expanded;
};

// Sidebar resize
const sidebarWidth = ref(500);
const startResize = (e: MouseEvent) => {
  const startX = e.clientX;
  const startW = sidebarWidth.value;
  const onMouseMove = (e: MouseEvent) => {
    sidebarWidth.value = Math.max(240, startW + (e.clientX - startX));
  };
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>


<style>
html, body {
  overflow: auto;
  height: 100%;
  margin: 0;
  padding: 0;
}

.border-right {
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.resizable-sidebar {
  position: relative;
  background-color: #1e1e1e;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}
</style>
