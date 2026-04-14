<script setup lang="ts">
const props = defineProps<{
  index: number
  content: string
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'remove'): void
}>()

function onInput(e: Event) {
  const target = e.target as HTMLElement
  emit('update', target.innerText)
}
</script>

<template>
  <div class="flex items-start gap-3 group">
    <div class="flex-shrink-0 w-16 text-sm font-bold text-primary text-right pt-0.5">
      步骤{{ index }}
    </div>
    <div
      class="flex-1 text-sm text-on-surface outline-none min-h-[1.5em]"
      contenteditable
      @input="onInput"
      v-text="content"
    />
    <el-button
      class="opacity-0 group-hover:opacity-100 transition-opacity"
      size="small"
      type="danger"
      text
      @click="emit('remove')"
    >
      删除
    </el-button>
  </div>
</template>
