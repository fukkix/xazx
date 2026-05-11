import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginResponse } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth-token') || '')
  const userStr = localStorage.getItem('auth-user')
  const user = ref(userStr ? JSON.parse(userStr) : null)
  const permissions = ref<string[]>(localStorage.getItem('auth-perms') ? JSON.parse(localStorage.getItem('auth-perms')!) : [])

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isSuperAdmin = computed(() => user.value?.role_name === 'super_admin')

  const hasPermission = (perm: string) => {
    return permissions.value.includes(perm)
  }

  const hasAnyPermission = (perms: string[]) => {
    return perms.some(p => permissions.value.includes(p))
  }

  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    token.value = res.token
    user.value = res.user
    permissions.value = res.permissions
    localStorage.setItem('auth-token', res.token)
    localStorage.setItem('auth-user', JSON.stringify(res.user))
    localStorage.setItem('auth-perms', JSON.stringify(res.permissions))
    return res
  }

  const logout = async () => {
    try { await authApi.logout() } catch (e) { /* ignore */ }
    token.value = ''
    user.value = null
    permissions.value = []
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
    localStorage.removeItem('auth-perms')
  }

  const restore = async () => {
    if (token.value) {
      try {
        const me = await authApi.me()
        user.value = me
        permissions.value = me.permissions || []
        localStorage.setItem('auth-user', JSON.stringify(me))
        localStorage.setItem('auth-perms', JSON.stringify(me.permissions || []))
      } catch (e) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    permissions,
    isLoggedIn,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    login,
    logout,
    restore,
  }
})
