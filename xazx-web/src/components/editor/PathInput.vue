<script setup lang="ts">
import { ref, computed } from 'vue'
import { DEFAULT_PATHS } from '@/types/editor'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const query = ref('')
const filtered = computed(() =>
  DEFAULT_PATHS.filter((p) => p.includes(query.value)).slice(0, 8),
)

function select(path: string) {
  emit('update:modelValue', path)
  query.value = ''
}
</script>

<template>
  <div class="relative">
    <el-input
      :model-value="modelValue"
      placeholder="输入 [ 触发路径建议"
      @input="(v: string) => { query = v; emit('update:modelValue', v) }"
    />
    <div
      v-if="query && filtered.length"
      class="absolute z-10 mt-1 w-full bg-white border border-outline max-h-40 overflow-auto"
    >
      <div
        v-for="path in filtered"
        :key="path"
        class="px-3 py-2 text-sm hover:bg-primary/5 cursor-pointer"
        @click="select(path)"
      >
        {{ path }}
      </div>
    </div>
  </div>
</template>
