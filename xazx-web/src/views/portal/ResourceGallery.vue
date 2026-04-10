<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMaterialsStore } from '../../stores/materials'

const route = useRoute()
const router = useRouter()
const store = useMaterialsStore()

const searchInput = ref('')
const currentPage = ref(1)
const pageSize = 8

const categories = [
  { label: '全部', value: 'all' },
  { label: '文档', value: 'document', icon: 'Document' },
  { label: '图片', value: 'image', icon: 'Picture' },
  { label: '演示文稿', value: 'ppt', icon: 'DataBoard' }
]

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

const typeLabels: Record<string, string> = {
  document: '文档',
  image: '图片',
  ppt: 'PPT'
}

// Initialize from query params
onMounted(() => {
  if (route.query.category && typeof route.query.category === 'string') {
    store.setCategory(route.query.category)
  }
})

// Watch for query parameter changes
watch(() => route.query.category, (newCat) => {
  if (newCat && typeof newCat === 'string') {
    store.setCategory(newCat)
  }
})

const onCategoryChange = (category: string) => {
  store.setCategory(category)
  currentPage.value = 1
  // Update URL query without reloading
  router.replace({ query: category !== 'all' ? { category } : {} })
}

const onSearch = () => {
  store.setSearch(searchInput.value)
  currentPage.value = 1
}

const onClearSearch = () => {
  searchInput.value = ''
  store.setSearch('')
}

const paginatedMaterials = () => {
  const start = (currentPage.value - 1) * pageSize
  return store.filteredMaterials.slice(start, start + pageSize)
}

const formatNumber = (n: number): string => {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString()
}
</script>

<template>
  <div>
    <!-- ═══════════ Page Header ═══════════ -->
    <section class="relative overflow-hidden bg-surface-container-low py-16 md:py-20">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/[0.04] blur-[100px]"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">Resource Gallery</span>
        <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-4">资料中心</h1>
        <p class="text-secondary max-w-lg mx-auto mb-10">检索并浏览所有企业资源文件，按分类快速定位需求</p>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto relative">
          <el-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary z-10" :size="20"><Search /></el-icon>
          <input
            v-model="searchInput"
            type="text"
            placeholder="搜索资源名称、描述或标签..."
            class="w-full pl-12 sm:pl-14 pr-[80px] sm:pr-32 py-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,52,94,0.06)] text-on-surface placeholder:text-secondary/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
            @keyup.enter="onSearch"
          >
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              v-if="searchInput"
              @click="onClearSearch"
              class="px-3 py-2 text-xs font-bold text-secondary hover:text-on-surface transition-colors"
            >
              清除
            </button>
            <button
              @click="onSearch"
              class="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-primary to-primary-dim text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97] transition-all whitespace-nowrap"
            >
              搜索
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Content Area ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-12">
      <!-- Category Filter Chips -->
      <div class="flex flex-nowrap sm:flex-wrap items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="onCategoryChange(cat.value)"
          class="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          :class="store.activeCategory === cat.value
            ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
            : 'bg-surface-container-low text-secondary hover:bg-surface-container-high hover:text-on-surface'"
        >
          <span class="flex items-center gap-2">
            <el-icon v-if="cat.icon" :size="14"><component :is="cat.icon" /></el-icon>
            {{ cat.label }}
          </span>
        </button>
        <span class="ml-auto text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em] shrink-0">
          共 {{ store.filteredMaterials.length }} 项资源
        </span>
      </div>

      <!-- Resource Cards Grid -->
      <div v-if="paginatedMaterials().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <router-link
          v-for="item in paginatedMaterials()"
          :key="item.id"
          :to="`/portal/resources/${item.id}`"
          class="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] hover:-translate-y-1 transition-all duration-300"
        >
          <!-- Card Header with Type Visual -->
          <div :class="`h-32 bg-gradient-to-br ${typeIconColors[item.type]} flex items-center justify-center relative overflow-hidden`">
            <div class="absolute inset-0 bg-black/5"></div>
            <!-- Decorative circle -->
            <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <el-icon :size="40" class="text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <component :is="item.type === 'document' ? 'Document' : item.type === 'image' ? 'Picture' : 'DataBoard'" />
            </el-icon>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <h3 class="font-bold text-on-surface text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ item.name }}</h3>
            <p class="text-xs text-secondary line-clamp-2 leading-relaxed mb-4">{{ item.description }}</p>

            <!-- Meta Row -->
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs text-on-surface-variant font-mono">{{ item.size }}</span>
              <span :class="`text-[10px] font-bold px-2.5 py-1 rounded-full ${typeBadgeStyles[item.type]}`">
                {{ typeLabels[item.type] }}
              </span>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="tag in item.tags.slice(0, 2)"
                :key="tag"
                class="text-[10px] font-semibold text-secondary bg-surface-container-low px-2 py-0.5 rounded"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-3 border-t border-surface-container-high/50">
              <span class="text-[10px] text-on-surface-variant">{{ item.uploadDate }}</span>
              <span class="text-[10px] text-on-surface-variant flex items-center gap-1">
                <el-icon :size="10"><Download /></el-icon>
                {{ formatNumber(item.downloads) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24">
        <el-icon :size="48" class="text-secondary/30 mb-4"><Search /></el-icon>
        <h3 class="font-headline text-xl font-bold text-on-surface mb-2">未找到匹配资源</h3>
        <p class="text-secondary text-sm">尝试修改搜索关键词或切换分类筛选</p>
      </div>

      <!-- Pagination -->
      <div v-if="store.filteredMaterials.length > pageSize" class="flex justify-center mt-12">
        <el-pagination
          v-model:current-page="currentPage"
          background
          layout="prev, pager, next"
          :total="store.filteredMaterials.length"
          :page-size="pageSize"
        />
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hide scrollbar for category swiping */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
