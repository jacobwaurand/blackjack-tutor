<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CardHand from './components/CardHand.vue'
import { useBlackjackStore } from './stores/blackjack'
import { usePlayerStore } from './stores/player'
import { useDealerStore } from './stores/dealer'
import { useDeckStore } from './stores/deck'
import { useStatsStore } from './stores/stats'
import StatsModal from './components/StatsModal.vue'

const blackjackStore = useBlackjackStore()
const playerStore = usePlayerStore()
const dealerStore = useDealerStore()
const deckStore = useDeckStore()
const statsStore = useStatsStore()

onMounted(() => {
  deckStore.initialize()
  deckStore.shuffle()
})

const canPlay = computed(() => {
  return blackjackStore.gameState !== 'inProgress'
})

function startGame() {
  blackjackStore.startRound()
}

function hit() {
  playerStore.hit()
}

function stand() {
  playerStore.stand()
}

function split() {
  playerStore.split()
}

function double() {
  playerStore.double()
}
</script>

<template>
  <div class="flex h-screen w-3/5 flex-col content-center justify-center">
    <StatsModal />
    <div class="flex min-h-1/2 flex-row justify-between">
      <div class="bg-dark-bg flex h-full grow flex-col justify-between rounded-2xl py-[3vh]">
        <div class="flex justify-center">
          <CardHand :hand="dealerStore.hand" :active="true" />
        </div>
        <div class="flex justify-around">
          <div class="flex flex-col content-center">
            <CardHand :hand="playerStore.hand" :active="blackjackStore.whosTurn === 'player'" />
          </div>
          <CardHand v-if="playerStore.splitHand.cards.length" :hand="playerStore.splitHand" :active="blackjackStore.whosTurn === 'split'" />
        </div>
      </div>
      <div v-if="false" class="bg-dark-bg ml-2 flex h-full w-1/5 flex-col rounded-2xl p-3">
        <div class="text-center text-2xl">Stats</div>
        <div class="text-center">Average Card Value: {{ deckStore.averageCardValue }}</div>
        <div class="text-center">Median Card Value: {{ deckStore.medianCardValue }}</div>
      </div>
    </div>
    <div v-if="canPlay" class="flex content-center justify-center">
      <button v-if="canPlay" class="bg-primary text-bg m-2 w-28 rounded-sm p-1 font-semibold" type="button" @click="startGame()">Play</button>
    </div>
    <div v-else class="flex content-center justify-center">
      <button class="bg-primary text-bg m-2 w-28 rounded-sm p-1 font-semibold" type="button" @click="hit()">Hit</button>
      <button class="bg-primary text-bg m-2 w-28 rounded-sm p-1 font-semibold" type="button" @click="stand()">Stand</button>
      <button class="bg-primary text-bg m-2 w-28 rounded-sm p-1 font-semibold" type="button" @click="split()">Split</button>
      <button class="bg-primary text-bg m-2 w-28 rounded-sm p-1 font-semibold" type="button" @click="double()">Double</button>
    </div>
  </div>
</template>

<style scoped></style>
