<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  imageUrl: string
}>()

const emit = defineEmits<{
  (e: 'save', blob: Blob): void
  (e: 'cancel'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const tool = ref<'rect' | 'arrow' | 'text'>('rect')
const isDrawing = ref(false)
const startPos = ref({ x: 0, y: 0 })
const textInput = ref('')
const showTextInput = ref(false)
const textPos = ref({ x: 0, y: 0 })

const historyStack: ImageData[] = []
let historyIndex = -1

onMounted(() => {
  const cvs = canvasRef.value
  if (!cvs) return
  const context = cvs.getContext('2d')
  if (!context) return
  ctx.value = context

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    cvs.width = img.naturalWidth
    cvs.height = img.naturalHeight
    context.drawImage(img, 0, 0)
    saveState()
  }
  img.src = props.imageUrl
})

function saveState() {
  const cvs = canvasRef.value
  const context = ctx.value
  if (!cvs || !context) return
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1)
  }
  historyStack.push(context.getImageData(0, 0, cvs.width, cvs.height))
  historyIndex++
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--
    const data = historyStack[historyIndex]
    if (data && ctx.value) ctx.value.putImageData(data, 0, 0)
  }
}

function clearAll() {
  if (historyStack.length > 0) {
    const data = historyStack[0]
    if (data && ctx.value) ctx.value.putImageData(data, 0, 0)
    saveState()
  }
}

function getPos(e: MouseEvent) {
  const cvs = canvasRef.value!
  const rect = cvs.getBoundingClientRect()
  const scaleX = cvs.width / rect.width
  const scaleY = cvs.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

function onMouseDown(e: MouseEvent) {
  if (tool.value === 'text') {
    const pos = getPos(e)
    textPos.value = pos
    showTextInput.value = true
    return
  }
  isDrawing.value = true
  startPos.value = getPos(e)
}

function onMouseMove(e: MouseEvent) {
  if (!isDrawing.value) return
  const pos = getPos(e)
  const context = ctx.value!
  const currentData = historyStack[historyIndex]
  if (currentData) context.putImageData(currentData, 0, 0)
  context.strokeStyle = '#ef4444'
  context.lineWidth = 3
  if (tool.value === 'rect') {
    context.strokeRect(startPos.value.x, startPos.value.y, pos.x - startPos.value.x, pos.y - startPos.value.y)
  } else if (tool.value === 'arrow') {
    drawArrow(context, startPos.value.x, startPos.value.y, pos.x, pos.y)
  }
}

function onMouseUp(e: MouseEvent) {
  if (!isDrawing.value) return
  isDrawing.value = false
  saveState()
}

function drawArrow(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const headlen = 15
  const dx = x2 - x1
  const dy = y2 - y1
  const angle = Math.atan2(dy, dx)
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
  context.beginPath()
  context.moveTo(x2, y2)
  context.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6))
  context.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6))
  context.lineTo(x2, y2)
  context.fillStyle = '#ef4444'
  context.fill()
}

function applyText() {
  if (!textInput.value.trim()) {
    showTextInput.value = false
    return
  }
  const context = ctx.value!
  context.fillStyle = '#ef4444'
  context.font = 'bold 24px sans-serif'
  context.fillText(textInput.value, textPos.value.x, textPos.value.y + 20)
  saveState()
  textInput.value = ''
  showTextInput.value = false
}

function onSave() {
  canvasRef.value?.toBlob((blob) => {
    if (blob) emit('save', blob)
  }, 'image/png')
}
</script>

<template>
  <el-dialog title="截图标注" width="900px" :model-value="true" @close="emit('cancel')">
    <div class="flex items-center gap-2 mb-3">
      <el-radio-group v-model="tool">
        <el-radio-button label="rect">红框</el-radio-button>
        <el-radio-button label="arrow">箭头</el-radio-button>
        <el-radio-button label="text">文字</el-radio-button>
      </el-radio-group>
      <el-divider direction="vertical" />
      <el-button size="small" @click="undo">撤销</el-button>
      <el-button size="small" @click="clearAll">清空</el-button>
    </div>

    <div class="relative overflow-auto border border-outline-variant rounded-lg bg-gray-100">
      <canvas
        ref="canvasRef"
        class="max-w-full cursor-crosshair block"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
      />

      <div
        v-if="showTextInput"
        class="absolute bg-white border border-primary shadow-lg rounded px-2 py-1 flex gap-2"
        :style="{ left: `${textPos.x}px`, top: `${textPos.y}px` }"
      >
        <el-input v-model="textInput" size="small" placeholder="输入文字" @keyup.enter="applyText" />
        <el-button size="small" type="primary" @click="applyText">确定</el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="onSave">保存标注</el-button>
    </template>
  </el-dialog>
</template>
