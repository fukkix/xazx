<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterialsStore, productCategories, fileTypeConfig, type ProductCategory } from '../../stores/materials'

const store = useMaterialsStore()
const router = useRouter()

// ============ Search State ============
const searchInput = ref('')
const currentPage = ref(1)
const pageSize = 12

// Sync with store
watch(searchInput, (val) => {
  store.setSearch(val)
  currentPage.value = 1
})

// ============ Product Category Filter ============
const activeProduct = ref<ProductCategory>('all')

const onProductCategoryChange = (category: ProductCategory) => {
  activeProduct.value = category
  store.setProductCategory(category)
  currentPage.value = 1
}

// ============ File Type Filter ============
const fileTypes = [
  { label: '全部类型', value: 'all' },
  { label: '文档', value: 'document', icon: 'Document' },
  { label: '图片', value: 'image', icon: 'Picture' },
  { label: 'PPT', value: 'ppt', icon: 'DataBoard' },
]

const activeFileType = ref('all')

const onFileTypeChange = (type: string) => {
  activeFileType.value = type
  store.setCategory(type)
  currentPage.value = 1
}

// Initialize
onMounted(() => {
  store.setSearch('')
  store.setCategory('all')
  store.setProductCategory('all')
})

// ============ Pagination ============
const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.filteredMaterials.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(store.filteredMaterials.length / pageSize))

// ============ Helpers ============
const formatNumber = (n: number): string => {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString()
}

const getFileTypeLabel = (type: string) => {
  return (fileTypeConfig as Record<string, { label: string }>)[type]?.label || type
}

const getFileTypeGradient = (type: string) => {
  return (fileTypeConfig as Record<string, { gradient: string }>)[type]?.gradient || 'from-slate-400 to-slate-600'
}

const getFileTypeBadge = (type: string) => {
  return (fileTypeConfig as Record<string, { badgeClass: string }>)[type]?.badgeClass || 'bg-slate-50 text-slate-600'
}

const getProductLabel = (key?: ProductCategory) => {
  if (!key) return ''
  return productCategories.find(c => c.key === key)?.label || ''
}

const getProductColor = (key?: ProductCategory) => {
  if (!key) return 'text-slate-500 bg-slate-50'
  const cat = productCategories.find(c => c.key === key)
  return cat ? `${cat.textColor} ${cat.bgLight}` : 'text-slate-500 bg-slate-50'
}
</script>

