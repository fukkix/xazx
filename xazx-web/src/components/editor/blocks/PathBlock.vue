<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import { DEFAULT_PATHS } from '@/types/editor'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const contentRef = ref<HTMLElement | null>(null)
const isComposing = ref(false)
const showDropdown = ref(false)

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

function selectPath(path: string) {
  store.updateNode(props.node.id, { content: path })
  showDropdown.value = false
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
</script>

<template>
  <div
    class="py-2 px-3 border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center gap-2">
      <el-icon class="text-primary"><ArrowRight /></el-icon>
      <div
        ref="contentRef"
        class="flex-1 text-sm text-on-surface font-medium outline-none min-h-[1.5em]"
        contenteditable
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @blur="onBlur"
      />
      <el-dropdown trigger="click" @command="selectPath" @click.stop>
        <el-button size="small" text @click.stop="toggleDropdown">
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="path in DEFAULT_PATHS"
              :key="path"
              :command="path"
            >
              {{ path }}
            </el-dropdown-item>
            <el-dropdown-item divided command="">清除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
