<template>
  <NavMenu />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import NavMenu from './components/NavMenu.vue'
import { RouterView } from 'vue-router'
</script>
