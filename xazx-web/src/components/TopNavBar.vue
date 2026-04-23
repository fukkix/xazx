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
  super_admin: 'SUPER_ADMIN',
  admin: 'ADMIN',
  user: 'USER'
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
  <nav class="h-14 flex justify-between items-center px-6 bg-surface border-b border-outline z-50">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <img src="@/assets/xazxpflogo.svg" class="h-7 object-contain" alt="Logo" />
        <span class="text-lg font-bold text-on-surface tracking-tight">资源管理中心</span>
      </div>
      <div class="hidden md:flex gap-0 h-14">
        <router-link
          v-for="link in adminLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 h-full flex items-center text-xs font-semibold tracking-wide uppercase transition-all border-b-2 border-transparent"
          :class="isActive(link)
            ? 'text-primary border-primary bg-primary/5'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
          :target="link.external ? '_blank' : undefined"
        >
          {{ link.label }}
          <el-icon v-if="link.external" :size="10" class="ml-1 opacity-50"><TopRight /></el-icon>
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <span
        v-if="auth.user?.role"
        class="geek-tag"
        :class="auth.user.role === 'super_admin' ? 'geek-tag-primary' : 'geek-tag-ghost'"
      >
        {{ roleLabels[auth.user.role] || auth.user.role }}
      </span>

      <button class="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <el-icon :size="18"><Bell /></el-icon>
      </button>
      <button class="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
        <el-icon :size="18"><Setting /></el-icon>
      </button>

      <el-dropdown trigger="click">
        <div class="flex items-center cursor-pointer ml-1 gap-2">
          <div class="w-7 h-7 bg-surface-container-high border border-outline flex items-center justify-center text-on-surface font-bold text-xs geek-mono">
            {{ auth.user?.name.charAt(0) }}
          </div>
          <span class="text-xs font-medium text-on-surface hidden sm:block">{{ auth.user?.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled class="geek-mono text-xs">{{ auth.user?.name }}</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>
