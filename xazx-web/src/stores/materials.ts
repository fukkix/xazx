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
  {
    id: 1,
    name: 'Q1 财务年度报告',
    type: 'document',
    size: '4.2 MB',
    description: '本报告涵盖2026年第一季度公司财务运营数据，包括收入、支出、利润率及各部门业绩分析。报告通过图表和叙述性文字，全面呈现企业财务健康状况和增长趋势。',
    uploader: '财务部 · 陈经理',
    uploadDate: '2026-04-01',
    tags: ['财务', '季度报告', '公开资料'],
    downloads: 1254
  },
  {
    id: 2,
    name: '企业文化宣传手册',
    type: 'document',
    size: '1.8 MB',
    description: '全面介绍公司企业文化、核心价值观、团队建设理念和员工发展路径。适用于新员工入职培训和对外宣传。',
    uploader: '人力资源部 · 王主任',
    uploadDate: '2026-03-28',
    tags: ['企业文化', '内部培训'],
    downloads: 876
  },
  {
    id: 3,
    name: '2026年度战略规划纲要',
    type: 'document',
    size: '3.5 MB',
    description: '本文件详细阐述了公司2026年度的战略方向、重点项目、市场拓展计划和预算分配方案。',
    uploader: '战略发展部 · 李总监',
    uploadDate: '2026-03-15',
    tags: ['战略规划', '年度计划'],
    downloads: 2103
  },
  {
    id: 4,
    name: '技术架构白皮书 v3.0',
    type: 'document',
    size: '6.7 MB',
    description: '深入解析公司核心产品的技术架构、微服务设计模式、数据治理策略和安全合规框架。',
    uploader: '技术架构组 · 赵工',
    uploadDate: '2026-03-10',
    tags: ['技术文档', '架构设计'],
    downloads: 567
  },
  {
    id: 5,
    name: '产品宣传主视觉 KV',
    type: 'image',
    size: '12.8 MB',
    description: '高分辨率产品主视觉图，适用于官方网站 Banner、线下展会海报及社交媒体推广。包含多种尺寸适配方案。',
    uploader: '设计中心 · 张设计师',
    uploadDate: '2026-04-02',
    tags: ['产品介绍', '营销素材'],
    downloads: 3421,
    dimensions: '8400 x 5600 px'
  },
  {
    id: 6,
    name: '年会集锦精选照片',
    type: 'image',
    size: '24.5 MB',
    description: '2025年度公司年会精选照片合集，包含团队合影、颁奖典礼及文艺表演等珍贵瞬间记录。',
    uploader: '品牌传播部 · 刘摄影',
    uploadDate: '2026-02-20',
    tags: ['企业文化', '活动记录'],
    downloads: 1987,
    dimensions: '6000 x 4000 px'
  },
  {
    id: 7,
    name: 'UI 设计规范图标集',
    type: 'image',
    size: '5.2 MB',
    description: '统一品牌视觉的图标资源合集，涵盖导航图标、功能图标和装饰图标。SVG 与 PNG 双格式，支持多倍率屏幕。',
    uploader: '设计中心 · 王 UI',
    uploadDate: '2026-03-22',
    tags: ['设计资源', 'UI 规范'],
    downloads: 742,
    dimensions: '1024 x 1024 px'
  },
  {
    id: 8,
    name: '办公环境全景展示',
    type: 'image',
    size: '18.3 MB',
    description: '公司总部办公环境 360° 全景照片，展现现代化协作空间、休闲区域和会议设施。',
    uploader: '行政部 · 周助理',
    uploadDate: '2026-03-05',
    tags: ['企业形象', '办公环境'],
    downloads: 456,
    dimensions: '12000 x 6000 px'
  },
  {
    id: 9,
    name: '品牌视觉识别手册',
    type: 'image',
    size: '8.9 MB',
    description: '企业品牌视觉识别系统完整指南，包括标志使用规范、色彩体系、字体规范和应用示例。',
    uploader: '品牌传播部 · 吴总监',
    uploadDate: '2026-01-18',
    tags: ['品牌指南', '设计资源'],
    downloads: 1345,
    dimensions: '3508 x 2480 px'
  },
  {
    id: 10,
    name: 'Q3 投资者路演方案',
    type: 'ppt',
    size: '25.1 MB',
    description: '面向投资机构的第三季度路演演示文稿，包含公司业绩亮点、市场份额分析、产品路线图和未来增长预期。',
    uploader: '投资者关系部 · 孙总',
    uploadDate: '2026-04-05',
    tags: ['投资者关系', '路演'],
    downloads: 890
  },
  {
    id: 11,
    name: '新人培训综合教程',
    type: 'ppt',
    size: '15.6 MB',
    description: '面向新入职员工的全面培训课件，涵盖公司制度、业务流程、工具使用和团队协作规范。',
    uploader: '人力资源部 · 王主任',
    uploadDate: '2026-04-06',
    tags: ['内部培训', '新人入职'],
    downloads: 2567
  },
  {
    id: 12,
    name: '产品功能演示 Demo',
    type: 'ppt',
    size: '32.4 MB',
    description: '核心产品功能点逐一演示，包含交互式原型截图、用户旅程映射和竞品对比分析。',
    uploader: '产品部 · 马 PM',
    uploadDate: '2026-03-25',
    tags: ['产品介绍', '功能演示'],
    downloads: 1678
  },
  {
    id: 13,
    name: '市场推广策略全案',
    type: 'ppt',
    size: '18.9 MB',
    description: '年度市场推广战略全案，涵盖品牌定位、渠道策略、内容营销计划和预算分配。',
    uploader: '市场部 · 黄经理',
    uploadDate: '2026-03-18',
    tags: ['市场营销', '策略方案'],
    downloads: 934
  },
  {
    id: 14,
    name: '供应链优化报告',
    type: 'document',
    size: '2.9 MB',
    description: '对当前供应链流程的全面审计报告，提出优化方案和数字化转型路径建议。',
    uploader: '运营部 · 钱主管',
    uploadDate: '2026-02-28',
    tags: ['运营管理', '供应链'],
    downloads: 321
  },
  {
    id: 15,
    name: '客户成功案例集',
    type: 'ppt',
    size: '21.7 MB',
    description: '精选10个标杆客户的成功案例，展示产品价值实现路径和客户 ROI 数据。',
    uploader: '客户成功部 · 郑经理',
    uploadDate: '2026-03-12',
    tags: ['客户案例', '产品介绍'],
    downloads: 1456
  },
  {
    id: 16,
    name: '数据安全合规指南',
    type: 'document',
    size: '1.4 MB',
    description: '企业数据安全管理制度和合规操作指南，涵盖数据分类、存储、传输和销毁等全生命周期管理。',
    uploader: '信息安全部 · 吴工',
    uploadDate: '2026-01-25',
    tags: ['安全合规', '制度规范'],
    downloads: 678
  }
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
