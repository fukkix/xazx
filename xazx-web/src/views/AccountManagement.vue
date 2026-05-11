<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, EditPen, Delete, Lock } from '@element-plus/icons-vue'
import { authApi, type Role, type User } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const activeTab = ref('users')

// ── 用户管理 ──
const users = ref<User[]>([])
const userDialogVisible = ref(false)
const userDialogTitle = ref('新建账号')
const userForm = ref<Partial<User> & { password?: string }>({ status: 1 })
const roles = ref<Role[]>([])

const loadUsers = async () => {
  try {
    users.value = await authApi.getUsers()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const loadRoles = async () => {
  try {
    roles.value = await authApi.getRoles()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const openUserDialog = (row?: User) => {
  if (row) {
    userDialogTitle.value = '编辑账号'
    userForm.value = { ...row, password: '' }
  } else {
    userDialogTitle.value = '新建账号'
    userForm.value = { status: 1, role_id: roles.value[0]?.id, password: '' }
  }
  userDialogVisible.value = true
}

const saveUser = async () => {
  try {
    if (userForm.value.id) {
      const data: any = { id: userForm.value.id }
      if (userForm.value.name) data.name = userForm.value.name
      if (userForm.value.email !== undefined) data.email = userForm.value.email
      if (userForm.value.role_id) data.role_id = userForm.value.role_id
      if (userForm.value.status !== undefined) data.status = userForm.value.status
      if (userForm.value.password) data.password = userForm.value.password
      await authApi.updateUser(data)
      ElMessage.success('账号更新成功')
    } else {
      await authApi.createUser({
        username: userForm.value.username || '',
        name: userForm.value.name || '',
        email: userForm.value.email || '',
        role_id: userForm.value.role_id || 0,
        password: userForm.value.password || '',
      })
      ElMessage.success('账号创建成功')
    }
    userDialogVisible.value = false
    loadUsers()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const disableUser = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确定禁用账号 ${row.name} 吗？`, '提示', { type: 'warning' })
    await authApi.deleteUser(row.id)
    ElMessage.success('账号已禁用')
    loadUsers()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

// ── 角色管理 ──
const allPermissions = [
  { key: 'product.view', label: '查看产品资料' },
  { key: 'product.upload', label: '上传产品资料' },
  { key: 'product.audit', label: '审核产品资料' },
  { key: 'product.delete', label: '删除产品资料' },
  { key: 'wiki.view', label: '查看知识库' },
  { key: 'wiki.edit', label: '编辑知识库' },
  { key: 'wiki.audit', label: '审核知识库' },
  { key: 'account.view', label: '查看账号列表' },
  { key: 'account.create', label: '创建账号' },
  { key: 'account.edit', label: '编辑账号' },
  { key: 'account.delete', label: '删除/禁用账号' },
  { key: 'role.manage', label: '管理角色权限' },
  { key: 'system.log', label: '查看系统日志' },
]

const roleDialogVisible = ref(false)
const roleDialogTitle = ref('新建角色')
const roleForm = ref<Partial<Role> & { permissions?: string[] }>({ permissions: [] })

const openRoleDialog = (row?: Role) => {
  if (row) {
    roleDialogTitle.value = '编辑角色'
    roleForm.value = { ...row, permissions: [...(row.permissions || [])] }
  } else {
    roleDialogTitle.value = '新建角色'
    roleForm.value = { permissions: [] }
  }
  roleDialogVisible.value = true
}

const saveRole = async () => {
  try {
    if (roleForm.value.id) {
      await authApi.updateRole({
        id: roleForm.value.id,
        label: roleForm.value.label,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions,
      })
      ElMessage.success('角色更新成功')
    } else {
      await authApi.createRole({
        name: roleForm.value.name,
        label: roleForm.value.label,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions,
      })
      ElMessage.success('角色创建成功')
    }
    roleDialogVisible.value = false
    loadRoles()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const deleteRole = async (row: Role) => {
  try {
    await ElMessageBox.confirm(`确定删除角色 ${row.label} 吗？`, '提示', { type: 'warning' })
    await authApi.deleteRole(row.id)
    ElMessage.success('角色已删除')
    loadRoles()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

const roleLabel = (name: string) => {
  const map: Record<string, string> = { super_admin: '系统超管', admin: '管理员', uploader: '资料上传员' }
  return map[name] || name
}

const statusLabel = (status: number) => status === 1 ? '启用' : '禁用'

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-baseline gap-3 mb-1">
          <h1 class="text-2xl font-bold text-on-surface">账号及权限管理</h1>
          <span class="geek-label">ACCESS_CONTROL</span>
        </div>
        <p class="text-sm text-secondary mt-1">管理平台账号、自定义角色与权限分配。</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 账号管理 -->
      <el-tab-pane label="账号管理" name="users">
        <div class="flex justify-end mb-4">
          <el-button v-if="auth.hasPermission('account.create')" type="primary" @click="openUserDialog()">
            <el-icon class="mr-1"><Plus /></el-icon> 新建账号
          </el-button>
        </div>
        <el-table :data="users" style="width: 100%"
          :header-cell-style="{background:'#f5f5f5',color:'#52525b',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}"
        >
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="username" label="账号" width="120" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="role_label" label="角色" width="120">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.role_name === 'super_admin' ? 'danger' : scope.row.role_name === 'admin' ? 'warning' : 'info'">
                {{ scope.row.role_label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <span :class="scope.row.status === 1 ? 'text-emerald-600 font-bold' : 'text-secondary'">{{ statusLabel(scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right" width="180">
            <template #default="scope">
              <el-button v-if="auth.hasPermission('account.edit')" link type="primary" @click="openUserDialog(scope.row)">
                <el-icon><EditPen /></el-icon> 编辑
              </el-button>
              <el-button v-if="auth.hasPermission('account.delete') && scope.row.status === 1" link type="danger" @click="disableUser(scope.row)">
                <el-icon><Delete /></el-icon> 禁用
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 角色权限 -->
      <el-tab-pane label="角色权限" name="roles">
        <div class="flex justify-end mb-4">
          <el-button v-if="auth.hasPermission('role.manage')" type="primary" @click="openRoleDialog()">
            <el-icon class="mr-1"><Plus /></el-icon> 新建角色
          </el-button>
        </div>
        <el-table :data="roles" style="width: 100%"
          :header-cell-style="{background:'#f5f5f5',color:'#52525b',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}"
        >
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="label" label="角色名称" />
          <el-table-column prop="name" label="标识" width="120">
            <template #default="scope">
              <span class="font-mono text-xs text-secondary">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column label="权限" min-width="200">
            <template #default="scope">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="p in (scope.row.permissions || []).slice(0, 4)" :key="p" size="small" type="info" class="text-[10px]">
                  {{ allPermissions.find(ap => ap.key === p)?.label || p }}
                </el-tag>
                <el-tag v-if="(scope.row.permissions || []).length > 4" size="small" type="info" class="text-[10px]">+{{ (scope.row.permissions || []).length - 4 }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right" width="150">
            <template #default="scope">
              <el-button v-if="auth.hasPermission('role.manage')" link type="primary" @click="openRoleDialog(scope.row)">
                <el-icon><EditPen /></el-icon> 编辑
              </el-button>
              <el-button v-if="auth.hasPermission('role.manage') && !scope.row.is_system" link type="danger" @click="deleteRole(scope.row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 账号弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="userDialogTitle" width="520px">
      <el-form label-position="top">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="登录账号">
            <el-input v-model="userForm.username" :disabled="!!userForm.id" placeholder="如: zhangsan" />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="userForm.name" placeholder="如: 张三" />
          </el-form-item>
        </div>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="name@xazx.com" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="角色">
            <el-select v-model="userForm.role_id" class="w-full">
              <el-option v-for="r in roles" :key="r.id" :label="r.label" :value="r.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="userForm.status" class="w-full">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item :label="userForm.id ? '重置密码（留空则不修改）' : '初始密码'">
          <el-input v-model="userForm.password" type="password" show-password :placeholder="userForm.id ? '留空表示不修改' : '默认: xazx123456'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 角色弹窗 -->
    <el-dialog v-model="roleDialogVisible" :title="roleDialogTitle" width="600px">
      <el-form label-position="top">
        <el-form-item label="角色标识" v-if="!roleForm.id">
          <el-input v-model="roleForm.name" placeholder="只能包含小写字母、数字和下划线，如: custom_editor" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.label" placeholder="如: 自定义编辑员" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="2" placeholder="角色的职责描述" />
        </el-form-item>
        <el-form-item label="权限配置">
          <div class="border border-outline p-4 bg-surface-container-low">
            <el-checkbox-group v-model="roleForm.permissions">
              <div class="grid grid-cols-2 gap-2">
                <el-checkbox v-for="p in allPermissions" :key="p.key" :label="p.key">{{ p.label }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
