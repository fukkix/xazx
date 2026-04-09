<script setup lang="ts">
// Public Footer component for the front-facing portal
</script>

<template>
  <footer class="relative bg-gradient-to-br from-[#0d2d5e] to-[#0a1f42] text-white overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-8">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-b border-white/10">
        <!-- Brand Column -->
        <div class="space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <el-icon :size="22" color="white"><Grid /></el-icon>
            </div>
            <span class="font-headline font-extrabold text-xl tracking-tight">企业资料展示平台</span>
          </div>
          <p class="text-blue-200/70 text-sm leading-relaxed max-w-xs">
            汇聚公司产品文档、设计素材与宣发PPT。<br>安全、高效、极简的企业资源管理门户。
          </p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-5">
          <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/80">快速链接</h3>
          <nav class="space-y-3">
            <router-link to="/portal" class="block text-sm text-blue-200/60 hover:text-white transition-colors">首页</router-link>
            <router-link to="/portal/resources" class="block text-sm text-blue-200/60 hover:text-white transition-colors">资料中心</router-link>
            <router-link to="/login" class="block text-sm text-blue-200/60 hover:text-white transition-colors">管理后台</router-link>
          </nav>
        </div>

        <!-- Legal Links -->
        <div class="space-y-5">
          <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/80">法律条款</h3>
          <nav class="space-y-3">
            <a href="#" class="block text-sm text-blue-200/60 hover:text-white transition-colors">隐私政策</a>
            <a href="#" class="block text-sm text-blue-200/60 hover:text-white transition-colors">服务条款</a>
            <a href="#" class="block text-sm text-blue-200/60 hover:text-white transition-colors">帮助中心</a>
          </nav>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span class="text-xs text-blue-300/50 font-medium tracking-wider uppercase">
          © 2026 Enterprise Resource Platform. All rights reserved.
        </span>
        <span class="text-xs text-blue-300/40">
          Architectural Integrity Guaranteed.
        </span>
      </div>
    </div>
  </footer>
</template>
