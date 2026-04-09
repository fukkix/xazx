<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { label: '首页', to: '/portal' },
  { label: '资料中心', to: '/portal/resources' },
  { label: '知识库', to: '/portal/knowledge' },
  { label: '关于我们', to: '/portal/about' }
]

const isActive = (path: string) => {
  if (path === '/portal') return route.path === '/portal'
  return route.path.startsWith(path) && path !== '#'
}
</script>

<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,52,94,0.06)] h-16 transition-all">
    <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
      <!-- Left: Brand -->
      <router-link to="/portal" class="flex items-center gap-3 group">
        <div class="w-9 h-9 bg-gradient-to-br from-primary to-primary-dim rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
          <el-icon :size="18" color="white"><Grid /></el-icon>
        </div>
        <span class="font-headline font-extrabold text-lg tracking-tight text-on-surface hidden sm:block">企业资料展示平台</span>
      </router-link>

      <!-- Center: Desktop Navigation Links -->
      <div class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="isActive(link.to)
            ? 'text-primary bg-primary/8'
            : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'"
        >
          {{ link.label }}
          <span
            v-if="isActive(link.to)"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full"
          ></span>
        </router-link>
      </div>

      <!-- Right: Admin Portal Button + Mobile Menu Toggle -->
      <div class="flex items-center gap-3">
        <router-link
          to="/login"
          class="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97] transition-all"
        >
          <el-icon :size="14"><Monitor /></el-icon>
          管理后台
        </router-link>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden p-2 text-secondary hover:text-on-surface transition-colors"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <el-icon :size="22">
            <component :is="isMobileMenuOpen ? 'Close' : 'Menu'" />
          </el-icon>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-16 inset-x-0 bg-white/95 backdrop-blur-xl shadow-xl border-t border-surface-container-high/30 p-4 space-y-1"
      >
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
          :class="isActive(link.to)
            ? 'text-primary bg-primary/8'
            : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'"
          @click="isMobileMenuOpen = false"
        >
          {{ link.label }}
        </router-link>
        <div class="pt-2 border-t border-surface-container-high/30 mt-2">
          <router-link
            to="/login"
            class="block w-full text-center px-4 py-3 bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-bold rounded-xl"
            @click="isMobileMenuOpen = false"
          >
            管理后台
          </router-link>
        </div>
      </div>
    </Transition>
  </nav>
</template>
