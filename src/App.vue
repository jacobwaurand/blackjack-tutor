<script setup lang="ts">
import DeckCard from './components/DeckCard.vue'
</script>

<template>
  <div class="flex h-screen w-3/5 flex-col justify-center">
    <div class="bg-dark-bg flex min-h-1/2 flex-col justify-between rounded-2xl px-[3vw] py-[3vh]">
      <div class="flex justify-center"><DeckCard /><DeckCard /></div>
      <div class="flex justify-center"><DeckCard /><DeckCard /></div>
    </div>
  </div>
</template>

<style scoped></style>
