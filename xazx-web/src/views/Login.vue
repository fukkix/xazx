<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const identifier = ref('')
const password = ref('')
const hasError = ref(false)

const handleLogin = () => {
  if (identifier.value && password.value) {
    auth.login(identifier.value, password.value)
    router.push('/')
  } else {
    hasError.value = true
  }
}
</script>

<template>
  <div class="bg-background font-body text-on-surface min-h-screen flex flex-col relative overflow-hidden">
    <!-- Background: subtle grid -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none geek-grid-bg"></div>

    <!-- Main Content Area -->
    <main class="flex-grow flex items-center justify-center p-6 relative z-10 w-full h-full my-auto">
      <div class="w-full max-w-[1100px] grid md:grid-cols-2 geek-panel bg-surface overflow-hidden">
        <!-- Left Side: Visual/Branding -->
        <div class="hidden md:flex flex-col justify-between p-10 bg-surface-container-high border-r border-outline relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-10">
              <img src="@/assets/xazxpflogo.svg" class="h-8 object-contain" alt="Logo" />
              <span class="font-headline font-extrabold text-xl tracking-tight text-on-surface">信安在线资料平台</span>
            </div>

            <div class="space-y-5">
              <div class="flex items-baseline gap-2">
                <span class="geek-label">SYSTEM.ID</span>
                <span class="font-mono text-xs text-on-surface-variant">AUTH_GATEWAY_01</span>
              </div>
              <h1 class="font-headline text-3xl font-extrabold text-on-background leading-tight">
                全链路企业资料 <br/><span class="text-primary">云端枢纽</span>
              </h1>
              <p class="text-secondary text-base max-w-sm leading-relaxed">
                汇聚公司产品文档、设计素材与宣发PPT。安全、高效、极简。
              </p>
            </div>
          </div>

          <div class="relative z-10 space-y-2">
            <div class="geek-divider-dashed"></div>
            <div class="flex justify-between text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
              <span>SECURE CONNECTION</span>
              <span>TLS 1.3</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div class="mb-8">
            <div class="flex items-baseline gap-2 mb-2">
              <h2 class="font-headline text-xl font-bold text-on-surface">欢迎回来</h2>
              <span class="geek-label">AUTH_REQUIRED</span>
            </div>
            <p class="text-secondary text-sm">请输入您的工作凭证登录资料中心。</p>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <!-- Error Alert -->
            <div v-if="hasError" class="p-3 border border-error bg-error-container/30 flex items-center gap-3">
              <el-icon class="text-error text-lg"><WarningFilled /></el-icon>
              <div class="flex-grow">
                <p class="text-xs font-semibold text-error">凭证无效，请检查您的账号和密码。</p>
              </div>
            </div>

            <!-- Employee ID / Email -->
            <div class="space-y-2">
              <label for="identifier" class="flex items-center gap-1 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                <el-icon class="text-base"><User /></el-icon>账号
              </label>
              <div class="relative group mt-1">
                <input
                  type="text"
                  id="identifier"
                  v-model="identifier"
                  placeholder="如: super 或 admin"
                  class="w-full pl-2 py-3 bg-transparent border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/50 font-medium transition-all font-mono"
                >
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label for="password" class="flex items-center gap-1 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  <el-icon class="text-base"><Lock /></el-icon>登录密码
                </label>
                <a href="#" v-if="false" class="text-xs font-semibold text-primary hover:text-primary-dim transition-colors">忘记密码？</a>
              </div>
              <div class="relative group mt-1">
                <input
                  type="password"
                  id="password"
                  v-model="password"
                  placeholder="••••••••"
                  class="w-full pl-2 py-3 bg-transparent border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/50 font-medium transition-all font-mono"
                >
              </div>
            </div>

            <!-- Sign In Button -->
            <button type="submit" class="w-full bg-on-surface text-on-primary font-bold py-3 hover:bg-on-surface-variant active:opacity-90 transition-all flex items-center justify-center gap-2 mt-2">
              登录系统
              <el-icon class="text-lg"><Right /></el-icon>
            </button>
          </form>

          <div class="mt-10 pt-6 border-t border-outline text-center">
            <p class="text-xs text-secondary">仅限授权人员访问。为了合规和安全，系统将记录所有访问日志。</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
