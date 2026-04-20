<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'
import {
  ArrowUp,
  ArrowDown,
  Delete,
  Plus,
  Document,
  List,
  Grid,
  Picture,
  Link,
  WarningFilled,
  Trophy
} from '@element-plus/icons-vue'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()

const pos = computed(() => store.getNodePosition(props.node.id))
const canMoveUp = computed(() => pos.value !== null && pos.value.index > 0)
const canMoveDown = computed(() => {
  if (!pos.value) return false
  const siblings = store.getSiblings(props.node.id)
  return siblings !== null && pos.value.index < siblings.length - 1
})

const insertMenu = [
  { label: '段落', type: 'paragraph' as const, icon: Document },
  { label: '标题', type: 'heading' as const, icon: Document },
  { label: '步骤', type: 'steps' as const, icon: List },
  { label: '表格', type: 'table' as const, icon: Grid },
  { label: '图片', type: 'image' as const, icon: Picture },
  { label: '路径', type: 'path' as const, icon: Link },
  { label: '提示', type: 'callout' as const, icon: WarningFilled },
  { label: '功能矩阵', type: 'feature-matrix' as const, icon: Trophy },
]

function onInsert(type: DocNode['type']) {
  store.insertAfter(props.node.id, type)
}

function onMoveUp() {
  store.moveNodeUp(props.node.id)
}

function onMoveDown() {
  store.moveNodeDown(props.node.id)
}

function onDelete() {
  store.removeNode(props.node.id)
}
</script>

<template>
  <div class="block-actions">
    <div class="flex items-center gap-0.5">
      <el-tooltip content="上移" placement="top">
        <el-button
          size="small"
          text
          :disabled="!canMoveUp"
          class="action-btn"
          @click.stop="onMoveUp"
        >
          <el-icon><ArrowUp /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="下移" placement="top">
        <el-button
          size="small"
          text
          :disabled="!canMoveDown"
          class="action-btn"
          @click.stop="onMoveDown"
        >
          <el-icon><ArrowDown /></el-icon>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" class="mx-0.5" />

      <el-dropdown trigger="hover" @command="(cmd: DocNode['type']) => onInsert(cmd)">
        <el-button size="small" text class="action-btn" @click.stop>
          <el-icon><Plus /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in insertMenu"
              :key="item.type"
              :command="item.type"
            >
              <div class="flex items-center gap-2">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-divider direction="vertical" class="mx-0.5" />

      <el-tooltip content="删除" placement="top">
        <el-button size="small" text type="danger" class="action-btn" @click.stop="onDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.block-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.15s ease;
  background: rgba(var(--el-bg-color-rgb), 0.95);
  border-radius: 6px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--el-border-color-lighter);
}

:global(.block-wrapper:hover) .block-actions,
.block-actions:hover {
  opacity: 1;
}

.action-btn {
  padding: 4px 6px !important;
  min-height: 24px;
}
</style>
