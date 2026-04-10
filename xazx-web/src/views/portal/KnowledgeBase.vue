<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { knowledgeApi } from '../../services/knowledge'

const searchQuery = ref('')
const isSearching = ref(false)
const searchResult = ref<{ answer: string; sources: any[] } | null>(null)
const statsLoaded = ref(false)

const categories = ref([
  { icon: 'Box', key: 'product', label: '产品知识库', count: 0, description: '各产品功能介绍、核心卖点、适用场景（WAF、动态防御、全流量分析等）', audience: '全员' },
  { icon: 'SetUp', key: 'tech', label: '技术文档库', count: 0, description: '部署架构、配置手册、API 文档、排障指南', audience: '研发 / 实施 / 售后' },
  { icon: 'Connection', key: 'sales', label: '销售支持库', count: 0, description: '竞品对比、客户案例、购买驱动力分析', audience: '销售 / 售前' },
  { icon: 'Reading', key: 'compliance', label: '行业合规库', count: 0, description: '等保 2.0、网络安全法、行业监管要求', audience: '售前 / 销售' },
  { icon: 'Notebook', key: 'ops', label: '内部运营库', count: 0, description: '实施规范、验收模板、售后 FAQ、流程 SOP', audience: '全员' }
])

const recentEntries = ref([
  { title: 'WAF 产品概述', domain: '产品知识库', date: '2026-04-09', status: 'published' },
  { title: 'Web 应用防护系统白皮书', domain: '产品知识库', date: '2026-04-09', status: 'published' },
  { title: '更多文档入库中...', domain: '', date: '', status: 'coming' }
])

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  searchResult.value = null
  try {
    const res = await knowledgeApi.search({ query: searchQuery.value })
    searchResult.value = res
  } catch {
    // 后端未启动时给出友好提示
    searchResult.value = { answer: '知识库检索服务暂未就绪，请稍后再试。', sources: [] }
  } finally {
    isSearching.value = false
  }
}

onMounted(async () => {
  try {
    const stats = await knowledgeApi.getStats()
    const domainMap: Record<string, number> = {}
    stats.domains.forEach(d => { domainMap[d.domain] = d.page_count })
    categories.value.forEach(cat => {
      cat.count = domainMap[cat.key] ?? 0
    })
    statsLoaded.value = true
  } catch {
    // 后端未启动，保持 count=0
  }
})
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
        <h1 class="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-5 leading-[1.15]">
          企业智能
          <span class="bg-gradient-to-r from-tertiary to-primary bg-clip-text text-transparent">知识库</span>
        </h1>

        <p class="text-secondary text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          基于 LLM 驱动的企业知识管理系统——自动整理、交叉引用、持续进化的结构化知识图谱。支持自然语言检索，让企业智慧不再散落。
        </p>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto relative">
          <el-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary z-10" :size="20"><Search /></el-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="用自然语言搜索知识库内容..."
            class="w-full pl-12 sm:pl-14 pr-[100px] sm:pr-36 py-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,52,94,0.06)] text-on-surface placeholder:text-secondary/40 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
            @keyup.enter="handleSearch"
          >
          <button
            :disabled="isSearching || !searchQuery.trim()"
            class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-tertiary to-tertiary-dim text-on-tertiary text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            @click="handleSearch"
          >
            {{ isSearching ? '检索中...' : '智能检索' }}
          </button>
        </div>

        <!-- Search Result -->
        <div v-if="searchResult" class="mt-6 max-w-2xl mx-auto text-left bg-surface-container-lowest rounded-2xl p-6 shadow-md">
          <p class="text-on-surface text-sm leading-relaxed mb-3">{{ searchResult.answer }}</p>
          <div v-if="searchResult.sources.length" class="space-y-1">
            <span class="text-xs font-bold text-secondary uppercase tracking-wider">来源</span>
            <div v-for="src in searchResult.sources" :key="src.path" class="text-xs text-primary hover:underline cursor-pointer">
              {{ src.title }} · {{ src.domain }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Knowledge Categories ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">知识分类</span>
        <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">五大知识领域</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="group bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.08)] transition-all duration-300 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <el-icon :size="24" class="text-primary"><component :is="cat.icon" /></el-icon>
          </div>
          <h3 class="font-bold text-on-surface mb-1">{{ cat.label }}</h3>
          <p class="text-[10px] text-primary/70 font-medium mb-2 uppercase tracking-wide">{{ cat.audience }}</p>
          <p class="text-xs text-secondary leading-relaxed mb-4">{{ cat.description }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-on-surface-variant">{{ cat.count }} 篇</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Recent Entries Preview ═══════════ -->
    <section class="bg-surface-container-low py-20">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">最新内容</span>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface tracking-tight">近期入库条目</h2>
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
                <span v-if="entry.domain" class="text-xs text-secondary">{{ entry.domain }} · {{ entry.date }}</span>
              </div>
            </div>
            <span
              class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              :class="entry.status === 'published'
                ? 'text-primary bg-primary/10'
                : 'text-tertiary bg-tertiary/8'"
            >
              {{ entry.status === 'published' ? '已入库' : 'Coming Soon' }}
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
