/**
 * 知识库 API 服务
 * 
 * 对接后端知识库 API，提供文档入库、检索、统计等功能
 */

const BASE_URL = (import.meta.env.VITE_KNOWLEDGE_API_URL as string) || 'http://localhost:8000'

// ============ 类型定义 ============

export interface SearchRequest {
  query: string
  domain?: string
  role?: string
  page?: number
  size?: number
}

export interface SearchSource {
  title: string
  path: string
  summary: string
}

export interface SearchResponse {
  answer: string
  sources: SearchSource[]
  total: number
  degraded: boolean
}

export interface IngestResponse {
  status: string
  task_id: string
  message: string
}

export interface BatchIngestResponse {
  total: number
  accepted: number
  rejected: number
  tasks: IngestResponse[]
  errors: string[]
}

export interface TaskStatusResponse {
  task_id: string
  status: 'processing' | 'success' | 'error'
  progress: string
  wiki_page_path?: string
  wiki_page_title?: string
  summary?: string
  error?: string
  processing_time_ms?: number
}

export interface DomainStats {
  total: number
  sub?: Record<string, number>
}

export interface StatsResponse {
  domains: Record<string, DomainStats>
  total: number
  last_updated: string
}

export interface LintSummary {
  orphan_pages: number
  broken_links: number
  stale_pages: number
}

export interface LintResponse {
  status: string
  issues_found: number
  report_path: string
  summary: LintSummary
}

export interface LogEntry {
  date: string
  type: string
  description: string
  detail?: string
}

export interface LogsResponse {
  entries: LogEntry[]
}

// ============ 前端辅助类型 ============

export interface TaskStatus {
  task_id: string
  status: string
  progress?: string
  error?: string
  wiki_page?: string
}

export interface DomainStat {
  domain: string
  page_count: number
}

// ============ 辅助函数 ============

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const resp = await fetch(input, init)
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`${resp.status}: ${text}`)
  }
  return resp.json()
}

// ============ API 接口 ============

export const knowledgeApi = {
  /**
   * 检索知识库
   */
  async search(params: SearchRequest): Promise<SearchResponse> {
    const queryParams = new URLSearchParams()
    queryParams.append('q', params.query)
    if (params.domain) queryParams.append('domain', params.domain)
    if (params.role) queryParams.append('role', params.role)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.size) queryParams.append('size', params.size.toString())
    
    return request<SearchResponse>(`${BASE_URL}/api/knowledge/search?${queryParams}`)
  },

  /**
   * 文档入库
   */
  async ingest(file: File, domain: string, productLine?: string): Promise<IngestResponse> {
    const form = new FormData()
    form.append('file', file)
    form.append('domain', domain)
    if (productLine) form.append('product_line', productLine)
    
    return request<IngestResponse>(`${BASE_URL}/api/knowledge/ingest`, {
      method: 'POST',
      body: form
    })
  },

  /**
   * 文档入库（带上传进度回调）
   * @param onProgress 上传进度回调 (0-100)
   */
  ingestWithProgress(
    file: File,
    domain: string,
    onProgress: (percent: number) => void,
    productLine?: string
  ): Promise<IngestResponse> {
    return new Promise((resolve, reject) => {
      const form = new FormData()
      form.append('file', file)
      form.append('domain', domain)
      if (productLine) form.append('product_line', productLine)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE_URL}/api/knowledge/ingest`)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as IngestResponse)
          } catch {
            reject(new Error('响应解析失败'))
          }
        } else {
          let msg = `${xhr.status}`
          try { msg = JSON.parse(xhr.responseText).detail ?? msg } catch {}
          reject(new Error(msg))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('网络错误，请检查连接后重试')))
      xhr.addEventListener('timeout', () => reject(new Error('上传超时，请稍后重试')))
      xhr.timeout = 120_000  // 2 分钟

      xhr.send(form)
    })
  },
  async batchIngest(files: File[], domain: string, productLine?: string): Promise<BatchIngestResponse> {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    form.append('domain', domain)
    if (productLine) form.append('product_line', productLine)

    return request<BatchIngestResponse>(`${BASE_URL}/api/knowledge/batch-ingest`, {
      method: 'POST',
      body: form
    })
  },

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    return request<TaskStatusResponse>(`${BASE_URL}/api/knowledge/tasks/${encodeURIComponent(taskId)}`)
  },

  /**
   * 获取统计信息
   */
  async getStats(): Promise<StatsResponse> {
    return request<StatsResponse>(`${BASE_URL}/api/knowledge/stats`)
  },

  /**
   * 执行 Lint 检查
   */
  async lint(): Promise<LintResponse> {
    return request<LintResponse>(`${BASE_URL}/api/knowledge/lint`, {
      method: 'POST'
    })
  },

  /**
   * 获取日志
   */
  async getLogs(limit = 50, logType?: string): Promise<LogsResponse> {
    const queryParams = new URLSearchParams()
    queryParams.append('limit', limit.toString())
    if (logType) queryParams.append('log_type', logType)
    
    return request<LogsResponse>(`${BASE_URL}/api/knowledge/logs?${queryParams}`)
  },

  /**
   * 健康检查
   */
  async health(): Promise<{ status: string; service: string; wiki_dir: string; wiki_exists: boolean; max_file_size_mb: number }> {
    return request(`${BASE_URL}/api/knowledge/health`)
  },

  /**
   * 手动提交 Wiki 页面（含图片上传）
   */
  async manualSubmit(data: {
    title: string
    domain: string
    summary: string
    content: string
    keywords: string
    audience: string
    relatedTopics: string
    productLine?: string
    sourceFile?: string
    images: File[]
  }): Promise<{ status: string; wiki_page_path: string; wiki_page_title: string; images_saved: number }> {
    const form = new FormData()
    form.append('title', data.title)
    form.append('domain', data.domain)
    form.append('summary', data.summary)
    form.append('content', data.content)
    form.append('keywords', data.keywords)
    form.append('audience', data.audience)
    form.append('related_topics', data.relatedTopics)
    if (data.productLine) form.append('product_line', data.productLine)
    if (data.sourceFile) form.append('source_file', data.sourceFile)
    data.images.forEach((img) => form.append('images', img))

    return request(`${BASE_URL}/api/knowledge/manual-submit`, {
      method: 'POST',
      body: form,
    })
  },
}
