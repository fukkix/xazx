<script setup lang="ts">
import { ref } from 'vue'
import {
  Monitor, Upload, DocumentChecked, UserFilled, Search, View, EditPen, Check, Warning, Lock
} from '@element-plus/icons-vue'

const activeSection = ref('overview')

const sections = [
  { key: 'overview', label: '平台概述', icon: Monitor },
  { key: 'portal', label: '前台浏览', icon: View },
  { key: 'material', label: '产品资料管理', icon: Upload },
  { key: 'wiki', label: '知识库编写', icon: EditPen },
  { key: 'audit', label: '审核流程', icon: Check },
  { key: 'account', label: '账号与权限', icon: UserFilled },
  { key: 'faq', label: '常见问题', icon: Warning },
]
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-baseline gap-3 mb-1">
        <h1 class="text-2xl font-bold text-on-surface">使用帮助</h1>
        <span class="geek-label">HELP_CENTER</span>
      </div>
      <p class="text-sm text-secondary">信安在线资料平台操作指南与使用说明</p>
    </div>

    <div class="flex gap-6">
      <!-- Left Sidebar -->
      <aside class="w-56 flex-shrink-0">
        <div class="geek-panel p-3 space-y-1 sticky top-4">
          <button
            v-for="s in sections"
            :key="s.key"
            class="w-full text-left px-3 py-2 text-xs font-medium transition-all flex items-center gap-2"
            :class="activeSection === s.key ? 'text-primary bg-primary/5 border-l-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-2 border-transparent'"
            @click="activeSection = s.key"
          >
            <el-icon :size="14"><component :is="s.icon" /></el-icon>
            {{ s.label }}
          </button>
        </div>
      </aside>

      <!-- Content -->
      <main class="flex-1 min-w-0">
        <!-- 平台概述 -->
        <div v-if="activeSection === 'overview'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">平台概述</h2>
            <p class="text-sm text-secondary leading-relaxed mb-4">
              信安在线资料平台是企业内部的产品资料与知识库管理系统，涵盖产品文档、宣传材料、技术白皮书、操作手册等资源的上传、管理与分发。
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-2 mb-2">
                  <el-icon :size="18" class="text-primary"><View /></el-icon>
                  <span class="font-bold text-sm">前台门户</span>
                </div>
                <p class="text-xs text-secondary">面向全员的产品资料展示与检索门户，支持按产品线快速定位。</p>
              </div>
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-2 mb-2">
                  <el-icon :size="18" class="text-primary"><UploadDocument /></el-icon>
                  <span class="font-bold text-sm">资料管理</span>
                </div>
                <p class="text-xs text-secondary">产品资料的分类上传、审核、预览与维护，支持多种文件格式。</p>
              </div>
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-2 mb-2">
                  <el-icon :size="18" class="text-primary"><EditPen /></el-icon>
                  <span class="font-bold text-sm">知识库</span>
                </div>
                <p class="text-xs text-secondary">结构化文档编辑器，支持 Word 导入、Markdown 导出与 Wiki 构建。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 前台浏览 -->
        <div v-if="activeSection === 'portal'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">前台浏览指南</h2>
            <div class="space-y-4">
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <span class="w-5 h-5 bg-primary text-on-primary text-xs flex items-center justify-center font-mono">1</span>
                  资料搜索
                </h3>
                <p class="text-xs text-secondary leading-relaxed">
                  在首页搜索框输入关键词，支持搜索资料名称、描述、标签或产品线。搜索结果会实时过滤展示。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <span class="w-5 h-5 bg-primary text-on-primary text-xs flex items-center justify-center font-mono">2</span>
                  按产品分类浏览
                </h3>
                <p class="text-xs text-secondary leading-relaxed">
                  点击产品分类标签（WAF、动态防御、全流量分析、网站监测系统、API模块、大模型安全等）可快速筛选对应产品线的资料。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <span class="w-5 h-5 bg-primary text-on-primary text-xs flex items-center justify-center font-mono">3</span>
                  资源下载
                </h3>
                <p class="text-xs text-secondary leading-relaxed">
                  在资料详情页或资料中心列表中，点击文件即可下载。支持文档、图片、PPT 等多种格式。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 产品资料管理 -->
        <div v-if="activeSection === 'material'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">产品资料管理</h2>
            <div class="space-y-4">
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <el-icon class="text-primary"><UploadDocument /></el-icon>
                  上传文件
                </h3>
                <p class="text-xs text-secondary leading-relaxed mb-2">
                  进入「产品资料管理」页面，点击「上传」按钮，按以下步骤操作：
                </p>
                <ul class="text-xs text-secondary space-y-1 list-disc list-inside">
                  <li>选择<strong>产品分类</strong>（如 WAF、API模块等）</li>
                  <li>选择<strong>文件分类</strong>（白皮书、操作手册、宣传PPT等）</li>
                  <li>填写<strong>文件标题</strong>和描述</li>
                  <li>拖拽或点击选择文件，支持 PDF、PPT、Word、图片等格式，单文件最大 50MB</li>
                  <li>点击「确认上传」提交</li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <el-icon class="text-primary"><EditPen /></el-icon>
                  手动编写资料
                </h3>
                <p class="text-xs text-secondary leading-relaxed">
                  点击「手动编写」按钮，进入结构化编辑器。编辑器支持标题、段落、表格、步骤、图片标注等富文本块，编写完成后以 Markdown 文件形式保存到产品资料库。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2 flex items-center gap-2">
                  <el-icon class="text-primary"><Search /></el-icon>
                  筛选与搜索
                </h3>
                <p class="text-xs text-secondary leading-relaxed">
                  文件列表支持按产品分类、文件分类筛选，也支持关键词搜索。可按文件大小、上传时间排序查看。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 知识库编写 -->
        <div v-if="activeSection === 'wiki'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">知识库编写</h2>
            <div class="space-y-4">
              <div>
                <h3 class="font-bold text-sm mb-2">结构化编辑器</h3>
                <p class="text-xs text-secondary leading-relaxed mb-2">
                  手动编写页面提供可视化结构化编辑器，支持以下文档块：
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="border border-outline p-2 text-xs text-secondary">标题层级（H1-H6）</div>
                  <div class="border border-outline p-2 text-xs text-secondary">普通段落</div>
                  <div class="border border-outline p-2 text-xs text-secondary">表格</div>
                  <div class="border border-outline p-2 text-xs text-secondary">步骤列表</div>
                  <div class="border border-outline p-2 text-xs text-secondary">图片与截图标注</div>
                  <div class="border border-outline p-2 text-xs text-secondary">引用标注（Callout）</div>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2">Word 导入</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  点击编辑器工具栏的「导入 Word」按钮，上传 .docx 文件，系统会自动解析文档结构并转换为可编辑的文档块。支持标题、段落、表格的自动识别。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2">导出功能</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  编辑器支持导出为 Markdown 或 HTML 格式，方便二次编辑或发布到其他平台。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2">自动保存草稿</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  编辑器默认开启自动保存，每 3 秒自动将当前内容保存到本地草稿。刷新页面或意外关闭后，重新进入编辑器可恢复上次编辑内容。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 审核流程 -->
        <div v-if="activeSection === 'audit'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">审核流程说明</h2>
            <div class="space-y-4">
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-3 mb-3">
                  <el-tag type="warning" size="small">待审核</el-tag>
                  <span class="text-xs text-secondary">资料上传员等低权限账号上传的文件</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  上传后文件状态为「待审核」，需要管理员或拥有「审核产品资料」权限的账号进行审核后才在前台展示。
                </p>
              </div>
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-3 mb-3">
                  <el-tag type="success" size="small">已通过</el-tag>
                  <span class="text-xs text-secondary">审核通过的文件</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  审核通过的文件会立即在前台门户展示，所有用户均可查看和下载。管理员上传的文件默认直接通过。
                </p>
              </div>
              <div class="border border-outline p-4 bg-surface-container-low">
                <div class="flex items-center gap-3 mb-3">
                  <el-tag type="danger" size="small">已拒绝</el-tag>
                  <span class="text-xs text-secondary">审核未通过的文件</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  不符合规范或内容有误的文件可被审核人员拒绝。被拒绝的文件不会在前台展示。
                </p>
              </div>
              <div class="mt-4">
                <h3 class="font-bold text-sm mb-2">审核操作入口</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  有审核权限的用户在「产品资料管理」页面的文件列表中，可对「待审核」状态的文件执行「通过」或「拒绝」操作。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号与权限 -->
        <div v-if="activeSection === 'account'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">账号与权限</h2>
            <div class="space-y-4">
              <div>
                <h3 class="font-bold text-sm mb-2">系统内置角色</h3>
                <table class="w-full text-xs border border-outline">
                  <thead class="bg-surface-container-high">
                    <tr>
                      <th class="p-2 text-left font-semibold">角色</th>
                      <th class="p-2 text-left font-semibold">权限范围</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-t border-outline">
                      <td class="p-2"><el-tag type="danger" size="small">系统超管</el-tag></td>
                      <td class="p-2 text-secondary">所有权限，包括角色管理</td>
                    </tr>
                    <tr class="border-t border-outline">
                      <td class="p-2"><el-tag type="warning" size="small">管理员</el-tag></td>
                      <td class="p-2 text-secondary">资料管理、审核、用户管理，不可管理角色</td>
                    </tr>
                    <tr class="border-t border-outline">
                      <td class="p-2"><el-tag type="info" size="small">资料上传员</el-tag></td>
                      <td class="p-2 text-secondary">查看资料、上传资料（需审核）、编辑知识库</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2">自定义角色</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  系统超管可在「账号及权限管理」→「角色权限」中创建自定义角色，从 13 项权限中灵活组合，满足特定岗位需求。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-2">默认账号</h3>
                <div class="font-mono text-xs text-secondary bg-surface-container-low p-3 border border-outline">
                  super / super123（系统超管）<br>
                  admin / admin123（管理员）
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常见问题 -->
        <div v-if="activeSection === 'faq'" class="space-y-4">
          <div class="geek-panel p-6">
            <h2 class="text-lg font-bold text-on-surface mb-4">常见问题</h2>
            <div class="space-y-4">
              <div class="border-b border-outline pb-3">
                <h3 class="font-bold text-sm mb-1">Q: 上传文件后为什么在前台看不到？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 如果您是资料上传员角色，上传的文件需要管理员审核通过后才能展示。请通知有审核权限的同事处理。
                </p>
              </div>
              <div class="border-b border-outline pb-3">
                <h3 class="font-bold text-sm mb-1">Q: 支持哪些文件格式？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 产品资料支持 PDF、PPT、Word（.doc/.docx）、图片（PNG/JPG）、ZIP 等格式。知识库编辑器支持 Word 导入和 Markdown 导出。
                </p>
              </div>
              <div class="border-b border-outline pb-3">
                <h3 class="font-bold text-sm mb-1">Q: 文件大小有限制吗？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 单文件最大 50MB。如需上传更大文件，请联系管理员。
                </p>
              </div>
              <div class="border-b border-outline pb-3">
                <h3 class="font-bold text-sm mb-1">Q: 编辑器里的草稿会保存多久？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 草稿保存在浏览器本地存储中，不会自动过期。但清除浏览器缓存会导致草稿丢失，建议及时提交。
                </p>
              </div>
              <div class="border-b border-outline pb-3">
                <h3 class="font-bold text-sm mb-1">Q: 如何修改自己的密码？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 请联系系统超管或管理员，在「账号及权限管理」中为您重置密码。
                </p>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-1">Q: 前台门户需要登录吗？</h3>
                <p class="text-xs text-secondary leading-relaxed">
                  A: 不需要。前台门户面向全员开放，无需登录即可浏览和下载已通过审核的产品资料。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
