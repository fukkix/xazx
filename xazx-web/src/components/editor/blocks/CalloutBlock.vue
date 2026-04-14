<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const contentRef = ref<HTMLElement | null>(null)
const isComposing = ref(false)

watch(
  () => props.node.content,
  (val) => {
    if (contentRef.value && contentRef.value.innerText !== val) {
      contentRef.value.innerText = val || ''
    }
  },
  { immediate: true },
)

function onClick() {
  store.selectedNodeId = props.node.id
}

function onInput(e: Event) {
  if (isComposing.value) return
  const target = e.target as HTMLElement
  store.updateNodeSilent(props.node.id, { content: target.innerText })
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd(e: Event) {
  isComposing.value = false
  const target = e.target as HTMLElement
  store.updateNode(props.node.id, { content: target.innerText })
}

function onBlur(e: Event) {
  const target = e.target as HTMLElement
  store.updateNode(props.node.id, { content: target.innerText })
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 cursor-text transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-start gap-2 bg-yellow-50 rounded-lg px-3 py-2">
      <el-icon class="text-yellow-600 mt-0.5"><Warning /></el-icon>
      <div
        ref="contentRef"
        class="flex-1 text-sm text-yellow-900 outline-none min-h-[1.5em]"
        contenteditable
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @blur="onBlur"
      />
    </div>
  </div>
</template>
