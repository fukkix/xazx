import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const userStr = localStorage.getItem('mock-user')
  const user = ref(userStr ? JSON.parse(userStr) : null)

  const login = (id: string, pw: string) => {
    // Mock login logic based on roles
    if (id === 'super') {
      user.value = { name: 'Super Admin', role: 'super_admin' }
    } else if (id === 'admin') {
      user.value = { name: 'Admin', role: 'admin' }
    } else {
      user.value = { name: 'Customer User', role: 'user' }
    }
    localStorage.setItem('mock-user', JSON.stringify(user.value))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('mock-user')
  }

  return { user, login, logout }
})
