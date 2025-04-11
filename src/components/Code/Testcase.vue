<template>
  <div>
    <!-- Toggle button -->
    <div class="test-cases-header d-flex align-center px-2" @click="toggleTestCases">
      <v-icon :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="small" class="mr-2"></v-icon>
      <span class="text-body-2">Testcase Panel</span>
      <v-spacer></v-spacer>
    </div>

    <!-- Collapsible test cases container -->
    <v-expand-transition>
      <v-sheet v-if="isExpanded" class="test-cases d-flex flex-column" :height="testCasesHeight" color="grey-darken-4">
        <v-tabs v-model="testTab" color="primary">
          <v-tab value="testcase">Testcase</v-tab>
          <v-tab value="result">Result</v-tab>
        </v-tabs>

        <v-window v-model="testTab" class="d-flex flex-column flex-grow-1">
          <!-- Testcase Tab -->
          <v-window-item value="testcase">
            <v-card-text class="d-flex flex-column flex-grow-1" style="overflow: hidden">
              <div class="d-flex align-center mb-2">
                <v-btn size="small" variant="outlined" color="primary" @click="addTestcase">
                  <v-icon start>mdi-plus</v-icon> Add Custom Testcase
                </v-btn>
                <v-spacer></v-spacer>
              </div>

              <v-tabs v-model="activeTestcaseIndex" grow class="testcase-tab-bar" show-arrows>
                <v-tab v-for="(tc, index) in combinedTestcases" :key="index" :value="index">
                  {{ tc.isPublic ? 'Public' : 'Custom' }} #{{ index + 1 }}
                </v-tab>
              </v-tabs>

              <v-window v-model="activeTestcaseIndex" class="overflow-auto flex-grow-1">
                <v-window-item v-for="(tc, index) in combinedTestcases" :key="index" :value="index">
                  <v-row class="mt-2">
                    <v-col cols="12" md="6">
                      <v-textarea
                        :model-value="tc.input"
                        label="Input"
                        bg-color="grey-darken-3"
                        auto-grow
                        density="compact"
                        class="monospace scroll-box"
                        rows="4"
                        max-rows="10"
                        :readonly="tc.isPublic"
                        @update:model-value="onInputChange(index, 'input', $event)"
                      ></v-textarea>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-textarea
                        :model-value="tc.expected_output"
                        label="Expected Output"
                        bg-color="grey-darken-3"
                        auto-grow
                        density="compact"
                        class="monospace scroll-box"
                        rows="4"
                        max-rows="10"
                        :readonly="tc.isPublic"
                        @update:model-value="onInputChange(index, 'expected_output', $event)"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-window-item>

          <!-- Result Tab -->
          <v-window-item value="result">
            <v-card-text class="overflow-auto" style="max-height: calc(100% - 48px)">
              <div v-if="testResult">
                <pre class="result-pre">{{ testResult }}</pre>
              </div>
              <div v-else class="text-center">
                Run code to see results
              </div>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-sheet>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface CustomTestcase {
  input: string;
  expected_output: string;
  isPublic?: false;
}

interface PublicTestcase {
  input: string;
  expected_output: string;
  isPublic: true;
}

type Testcase = CustomTestcase | PublicTestcase;

const props = withDefaults(defineProps<{
  initialTab?: string;
  result?: string;
  publicTestcases?: PublicTestcase[];
  maxVisibleTestcases?: number;
}>(), {
  initialTab: 'testcase',
  result: '',
  publicTestcases: () => [],
  maxVisibleTestcases: 2,
});

const emit = defineEmits<{
  (e: 'update:tab', tab: string): void;
  (e: 'update:input', input: CustomTestcase[]): void;
  (e: 'toggle', isExpanded: boolean): void;
}>();

const testTab = ref(props.initialTab);
const testResult = ref(props.result);
const isExpanded = ref(true);
const testCasesHeight = ref('300px');
const activeTestcaseIndex = ref(0);

const customTestcases = ref<CustomTestcase[]>([]);

const combinedTestcases = computed<Testcase[]>(() => [
  ...props.publicTestcases.map(tc => ({ ...tc, isPublic: true as const })),
  ...customTestcases.value,
]);

const toggleTestCases = () => {
  isExpanded.value = !isExpanded.value;
  emit('toggle', isExpanded.value);
};

const addTestcase = () => {
  customTestcases.value.push({ input: '', expected_output: '' });
  activeTestcaseIndex.value = props.publicTestcases.length + customTestcases.value.length - 1;
};

const onInputChange = (index: number, field: 'input' | 'expected_output', value: string) => {
  const publicLength = props.publicTestcases.length;
  if (index >= publicLength) {
    const i = index - publicLength;
    customTestcases.value[i][field] = value;
  }
};

watch(() => props.result, (newVal) => {
  testResult.value = newVal;
  if (newVal) {
    testTab.value = 'result';
    isExpanded.value = true;
    emit('toggle', true);
  }
});

watch(testTab, (newVal) => emit('update:tab', newVal));
watch(customTestcases, (newVal) => emit('update:input', newVal), { deep: true });
</script>

<style scoped>
.test-cases {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.test-cases-header {
  cursor: pointer;
  height: 36px;
  background-color: rgba(66, 66, 66, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

:deep(.v-field__input) {
  font-family: monospace;
}

.result-pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 100%;
  overflow: auto;
}

.monospace {
  font-family: monospace;
}

.scroll-box {
  max-height: 240px;
  overflow: auto;
}
</style>

