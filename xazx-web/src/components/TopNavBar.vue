<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm dark:shadow-none h-16 flex justify-between items-center px-8 border-b border-surface-container-high/50">
    <div class="flex items-center gap-8">
      <span class="text-2xl font-black text-blue-900 dark:text-blue-100">资源管理中心</span>
      <div class="hidden md:flex gap-6">
        <router-link to="/" class="font-manrope tracking-tight headline-sm font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 pb-1 hover:text-blue-800 transition-colors">控制台</router-link>
        <a href="#" class="font-manrope tracking-tight headline-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-800 transition-colors">组织架构</a>
        <a href="#" class="font-manrope tracking-tight headline-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-800 transition-colors">企业名录</a>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">{{ auth.user?.role }}</span>
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
