<script setup lang="ts">
// 知识库页面 — 第二期开发中
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="max-w-lg mx-auto px-6 text-center">
      <!-- Icon -->
      <div class="w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-8">
        <el-icon :size="48" class="text-primary"><Tools /></el-icon>
      </div>

      <!-- Title -->
      <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-4">
        企业智能知识库
      </h1>
      <p class="text-secondary text-lg mb-2">第二期开发中</p>
      <p class="text-secondary/70 text-sm max-w-sm mx-auto leading-relaxed mb-10">
        基于 LLM 驱动的企业知识管理系统正在建设中。届时将支持自然语言检索、知识自动沉淀与结构化 Wiki 管理。
      </p>

      <!-- Feature Preview -->
      <div class="bg-surface-container-low rounded-2xl p-6 text-left space-y-4 mb-10">
        <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">即将上线功能</h3>
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <el-icon :size="16" class="text-blue-600"><Search /></el-icon>
          </div>
          <div>
            <h4 class="font-bold text-on-surface text-sm mb-0.5">自然语言智能检索</h4>
            <p class="text-xs text-secondary">用日常语言提问，AI 精准定位答案</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
            <el-icon :size="16" class="text-purple-600"><Connection /></el-icon>
          </div>
          <div>
            <h4 class="font-bold text-on-surface text-sm mb-0.5">知识图谱构建</h4>
            <p class="text-xs text-secondary">自动关联知识点，形成结构化知识网络</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <el-icon :size="16" class="text-emerald-600"><DocumentChecked /></el-icon>
          </div>
          <div>
            <h4 class="font-bold text-on-surface text-sm mb-0.5">文档智能入库</h4>
            <p class="text-xs text-secondary">上传文档自动解析、分类、生成 Wiki 条目</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <router-link
        to="/portal"
        class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
      >
        <el-icon :size="16"><Back /></el-icon>
        返回首页
      </router-link>
    </div>
  </div>
</template>
