import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useBlackjackStore } from './blackjack'
import { Hand } from '@/models/hand'

export const useDealerStore = defineStore('dealer', () => {
  const hand: Ref<Hand> = ref(new Hand())
  const blackjackStore = useBlackjackStore()

  const myTurn = computed(() => blackjackStore.whosTurn === 'dealer')

  function resetHand() {
    hand.value = new Hand()
  }

  async function playTurn() {
    if (!myTurn.value || hand.value.cards.length === 0) return
    hand.value.cards.forEach((card) => (card.isFaceUp = true))

    let bestValue = hand.value.bestValue

    while (bestValue < 17) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      blackjackStore.drawCardTo(hand.value)
      bestValue = hand.value.bestValue
    }

    blackjackStore.advanceTurn()
  }

  return { hand, playTurn, resetHand }
})
