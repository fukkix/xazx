<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <aside class="h-screen w-60 flex-shrink-0 bg-surface border-r border-outline hidden md:flex flex-col z-40">
    <div class="h-14 flex items-center px-4 border-b border-outline">
      <div>
        <h2 class="text-on-surface font-bold text-sm tracking-tight">资料库</h2>
        <p class="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest">ENTERPRISE_ASSETS</p>
      </div>
    </div>

    <nav class="flex-1 py-2">
      <div class="px-3 py-2">
        <span class="geek-label px-1">核心资源</span>
      </div>
      <router-link to="/products" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><Document /></el-icon>
        产品资料管理
      </router-link>

      <div class="px-3 py-2 mt-2">
        <span class="geek-label px-1">系统模块</span>
      </div>
      <router-link to="/knowledge" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><Opportunity /></el-icon>
        知识库 (Wiki)
      </router-link>
      <router-link v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'" to="/accounts" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><User /></el-icon>
        账号及权限管理
      </router-link>
    </nav>

    <div class="p-3 space-y-2 border-t border-outline">
      <div class="pt-2 space-y-0">
        <router-link to="/portal" target="_blank" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
          <el-icon :size="14"><Monitor /></el-icon> 前台门户
          <el-icon :size="10" class="ml-auto opacity-40"><TopRight /></el-icon>
        </router-link>
        <router-link to="/help" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
          <el-icon :size="14"><Help /></el-icon> 使用帮助
        </router-link>
      </div>
    </div>


  </aside>
</template>
