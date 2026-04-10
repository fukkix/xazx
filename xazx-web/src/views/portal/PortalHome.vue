<script setup lang="ts">
import { useMaterialsStore } from '../../stores/materials'
import { computed } from 'vue'

const store = useMaterialsStore()

const featuredResources = computed(() => store.materials.slice(0, 4))

const categoryEntries = [
  {
    icon: 'Document',
    label: '文档中心',
    count: store.documentCount,
    description: '企业财务报告、战略规划、技术白皮书等核心文件',
    color: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    filter: 'document'
  },
  {
    icon: 'Picture',
    label: '图片素材',
    count: store.imageCount,
    description: '品牌视觉、产品宣传图、UI设计规范和活动影像',
    color: 'from-emerald-500 to-teal-700',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    filter: 'image'
  },
  {
    icon: 'DataBoard',
    label: '演示文稿',
    count: store.pptCount,
    description: '路演方案、培训教程、产品演示和客户案例集',
    color: 'from-amber-500 to-orange-700',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    filter: 'ppt'
  }
]

const typeIconColors: Record<string, string> = {
  document: 'from-blue-400 to-blue-600',
  image: 'from-emerald-400 to-teal-600',
  ppt: 'from-amber-400 to-orange-600'
}

const typeLabels: Record<string, string> = {
  document: '文档',
  image: '图片',
  ppt: 'PPT'
}

const formatNumber = (n: number): string => {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString()
}
</script>

