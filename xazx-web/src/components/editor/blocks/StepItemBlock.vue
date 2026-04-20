<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  index: number
  content: string
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'remove'): void
}>()

const contentRef = ref<HTMLElement | null>(null)
const isComposing = ref(false)

watch(
  () => props.content,
  (val) => {
    if (contentRef.value && contentRef.value.innerText !== val) {
      contentRef.value.innerText = val
    }
  },
  { immediate: true },
)

function onInput(e: Event) {
  if (isComposing.value) return
  const target = e.target as HTMLElement
  emit('update', target.innerText)
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd(e: Event) {
  isComposing.value = false
  const target = e.target as HTMLElement
  emit('update', target.innerText)
}

function onBlur(e: Event) {
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
      ref="contentRef"
      class="flex-1 text-sm text-on-surface outline-none min-h-[1.5em]"
      contenteditable
      @input="onInput"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @blur="onBlur"
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
