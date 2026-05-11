<script setup lang="ts">
import SideNavBar from '../components/SideNavBar.vue'
</script>

<template>
  <div class="bg-background text-on-background min-h-screen flex">
    <SideNavBar />
    <main class="flex-1 p-6 overflow-auto min-h-screen min-w-0">
      <router-view />
    </main>
  </div>
</template>
