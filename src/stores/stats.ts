import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useStatsStore = defineStore('stats', () => {
  const totalRounds: Ref<number> = ref(0)
  const playerWins: Ref<number> = ref(0)
  const dealerWins: Ref<number> = ref(0)
  const pushes: Ref<number> = ref(0)

  const playerWinRate = computed(() => (totalRounds.value > 0 ? Math.round((playerWins.value / totalRounds.value) * 100) : 0))
  const dealerWinRate = computed(() => (totalRounds.value > 0 ? Math.round((dealerWins.value / totalRounds.value) * 100) : 0))
  const pushRate = computed(() => (totalRounds.value > 0 ? Math.round((pushes.value / totalRounds.value) * 100) : 0))

  function recordPlayerWin() {
    playerWins.value++
    totalRounds.value++
  }

  function recordDealerWin() {
    dealerWins.value++
    totalRounds.value++
  }

  function recordPush() {
    pushes.value++
    totalRounds.value++
  }

  return {
    totalRounds,
    playerWins,
    dealerWins,
    pushes,
    playerWinRate,
    dealerWinRate,
    pushRate,
    recordPlayerWin,
    recordDealerWin,
    recordPush,
  }
})
