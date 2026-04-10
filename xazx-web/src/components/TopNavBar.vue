<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const roleLabels: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  user: '普通用户'
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-50 text-red-600',
  admin: 'bg-amber-50 text-amber-600',
  user: 'bg-blue-50 text-blue-600'
}

const adminLinks = [
  { label: '控制台', to: '/', exact: true },
  { label: '组织架构', to: '/accounts' },
  { label: '前台门户', to: '/portal', external: true }
]

const isActive = (link: any) => {
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
}
</script>

<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm dark:shadow-none h-16 flex justify-between items-center px-8 border-b border-surface-container-high/50">
    <div class="flex items-center gap-8">
      <div class="flex items-center gap-3">
        <img src="@/assets/xazxpflogo.svg" class="h-8 object-contain" alt="Logo" />
        <span class="text-2xl font-black text-blue-900 dark:text-blue-100">资源管理中心</span>
      </div>
      <div class="hidden md:flex gap-1">
        <router-link
          v-for="link in adminLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg font-manrope tracking-tight text-sm font-semibold transition-all"
          :class="isActive(link)
            ? 'text-primary bg-primary/8'
            : 'text-slate-500 dark:text-slate-400 hover:text-blue-800 hover:bg-surface-container-low'"
          :target="link.external ? '_blank' : undefined"
        >
          {{ link.label }}
          <el-icon v-if="link.external" :size="10" class="ml-1 opacity-50"><TopRight /></el-icon>
        </router-link>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <span
        v-if="auth.user?.role"
        :class="`px-3 py-1 rounded-full text-xs font-bold ${roleColors[auth.user.role] || 'bg-blue-50 text-blue-600'}`"
      >
        {{ roleLabels[auth.user.role] || auth.user.role }}
      </span>
      <button class="p-2 text-slate-500 hover:text-blue-700 scale-95 active:opacity-80 transition-all">
        <el-icon :size="20"><Bell /></el-icon>
      </button>
      <button class="p-2 text-slate-500 hover:text-blue-700 scale-95 active:opacity-80 transition-all">
        <el-icon :size="20"><Setting /></el-icon>
      </button>
      
      <el-dropdown trigger="click">
        <div class="flex items-center cursor-pointer ml-2">
          <div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold">
            {{ auth.user?.name.charAt(0) }}
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>{{ auth.user?.name }}</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>
