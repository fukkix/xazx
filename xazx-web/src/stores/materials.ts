import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============ 产品分类定义 ============

export type FileType = 'document' | 'image' | 'ppt'
export type ProductCategory = 'all' | 'waf' | 'dynamic-defense' | 'traffic-analysis' | 'situation-awareness' | 'api-module' | 'other'

export interface MaterialItem {
  id: number
  name: string
  type: FileType
  size: string
  description: string
  uploader: string
  uploadDate: string
  tags: string[]
  downloads: number
  dimensions?: string
  productCategory?: ProductCategory  // 产品分类（新增）
}

// 产品分类配置
export const productCategories = [
  { key: 'all' as ProductCategory, label: '全部产品', icon: 'Grid', color: 'from-slate-500 to-slate-700', bgLight: 'bg-slate-50', textColor: 'text-slate-600' },
  { key: 'waf' as ProductCategory, label: 'WAF / Web应用防火墙', icon: 'Shield', color: 'from-blue-500 to-blue-700', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
  { key: 'dynamic-defense' as ProductCategory, label: '动态防御', icon: 'Refresh', color: 'from-emerald-500 to-teal-700', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { key: 'traffic-analysis' as ProductCategory, label: '全流量分析', icon: 'DataLine', color: 'from-violet-500 to-purple-700', bgLight: 'bg-violet-50', textColor: 'text-violet-600' },
  { key: 'situation-awareness' as ProductCategory, label: '网站监测系统', icon: 'View', color: 'from-rose-500 to-red-700', bgLight: 'bg-rose-50', textColor: 'text-rose-600' },
  { key: 'api-module' as ProductCategory, label: 'API模块', icon: 'Reading', color: 'from-amber-500 to-orange-700', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
  { key: 'other' as ProductCategory, label: '其他安全产品', icon: 'MoreFilled', color: 'from-cyan-500 to-sky-700', bgLight: 'bg-cyan-50', textColor: 'text-cyan-600' },
]

// 文件类型配置
export const fileTypeConfig = {
  document: { label: '文档', icon: 'Document', badgeClass: 'bg-blue-50 text-blue-600', gradient: 'from-blue-400 to-blue-600' },
  image: { label: '图片素材', icon: 'Picture', badgeClass: 'bg-emerald-50 text-emerald-600', gradient: 'from-emerald-400 to-teal-600' },
  ppt: { label: '演示文稿', icon: 'DataBoard', badgeClass: 'bg-amber-50 text-amber-600', gradient: 'from-amber-400 to-orange-600' },
}

const mockMaterials: MaterialItem[] = [
  // 资料数据将由后端 API 提供，此处保留空数组作为初始状态
]

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref<MaterialItem[]>(mockMaterials)
  const searchKeyword = ref('')
  const activeCategory = ref<string>('all')
  const activeProductCategory = ref<ProductCategory>('all')

  const filteredMaterials = computed(() => {
    let result = materials.value

    // Filter by file type category
    if (activeCategory.value !== 'all') {
      result = result.filter(item => item.type === activeCategory.value)
    }

    // Filter by product category
    if (activeProductCategory.value !== 'all') {
      result = result.filter(item => item.productCategory === activeProductCategory.value)
    }

    // Filter by search keyword
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.trim().toLowerCase()
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    return result
  })

  const totalCount = computed(() => materials.value.length)
  const documentCount = computed(() => materials.value.filter(m => m.type === 'document').length)
  const imageCount = computed(() => materials.value.filter(m => m.type === 'image').length)
  const pptCount = computed(() => materials.value.filter(m => m.type === 'ppt').length)
  const totalDownloads = computed(() => materials.value.reduce((sum, m) => sum + m.downloads, 0))

  // 按产品分类统计
  const productCategoryCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    productCategories.forEach(cat => {
      counts[cat.key] = cat.key === 'all'
        ? materials.value.length
        : materials.value.filter(m => m.productCategory === cat.key).length
    })
    return counts
  })

  const getMaterialById = (id: number): MaterialItem | undefined => {
    return materials.value.find(m => m.id === id)
  }

  const getRelatedMaterials = (id: number, limit = 4): MaterialItem[] => {
    const current = getMaterialById(id)
    if (!current) return materials.value.slice(0, limit)
    return materials.value
      .filter(m => m.id !== id && m.type === current.type)
      .slice(0, limit)
  }

  const setCategory = (category: string) => {
    activeCategory.value = category
  }

  const setProductCategory = (category: ProductCategory) => {
    activeProductCategory.value = category
  }

  const setSearch = (keyword: string) => {
    searchKeyword.value = keyword
  }

  return {
    materials,
    searchKeyword,
    activeCategory,
    activeProductCategory,
    filteredMaterials,
    totalCount,
    documentCount,
    imageCount,
    pptCount,
    totalDownloads,
    productCategoryCounts,
    getMaterialById,
    getRelatedMaterials,
    setCategory,
    setProductCategory,
    setSearch
  }
})
