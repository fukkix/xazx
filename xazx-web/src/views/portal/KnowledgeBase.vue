<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const handleSearch = () => {
  // TODO: 对接知识库搜索 API
  console.log('Knowledge base search:', searchQuery.value)
}

const categories = [
  { icon: 'Notebook', label: 'LLM 技术文档', count: 0, description: '大语言模型架构、训练方法与应用实践' },
  { icon: 'Connection', label: '产品知识图谱', count: 0, description: '产品功能、API 接口与集成方案' },
  { icon: 'Reading', label: '行业研究报告', count: 0, description: '市场分析、竞品调研与趋势洞察' },
  { icon: 'SetUp', label: '内部技术 Wiki', count: 0, description: '团队沉淀的工程实践与最佳方案' }
]

const recentEntries = [
  { title: 'LLM Wiki — 构建企业知识库的模式', date: '即将上线', status: 'coming' },
  { title: '大模型 RAG 检索增强生成指南', date: '即将上线', status: 'coming' },
  { title: '向量数据库选型对比分析', date: '即将上线', status: 'coming' }
]
</script>

<template>
  <div>
    <!-- ═══════════ Hero Section ═══════════ -->
    <section class="relative overflow-hidden bg-surface-container-low py-16 md:py-24">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-[15%] right-[10%] w-[40%] h-[40%] rounded-full bg-tertiary/[0.04] blur-[100px]"></div>
        <div class="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-primary/[0.03] blur-[80px]"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-tertiary/8 text-tertiary rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-6">
          <el-icon :size="14"><Opportunity /></el-icon>
          即将上线
        </div>

        <h1 class="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-5 leading-[1.15]">
          企业智能
          <span class="bg-gradient-to-r from-tertiary to-primary bg-clip-text text-transparent">知识库</span>
        </h1>

        <p class="text-secondary text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          基于 LLM 驱动的企业知识管理系统——自动整理、交叉引用、持续进化的结构化知识图谱。支持自然语言检索，让企业智慧不再散落。
        </p>

        <!-- Search Bar (预留) -->
        <div class="max-w-2xl mx-auto relative">
          <el-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary z-10" :size="20"><Search /></el-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="用自然语言搜索知识库内容...（功能开发中）"
            disabled
            class="w-full pl-14 pr-36 py-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,52,94,0.06)] text-on-surface placeholder:text-secondary/40 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            @keyup.enter="handleSearch"
          >
          <button
            disabled
            class="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-br from-tertiary to-tertiary-dim text-on-tertiary text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            智能检索
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════ Knowledge Categories ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">知识分类</span>
        <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">知识领域一览</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="cat in categories"
          :key="cat.label"
          class="group bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.08)] transition-all duration-300 relative overflow-hidden"
        >
          <!-- Coming Soon Overlay -->
          <div class="absolute top-3 right-3">
            <span class="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              即将上线
            </span>
          </div>

          <div class="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <el-icon :size="24" class="text-primary"><component :is="cat.icon" /></el-icon>
          </div>
          <h3 class="font-bold text-on-surface mb-2">{{ cat.label }}</h3>
          <p class="text-xs text-secondary leading-relaxed mb-4">{{ cat.description }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-on-surface-variant">{{ cat.count }} 篇文章</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Recent Entries Preview ═══════════ -->
    <section class="bg-surface-container-low py-20">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">最新内容</span>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface tracking-tight">近期规划入库条目</h2>
        </div>

        <div class="space-y-4">
          <div
            v-for="entry in recentEntries"
            :key="entry.title"
            class="bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,52,94,0.03)]"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-tertiary/8 flex items-center justify-center">
                <el-icon :size="18" class="text-tertiary"><Document /></el-icon>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface text-sm">{{ entry.title }}</h4>
                <span class="text-xs text-secondary">{{ entry.date }}</span>
              </div>
            </div>
            <span class="text-[10px] font-bold text-tertiary bg-tertiary/8 px-3 py-1 rounded-full uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Architecture Preview ═══════════ -->
    <section class="max-w-4xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">系统设计</span>
        <h2 class="font-headline text-2xl font-extrabold text-on-surface tracking-tight mb-4">知识库架构</h2>
        <p class="text-secondary max-w-lg mx-auto">基于 LLM Wiki 模式，构建持续进化的企业知识体系</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.04)] text-center">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <el-icon :size="28" class="text-blue-600"><UploadFilled /></el-icon>
          </div>
          <h3 class="font-bold text-on-surface mb-2 text-sm">原始资料层</h3>
          <p class="text-xs text-secondary leading-relaxed">文档、报告、会议记录等原始素材。不可变的事实来源。</p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.04)] text-center">
          <div class="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <el-icon :size="28" class="text-purple-600"><Connection /></el-icon>
          </div>
          <h3 class="font-bold text-on-surface mb-2 text-sm">知识 Wiki 层</h3>
          <p class="text-xs text-secondary leading-relaxed">LLM 自动生成的结构化 Wiki。交叉引用、持续更新。</p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.04)] text-center">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <el-icon :size="28" class="text-amber-600"><Search /></el-icon>
          </div>
          <h3 class="font-bold text-on-surface mb-2 text-sm">智能检索层</h3>
          <p class="text-xs text-secondary leading-relaxed">自然语言查询，直达知识精髓。无需翻阅海量文档。</p>
        </div>
      </div>
    </section>
  </div>
</template>
