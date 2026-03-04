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

/** Totals computed from face-up cards only. */
const visibleTotals = computed(() => {
  let totals: number[] = [0]
  for (const card of props.hand.cards.filter((c) => c.isFaceUp)) {
    const next: number[] = []
    for (const t of totals)
      for (const v of card.rank.values)
        next.push(t + v)
    totals = [...new Set(next)]
  }
  return totals.sort((a, b) => a - b)
})

const visibleBest = computed(() => {
  const valid = visibleTotals.value.filter((t) => t <= 21)
  if (valid.length === 0) return Math.min(...visibleTotals.value)
  return Math.max(...valid)
})

const visibleIsBust = computed(() => visibleTotals.value.every((t) => t > 21))
const visibleIsSoft = computed(() => {
  const valid = visibleTotals.value.filter((t) => t <= 21)
  return valid.length > 1 && visibleBest.value < 21
})
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
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
    <div
      v-if="hand.cards.length > 0"
      class="min-w-12 rounded-full px-3 py-0.5 text-center text-sm font-bold"
      :class="visibleIsBust ? 'bg-secondary/20 text-secondary' : 'bg-bg/60 text-text'"
    >
      {{ visibleIsBust ? 'Bust' : visibleIsSoft ? `Soft ${visibleBest}` : visibleBest }}
    </div>
  </div>
</template>

<style scoped></style>
