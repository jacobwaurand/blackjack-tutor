<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CardHand from './components/CardHand.vue'
import AppButton from './components/AppButton.vue'
import { useBlackjackStore } from './stores/blackjack'
import { usePlayerStore } from './stores/player'
import { useDealerStore } from './stores/dealer'
import { useDeckStore } from './stores/deck'
import { useBankStore } from './stores/bank'
import StatsModal from './components/StatsModal.vue'
import { Play, Plus, Hand, GitFork, ChevronsRight, Trash2 } from 'lucide-vue-next'

const blackjackStore = useBlackjackStore()
const playerStore = usePlayerStore()
const dealerStore = useDealerStore()
const deckStore = useDeckStore()
const bankStore = useBankStore()

const CHIPS = [5, 10, 25, 50, 100]

const canStartRound = computed(() => playerStore.handBet > 0 && playerStore.handBet <= bankStore.bank)

const resultText = computed(() => {
  if (blackjackStore.gameState !== 'roundOver') return null
  const result = playerStore.hand.result
  if (result === 'win') return 'You Win! 🎉'
  if (result === 'lose') return playerStore.didPlayerBust ? 'Bust! 💥' : 'Dealer Wins 😔'
  if (result === 'push') return 'Push 🤝'
  return null
})

const resultColor = computed(() => {
  if (playerStore.hand.result === 'win') return 'text-primary'
  if (playerStore.hand.result === 'lose') return 'text-secondary'
  return 'text-tertiary'
})

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
      <div
        class="relative flex h-full grow flex-col justify-between rounded-2xl py-[3vh]"
        style="background: radial-gradient(ellipse at 50% 40%, rgb(42, 48, 58) 0%, rgb(34, 39, 49) 75%)"
      >
        <!-- Dealer area -->
        <div class="flex flex-col items-center gap-2">
          <span class="text-text/40 text-xs font-semibold tracking-widest uppercase">Dealer</span>
          <CardHand :hand="dealerStore.hand" :active="true" />
        </div>

        <!-- Round result overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <div
            v-if="blackjackStore.gameState === 'roundOver' && resultText"
            class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/20"
          >
            <span :class="resultColor" class="rounded-2xl bg-black/70 p-2 text-5xl font-black tracking-wide drop-shadow-lg">{{ resultText }}</span>
          </div>
        </Transition>

        <!-- Player area -->
        <div class="flex flex-col items-center gap-2">
          <div class="flex w-full justify-around">
            <CardHand :hand="playerStore.hand" :active="blackjackStore.whosTurn === 'player'" />
            <CardHand v-if="playerStore.splitHand.cards.length" :hand="playerStore.splitHand" :active="blackjackStore.whosTurn === 'split'" />
          </div>
          <span class="text-text/40 text-xs font-semibold tracking-widest uppercase">Player</span>
        </div>
      </div>
      <div v-if="false" class="bg-dark-bg ml-2 flex h-full w-1/5 flex-col rounded-2xl p-3">
        <div class="text-center text-2xl">Stats</div>
        <div class="text-center">Average Card Value: {{ deckStore.averageCardValue }}</div>
        <div class="text-center">Median Card Value: {{ deckStore.medianCardValue }}</div>
      </div>
    </div>
    <div v-if="canPlay" class="flex flex-col items-center gap-2 pt-2">
      <!-- Chip selector -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="chip in CHIPS"
          :key="chip"
          :disabled="chip > bankStore.bank"
          class="border-primary/60 bg-primary/10 text-primary hover:bg-primary/25 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold shadow transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          @click="playerStore.addToBet(chip)"
        >
          ${{ chip }}
        </button>
      </div>
      <!-- Bet summary + actions -->
      <div class="flex items-center gap-2">
        <span class="text-text/50 text-sm">
          Bet: <span class="text-primary font-bold">${{ playerStore.savedBet }}</span>
        </span>
        <button
          v-if="playerStore.handBet > 0"
          class="text-text/40 hover:text-secondary cursor-pointer transition-colors"
          title="Clear bet"
          @click="playerStore.clearBet()"
        >
          <Trash2 :size="15" />
        </button>
      </div>
      <AppButton label="Deal" :icon="Play" :disabled="!canStartRound" @click="startGame()" />
    </div>
    <div v-else class="flex content-center justify-center">
      <AppButton label="Hit" :icon="Plus" @click="hit()" />
      <AppButton label="Stand" :icon="Hand" variant="secondary" @click="stand()" />
      <AppButton label="Split" :icon="GitFork" variant="tertiary" @click="split()" :disabled="!playerStore.canSplit" />
      <AppButton label="Double" :icon="ChevronsRight" variant="secondary" @click="double()" :disabled="!playerStore.canDouble" />
    </div>
    <div class="mt-1 flex items-center justify-center gap-6 text-sm">
      <span class="text-text/50"
        >Balance: <span class="text-text font-semibold">${{ bankStore.bank }}</span></span
      >
      <span v-if="playerStore.totalBet > 0 && blackjackStore.gameState === 'inProgress'" class="text-text/50"
        >Bet this round: <span class="text-primary font-semibold">${{ playerStore.totalBet }}</span></span
      >
    </div>
  </div>
</template>

<style scoped></style>
