<script setup lang="ts">
import type { Card } from '@/models/card'
import type { Hand } from '@/models/hand'
import { computed } from 'vue'

const props = defineProps<{
  card: Card
  hand: Hand
  active: boolean
}>()

const rank = computed(() => {
  return props.card?.rank.text || 'A'
})

const colorClass = computed(() => {
  if (!props.card?.suit) return 'text-black'
  return props.card.suit === 'spade' || props.card.suit === 'club' ? 'text-black' : 'text-red-500'
})

const borderClass = computed(() => {
  if (!props.hand.result) return ''
  if (props.hand.result === 'win') return 'border-3 border-green-400'
  else if (props.hand.result === 'push') return 'border-3 border-orange-400'
  else return 'border-3 border-red-400'
})

const activeClass = computed(() => {
  return !props.active ? 'bg-gray-400' : 'bg-white'
})
</script>

<template>
  <div
    v-if="props.card.isFaceUp"
    :class="[colorClass, borderClass, activeClass]"
    class="m-1 flex h-35 w-25 flex-col justify-between rounded-md border border-gray-400 p-2"
  >
    <div class="font-semibold">{{ rank }}</div>
    <div class="flex flex-row justify-center text-4xl font-bold">{{ rank }}</div>
    <div class="flex flex-row justify-end font-semibold">{{ rank }}</div>
  </div>
  <div v-else class="card-back m-1 flex h-35 w-25 flex-col rounded-md border-2 border-white/70 p-1.5">
    <div class="card-back-inner h-full w-full rounded-sm border border-white/40" />
  </div>
</template>

<style scoped>
.card-back {
  background-color: #991b1b;
}
.card-back-inner {
  background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.07) 0px,
      rgba(255, 255, 255, 0.07) 1px,
      transparent 1px,
      transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.07) 0px,
      rgba(255, 255, 255, 0.07) 1px,
      transparent 1px,
      transparent 8px
    );
}
</style>
