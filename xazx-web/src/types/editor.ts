/**
 * 结构化文档编辑器类型定义
 */

export type DocNodeType =
  | 'heading'
  | 'paragraph'
  | 'steps'
  | 'step-item'
  | 'table'
  | 'feature-matrix'
  | 'image'
  | 'callout'
  | 'path'

export interface TableCell {
  content: string
  rowspan?: number
  colspan?: number
  isMerged?: boolean
}

export interface FeatureMatrixItem {
  name: string
  description: string
  supports: Record<string, string>
}

export interface FeatureMatrixCategory {
  name: string
  items: FeatureMatrixItem[]
}

export interface DocNode {
  id: string
  type: DocNodeType
  level?: number
  content?: string
  children?: DocNode[]
  attrs?: Record<string, any>
  tags?: string[]
  links?: string[]
  permissions?: string[]
  // table specific
  cells?: TableCell[][]
  // feature-matrix specific
  versions?: string[]
  categories?: FeatureMatrixCategory[]
  // image specific
  alt?: string
  file?: File
  url?: string
}

export interface DocFragment {
  id: string
  name: string
  nodes: DocNode[]
}

export const DEFAULT_PATHS = [
  '【策略配置】>【站点配置】',
  '【策略配置】>【防护策略】',
  '【系统管理】>【用户管理】',
  '【系统管理】>【日志配置】',
  '【安全运营】>【告警中心】',
  '【安全运营】>【态势感知】',
  '【产品中心】>【WAF】',
  '【产品中心】>【动态防御】',
  '【产品中心】>【全流量分析】',
]

export const DEFAULT_TAGS = ['独享版', '旗舰版', 'Beta', 'V3.6.4', 'V3.6.5']
