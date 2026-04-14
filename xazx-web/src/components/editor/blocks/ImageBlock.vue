<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import ImageAnnotator from '../ImageAnnotator.vue'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const showAnnotator = ref(false)

function onClick() {
  store.selectedNodeId = props.node.id
}

function updateAlt(e: Event) {
  const target = e.target as HTMLInputElement
  store.updateNode(props.node.id, { alt: target.value })
}

function getImageUrl() {
  return props.node.url || (props.node.file ? URL.createObjectURL(props.node.file) : '')
}

function onAnnotateDone(blob: Blob) {
  const file = new File([blob], props.node.file?.name || 'annotated.png', { type: 'image/png' })
  const url = URL.createObjectURL(file)
  store.updateNode(props.node.id, { file, url, content: file.name })
  showAnnotator.value = false
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-secondary">图片</span>
      <div class="flex gap-2">
        <el-button v-if="node.url || node.file" size="small" text @click.stop="showAnnotator = true">标注</el-button>
      </div>
    </div>

    <div v-if="node.url || node.file" class="relative">
      <img
        :src="getImageUrl()"
        :alt="node.alt || ''"
        class="max-w-full max-h-64 object-contain rounded border border-outline-variant"
      />
    </div>
    <div v-else class="text-secondary text-xs">无图片预览</div>

    <div class="mt-2">
      <el-input
        size="small"
        :model-value="node.alt || ''"
        placeholder="ALT 描述"
        @input="(v: string) => store.updateNodeSilent(props.node.id, { alt: v })"
        @change="(v: string) => store.updateNode(props.node.id, { alt: v })"
      />
    </div>
  </div>

  <ImageAnnotator
    v-if="showAnnotator"
    :image-url="getImageUrl()"
    @save="onAnnotateDone"
    @cancel="showAnnotator = false"
  />
</template>
