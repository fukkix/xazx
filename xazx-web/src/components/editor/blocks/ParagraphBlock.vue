<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import TagBadge from '../TagBadge.vue'

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
    <div class="flex items-start gap-2">
      <div
        class="flex-1 text-sm text-on-surface leading-relaxed outline-none min-h-[1.5em]"
        contenteditable
        @input="updateContent"
        @blur="onBlur"
        v-text="node.content"
      />
      <div class="flex gap-1 flex-shrink-0">
        <TagBadge v-for="tag in node.tags" :key="tag" :tag="tag" />
      </div>
    </div>
  </div>
</template>
