# 技术实施说明书：从静态设计到 Vue 框架转换指南

## 1. 核心转换策略：组件化驱动
Vue 的核心优势在于组件化。本平台（资料管理平台）的静态 HTML 应按以下逻辑拆分：

### 基础组件 (Atomic Components)
- **BaseButton**: 统一处理主色调、悬浮状态和加载中 (loading) 状态。
- **BaseInput**: 封装输入框样式、图标预留及表单校验逻辑。
- **FileIcon**: 根据文件后缀名（.pdf, .jpg, .ppt）自动切换图标颜色的微组件。

### 模块组件 (Molecules)
- **TopNavBar**: 包含搜索逻辑、通知推送及用户个人中心。
- **ResourceCard**: 首页和详情页通用的资料卡片，需预留 `props` 传入标题、封面图及下载次数。
- **SideMenu**: 侧边导航，需配合 `vue-router` 实现 `active-class` 自动高亮。

---

## 2. 数据与交互预留 (Pre-Vue Hooks)

### A. 登录页逻辑 (Login.vue)
- **预留点**：将 "Sign In" 按钮绑定 `v-on:click` 事件。
- **状态管理**：预留 `isLoading` 变量，在请求接口时切换按钮为禁用/加载状态。
- **错误处理**：预留一个 `v-if` 显示的错误提示框。

### B. 资料展示页 (Dashboard.vue)
- **数据渲染**：使用 `v-for="(item, index) in resourceList"` 渲染最近上传和热门资源。
- **过滤搜索**：搜索框绑定 `v-model="searchQuery"`，配合计算属性 `computed` 实现前端实时搜索或触发 API 节流请求。

### C. 详情页下载 (Details.vue)
- **动态路由**：路径应配置为 `/resource/:id`，通过 `$route.params.id` 获取对应资料。
- **下载触发**：下载按钮需绑定 `downloadResource(id)` 方法，调用后端二进制流接口。

---

## 3. 开发环境建议
- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite (极速热更新体验)
- **样式方案**：Tailwind CSS (当前设计已基于 Tailwind 类名，转换成本极低)
- **状态管理**：Pinia (更简洁的 Vuex 替代品)

## 4. 后台管理扩展
- 建议使用 **Element Plus** 或 **Ant Design Vue** 等成熟组件库来快速搭建后台的表格和表单，保持与前台 Azure Horizon II 风格一致即可。