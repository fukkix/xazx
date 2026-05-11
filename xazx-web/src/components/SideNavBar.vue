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
  uploader: 'UPLOADER',
}

const navLinks = [
  { label: '控制台', to: '/', exact: true, icon: 'Grid' },
  { label: '产品资料管理', to: '/products', exact: false, icon: 'Document' },
  { label: '知识库 (Wiki)', to: '/knowledge', exact: false, icon: 'Opportunity' },
  { label: '账号及权限管理', to: '/accounts', exact: false, icon: 'User', adminOnly: true },
  { label: '前台门户', to: '/portal', exact: false, icon: 'Monitor', external: true },
]

const isActive = (link: any) => {
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
}
</script>

<template>
  <aside class="h-screen w-60 flex-shrink-0 bg-surface border-r border-outline hidden md:flex flex-col z-40">
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-outline gap-2">
      <img src="@/assets/xazxpflogo.svg" class="h-7 object-contain" alt="Logo" />
      <span class="text-sm font-bold text-on-surface tracking-tight">资源管理中心</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-2">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :target="link.external ? '_blank' : undefined"
        active-class="!text-on-surface border-l-2 border-primary bg-primary/5"
        class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent"
        :class="isActive(link) ? '!text-on-surface border-l-2 border-primary bg-primary/5' : ''"
      >
        <el-icon :size="16"><component :is="link.icon" /></el-icon>
        {{ link.label }}
        <el-icon v-if="link.external" :size="10" class="ml-auto opacity-40"><TopRight /></el-icon>
      </router-link>
    </nav>

    <!-- Bottom -->
    <div class="p-3 space-y-2 border-t border-outline">
      <router-link to="/help" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
        <el-icon :size="14"><Help /></el-icon> 使用帮助
      </router-link>

      <!-- User Info -->
      <div class="pt-2 border-t border-outline mt-2">
        <div class="flex items-center gap-2 px-2 py-2">
          <div class="w-7 h-7 bg-surface-container-high border border-outline flex items-center justify-center text-on-surface font-bold text-xs geek-mono flex-shrink-0">
            {{ auth.user?.name?.charAt(0) || '?' }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium text-on-surface truncate">{{ auth.user?.name }}</div>
            <span
              v-if="auth.user?.role_name"
              class="geek-tag text-[10px] px-1 py-0.5 mt-0.5 inline-block"
              :class="auth.user.role_name === 'super_admin' ? 'geek-tag-primary' : 'geek-tag-ghost'"
            >
              {{ roleLabels[auth.user.role_name] || auth.user.role_label || auth.user.role_name }}
            </span>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full text-left px-2 py-1.5 text-xs text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors flex items-center gap-2"
        >
          <el-icon :size="14"><SwitchButton /></el-icon> 退出登录
        </button>
      </div>
    </div>
  </aside>
</template>
