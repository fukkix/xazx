# XAZX 企业资料展示平台

基于 Vue 3 + Vite + Element Plus + Tailwind CSS 构建的企业级资源管理与展示系统。

## 功能概览

| 模块 | 说明 |
|---|---|
| 🔐 登录系统 | 角色鉴权（超管 / 管理员 / 普通用户） |
| 📊 管理后台 | 仪表盘、账号管理、资料库管理（文档 / 图片 / PPT） |
| 🌐 前台门户 | 首页展示、资料中心检索、资源详情与下载 |
| 🧠 知识库 | LLM 驱动的企业知识管理系统（规划中） |

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

访问 http://localhost:5173

### 测试账号

| 账号 | 角色 | 密码 |
|---|---|---|
| `super` | 超级管理员 | 任意 |
| `admin` | 管理员 | 任意 |
| 其他任意 | 普通用户 | 任意 |

### 页面路由

| 路径 | 说明 |
|---|---|
| `/portal` | 前台首页 |
| `/portal/resources` | 资料中心 |
| `/portal/resources/:id` | 资源详情 |
| `/portal/knowledge` | 知识库（即将上线） |
| `/portal/about` | 关于我们 |
| `/login` | 登录页 |
| `/` | 管理后台（需登录） |
| `/knowledge` | 后台知识库入口（需登录） |

## 项目结构

```
xazxplatform/
├── demo/                  # 设计稿参考 (HTML + 截图 + 设计规范)
├── product-introduction/  # 产品介绍资料 & 知识库源文件
├── xazx-web/              # 主工程
│   └── src/
│       ├── assets/        # 全局样式 & 设计系统 (@theme)
│       ├── components/    # 公共组件 (NavBar, Footer, Upload)
│       ├── router/        # 路由配置
│       ├── stores/        # Pinia 状态管理
│       └── views/         # 页面视图
│           └── portal/    # 前台展示页面
└── README.md
```

## License

Private — Internal use only.
