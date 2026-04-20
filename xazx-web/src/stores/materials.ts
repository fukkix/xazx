import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MaterialItem {
  id: number
  name: string
  type: 'document' | 'image' | 'ppt'
  size: string
  description: string
  uploader: string
  uploadDate: string
  tags: string[]
  downloads: number
  dimensions?: string
}

const mockMaterials: MaterialItem[] = [
  // 资料数据将由后端 API 提供，此处保留空数组作为初始状态
]

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref<MaterialItem[]>(mockMaterials)
  const searchKeyword = ref('')
  const activeCategory = ref<string>('all')

  const filteredMaterials = computed(() => {
    let result = materials.value

    // Filter by category
    if (activeCategory.value !== 'all') {
      result = result.filter(item => item.type === activeCategory.value)
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

  const setSearch = (keyword: string) => {
    searchKeyword.value = keyword
  }

  return {
    materials,
    searchKeyword,
    activeCategory,
    filteredMaterials,
    totalCount,
    documentCount,
    imageCount,
    pptCount,
    totalDownloads,
    getMaterialById,
    getRelatedMaterials,
    setCategory,
    setSearch
  }
})
