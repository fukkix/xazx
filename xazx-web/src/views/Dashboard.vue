<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  {
    name: 'Annual_Report_2023.pdf',
    size: '4.2 MB',
    category: 'Documents',
    author: 'Sarah Jenkins',
    date: 'Oct 12, 2023',
    icon: 'Document'
  },
  {
    name: 'Hero_Header_v2.png',
    size: '12.8 MB',
    category: 'Images',
    author: 'David Chen',
    date: 'Oct 11, 2023',
    icon: 'Picture'
  },
  {
    name: 'Q3_Pitch_Deck.pptx',
    size: '25.1 MB',
    category: 'PPTs',
    author: 'Marcus Aurelius',
    date: 'Oct 09, 2023',
    icon: 'DataBoard'
  }
])
</script>

<template>
  <main class="max-w-7xl mx-auto">
    <!-- Header Section -->
    <header class="mb-12">
      <h1 class="text-3xl font-black text-on-background tracking-tight mb-2">企业管理控制台</h1>
      <p class="text-on-surface-variant max-w-2xl font-medium">集中管理平台核心资源、用户权限及数字资产分发。</p>
    </header>

    <!-- Statistics Bento Grid -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-surface-container-low rounded-xl p-8 transition-all hover:shadow-md border-l-4 border-primary">
        <div class="flex justify-between items-start mb-4">
          <span class="p-3 bg-primary-container text-primary rounded-xl">
            <el-icon :size="24"><Box /></el-icon>
          </span>
          <span class="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">+12.5%</span>
        </div>
        <h3 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest mb-1">资料总数量</h3>
        <div class="text-4xl font-black text-on-surface">24,892</div>
      </div>

      <div class="bg-surface-container-low rounded-xl p-8 transition-all hover:shadow-md border-l-4 border-tertiary">
        <div class="flex justify-between items-start mb-4">
          <span class="p-3 bg-tertiary-container text-tertiary rounded-xl">
            <el-icon :size="24"><Clock /></el-icon>
          </span>
          <span class="text-xs font-bold text-error px-2 py-1 bg-error/10 rounded-full">高优先级</span>
        </div>
        <h3 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest mb-1">待审核内容</h3>
        <div class="text-4xl font-black text-on-surface">156</div>
      </div>

      <div class="bg-primary text-on-primary rounded-xl p-8 transition-all shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <span class="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <el-icon :size="24"><UploadFilled /></el-icon>
            </span>
          </div>
          <h3 class="text-primary-fixed-dim font-bold text-sm uppercase tracking-widest mb-1">存储空间使用率</h3>
          <div class="text-4xl font-black mb-4">82.4%</div>
          <div class="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div class="bg-white h-full" style="width: 82.4%"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Resource Table Section (Element Plus Table combined with Tailwind) -->
    <section class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-6">
      <div class="border-b border-surface-container-high pb-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 class="text-xl font-bold text-on-surface">平台资源列表</h2>
        <div class="flex gap-3 w-full md:w-auto">
          <el-input placeholder="搜索资料名称..." clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" plain>
            <el-icon class="mr-1"><Filter /></el-icon> 筛选
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" row-class-name="hover:bg-surface-container-low transition-colors group cursor-pointer">
        <el-table-column label="资料名称" min-width="200">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-primary">
                <el-icon><component :is="scope.row.icon" /></el-icon>
              </div>
              <div>
                <div class="font-bold text-on-surface">{{ scope.row.name }}</div>
                <div class="text-xs text-on-surface-variant">{{ scope.row.size }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="所属分类">
          <template #default="scope">
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{{ scope.row.category === 'Documents' ? '文档' : (scope.row.category === 'Images' ? '图片' : 'PPT') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="上传者" />
        <el-table-column prop="date" label="上传日期" />
        <el-table-column label="操作" align="right" width="120">
          <template #default>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <el-button link type="primary"><el-icon><Edit /></el-icon></el-button>
              <el-button link type="danger"><el-icon><Delete /></el-icon></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-between items-center">
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">当前显示 3 条，共 2,410 条记录</span>
        <el-pagination background layout="prev, pager, next" :total="2410" :page-size="10" />
      </div>
    </section>
  </main>
</template>
