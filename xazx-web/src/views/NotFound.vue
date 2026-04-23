<script setup lang="ts">
// 404 Not Found page
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-6">
    <div class="text-center max-w-lg">
      <!-- 404 Number -->
      <div class="relative mb-6">
        <span class="font-mono text-[8rem] md:text-[10rem] font-bold text-outline leading-none select-none">
          404
        </span>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 bg-surface-container-high border border-outline flex items-center justify-center">
            <el-icon :size="40" class="text-on-surface"><Warning /></el-icon>
          </div>
        </div>
      </div>

      <h1 class="font-headline text-xl md:text-2xl font-bold text-on-surface tracking-tight mb-3">
        页面未找到
      </h1>
      <p class="text-secondary text-sm mb-8 max-w-sm mx-auto leading-relaxed">
        您访问的页面不存在或已被移除。请检查链接地址，或返回首页浏览更多内容。
      </p>

      <div class="flex flex-wrap justify-center gap-3">
        <router-link
          to="/portal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-on-surface text-on-primary font-bold text-sm hover:bg-on-surface-variant active:opacity-90 transition-all"
        >
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </router-link>
        <router-link
          to="/portal/resources"
          class="inline-flex items-center gap-2 px-6 py-3 bg-surface text-on-surface font-bold text-sm border border-outline hover:bg-surface-container-high transition-all"
        >
          <el-icon><Search /></el-icon>
          浏览资料中心
        </router-link>
      </div>
    </div>
  </div>
</template>
