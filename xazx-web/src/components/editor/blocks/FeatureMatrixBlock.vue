<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode, FeatureMatrixCategory } from '@/types/editor'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const collapsed = ref<Record<string, boolean>>({})

function onClick() {
  store.selectedNodeId = props.node.id
}

function update(patch: Partial<DocNode>) {
  store.updateNode(props.node.id, patch)
}

const versions = computed(() => props.node.versions || [])
const categories = computed(() => props.node.categories || [])

function addVersion() {
  const nextVersions = [...versions.value]
  const newVersion = `版本${nextVersions.length + 1}`
  nextVersions.push(newVersion)
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      item.supports[newVersion] = ''
    })
  })
  update({ versions: nextVersions, categories: nextCategories })
}

function removeVersion(idx: number) {
  const nextVersions = [...versions.value]
  const removed = nextVersions[idx]
  if (!removed) return
  nextVersions.splice(idx, 1)
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      delete item.supports[removed]
    })
  })
  update({ versions: nextVersions, categories: nextCategories })
}

function renameVersion(idx: number, val: string) {
  const nextVersions = [...versions.value]
  const oldName = nextVersions[idx]
  if (!oldName) return
  nextVersions[idx] = val
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      item.supports[val] = item.supports[oldName] || ''
      delete item.supports[oldName]
    })
  })
  update({ versions: nextVersions, categories: nextCategories })
}

function addCategory() {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  const newItem = { name: '新功能项', description: '', supports: {} as Record<string, string> }
  versions.value.forEach((v) => (newItem.supports[v] = ''))
  nextCategories.push({
    name: '新类别',
    items: [newItem],
  })
  update({ categories: nextCategories })
}

function removeCategory(cIdx: number) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories.splice(cIdx, 1)
  update({ categories: nextCategories })
}

function renameCategory(cIdx: number, val: string) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories[cIdx]!.name = val
  update({ categories: nextCategories })
}

function addItem(cIdx: number) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  const newItem = { name: '新功能项', description: '', supports: {} as Record<string, string> }
  versions.value.forEach((v) => (newItem.supports[v] = ''))
  nextCategories[cIdx]!.items.push(newItem)
  update({ categories: nextCategories })
}

function removeItem(cIdx: number, iIdx: number) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories[cIdx]!.items.splice(iIdx, 1)
  if (nextCategories[cIdx]!.items.length === 0) {
    nextCategories.splice(cIdx, 1)
  }
  update({ categories: nextCategories })
}

function updateItem(cIdx: number, iIdx: number, key: 'name' | 'description', val: string) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories[cIdx]!.items[iIdx]![key] = val
  update({ categories: nextCategories })
}

function updateSupport(cIdx: number, iIdx: number, version: string, val: string) {
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories[cIdx]!.items[iIdx]!.supports[version] = val
  update({ categories: nextCategories })
}

function cycleSupport(cIdx: number, iIdx: number, version: string) {
  const marks = ['√', '×', '-', '']
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  const current = nextCategories[cIdx]!.items[iIdx]!.supports[version] || ''
  const idx = marks.indexOf(current)
  const next = marks[(idx + 1) % marks.length] || ''
  nextCategories[cIdx]!.items[iIdx]!.supports[version] = next
  update({ categories: nextCategories })
}

function fillColumn(vIdx: number, mark: string) {
  const version = versions.value[vIdx]
  if (!version) return
  const nextCategories = JSON.parse(JSON.stringify(categories.value)) as FeatureMatrixCategory[]
  nextCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      item.supports[version] = mark
    })
  })
  update({ categories: nextCategories })
}

function toggleCollapse(cName: string) {
  collapsed.value[cName] = !collapsed.value[cName]
}

