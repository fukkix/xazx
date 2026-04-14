<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import BlockRenderer from '../BlockRenderer.vue'
import TagBadge from '../TagBadge.vue'

const props = defineProps<{
  node: DocNode
  depth?: number
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const paddingLeft = computed(() => (props.depth || 0) * 16)

function updateContent(e: Event) {
  const target = e.target as HTMLElement
  store.updateNodeSilent(props.node.id, { content: target.innerText })
}

function onBlur(e: Event) {
  const target = e.target as HTMLElement
  store.updateNode(props.node.id, { content: target.innerText })
}

function onClick() {
  store.selectedNodeId = props.node.id
}

function changeLevel(delta: number) {
  const newLevel = Math.max(1, Math.min(6, (props.node.level || 1) + delta))
  store.updateNode(props.node.id, { level: newLevel })
}
</script>

<template>
  <div
    class="heading-block py-3 px-3 rounded-lg border-2 cursor-pointer transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    :style="{ paddingLeft: `${paddingLeft + 12}px` }"
    @click.stop="onClick"
  >
    <div class="flex items-center gap-2">
      <div
        class="font-bold text-on-surface outline-none flex-1"
        :class="{
          'text-2xl': node.level === 1,
          'text-xl': node.level === 2,
          'text-lg': node.level === 3,
          'text-base': node.level === 4,
          'text-sm': node.level === 5,
          'text-xs': node.level === 6,
        }"
        contenteditable
        @input="updateContent"
        @blur="onBlur"
        v-text="node.content"
      />
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <el-button size="small" text @click.stop="changeLevel(-1)">←</el-button>
        <span class="text-xs text-secondary">H{{ node.level }}</span>
        <el-button size="small" text @click.stop="changeLevel(1)">→</el-button>
      </div>
      <div class="flex gap-1">
        <TagBadge v-for="tag in node.tags" :key="tag" :tag="tag" />
      </div>
    </div>

    <!-- Children blocks -->
    <div v-if="node.children?.length" class="mt-2 space-y-1">
      <BlockRenderer
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="(depth || 0) + 1"
      />
    </div>
  </div>
</template>
