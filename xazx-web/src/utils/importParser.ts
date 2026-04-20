import { createNode } from '@/stores/docEditor'
import type { DocNode, TableCell } from '@/types/editor'

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0]!.match(/:(.*?);/)?.[1] || 'image/png'
  const data = arr[1] || ''
  const bstr = atob(data)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/width="[\d.]+in"/g, '')
    .replace(/height="[\d.]+in"/g, '')
    .trim()
}

function cleanCellText(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/width="[\d.]+in"/g, '')
    .replace(/height="[\d.]+in"/g, '')
    .trim()
}

function parseHtmlTable(tableEl: HTMLTableElement): TableCell[][] {
  const rows = Array.from(tableEl.querySelectorAll('tr'))
  if (!rows.length) return []
  const colCount = Math.max(...rows.map((r) => r.querySelectorAll('td, th').length))
  if (!colCount) return []

  const grid: (TableCell | null)[][] = Array.from({ length: rows.length }, () =>
    Array.from({ length: colCount }, () => null),
  )

  rows.forEach((tr, r) => {
    const cells = Array.from(tr.querySelectorAll('td, th'))
    let c = 0
    cells.forEach((cellEl) => {
      while (c < colCount && grid[r]![c]) c++
      if (c >= colCount) return
      const rowspan = parseInt(cellEl.getAttribute('rowspan') || '1')
      const colspan = parseInt(cellEl.getAttribute('colspan') || '1')
      // 保留单元格内的换行（Excel 单元格内换行）
      const cell: TableCell = {
        content: cleanCellText(cellEl.textContent || ''),
        rowspan,
        colspan,
        isMerged: false,
      }
      grid[r]![c] = cell
      for (let i = 0; i < rowspan; i++) {
        for (let j = 0; j < colspan; j++) {
          if (i === 0 && j === 0) continue
          if (grid[r + i]) {
            grid[r + i]![c + j] = { content: '', isMerged: true }
          }
        }
      }
      c++
    })
  })

  return grid.map((row) => row.map((cell) => cell || { content: '', isMerged: false }))
}

export function parseHtmlToNodes(html: string): { nodes: DocNode[]; images: File[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes: DocNode[] = []
  const images: File[] = []

  function parseElement(el: Element, parentNodes: DocNode[]) {
    const tag = el.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]!)
      parentNodes.push(
        createNode('heading', {
          level,
          content: cleanText(el.textContent || ''),
        }),
      )
    } else if (tag === 'p') {
      const text = cleanText(el.textContent || '')
      if (text) {
        parentNodes.push(createTextNode(text))
      }
    } else if (tag === 'table') {
      const cells = parseHtmlTable(el as HTMLTableElement)
      if (cells.length) {
        parentNodes.push(createNode('table', { cells }))
      }
    } else if (tag === 'img') {
      const src = el.getAttribute('src') || ''
      let file: File | undefined
      let url = src
      if (src.startsWith('data:')) {
        try {
          file = dataUrlToFile(src, `pasted_img_${Date.now()}_${images.length}.png`)
          url = URL.createObjectURL(file)
          images.push(file)
        } catch {}
      }
      parentNodes.push(
        createNode('image', {
          content: file?.name || src,
          url,
          file,
        }),
      )
    } else if (tag === 'ol' || tag === 'ul') {
      const steps = createNode('steps')
      el.querySelectorAll('li').forEach((li) => {
        steps.children!.push(createNode('step-item', { content: cleanText(li.textContent || '') }))
      })
      if (steps.children!.length) parentNodes.push(steps)
    } else if (tag === 'blockquote') {
      const text = cleanText(el.textContent || '')
      if (text) {
        parentNodes.push(createNode('callout', { content: text }))
      }
    } else if (tag === 'div' || tag === 'section' || tag === 'article') {
      for (const child of Array.from(el.children)) {
        parseElement(child, parentNodes)
      }
    } else if (tag === 'br') {
      // ignore single br
    } else {
      // fallback for inline elements wrapped in unknown block
      const text = cleanText(el.textContent || '')
      if (text) parentNodes.push(createTextNode(text))
    }
  }

  for (const child of Array.from(doc.body.children)) {
    parseElement(child, nodes)
  }

  // 过滤 Excel 产生的空节点（如空段落、只有 &nbsp; 的段落）
  const filtered = nodes.filter((n) => {
    if (n.type === 'paragraph' && !n.content?.trim()) return false
    if (n.type === 'callout' && !n.content?.trim()) return false
    return true
  })

  return {
    nodes: filtered.length ? filtered : [createNode('paragraph', { content: '导入内容为空' })],
    images,
  }
}

