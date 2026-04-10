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
  <div class="bg-surface font-body text-on-surface min-h-screen flex flex-col relative overflow-hidden">
    <!-- Background Decor (Azure Horizon Theme) -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-on-surface-variant/5 blur-[100px]"></div>
      <div class="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary-container/10 blur-[80px]"></div>
    </div>
    
    <!-- Main Content Area -->
    <main class="flex-grow flex items-center justify-center p-6 relative z-10 w-full h-full my-auto">
      <div class="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,52,94,0.08)]">
        <!-- Left Side: Visual/Branding -->
        <div class="hidden md:flex flex-col justify-between p-12 bg-surface-container-low border-r border-outline-variant/15 relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-12">
              <img src="@/assets/xazxpflogo.svg" class="h-10 object-contain" alt="Logo" />
              <span class="font-headline font-extrabold text-2xl tracking-tight text-on-surface">信安在线资料平台</span>
            </div>
            
            <div class="space-y-6">
              <h1 class="font-headline text-4xl font-extrabold text-on-background leading-tight">
                全链路企业资料 <br/><span class="text-primary">云端枢纽</span>
              </h1>
              <p class="text-secondary text-lg max-w-sm leading-relaxed">
                汇聚公司产品文档、设计素材与宣发PPT。安全、高效、极简。
              </p>
            </div>
          </div>
          

          <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="flex flex-col justify-center p-8 md:p-16 lg:p-20">
          <div class="mb-10">
            <h2 class="font-headline text-2xl font-bold text-on-surface mb-2">欢迎回来</h2>
            <p class="text-secondary text-sm">请输入您的工作凭证登录资料中心。</p>
          </div>
          
          <form class="space-y-6" @submit.prevent="handleLogin">
            <!-- Error Alert -->
            <div v-if="hasError" class="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
              <el-icon class="text-error text-lg"><WarningFilled /></el-icon>
              <div class="flex-grow">
                <p class="text-xs font-semibold text-error-container">凭证无效，请检查您的账号和密码。</p>
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
                  class="w-full pl-2 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/50 font-medium transition-all"
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
                  class="w-full pl-2 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/50 font-medium transition-all"
                >
              </div>
            </div>

            <!-- Sign In Button -->
            <button type="submit" class="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
              登录系统
              <el-icon class="text-lg"><Right /></el-icon>
            </button>
          </form>

          <div class="mt-12 pt-8 border-t border-outline-variant/10 text-center">
            <p class="text-xs text-secondary">仅限授权人员访问。为了合规和安全，系统将记录所有访问日志。</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
