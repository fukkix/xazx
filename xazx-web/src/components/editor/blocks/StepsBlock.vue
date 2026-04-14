<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore, createNode } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import StepItemBlock from './StepItemBlock.vue'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const items = computed(() => (props.node.children || []).filter((c) => c.type === 'step-item'))

function onClick() {
  store.selectedNodeId = props.node.id
}

function addStep() {
  const step = createNode('step-item', { content: '' })
  const children = [...(props.node.children || []), step]
  store.updateNode(props.node.id, { children })
}

function removeStep(index: number) {
  const children = [...(props.node.children || [])]
  children.splice(index, 1)
  store.updateNode(props.node.id, { children })
}

function updateStep(index: number, content: string) {
  const children = [...(props.node.children || [])]
  if (children[index]) {
    children[index] = { ...children[index], content }
    store.updateNode(props.node.id, { children })
  }
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="space-y-2">
      <StepItemBlock
        v-for="(item, idx) in items"
        :key="item.id"
        :index="idx + 1"
        :content="item.content || ''"
        @update="(v) => updateStep(idx, v)"
        @remove="removeStep(idx)"
      />
    </div>
    <div class="mt-2">
      <el-button size="small" text @click.stop="addStep">+ 添加步骤</el-button>
    </div>
  </div>
</template>
