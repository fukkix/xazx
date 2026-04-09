<script setup lang="ts">
import PublicNavBar from '../components/PublicNavBar.vue'
import PublicFooter from '../components/PublicFooter.vue'
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen flex flex-col">
    <PublicNavBar />
    <main class="flex-grow pt-16">
      <router-view />
    </main>
    <PublicFooter />
  </div>
</template>
