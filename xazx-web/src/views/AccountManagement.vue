<script setup lang="ts">
import { ref } from 'vue'

const users = ref([
  { id: 'E-admin', name: 'Monolith Admin', role: 'super_admin', email: 'admin@monolith.com', status: 'Active' },
  { id: 'E-123456', name: 'Sarah Jenkins', role: 'admin', email: 'sarah.j@monolith.com', status: 'Active' },
  { id: 'E-102938', name: 'David Chen', role: 'user', email: 'david.c@monolith.com', status: 'Inactive' }
])

const dialogVisible = ref(false)
const form = ref({ name: '', id: '', email: '', role: 'user' })

const handleAddAccount = () => {
  form.value = { name: '', id: '', email: '', role: 'user' }
  dialogVisible.value = true
}

const saveAccount = () => {
  users.value.push({ ...form.value, status: 'Active' })
  dialogVisible.value = false
}
</script>

<template>
  <main class="max-w-7xl mx-auto">
    <header class="mb-12 flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-on-background tracking-tight mb-2">企业账号管理</h1>
        <p class="text-on-surface-variant max-w-2xl font-medium">配置并管理平台访问凭证，把控企业资产流转安全。</p>
      </div>
      <el-button type="primary" size="large" @click="handleAddAccount">
        <el-icon class="mr-2"><Plus /></el-icon> 新建账号
      </el-button>
    </header>

    <section class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-6">
      <el-table :data="users" style="width: 100%" row-class-name="hover:bg-surface-container-low transition-colors">
        <el-table-column prop="id" label="员工工号" width="150" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="系统角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'super_admin' ? 'danger' : (scope.row.role === 'admin' ? 'warning' : 'info')">
              {{ scope.row.role === 'super_admin' ? '超级管理员' : (scope.row.role === 'admin' ? '管理员' : '普通用户') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="账号状态">
          <template #default="scope">
            <span :class="scope.row.status === 'Active' ? 'text-green-600 font-bold' : 'text-gray-400'">{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="150">
          <template #default>
            <el-button link type="primary">编辑</el-button>
            <el-button link type="danger">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- Account Modal -->
    <el-dialog v-model="dialogVisible" title="开设新的访问账号" width="500px">
      <el-form label-position="top">
        <el-form-item label="完整姓名">
          <el-input v-model="form.name" placeholder="例如: 张三" />
        </el-form-item>
        <el-form-item label="工号标识">
          <el-input v-model="form.id" placeholder="例如: E-998877" />
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="form.email" placeholder="name@monolith.com" />
        </el-form-item>
        <el-form-item label="权限级别">
          <el-select v-model="form.role" placeholder="请选择分配的角色" class="w-full">
            <el-option label="普通用户 (仅浏览和下载数据)" value="user" />
            <el-option label="管理员 (可进行资源分类及上传)" value="admin" />
            <el-option label="系统超管 (可管理全局与用户账号)" value="super_admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAccount">确认开通</el-button>
        </div>
      </template>
    </el-dialog>
  </main>
</template>
