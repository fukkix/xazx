<script setup lang="ts">
// 404 Not Found page
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center px-6">
    <div class="text-center max-w-lg">
      <!-- 404 Number -->
      <div class="relative mb-8">
        <span class="font-headline text-[10rem] md:text-[14rem] font-black text-primary/[0.06] leading-none select-none">
          404
        </span>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-24 h-24 rounded-3xl bg-primary/8 flex items-center justify-center">
            <el-icon :size="48" class="text-primary"><Warning /></el-icon>
          </div>
        </div>
      </div>

      <h1 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mb-4">
        页面未找到
      </h1>
      <p class="text-secondary mb-10 max-w-sm mx-auto leading-relaxed">
        您访问的页面不存在或已被移除。请检查链接地址，或返回首页浏览更多内容。
      </p>

      <div class="flex flex-wrap justify-center gap-4">
        <router-link
          to="/portal"
          class="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
        >
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </router-link>
        <router-link
          to="/portal/resources"
          class="inline-flex items-center gap-2 px-8 py-3.5 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all"
        >
          <el-icon><Search /></el-icon>
          浏览资料中心
        </router-link>
      </div>
    </div>
  </div>
</template>
