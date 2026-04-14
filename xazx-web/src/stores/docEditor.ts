import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { DocNode, TableCell } from '@/types/editor'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function findNodeById(nodes: DocNode[], id: string): DocNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function findParentById(nodes: DocNode[], id: string): DocNode[] | null {
  for (const node of nodes) {
    if (node.children) {
      if (node.children.some((c) => c.id === id)) return node.children
      const found = findParentById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function removeNodeFromArray(nodes: DocNode[], id: string): boolean {
  const idx = nodes.findIndex((n) => n.id === id)
  if (idx >= 0) {
    nodes.splice(idx, 1)
    return true
  }
  for (const node of nodes) {
    if (node.children && removeNodeFromArray(node.children, id)) return true
  }
  return false
}

function flattenHeadings(nodes: DocNode[]): DocNode[] {
  const result: DocNode[] = []
  for (const node of nodes) {
    if (node.type === 'heading') {
      result.push(node)
      if (node.children) {
        result.push(...flattenHeadings(node.children))
      }
    }
  }
  return result
}

function collectAllNodes(nodes: DocNode[]): DocNode[] {
  const result: DocNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children) {
      result.push(...collectAllNodes(node.children))
    }
  }
  return result
}

function nodeToMarkdown(node: DocNode, depth = 0): string {
  const indent = '  '.repeat(depth)
  switch (node.type) {
    case 'heading': {
      const prefix = '#'.repeat(node.level || 1)
      const tags = node.tags?.length ? ` ${node.tags.map((t) => `《${t}》`).join('')}` : ''
      let md = `${prefix} ${node.content || ''}${tags}\n`
      if (node.children) {
        for (const child of node.children) {
          md += nodeToMarkdown(child, depth + 1)
        }
      }
      return md + '\n'
    }
    case 'paragraph':
      return `${indent}${node.content || ''}\n\n`
    case 'steps': {
      let md = ''
      const items = (node.children || []).filter((c) => c.type === 'step-item')
      items.forEach((item, idx) => {
        md += `${indent}步骤${idx + 1}：${item.content || ''}\n\n`
      })
      return md
    }
    case 'table': {
      if (!node.cells || node.cells.length === 0) return ''
      let md = ''
      for (let r = 0; r < node.cells.length; r++) {
        const row = node.cells[r]!
        md += '| ' + row.map((c) => c.content).join(' | ') + ' |\n'
        if (r === 0) {
          md += '| ' + row.map(() => '---').join(' | ') + ' |\n'
        }
      }
      return md + '\n'
    }
    case 'image':
      return `${indent}![${node.alt || node.content || 'image'}](${node.url || node.content || ''})\n\n`
    case 'path':
      return `${indent}${node.content || ''}\n\n`
    case 'callout':
      return `${indent}> ⚠️ ${node.content || ''}\n\n`
    default:
      return ''
  }
}

export const useDocEditorStore = defineStore('docEditor', () => {
  const docTree = ref<DocNode[]>([])
  const selectedNodeId = ref<string | null>(null)
  const history = ref<DocNode[][]>([])
  const historyIndex = ref(-1)
  const MAX_HISTORY = 50

  const allNodes = computed(() => collectAllNodes(docTree.value))
  const allHeadings = computed(() => flattenHeadings(docTree.value))
  const selectedNode = computed(() =>
    selectedNodeId.value ? findNodeById(docTree.value, selectedNodeId.value) : null,
  )

  function snapshot() {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(deepClone(docTree.value))
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function initDocument(nodes: DocNode[]) {
    docTree.value = deepClone(nodes)
    history.value = [deepClone(nodes)]
    historyIndex.value = 0
    selectedNodeId.value = nodes[0]?.id || null
  }

  function addNode(parentId: string | null, node: DocNode, index?: number) {
    snapshot()
    if (!parentId) {
      const i = index ?? docTree.value.length
      docTree.value.splice(i, 0, node)
    } else {
      const parent = findNodeById(docTree.value, parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        const i = index ?? parent.children.length
        parent.children.splice(i, 0, node)
      }
    }
    selectedNodeId.value = node.id
  }

  function removeNode(id: string) {
    snapshot()
    removeNodeFromArray(docTree.value, id)
    if (selectedNodeId.value === id) {
      selectedNodeId.value = null
    }
  }

  function moveNode(id: string, targetParentId: string | null, targetIndex: number) {
    snapshot()
    let node: DocNode | null = null
    // find and remove
    const findAndRemove = (arr: DocNode[]): boolean => {
      const idx = arr.findIndex((n) => n.id === id)
      if (idx >= 0) {
        node = arr[idx]!
        arr.splice(idx, 1)
        return true
      }
      for (const n of arr) {
        if (n.children && findAndRemove(n.children)) return true
      }
      return false
    }
    findAndRemove(docTree.value)
    if (!node) return
    // insert
    if (!targetParentId) {
      docTree.value.splice(targetIndex, 0, node)
    } else {
      const parent = findNodeById(docTree.value, targetParentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.splice(targetIndex, 0, node)
      } else {
        docTree.value.splice(targetIndex, 0, node)
      }
    }
  }

  function updateNode(id: string, patch: Partial<DocNode>) {
    const node = findNodeById(docTree.value, id)
    if (!node) return
    // Only snapshot on significant changes
    if ('content' in patch || 'cells' in patch || 'children' in patch || 'tags' in patch) {
      snapshot()
    }
    Object.assign(node, patch)
  }

  function updateNodeSilent(id: string, patch: Partial<DocNode>) {
    const node = findNodeById(docTree.value, id)
    if (node) Object.assign(node, patch)
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      const snap = history.value[historyIndex.value]
      if (snap) docTree.value = deepClone(snap)
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      const snap = history.value[historyIndex.value]
      if (snap) docTree.value = deepClone(snap)
    }
  }

  function toMarkdown(): string {
    let md = ''
    for (const node of docTree.value) {
      md += nodeToMarkdown(node)
    }
    return md.trim()
  }

  function toHtml(): string {
    const md = toMarkdown()
    // Simple markdown to html conversion for MVP
    return md
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\n/gim, '<br>')
  }

  function canUndo() {
    return historyIndex.value > 0
  }

  function canRedo() {
    return historyIndex.value < history.value.length - 1
  }

  return {
    docTree,
    selectedNodeId,
    selectedNode,
    allNodes,
    allHeadings,
    initDocument,
    addNode,
    removeNode,
    moveNode,
    updateNode,
    updateNodeSilent,
    undo,
    redo,
    toMarkdown,
    toHtml,
    canUndo,
    canRedo,
  }
})

export function createNode(type: DocNode['type'], overrides: Partial<DocNode> = {}): DocNode {
  const base: DocNode = {
    id: uuidv4(),
    type,
    content: '',
    ...overrides,
  }
  if (type === 'heading') {
    base.level = 1
    base.children = []
  }
  if (type === 'steps') {
    base.children = []
  }
  if (type === 'table') {
    base.cells = [
      [{ content: '字段' }, { content: '说明' }],
      [{ content: '' }, { content: '' }],
    ]
  }
  return base
}
