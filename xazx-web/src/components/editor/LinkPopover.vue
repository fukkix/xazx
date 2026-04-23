<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'

const emit = defineEmits<{
  (e: 'select', title: string): void
  (e: 'close'): void
}>()

const store = useDocEditorStore()
const query = ref('')

const headings = computed(() =>
  store.allHeadings
    .map((h) => h.content || '')
    .filter((t) => t && t.toLowerCase().includes(query.value.toLowerCase()))
    .slice(0, 10),
)

function select(title: string) {
  emit('select', title)
  emit('close')
}
</script>

<template>
  <div class="bg-white border border-outline p-3 w-64">
    <el-input v-model="query" size="small" placeholder="搜索页面标题..." />
    <div class="mt-2 max-h-40 overflow-auto space-y-1">
      <div
        v-for="title in headings"
        :key="title"
        class="px-2 py-1 text-sm hover:bg-primary/5 cursor-pointer rounded"
        @click="select(title)"
      >
        {{ title }}
      </div>
      <div v-if="!headings.length" class="text-xs text-secondary px-2">无匹配结果</div>
    </div>
  </div>
</template>
