<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { TableCell } from '@/types/editor'

const props = defineProps<{
  cells: TableCell[][]
}>()

const emit = defineEmits<{
  (e: 'save', cells: TableCell[][]): void
  (e: 'cancel'): void
}>()

const localCells = ref<TableCell[][]>(
  JSON.parse(JSON.stringify(props.cells.length ? props.cells : [[{ content: '' }]])),
)

const selectedCells = ref<[number, number][]>([])

const rowCount = computed(() => localCells.value.length)
const colCount = computed(() => (localCells.value[0] ? localCells.value[0].length : 0))

function isSelected(r: number, c: number) {
  return selectedCells.value.some(([sr, sc]) => sr === r && sc === c)
}

function toggleSelect(r: number, c: number) {
  const idx = selectedCells.value.findIndex(([sr, sc]) => sr === r && sc === c)
  if (idx >= 0) {
    selectedCells.value.splice(idx, 1)
  } else {
    selectedCells.value.push([r, c])
  }
}

function clearSelection() {
  selectedCells.value = []
}

function addRow() {
  const cols = colCount.value || 1
  localCells.value.push(Array.from({ length: cols }, () => ({ content: '' })))
  clearSelection()
}

function addCol() {
  for (const row of localCells.value) {
    row.push({ content: '' })
  }
  if (localCells.value.length === 0) {
    localCells.value.push([{ content: '' }])
  }
  clearSelection()
}

function removeRow() {
  if (selectedCells.value.length === 0) {
    localCells.value.pop()
  } else {
    const rows = Array.from(new Set(selectedCells.value.map(([r]) => r))).sort((a, b) => b - a)
    for (const r of rows) {
      if (r >= 0 && r < localCells.value.length) {
        localCells.value.splice(r, 1)
      }
    }
  }
  if (localCells.value.length === 0) localCells.value.push([{ content: '' }])
  clearSelection()
}

function removeCol() {
  if (selectedCells.value.length === 0) {
    for (const row of localCells.value) {
      row.pop()
    }
  } else {
    const cols = Array.from(new Set(selectedCells.value.map(([_, c]) => c))).sort((a, b) => b - a)
    for (const row of localCells.value) {
      for (const c of cols) {
        if (c >= 0 && c < row.length) {
          row.splice(c, 1)
        }
      }
    }
  }
  if (localCells.value[0]?.length === 0) {
    localCells.value = [[{ content: '' }]]
  }
  clearSelection()
}

function mergeCells() {
  if (selectedCells.value.length < 2) return
  const rows = selectedCells.value.map(([r]) => r)
  const cols = selectedCells.value.map(([_, c]) => c)
  const minR = Math.min(...rows)
  const maxR = Math.max(...rows)
  const minC = Math.min(...cols)
  const maxC = Math.max(...cols)

  const expectedCount = (maxR - minR + 1) * (maxC - minC + 1)
  if (expectedCount !== selectedCells.value.length) {
    ElMessage.warning('请选择矩形区域进行合并')
    return
  }

  const contents: string[] = []
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const cell = localCells.value[r]?.[c]
      if (cell && !cell.isMerged) {
        contents.push(cell.content)
      }
      if (localCells.value[r]) {
        localCells.value[r]![c] = { content: cell?.content || '', isMerged: true, rowspan: 1, colspan: 1 }
      }
    }
  }

  if (localCells.value[minR]) {
    localCells.value[minR]![minC] = {
      content: contents.filter(Boolean).join(' ') || '',
      rowspan: maxR - minR + 1,
      colspan: maxC - minC + 1,
      isMerged: false,
    }
  }
  clearSelection()
}

function splitCell() {
  if (selectedCells.value.length !== 1) return
  const sc = selectedCells.value[0]
  if (!sc) return
  const [r, c] = sc
  const cell = localCells.value[r]?.[c]
  if (!cell || (!cell.rowspan && !cell.colspan)) return
  const rs = cell.rowspan || 1
  const cs = cell.colspan || 1
  for (let i = 0; i < rs; i++) {
    for (let j = 0; j < cs; j++) {
      if (localCells.value[r + i]) {
        localCells.value[r + i]![c + j] = { content: i === 0 && j === 0 ? cell.content : '', isMerged: false }
      }
    }
  }
  clearSelection()
}

function cleanStyles() {
  for (const row of localCells.value) {
    for (const cell of row) {
      cell.content = (cell.content || '')
        .replace(/width="[\d.]+in"/g, '')
        .replace(/height="[\d.]+in"/g, '')
        .trim()
    }
  }
  ElMessage.success('已清洗冗余样式')
}
</script>

<template>
  <el-dialog title="编辑表格" width="800px" :model-value="true" @close="emit('cancel')">
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <el-button size="small" @click="addRow">+ 行</el-button>
      <el-button size="small" @click="addCol">+ 列</el-button>
      <el-button size="small" @click="removeRow">- 行</el-button>
      <el-button size="small" @click="removeCol">- 列</el-button>
      <el-divider direction="vertical" />
      <el-button size="small" @click="mergeCells">合并单元格</el-button>
      <el-button size="small" @click="splitCell">拆分单元格</el-button>
      <el-button size="small" type="info" plain @click="cleanStyles">清洗样式</el-button>
      <el-button size="small" text @click="clearSelection">清除选择</el-button>
    </div>

    <div class="overflow-auto border border-outline-variant rounded-lg p-3 bg-surface-container-lowest">
      <table class="border-collapse">
        <tbody>
          <tr v-for="(row, rIdx) in localCells" :key="rIdx">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              class="border border-outline-variant min-w-[100px] min-h-[40px] align-top"
              :class="isSelected(rIdx, cIdx) ? 'bg-primary/10' : ''"
              :rowspan="cell.rowspan || 1"
              :colspan="cell.colspan || 1"
              :style="cell.isMerged ? 'display:none' : ''"
              @click="toggleSelect(rIdx, cIdx)"
            >
              <el-input
                :model-value="cell.content"
                type="textarea"
                :rows="1"
                class="w-full"
                input-style="border:none;resize:none;"
                @input="(v: string) => cell.content = v"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="emit('save', localCells)">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-textarea__inner) {
  border: none;
  background: transparent;
  padding: 8px;
  min-height: 36px;
}
</style>