const totalColspan = computed(() => 3 + versions.value.length)
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-secondary font-bold">功能矩阵</span>
      <div class="flex items-center gap-2">
        <el-button size="small" text @click.stop="addCategory">+ 类别</el-button>
        <el-button size="small" text @click.stop="addVersion">+ 版本列</el-button>
      </div>
    </div>

    <div class="overflow-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-surface-container-low">
            <th class="border border-outline-variant px-2 py-1.5 text-left font-medium min-w-[100px]">功能类别</th>
            <th class="border border-outline-variant px-2 py-1.5 text-left font-medium min-w-[140px]">功能项</th>
            <th class="border border-outline-variant px-2 py-1.5 text-left font-medium min-w-[200px]">功能说明</th>
            <th
              v-for="(ver, vIdx) in versions"
              :key="vIdx"
              class="border border-outline-variant px-2 py-1.5 text-center font-medium min-w-[80px]"
            >
              <div class="flex items-center justify-center gap-1">
                <input
                  :value="ver"
                  class="w-20 bg-transparent text-center outline-none border-b border-transparent focus:border-primary"
                  @change="(e) => renameVersion(vIdx, (e.target as HTMLInputElement).value)"
                  @click.stop
                />
                <el-dropdown trigger="click" @command="(cmd: string) => fillColumn(vIdx, cmd)" @click.stop>
                  <el-icon class="cursor-pointer hover:text-primary"><ArrowDown /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="√">填充 √</el-dropdown-item>
                      <el-dropdown-item command="×">填充 ×</el-dropdown-item>
                      <el-dropdown-item command="-">填充 -</el-dropdown-item>
                      <el-dropdown-item command="">清空</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-icon class="cursor-pointer hover:text-danger text-secondary" @click.stop="removeVersion(vIdx)"><Close /></el-icon>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(cat, cIdx) in categories" :key="cIdx">
            <template v-if="!collapsed[cat.name]">
              <tr>
                <td
                  class="border border-outline-variant px-2 py-1.5 align-top bg-surface-container-lowest font-medium"
                  :rowspan="cat.items.length"
                >
                  <div class="flex items-start justify-between gap-2">
                    <input
                      :value="cat.name"
                      class="flex-1 bg-transparent outline-none border-b border-transparent focus:border-primary font-medium"
                      @change="(e) => renameCategory(cIdx, (e.target as HTMLInputElement).value)"
                      @click.stop
                    />
                    <div class="flex gap-1 flex-shrink-0">
                      <el-icon class="cursor-pointer hover:text-primary text-secondary" @click.stop="toggleCollapse(cat.name)"><ArrowDown /></el-icon>
                      <el-icon class="cursor-pointer hover:text-danger text-secondary" @click.stop="removeCategory(cIdx)"><Close /></el-icon>
                    </div>
                  </div>
                </td>
                <td class="border border-outline-variant px-2 py-1.5 align-top">
                  <div class="flex items-center justify-between gap-1">
                    <input
                      :value="cat.items[0]!.name"
                      class="w-full bg-transparent outline-none border-b border-transparent focus:border-primary"
                      @change="(e) => updateItem(cIdx, 0, 'name', (e.target as HTMLInputElement).value)"
                      @click.stop
                    />
                    <el-icon class="cursor-pointer hover:text-danger text-secondary flex-shrink-0" @click.stop="removeItem(cIdx, 0)"><Close /></el-icon>
                  </div>
                </td>
                <td class="border border-outline-variant px-2 py-1.5 align-top">
                  <input
                    :value="cat.items[0]!.description"
                    class="w-full bg-transparent outline-none border-b border-transparent focus:border-primary"
                    @change="(e) => updateItem(cIdx, 0, 'description', (e.target as HTMLInputElement).value)"
                    @click.stop
                  />
                </td>
                <td
                  v-for="(ver, vIdx) in versions"
                  :key="vIdx"
                  class="border border-outline-variant px-2 py-1.5 text-center align-top cursor-pointer hover:bg-primary/5"
                  @dblclick.stop="cycleSupport(cIdx, 0, ver)"
                >
                  <input
                    :value="cat.items[0]!.supports[ver] || ''"
                    class="w-8 bg-transparent text-center outline-none border-b border-transparent focus:border-primary"
                    @change="(e) => updateSupport(cIdx, 0, ver, (e.target as HTMLInputElement).value)"
                    @click.stop
                  />
                </td>
              </tr>
              <tr v-for="(item, iIdx) in cat.items.slice(1)" :key="`${cIdx}-${iIdx + 1}`">
                <td class="border border-outline-variant px-2 py-1.5 align-top">
                  <div class="flex items-center justify-between gap-1">
                    <input
                      :value="item.name"
                      class="w-full bg-transparent outline-none border-b border-transparent focus:border-primary"
                      @change="(e) => updateItem(cIdx, iIdx + 1, 'name', (e.target as HTMLInputElement).value)"
                      @click.stop
                    />
                    <el-icon class="cursor-pointer hover:text-danger text-secondary flex-shrink-0" @click.stop="removeItem(cIdx, iIdx + 1)"><Close /></el-icon>
                  </div>
                </td>
                <td class="border border-outline-variant px-2 py-1.5 align-top">
                  <input
                    :value="item.description"
                    class="w-full bg-transparent outline-none border-b border-transparent focus:border-primary"
                    @change="(e) => updateItem(cIdx, iIdx + 1, 'description', (e.target as HTMLInputElement).value)"
                    @click.stop
                  />
                </td>
                <td
                  v-for="(ver, vIdx) in versions"
                  :key="vIdx"
                  class="border border-outline-variant px-2 py-1.5 text-center align-top cursor-pointer hover:bg-primary/5"
                  @dblclick.stop="cycleSupport(cIdx, iIdx + 1, ver)"
                >
                  <input
                    :value="item.supports[ver] || ''"
                    class="w-8 bg-transparent text-center outline-none border-b border-transparent focus:border-primary"
                    @change="(e) => updateSupport(cIdx, iIdx + 1, ver, (e.target as HTMLInputElement).value)"
                    @click.stop
                  />
                </td>
              </tr>
              <tr>
                <td :colspan="totalColspan" class="px-2 py-1">
                  <el-button size="small" text @click.stop="addItem(cIdx)">+ 添加功能项</el-button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td :colspan="totalColspan" class="border border-outline-variant px-2 py-1.5 bg-surface-container-lowest cursor-pointer" @click.stop="toggleCollapse(cat.name)">
                <div class="flex items-center gap-2 text-secondary">
                  <el-icon><ArrowRight /></el-icon>
                  <span class="font-medium">{{ cat.name }}</span>
                  <span class="text-xs">（{{ cat.items.length }} 项功能，点击展开）</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
