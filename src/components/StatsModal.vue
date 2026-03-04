<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import { computed, ref } from 'vue'

const isHidden = ref(true)
const statsStore = useStatsStore()
</script>

<template>
  <div v-if="!isHidden" class="bg-dark-bg absolute top-1 right-1 w-1/6 rounded-2xl p-3">
    <div>Win %: \r {{ statsStore.playerWinRate }}</div>
    <div>Push %: {{ statsStore.pushRate }}</div>
    <div>Loss %:{{ statsStore.dealerWinRate }}</div>
    <div class="absolute top-1 right-2 cursor-pointer rounded-sm p-1" @click="() => (isHidden = true)">X</div>
  </div>
  <button v-else class="bg-primary text-bg absolute top-1 right-1 m-2 w-28 rounded-sm p-1 font-semibold" @click="() => (isHidden = false)">
    Show Stats
  </button>
</template>

<style scoped></style>
