<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import { useDeckStore } from '@/stores/deck'
import { ref, computed } from 'vue'
import { X, Waypoints, Trophy, Handshake, Skull, Layers, TrendingUp, Info, GripHorizontal } from 'lucide-vue-next'
import AppButton from './AppButton.vue'

const isOpen = ref(false)
const statsStore = useStatsStore()
const deckStore = useDeckStore()

// Position
const x = ref(16)
const y = ref(16)

// Drag state
let dragging = false
let dragOffsetX = 0
let dragOffsetY = 0

function onDragStart(e: MouseEvent) {
  dragging = true
  dragOffsetX = e.clientX - x.value
  dragOffsetY = e.clientY - y.value
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  if (!dragging) return
  x.value = e.clientX - dragOffsetX
  y.value = e.clientY - dragOffsetY
}

function onDragEnd() {
  dragging = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

const rows = computed(() => [
  {
    label: 'Win',
    value: statsStore.playerWinRate,
    count: statsStore.playerWins,
    icon: Trophy,
    bar: 'bg-primary',
    text: 'text-primary',
  },
  {
    label: 'Push',
    value: statsStore.pushRate,
    count: statsStore.pushes,
    icon: Handshake,
    bar: 'bg-tertiary',
    text: 'text-tertiary',
  },
  {
    label: 'Loss',
    value: statsStore.dealerWinRate,
    count: statsStore.dealerWins,
    icon: Skull,
    bar: 'bg-secondary',
    text: 'text-secondary',
  },
])
</script>

<template>
  <!-- Trigger button -->
  <div class="absolute top-2 right-2">
    <AppButton label="Stats" :icon="Waypoints" @click="isOpen = true" />
  </div>

  <!-- Floating draggable panel -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="bg-dark-bg fixed z-50 w-80 rounded-2xl shadow-2xl select-none" :style="{ left: `${x}px`, top: `${y}px` }">
      <!-- Drag handle / header -->
      <div class="flex cursor-grab items-center justify-between rounded-t-2xl px-5 pt-5 pb-3 active:cursor-grabbing" @mousedown="onDragStart">
        <div class="flex items-center gap-2">
          <TrendingUp class="text-primary" :size="20" />
          <span class="text-lg font-bold tracking-wide">Session Stats</span>
        </div>
        <div class="flex items-center gap-1">
          <GripHorizontal class="text-text/30" :size="16" />
          <button class="text-text/50 hover:text-text cursor-pointer rounded-md p-1 transition-colors" @mousedown.stop @click="isOpen = false">
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 pb-6">
        <!-- Round count -->
        <div class="text-text/50 mb-4 flex items-center gap-1.5 text-sm">
          <Layers :size="14" />
          <span>{{ statsStore.totalRounds }} round{{ statsStore.totalRounds !== 1 ? 's' : '' }} played</span>
        </div>

        <!-- Win / Push / Loss rows -->
        <div class="space-y-3">
          <div v-for="row in rows" :key="row.label" class="flex flex-col gap-1">
            <div class="flex items-center justify-between text-sm font-medium">
              <div class="flex items-center gap-1.5">
                <component :is="row.icon" :class="row.text" :size="14" />
                <span>{{ row.label }}</span>
              </div>
              <div class="text-text/60 flex gap-2 text-xs">
                <span>{{ row.count }}</span>
                <span :class="row.text" class="font-semibold">{{ row.value }}%</span>
              </div>
            </div>
            <div class="bg-bg h-2 w-full overflow-hidden rounded-full">
              <div :class="row.bar" class="h-full rounded-full transition-all duration-500" :style="{ width: `${row.value}%` }" />
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="bg-text/10 my-5 h-px" />

        <!-- Deck info -->
        <div class="space-y-1.5 text-sm">
          <div class="text-text/50 mb-2 text-xs font-semibold tracking-widest uppercase">Deck</div>
          <div class="flex justify-between">
            <span class="text-text/60">Cards left in shoe</span>
            <span class="font-medium">{{ deckStore.cardsRemaining }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text/60">Deck Penetration</span>
            <span class="font-medium">{{ deckStore.currentPenetration }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text/60 flex items-center gap-1.5">
              High card concentration
              <span class="group relative cursor-default">
                <Info :size="14" class="text-text/40 hover:text-text/70 transition-colors" />
                <span
                  class="bg-bg pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-52 -translate-x-1/2 rounded-lg px-3 py-2 text-xs leading-snug opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                >
                  % of remaining cards worth 10 or more (10, J, Q, K, A).
                </span>
              </span>
            </span>
            <span class="font-medium">{{ deckStore.highCardPercentage }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text/60">Avg card value</span>
            <span class="font-medium">{{ deckStore.averageCardValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped></style>
