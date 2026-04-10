const BASE_URL = (import.meta.env.VITE_KNOWLEDGE_API_URL as string) || 'http://localhost:8000'

export interface SearchRequest {
  query: string
  domain?: string
  top_k?: number
}

export interface SearchSource {
  title: string
  path: string
  domain: string
}

export interface SearchResponse {
  query: string
  answer: string
  sources: SearchSource[]
}

export interface IngestResponse {
  task_id: string
  status: string
}

export interface TaskStatus {
  task_id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  progress?: string
  error?: string
  wiki_page?: string
}

export interface DomainStat {
  domain: string
  page_count: number
}

export interface StatsResponse {
  total_pages: number
  domains: DomainStat[]
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const resp = await fetch(input, init)
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`${resp.status}: ${text}`)
  }
  return resp.json()
}

export const knowledgeApi = {
  async search(req: SearchRequest): Promise<SearchResponse> {
    return request<SearchResponse>(`${BASE_URL}/api/knowledge/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    })
  },

  async ingest(file: File, domain: string): Promise<IngestResponse> {
    const form = new FormData()
    form.append('file', file)
    form.append('domain', domain)
    return request<IngestResponse>(`${BASE_URL}/api/knowledge/ingest`, {
      method: 'POST',
      body: form
    })
  },

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return request<TaskStatus>(`${BASE_URL}/api/knowledge/ingest/${encodeURIComponent(taskId)}`)
  },

  async getStats(): Promise<StatsResponse> {
    return request<StatsResponse>(`${BASE_URL}/api/knowledge/stats`)
  },

  async getLogs(limit = 20): Promise<{ logs: Array<{ timestamp: string; type: string; message: string }> }> {
    return request(`${BASE_URL}/api/knowledge/logs?limit=${limit}`)
  }
}
