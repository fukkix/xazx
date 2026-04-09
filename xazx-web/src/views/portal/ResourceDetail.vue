<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMaterialsStore } from '../../stores/materials'

const route = useRoute()
const router = useRouter()
const store = useMaterialsStore()

const resourceId = computed(() => Number(route.params.id))
const resource = computed(() => store.getMaterialById(resourceId.value))
const relatedResources = computed(() => store.getRelatedMaterials(resourceId.value, 4))

const typeLabels: Record<string, string> = {
  document: '文档',
  image: '图片素材',
  ppt: '演示文稿'
}

const typeIconColors: Record<string, string> = {
  document: 'from-blue-400 to-blue-600',
  image: 'from-emerald-400 to-teal-600',
  ppt: 'from-amber-400 to-orange-600'
}

const typeBadgeStyles: Record<string, string> = {
  document: 'bg-blue-50 text-blue-600',
  image: 'bg-emerald-50 text-emerald-600',
  ppt: 'bg-amber-50 text-amber-600'
}

const formatNumber = (n: number): string => {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString()
}

const handleDownload = () => {
  if (resource.value) {
    console.log('Downloading:', resource.value.name)
    // In a real app, this would trigger a file download
  }
}

const handleShare = () => {
  if (resource.value) {
    console.log('Sharing:', resource.value.name)
  }
}
</script>

<template>
  <div v-if="resource">
    <!-- ═══════════ Breadcrumb ═══════════ -->
    <div class="bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <nav class="flex items-center gap-2 text-sm text-secondary">
          <router-link to="/portal/resources" class="hover:text-primary transition-colors font-medium">资料中心</router-link>
          <el-icon :size="12" class="text-on-surface-variant/40"><Right /></el-icon>
          <span class="text-on-surface-variant font-medium">{{ typeLabels[resource.type] }}</span>
          <el-icon :size="12" class="text-on-surface-variant/40"><Right /></el-icon>
          <span class="text-on-surface font-semibold truncate max-w-[200px]">{{ resource.name }}</span>
        </nav>
      </div>
    </div>

    <!-- ═══════════ Main Content ═══════════ -->
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <!-- Left Column: Preview + Details -->
        <div class="space-y-8">
          <!-- Preview Area -->
          <div :class="`rounded-2xl overflow-hidden bg-gradient-to-br ${typeIconColors[resource.type]} aspect-video flex items-center justify-center relative shadow-lg`">
            <div class="absolute inset-0 bg-black/10"></div>
            <!-- Decorative background shapes -->
            <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full"></div>
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <el-icon :size="80" class="text-white/80 relative z-10">
              <component :is="resource.type === 'document' ? 'Document' : resource.type === 'image' ? 'Picture' : 'DataBoard'" />
            </el-icon>
            <!-- Fullscreen Button Placeholder -->
            <button class="absolute bottom-4 right-4 p-2.5 bg-black/30 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-black/50 transition-all z-10">
              <el-icon :size="18"><FullScreen /></el-icon>
            </button>
          </div>

          <!-- Resource Title & Description -->
          <div>
            <span :class="`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${typeBadgeStyles[resource.type]}`">
              {{ typeLabels[resource.type] }}
            </span>
            <h1 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mb-5">
              {{ resource.name }}
            </h1>
            <p class="text-secondary leading-relaxed text-base">
              {{ resource.description }}
            </p>
          </div>
        </div>

        <!-- Right Column: Action Sidebar -->
        <div class="space-y-6">
          <!-- Download Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.06)] space-y-4">
            <button
              @click="handleDownload"
              class="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
            >
              <el-icon :size="20"><Download /></el-icon>
              下载资源
            </button>
            <button
              @click="handleShare"
              class="w-full flex items-center justify-center gap-3 py-3.5 bg-surface-container-low text-secondary font-semibold text-sm rounded-xl hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <el-icon :size="16"><Share /></el-icon>
              分享到团队
            </button>
          </div>

          <!-- Metadata Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.06)]">
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">资源类型</span>
                <span class="text-sm font-semibold text-on-surface">{{ typeLabels[resource.type] }}</span>
              </div>
              <div class="h-px bg-surface-container-high/50"></div>
              <div class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">文件大小</span>
                <span class="text-sm font-semibold text-on-surface font-mono">{{ resource.size }}</span>
              </div>
              <div v-if="resource.dimensions" class="h-px bg-surface-container-high/50"></div>
              <div v-if="resource.dimensions" class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">尺寸</span>
                <span class="text-sm font-semibold text-on-surface font-mono">{{ resource.dimensions }}</span>
              </div>
              <div class="h-px bg-surface-container-high/50"></div>
              <div class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">上传日期</span>
                <span class="text-sm font-semibold text-on-surface">{{ resource.uploadDate }}</span>
              </div>
              <div class="h-px bg-surface-container-high/50"></div>
              <div class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">上传者</span>
                <span class="text-sm font-semibold text-on-surface">{{ resource.uploader }}</span>
              </div>
              <div class="h-px bg-surface-container-high/50"></div>
              <div class="flex justify-between items-center py-2">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">下载次数</span>
                <span class="text-sm font-semibold text-on-surface font-mono">{{ resource.downloads.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Tags Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,52,94,0.06)]">
            <h3 class="text-xs font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-4">资源标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in resource.tags"
                :key="tag"
                class="px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-primary/8 hover:text-primary cursor-pointer transition-colors"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════ Related Resources ═══════════ -->
      <section v-if="relatedResources.length > 0" class="mt-20">
        <div class="flex justify-between items-end mb-8">
          <div>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">精选合集</span>
            <h2 class="font-headline text-xl md:text-2xl font-extrabold text-on-surface tracking-tight">相关资源</h2>
          </div>
          <router-link
            to="/portal/resources"
            class="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dim transition-colors"
          >
            查看全部合集
            <el-icon><Right /></el-icon>
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="item in relatedResources"
            :key="item.id"
            :to="`/portal/resources/${item.id}`"
            class="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] hover:-translate-y-1 transition-all duration-300"
          >
            <div :class="`h-28 bg-gradient-to-br ${typeIconColors[item.type]} flex items-center justify-center relative overflow-hidden`">
              <div class="absolute inset-0 bg-black/5"></div>
              <div class="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
              <el-icon :size="32" class="text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <component :is="item.type === 'document' ? 'Document' : item.type === 'image' ? 'Picture' : 'DataBoard'" />
              </el-icon>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-on-surface text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">{{ item.name }}</h3>
              <span class="text-xs text-on-surface-variant font-mono">{{ item.size }} · {{ typeLabels[item.type] }}</span>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>

  <!-- 404 State -->
  <div v-else class="max-w-7xl mx-auto px-6 py-32 text-center">
    <el-icon :size="64" class="text-secondary/20 mb-6"><Warning /></el-icon>
    <h1 class="font-headline text-2xl font-extrabold text-on-surface mb-3">资源未找到</h1>
    <p class="text-secondary mb-8">该资源可能已被移除或链接无效</p>
    <router-link
      to="/portal/resources"
      class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
    >
      <el-icon><Back /></el-icon>
      返回资料中心
    </router-link>
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
