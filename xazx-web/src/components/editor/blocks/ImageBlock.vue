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
const fileInputRef = ref<HTMLInputElement | null>(null)

function onClick() {
  store.selectedNodeId = props.node.id
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  store.updateNode(props.node.id, { file, url, content: file.name, alt: file.name })
  input.value = ''
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
    class="py-2 px-3 border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-secondary font-medium">图片</span>
      <div class="flex gap-2">
        <el-button size="small" text @click.stop="triggerUpload">
          <el-icon class="mr-1"><Upload /></el-icon>上传
        </el-button>
        <el-button
          v-if="node.url || node.file"
          size="small"
          text
          @click.stop="showAnnotator = true"
        >
          <el-icon class="mr-1"><EditPen /></el-icon>标注
        </el-button>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />

    <div v-if="node.url || node.file" class="relative">
      <img
        :src="getImageUrl()"
        :alt="node.alt || ''"
        class="max-w-full max-h-64 object-contain rounded border border-outline"
      />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-8 text-secondary bg-surface-container-low border border-dashed border-outline cursor-pointer hover:border-primary/40 transition-colors" @click.stop="triggerUpload">
      <el-icon :size="32" class="mb-2 opacity-50"><Picture /></el-icon>
      <span class="text-sm">点击上传或拖拽图片到此处</span>
    </div>

    <div class="mt-2">
      <el-input
        size="small"
        :model-value="node.alt || ''"
        placeholder="ALT 描述（可选）"
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
