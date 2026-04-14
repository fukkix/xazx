<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)

function onClick() {
  store.selectedNodeId = props.node.id
}

function updateContent(e: Event) {
  const target = e.target as HTMLElement
  store.updateNodeSilent(props.node.id, { content: target.innerText })
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
    <div class="flex items-center gap-2">
      <el-icon class="text-primary"><ArrowRight /></el-icon>
      <div
        class="flex-1 text-sm text-on-surface font-medium outline-none min-h-[1.5em]"
        contenteditable
        @input="updateContent"
        @blur="onBlur"
        v-text="node.content"
      />
    </div>
  </div>
</template>
