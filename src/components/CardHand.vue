<script setup lang="ts">
import type { Hand } from '@/models/hand'
import { computed } from 'vue'
import DeckCard from './DeckCard.vue'

const props = defineProps<{
  hand: Hand
  active: boolean
}>()

const CARD_TOTAL_WIDTH = 108
const CARD_TOTAL_HEIGHT = 148
const CARD_OFFSET = 50

const containerWidth = computed(() => {
  const count = props.hand.cards.length
  if (count === 0) return '0px'
  return `${CARD_OFFSET * (count - 1) + CARD_TOTAL_WIDTH}px`
})
</script>

<template>
  <div class="relative" :style="{ width: containerWidth, height: `${CARD_TOTAL_HEIGHT}px` }">
    <div
      v-for="(card, index) in hand.cards"
      :key="`${card.rank.text}-${card.suit}-${index}`"
      class="absolute"
      :style="{ left: `${index * CARD_OFFSET}px`, zIndex: index }"
    >
      <DeckCard :card="card" :hand="hand" :active="active" />
    </div>
  </div>
</template>

<style scoped></style>
