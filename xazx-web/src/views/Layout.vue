<script setup lang="ts">
import TopNavBar from '../components/TopNavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'
</script>

<template>
  <div class="bg-background text-on-background min-h-screen flex">
    <SideNavBar />
    <div class="flex-1 flex flex-col min-h-screen">
      <TopNavBar />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
