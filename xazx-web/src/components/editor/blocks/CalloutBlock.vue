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

const calloutTypes = [
  { key: 'info', label: '信息', icon: 'InfoFilled', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'warning', label: '警告', icon: 'WarningFilled', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { key: 'success', label: '成功', icon: 'CircleCheckFilled', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { key: 'danger', label: '危险', icon: 'CircleCloseFilled', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { key: 'tip', label: '提示', icon: 'StarFilled', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
] as const

type CalloutType = typeof calloutTypes[number]['key']

const currentType = computed<CalloutType>({
  get: () => {
    const t = props.node.attrs?.calloutType
    return calloutTypes.some(ct => ct.key === t) ? (t as CalloutType) : 'warning'
  },
  set: (val) => {
    const attrs = { ...(props.node.attrs || {}), calloutType: val }
    store.updateNode(props.node.id, { attrs })
  }
})

const style = computed(() => {
  const ct = calloutTypes.find(c => c.key === currentType.value)
  return ct || calloutTypes[1]
})

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

function setType(type: CalloutType) {
  currentType.value = type
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-1">
        <el-tag
          v-for="ct in calloutTypes"
          :key="ct.key"
          size="small"
          :type="currentType === ct.key ? 'primary' : 'info'"
          class="cursor-pointer"
          @click.stop="setType(ct.key)"
        >
          <el-icon class="mr-0.5"><component :is="ct.icon" /></el-icon>
          {{ ct.label }}
        </el-tag>
      </div>
    </div>
    <div class="flex items-start gap-2 rounded-lg px-3 py-2 border"
      :class="[style.bg, style.border]"
    >
      <el-icon :class="style.color" class="mt-0.5 flex-shrink-0">
        <component :is="style.icon" />
      </el-icon>
      <div
        ref="contentRef"
        class="flex-1 text-sm outline-none min-h-[1.5em]"
        :class="style.color"
        contenteditable
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @blur="onBlur"
      />
    </div>
  </div>
</template>
