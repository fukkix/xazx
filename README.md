# XAZX 企业资料展示平台

基于 Vue 3 + Vite + Element Plus + Tailwind CSS 构建的企业级资源管理与展示系统。

## 功能概览

| 模块 | 说明 |
|------|------|
| 🔐 登录系统 | 角色鉴权（超管 / 管理员 / 普通用户） |
| 📊 管理后台 | 仪表盘、账号管理、产品资料管理 |
| 🌐 前台门户 | 首页展示、资料中心检索、资源详情与下载 |
| 🧠 知识库 | 企业知识管理（规划中） |

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite 8
- **UI**: Element Plus + Tailwind CSS 4
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **语言**: TypeScript

## 快速启动

```bash
cd xazx-web
npm install
npm run dev
```

访问 http://localhost:5173（或自动分配的端口）

### 测试账号

| 账号 | 角色 | 密码 |
|------|------|------|
| `super` | 超级管理员 | 任意 |
| `admin` | 管理员 | 任意 |
| 其他任意 | 普通用户 | 任意 |

### 后端配置

前端通过 Vite 代理访问 PHP 后端：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost/xazx-admin',
      changeOrigin: true
    }
  }
}
```

确保 phpStudy 已启动 Apache + MySQL。

## 页面路由

| 路径 | 说明 |
|------|------|
| `/portal` | 前台首页 |
| `/portal/resources` | 资料中心 |
| `/portal/resources/:id` | 资源详情 |
| `/portal/knowledge` | 知识库 |
| `/login` | 登录页 |
| `/` | 管理后台控制台（需登录） |
| `/products` | 产品资料管理（需登录） |
| `/accounts` | 账号及权限管理（需登录） |
| `/knowledge` | 后台知识库（需登录） |

## 项目结构

```
xazx-web/
├── src/
│   ├── assets/              # 全局样式 & 设计系统
│   │   ├── main.css         # Tailwind 主题配置
│   │   └── geek-theme.css   # Element Plus 覆盖样式
│   ├── components/          # 公共组件
│   │   ├── TopNavBar.vue
│   │   ├── SideNavBar.vue
│   │   ├── PublicFooter.vue
│   │   ├── PublicNavBar.vue
│   │   ├── UnifiedUpload.vue
│   │   └── editor/          # 编辑器相关组件
│   ├── router/
│   │   └── index.ts
│   ├── stores/              # Pinia 状态管理
│   │   ├── auth.ts
│   │   ├── materials.ts
│   │   └── docEditor.ts
│   ├── services/            # API 服务层
│   │   └── knowledge.ts
│   ├── views/               # 页面视图
│   │   ├── Dashboard.vue
│   │   ├── ProductMaterial.vue   # 产品资料管理
│   │   ├── AccountManagement.vue
│   │   ├── AdminKnowledge.vue
│   │   ├── Login.vue
│   │   ├── Layout.vue
│   │   └── portal/          # 前台展示页面
│   └── types/               # TypeScript 类型定义
├── dist/                    # 构建产物
└── package.json
```

## 构建部署

```bash
# 生产构建
npm run build

# 代码检查
npm run lint
```

构建产物输出到 `dist/` 目录。

## License

Private — Internal use only.
