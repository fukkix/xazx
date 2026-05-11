const BASE_URL = ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Token': token } : {}),
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
  })
  const contentType = res.headers.get('content-type') || ''
  let data: any
  try {
    data = await res.json()
  } catch (e) {
    if (!contentType.includes('application/json')) {
      throw new Error(`服务器响应异常 (HTTP ${res.status})，请检查后端服务是否正常运行。响应类型: ${contentType || 'unknown'}`)
    }
    throw new Error('解析响应失败')
  }
  if (!data.success) {
    throw new Error(data.message || '请求失败')
  }
  return data.data as T
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
    name: string
    email: string
    role_id: number
    role_name: string
    role_label: string
  }
  permissions: string[]
  token: string
}

export interface Role {
  id: number
  name: string
  label: string
  description: string
  is_system: number
  permissions: string[]
  created_at: string
}

export interface User {
  id: number
  username: string
  name: string
  email: string
  role_id: number
  role_name: string
  role_label: string
  status: number
  created_at: string
}

export const authApi = {
  login(params: LoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>('/api/login.php', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  logout(): Promise<void> {
    return request<void>('/api/logout.php', { method: 'POST' })
  },

  me(): Promise<any> {
    return request<any>('/api/me.php')
  },

  getRoles(): Promise<Role[]> {
    return request<Role[]>('/api/roles.php')
  },

  createRole(data: Partial<Role>): Promise<{ id: number }> {
    return request<{ id: number }>('/api/roles.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateRole(data: Partial<Role>): Promise<void> {
    return request<void>('/api/roles.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteRole(id: number): Promise<void> {
    return request<void>('/api/roles.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  },

  getUsers(): Promise<User[]> {
    return request<User[]>('/api/users.php')
  },

  createUser(data: Partial<User> & { password?: string }): Promise<{ id: number }> {
    return request<{ id: number }>('/api/users.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateUser(data: Partial<User> & { id: number; password?: string }): Promise<void> {
    return request<void>('/api/users.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteUser(id: number): Promise<void> {
    return request<void>('/api/users.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  },

  auditFile(id: number, status: 'approved' | 'rejected'): Promise<void> {
    return request<void>('/api/audit.php', {
      method: 'POST',
      body: JSON.stringify({ id, status }),
    })
  },
}