<template>
  <div>
    <!-- ═══════════ Hero + Search ═══════════ -->
    <section class="relative overflow-hidden bg-surface py-16 md:py-24 lg:py-28">
      <!-- Decorative background -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-[15%] -left-[8%] w-[55%] h-[55%] rounded-full bg-primary/[0.04] blur-[120px]"></div>
        <div class="absolute -bottom-[10%] -right-[5%] w-[45%] h-[45%] rounded-full bg-on-surface-variant/[0.03] blur-[100px]"></div>
        <div class="absolute top-[35%] left-[25%] w-[25%] h-[25%] rounded-full bg-primary-container/[0.08] blur-[80px]"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/8 text-primary rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-6">
          <el-icon :size="14"><Promotion /></el-icon>
          企业产品资料门户
        </div>

        <!-- Title -->
        <h1 class="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-background leading-[1.15] tracking-tight mb-4">
          信安产品资料
          <span class="bg-gradient-to-r from-primary to-[#3b82f6] bg-clip-text text-transparent">一站式检索</span>
        </h1>

        <p class="text-secondary text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
          搜索产品文档、技术白皮书、宣传PPT与设计素材。按产品线快速定位，高效获取所需资料。
        </p>

        <!-- Main Search Bar -->
        <div class="max-w-2xl mx-auto relative">
          <el-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary z-10" :size="20"><Search /></el-icon>
          <input
            v-model="searchInput"
            type="text"
            placeholder="搜索资料名称、描述、标签或产品线..."
            class="w-full pl-12 sm:pl-14 pr-[100px] sm:pr-36 py-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,52,94,0.08)] text-on-surface placeholder:text-secondary/40 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
          >
          <div class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              v-if="searchInput"
              @click="searchInput = ''"
              class="px-3 py-2 text-xs font-bold text-secondary hover:text-on-surface transition-colors"
            >
              清除
            </button>
            <button
              class="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97] transition-all whitespace-nowrap"
            >
              搜索
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="flex items-center justify-center gap-6 mt-8">
          <div class="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <el-icon :size="14" class="text-primary"><Box /></el-icon>
            <span>{{ store.totalCount }} 项资料</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-on-surface-variant/30"></div>
          <div class="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <el-icon :size="14" class="text-emerald-500"><Document /></el-icon>
            <span>{{ store.documentCount }} 文档</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-on-surface-variant/30"></div>
          <div class="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <el-icon :size="14" class="text-amber-500"><DataBoard /></el-icon>
            <span>{{ store.pptCount }} PPT</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-on-surface-variant/30"></div>
          <div class="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <el-icon :size="14" class="text-rose-500"><Picture /></el-icon>
            <span>{{ store.imageCount }} 图片</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Product Category Filter ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 pb-8">
      <div class="flex items-center gap-2 mb-4">
        <el-icon :size="14" class="text-primary"><Filter /></el-icon>
        <span class="text-xs font-bold uppercase tracking-[0.15em] text-primary">产品分类</span>
      </div>
      <div class="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar pb-2">
        <button
          v-for="cat in productCategories"
          :key="cat.key"
          @click="onProductCategoryChange(cat.key)"
          class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          :class="activeProduct === cat.key
            ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
            : 'bg-surface-container-low text-secondary hover:bg-surface-container-high hover:text-on-surface'"
        >
          <el-icon :size="14"><component :is="cat.icon" /></el-icon>
          <span>{{ cat.label }}</span>
          <span
            v-if="(store.productCategoryCounts[cat.key] ?? 0) > 0"
            class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
            :class="activeProduct === cat.key ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'"
          >
            {{ store.productCategoryCounts[cat.key] ?? 0 }}
          </span>
        </button>
      </div>
    </section>

    <!-- ═══════════ Content Area: File Type Filter + List ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 pb-20">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <!-- File Type Chips -->
        <div class="flex items-center gap-2">
          <button
            v-for="ft in fileTypes"
            :key="ft.value"
            @click="onFileTypeChange(ft.value)"
            class="shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
            :class="activeFileType === ft.value
              ? 'bg-surface-container-high text-on-surface ring-1 ring-outline-variant'
              : 'bg-transparent text-secondary hover:text-on-surface'"
          >
            <span class="flex items-center gap-1.5">
              <el-icon v-if="ft.icon" :size="12"><component :is="ft.icon" /></el-icon>
              {{ ft.label }}
            </span>
          </button>
        </div>

        <!-- Result Count -->
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">
          共 {{ store.filteredMaterials.length }} 项资源
          <span v-if="searchInput" class="normal-case text-secondary ml-1">· 搜索 "{{ searchInput }}"</span>
        </span>
      </div>

      <!-- Resource Cards Grid -->
      <div v-if="paginatedMaterials.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <router-link
          v-for="item in paginatedMaterials"
          :key="item.id"
          :to="`/portal/resources/${item.id}`"
          class="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,52,94,0.04)] hover:shadow-[0_12px_40px_rgba(0,52,94,0.1)] hover:-translate-y-1 transition-all duration-300"
        >
          <!-- Card Header with Type Visual -->
          <div :class="`h-36 bg-gradient-to-br ${getFileTypeGradient(item.type)} flex items-center justify-center relative overflow-hidden`">
            <div class="absolute inset-0 bg-black/5"></div>
            <!-- Decorative circle -->
            <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div class="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
            <el-icon :size="40" class="text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <component :is="(fileTypeConfig as Record<string, { icon: string }>)[item.type]?.icon || 'Document'" />
            </el-icon>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <!-- Product Category Tag -->
            <div class="mb-2">
              <span v-if="item.productCategory && item.productCategory !== 'all'" :class="`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${getProductColor(item.productCategory)}`">
                {{ getProductLabel(item.productCategory) }}
              </span>
              <span v-else class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-400 bg-slate-50">
                未分类
              </span>
            </div>

            <h3 class="font-bold text-on-surface text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ item.name }}</h3>
            <p class="text-xs text-secondary line-clamp-2 leading-relaxed mb-4">{{ item.description }}</p>

            <!-- Meta Row -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-on-surface-variant font-mono">{{ item.size }}</span>
              <span :class="`text-[10px] font-bold px-2 py-0.5 rounded-full ${getFileTypeBadge(item.type)}`">
                {{ getFileTypeLabel(item.type) }}
              </span>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-3">
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
        <el-icon :size="56" class="text-secondary/20 mb-5"><Search /></el-icon>
        <h3 class="font-headline text-xl font-bold text-on-surface mb-2">
          {{ searchInput ? '未找到匹配资料' : '暂无产品资料' }}
        </h3>
        <p class="text-secondary text-sm max-w-sm mx-auto">
          {{ searchInput
            ? '尝试修改搜索关键词、切换产品分类或文件类型'
            : '产品资料正在整理中，请稍后访问或联系管理员上传'
          }}
        </p>
        <div v-if="searchInput || activeProduct !== 'all' || activeFileType !== 'all'" class="mt-6 flex justify-center gap-3">
          <button
            v-if="searchInput"
            @click="searchInput = ''"
            class="px-4 py-2 text-xs font-bold text-primary hover:text-primary-dim transition-colors"
          >
            清除搜索
          </button>
          <button
            v-if="activeProduct !== 'all'"
            @click="onProductCategoryChange('all')"
            class="px-4 py-2 text-xs font-bold text-primary hover:text-primary-dim transition-colors"
          >
            重置产品分类
          </button>
          <button
            v-if="activeFileType !== 'all'"
            @click="onFileTypeChange('all')"
            class="px-4 py-2 text-xs font-bold text-primary hover:text-primary-dim transition-colors"
          >
            重置文件类型
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-12">
        <el-pagination
          v-model:current-page="currentPage"
          background
          layout="prev, pager, next"
          :total="store.filteredMaterials.length"
          :page-size="pageSize"
        />
      </div>
    </section>

    <!-- ═══════════ Knowledge Base Promo (开发中) ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 pb-20">
      <router-link
        to="/portal/knowledge"
        class="group block bg-gradient-to-r from-[#0d2d5e] to-[#1a4a8a] rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 left-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl"></div>
        </div>
        <!-- Coming Soon Badge -->
        <div class="absolute top-4 right-4 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
          开发中
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="max-w-xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-100 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <el-icon :size="12"><Opportunity /></el-icon>
              即将上线
            </div>
            <h2 class="font-headline text-xl md:text-2xl font-extrabold text-white tracking-tight mb-2">企业智能知识库</h2>
            <p class="text-blue-200/70 text-sm leading-relaxed">基于 LLM 驱动的知识管理系统——自动整理、交叉索引、自然语言检索。让企业智慧持续沉淀、高效流转。</p>
          </div>
          <div class="shrink-0 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold text-sm rounded-xl group-hover:bg-white/20 transition-colors">
            <el-icon :size="16"><Tools /></el-icon>
            了解详情
            <el-icon :size="14"><Right /></el-icon>
          </div>
        </div>
      </router-link>
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

/* Hide scrollbar for horizontal scrolling */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
