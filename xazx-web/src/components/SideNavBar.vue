<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <aside class="h-screen w-64 fixed left-0 top-0 bg-blue-900 dark:bg-slate-950 shadow-2xl hidden md:flex flex-col pt-20 pb-8 px-4 z-40">
    <div class="mb-8 px-4">
      <h2 class="text-white font-bold text-xl">资料库</h2>
      <p class="text-blue-200/70 text-xs font-medium font-manrope uppercase tracking-widest">企业级核心资产</p>
    </div>
    
    <nav class="flex-1 space-y-1">
      <router-link to="/materials/document" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><Document /></el-icon>
        文档 (Documents)
      </router-link>
      <router-link to="/materials/image" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><Picture /></el-icon>
        图片素材 (Images)
      </router-link>
      <router-link to="/materials/ppt" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><DataBoard /></el-icon>
        演示文稿 (PPTs)
      </router-link>
      <router-link to="/knowledge" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all border-t border-blue-800 mt-4 pt-4">
        <el-icon :size="18"><Opportunity /></el-icon>
        知识库 (Wiki)
      </router-link>
      <router-link v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'" to="/accounts" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><User /></el-icon>
        账号及权限管理
      </router-link>
    </nav>
    
    <div class="mt-auto space-y-4">
      <button v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'" class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-primary-dim transition-colors">
        <el-icon :size="20"><Plus /></el-icon>
        上传新资源
      </button>
      
      <div class="pt-6 border-t border-blue-800/50">
        <a href="#" class="text-blue-200/70 hover:text-white px-4 py-2 flex items-center gap-3 font-manrope text-sm font-medium">
          <el-icon :size="18"><Help /></el-icon> 使用帮助
        </a>
        <a href="#" class="text-blue-200/70 hover:text-white px-4 py-2 flex items-center gap-3 font-manrope text-sm font-medium">
          <el-icon :size="18"><Box /></el-icon> 资产归档
        </a>
      </div>
    </div>
  </aside>
</template>