<template>
  <div>
    <!-- ═══════════ Hero Section ═══════════ -->
    <section class="relative overflow-hidden bg-surface py-16 md:py-32 lg:py-40">
      <!-- Decorative background orbs -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-[15%] -left-[8%] w-[55%] h-[55%] rounded-full bg-primary/[0.04] blur-[120px]"></div>
        <div class="absolute -bottom-[10%] -right-[5%] w-[45%] h-[45%] rounded-full bg-on-surface-variant/[0.03] blur-[100px]"></div>
        <div class="absolute top-[35%] left-[25%] w-[25%] h-[25%] rounded-full bg-primary-container/[0.08] blur-[80px]"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-6">
        <div class="max-w-3xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/8 text-primary rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-8">
            <el-icon :size="14"><Promotion /></el-icon>
            企业级资源管理平台
          </div>

          <!-- Main Title -->
          <h1 class="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-background leading-[1.1] tracking-tight mb-6">
            全链路企业资料
            <br>
            <span class="bg-gradient-to-r from-primary to-[#3b82f6] bg-clip-text text-transparent">云端枢纽</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-secondary text-lg md:text-xl max-w-xl leading-relaxed mb-10">
            汇聚公司产品文档、设计素材与宣发PPT。安全、高效、极简——为您的企业资源提供精策展览式管理体验。
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link
              to="/portal/resources"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
            >
              浏览资料中心
              <el-icon><Right /></el-icon>
            </router-link>
            <router-link
              to="/login"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-container-low text-primary font-bold text-base rounded-xl hover:bg-surface-container-high transition-all"
            >
              <el-icon><Monitor /></el-icon>
              管理后台
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Stats Bar ═══════════ -->
    <section class="relative z-10 max-w-7xl mx-auto px-6 mt-0 md:-mt-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Resources -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,52,94,0.06)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
              <el-icon :size="26" class="text-primary"><Box /></el-icon>
            </div>
            <div>
              <div class="font-headline text-3xl font-extrabold text-on-surface tracking-tight">{{ store.totalCount }}</div>
              <div class="text-xs font-bold text-on-surface-variant uppercase tracking-[0.15em]">总资料数量</div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,52,94,0.06)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-tertiary/8 flex items-center justify-center">
              <el-icon :size="26" class="text-tertiary"><Folder /></el-icon>
            </div>
            <div>
              <div class="font-headline text-3xl font-extrabold text-on-surface tracking-tight">3</div>
              <div class="text-xs font-bold text-on-surface-variant uppercase tracking-[0.15em]">覆盖品类</div>
            </div>
          </div>
        </div>

        <!-- Downloads -->
        <div class="bg-gradient-to-br from-primary to-primary-dim text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <el-icon :size="26"><Download /></el-icon>
            </div>
            <div>
              <div class="font-headline text-3xl font-extrabold tracking-tight">{{ formatNumber(store.totalDownloads) }}</div>
              <div class="text-xs font-bold text-blue-200/80 uppercase tracking-[0.15em]">累计下载量</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Featured Resources ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-24">
      <div class="flex justify-between items-end mb-12">
        <div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">精选推荐</span>
          <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">热门企业资源</h2>
        </div>
        <router-link
          to="/portal/resources"
          class="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dim transition-colors"
        >
          查看全部
          <el-icon><Right /></el-icon>
        </router-link>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <router-link
          v-for="item in featuredResources"
          :key="item.id"
          :to="`/portal/resources/${item.id}`"
          class="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <!-- Card Header Gradient -->
          <div :class="`h-36 bg-gradient-to-br ${typeIconColors[item.type]} flex items-center justify-center relative overflow-hidden`">
            <div class="absolute inset-0 bg-black/10"></div>
            <el-icon :size="48" class="text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <component :is="item.type === 'document' ? 'Document' : item.type === 'image' ? 'Picture' : 'DataBoard'" />
            </el-icon>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <h3 class="font-bold text-on-surface text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ item.name }}</h3>
            <div class="flex items-center justify-between">
              <span class="text-xs text-on-surface-variant font-medium">{{ item.size }} · {{ typeLabels[item.type] }}</span>
              <span class="text-xs text-on-surface-variant font-mono">
                <el-icon :size="12" class="mr-0.5"><Download /></el-icon>
                {{ formatNumber(item.downloads) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Mobile "View All" link -->
      <div class="flex justify-center mt-8 md:hidden">
        <router-link
          to="/portal/resources"
          class="inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          查看全部资源
          <el-icon><Right /></el-icon>
        </router-link>
      </div>
    </section>

    <!-- ═══════════ Category Browsing ═══════════ -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">分类浏览</span>
          <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">按资源类型快速定位</h2>
          <p class="text-secondary mt-3 max-w-lg mx-auto">精确分类的企业资源体系，帮助您快速找到所需内容</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <router-link
            v-for="entry in categoryEntries"
            :key="entry.label"
            :to="{ path: '/portal/resources', query: { category: entry.filter } }"
            class="group bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,52,94,0.04)] hover:shadow-[0_16px_50px_rgba(0,52,94,0.1)] hover:-translate-y-1 transition-all duration-300"
          >
            <div :class="`w-16 h-16 rounded-2xl bg-gradient-to-br ${entry.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform`">
              <el-icon :size="28" class="text-white">
                <component :is="entry.icon" />
              </el-icon>
            </div>
            <h3 class="font-headline text-xl font-extrabold text-on-surface mb-2">{{ entry.label }}</h3>
            <p class="text-sm text-secondary leading-relaxed mb-5">{{ entry.description }}</p>
            <div class="flex items-center justify-between">
              <span :class="`text-xs font-bold ${entry.textColor} ${entry.bgLight} px-3 py-1 rounded-full`">
                {{ entry.count }} 项资源
              </span>
              <span class="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                查看全部
                <el-icon :size="14"><Right /></el-icon>
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════ Knowledge Base Promo ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <router-link
        to="/portal/knowledge"
        class="group block bg-gradient-to-r from-[#0d2d5e] to-[#1a4a8a] rounded-2xl p-10 md:p-14 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 left-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl"></div>
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="max-w-xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-100 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <el-icon :size="12"><Opportunity /></el-icon>
              新增功能
            </div>
            <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">企业智能知识库</h2>
            <p class="text-blue-200/70 leading-relaxed">基于 LLM 驱动的知识管理系统——自动整理、交叉索引、自然语言检索。让企业智慧持续沉淀、高效流转。</p>
          </div>
          <div class="shrink-0 flex items-center gap-3 px-7 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl group-hover:bg-white/20 transition-colors">
            <el-icon :size="18"><Opportunity /></el-icon>
            立即使用
            <el-icon :size="14"><Right /></el-icon>
          </div>
        </div>
      </router-link>
    </section>

    <!-- ═══════════ CTA Section ═══════════ -->
    <section class="relative overflow-hidden py-24">
      <!-- Background Decor -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]"></div>
      </div>

      <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mb-4">
          需要管理企业资源？
        </h2>
        <p class="text-secondary mb-8 max-w-md mx-auto">
          登录管理后台，上传、编辑和管理所有企业资源文件。
        </p>
        <router-link
          to="/login"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
        >
          <el-icon><Monitor /></el-icon>
          进入管理后台
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
