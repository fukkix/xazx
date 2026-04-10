<script setup lang="ts">
// About Us page — public portal
</script>

<template>
  <div>
    <!-- ═══════════ Hero ═══════════ -->
    <section class="relative overflow-hidden bg-surface-container-low py-20 md:py-28">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-[15%] -left-[8%] w-[50%] h-[50%] rounded-full bg-primary/[0.04] blur-[120px]"></div>
        <div class="absolute bottom-[5%] right-[10%] w-[35%] h-[35%] rounded-full bg-tertiary/[0.03] blur-[80px]"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">About Us</span>
        <h1 class="font-headline text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-6 leading-[1.15]">
          让安全更智能
          <br>
          <span class="bg-gradient-to-r from-primary to-[#3b82f6] bg-clip-text text-transparent">让智能更安全</span>
        </h1>
        <p class="text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          我们致力于构建企业级资源管理解决方案，帮助组织高效管理产品文档、设计素材与宣发材料，释放团队创造力。
        </p>
      </div>
    </section>

    <!-- ═══════════ Mission & Values ═══════════ -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,52,94,0.04)]">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
            <el-icon :size="28" class="text-blue-600"><Aim /></el-icon>
          </div>
          <h3 class="font-headline text-lg font-extrabold text-on-surface mb-3">使命</h3>
          <p class="text-sm text-secondary leading-relaxed">
            以技术驱动企业资源数字化转型，打造安全、高效、极简的资产管理与分发平台。
          </p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,52,94,0.04)]">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
            <el-icon :size="28" class="text-emerald-600"><Star /></el-icon>
          </div>
          <h3 class="font-headline text-lg font-extrabold text-on-surface mb-3">愿景</h3>
          <p class="text-sm text-secondary leading-relaxed">
            成为企业信息管理领域最值得信赖的智能化平台，让知识流动不再受限。
          </p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,52,94,0.04)]">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <el-icon :size="28" class="text-amber-600"><Trophy /></el-icon>
          </div>
          <h3 class="font-headline text-lg font-extrabold text-on-surface mb-3">价值观</h3>
          <p class="text-sm text-secondary leading-relaxed">
            精设计、重安全、追效率。每一个界面交互都经过精心策展，确保极致的用户体验。
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════ Platform Capabilities ═══════════ -->
    <section class="bg-surface-container-low py-20">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">核心能力</span>
          <h2 class="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">平台技术亮点</h2>
        </div>

        <div class="space-y-5">
          <div v-for="(item, i) in [
            { icon: 'Lock', title: '角色鉴权体系', desc: '超管 / 管理员 / 普通用户三级权限模型，确保资源访问安全可控' },
            { icon: 'FolderOpened', title: '多类型资源管理', desc: '支持文档、图片、PPT 三大品类的上传、分类、检索与全生命周期管理' },
            { icon: 'Search', title: '智能检索引擎', desc: '跨品类关键词搜索 + 标签过滤，秒级定位目标资源' },
            { icon: 'Opportunity', title: 'LLM 知识库 (规划中)', desc: '基于大模型的企业知识图谱，支持自然语言查询和知识自动沉淀' },
            { icon: 'Monitor', title: '响应式双端架构', desc: '前台展示门户 + 后台管理系统双端独立部署，互不干扰' }
          ]" :key="i"
            class="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-5 shadow-[0_2px_10px_rgba(0,52,94,0.03)]"
          >
            <div class="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
              <el-icon :size="20" class="text-primary"><component :is="item.icon" /></el-icon>
            </div>
            <div>
              <h4 class="font-bold text-on-surface mb-1">{{ item.title }}</h4>
              <p class="text-sm text-secondary leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Contact CTA ═══════════ -->
    <section class="py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h2 class="font-headline text-2xl font-extrabold text-on-surface tracking-tight mb-4">联系我们</h2>
        <p class="text-secondary mb-8 max-w-md mx-auto">如需了解更多平台功能或洽谈企业合作，欢迎随时联系我们的团队。</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:contact@enterprise.com"
            class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all"
          >
            <el-icon><Message /></el-icon>
            发送邮件
          </a>
          <router-link
            to="/portal/resources"
            class="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all"
          >
            <el-icon><Box /></el-icon>
            浏览资料中心
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
