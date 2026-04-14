<script setup lang="ts">
const props = defineProps<{
  tag: string
}>()

const colorMap: Record<string, string> = {
  '独享版': 'bg-purple-100 text-purple-700 border-purple-200',
  '旗舰版': 'bg-amber-100 text-amber-700 border-amber-200',
  'Beta': 'bg-blue-100 text-blue-700 border-blue-200',
  'V3.6.4': 'bg-gray-100 text-gray-700 border-gray-200',
  'V3.6.5': 'bg-gray-100 text-gray-700 border-gray-200',
}

const cls = computed(() => {
  return (
    colorMap[props.tag] ||
    'bg-surface-container-high text-on-surface border-outline-variant'
  )
})
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border"
    :class="cls"
  >
    《{{ tag }}》
  </span>
</template>