function createTextNode(text: string): DocNode {
  // Detect path pattern like 【策略配置】>【站点配置】
  if (/【[^】]+】\s*>\s*【[^】]+】/.test(text)) {
    return createNode('path', { content: text })
  }
  return createNode('paragraph', { content: text })
}

export function parseMarkdownToNodes(md: string): DocNode[] {
  const nodes: DocNode[] = []
  const lines = md.split(/\r?\n/)
  let i = 0

  function flushParagraph(buffer: string[]) {
    if (buffer.length === 0) return
    const text = cleanText(buffer.join(' '))
    if (text) nodes.push(createTextNode(text))
  }

  let paraBuffer: string[] = []

  while (i < lines.length) {
    const line = lines[i]!

    // Table
    if (line.startsWith('|')) {
      flushParagraph(paraBuffer)
      paraBuffer = []
      const tableLines: string[] = []
      while (i < lines.length && lines[i]!.startsWith('|')) {
        tableLines.push(lines[i]!)
        i++
      }
      const cells = parseMarkdownTable(tableLines)
      if (cells.length) {
        nodes.push(createNode('table', { cells }))
      }
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph(paraBuffer)
      paraBuffer = []
      const level = headingMatch[1]!.length
      nodes.push(createNode('heading', { level, content: cleanText(headingMatch[2] || '') }))
      i++
      continue
    }

    // Callout / blockquote
    if (line.startsWith('> ')) {
      flushParagraph(paraBuffer)
      paraBuffer = []
      nodes.push(createNode('callout', { content: cleanText(line.slice(2)) }))
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushParagraph(paraBuffer)
      paraBuffer = []
      i++
      continue
    }

    // Steps detection: 步骤1/2/3：xxx
    const stepMatch = line.match(/^步骤\s*(\d+)\s*[：:]\s*(.*)$/)
    if (stepMatch) {
      flushParagraph(paraBuffer)
      paraBuffer = []
      // Try to collect consecutive steps
      const steps = createNode('steps')
      let stepIdx = Number(stepMatch[1])
      let stepContent = stepMatch[2] || ''
      steps.children!.push(createNode('step-item', { content: cleanText(stepContent) }))
      i++
      while (i < lines.length) {
        const nextStep = lines[i]!.match(/^步骤\s*(\d+)\s*[：:]\s*(.*)$/)
        if (nextStep) {
          steps.children!.push(createNode('step-item', { content: cleanText(nextStep[2] || '') }))
          i++
        } else {
          break
        }
      }
      nodes.push(steps)
      continue
    }

    // Normal paragraph line
    paraBuffer.push(line)
    i++
  }

  flushParagraph(paraBuffer)

  return nodes.length ? nodes : [createNode('paragraph', { content: '导入内容为空' })]
}

function parseMarkdownTable(lines: string[]): TableCell[][] {
  // Filter out separator line like | --- | --- |
  const dataLines = lines.filter((l) => !/^\|\s*[-:]+\s*(\|\s*[-:]+\s*)*\|?\s*$/.test(l))
  return dataLines.map((line) => {
    const parts = line.split('|').slice(1, -1)
    return parts.map((p) => ({ content: cleanText(p), isMerged: false }))
  })
}
