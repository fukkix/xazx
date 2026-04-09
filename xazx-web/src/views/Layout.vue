<script setup lang="ts">
import TopNavBar from '../components/TopNavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'
</script>

<template>
  <div class="bg-surface text-on-background min-h-screen">
    <TopNavBar />
    <SideNavBar />
    <div class="md:ml-64 pt-24 px-8 pb-12">
      <router-view />
    </div>
  </div>
</template>
