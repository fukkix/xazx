<script setup lang="ts">
import PublicNavBar from '../components/PublicNavBar.vue'
import PublicFooter from '../components/PublicFooter.vue'
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen flex flex-col">
    <PublicNavBar />
    <main class="flex-grow pt-16">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <PublicFooter />
  </div>
</template>

<style scoped>
.page-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
}
</style>
