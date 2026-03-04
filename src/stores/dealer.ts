import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useBlackjackStore } from './blackjack'
import type { Hand } from '@/models/hand'

export const useDealerStore = defineStore('dealer', () => {
  const hand: Ref<Hand> = ref({ cards: [], result: null })
  const blackjackStore = useBlackjackStore()

  const myTurn = computed(() => blackjackStore.whosTurn === 'dealer')

  const dealerTotal: Ref<number[]> = computed(() => {
    return blackjackStore.calculateHandValues(hand.value.cards)
  })

  function resetHand() {
    hand.value = { cards: [], result: null }
  }

  async function playTurn() {
    if (!myTurn.value || hand.value.cards.length === 0) return
    hand.value.cards.forEach((card) => (card.isFaceUp = true))

    let bestValue = blackjackStore.getBestHandValue(hand.value.cards)

    while (bestValue < 17) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      blackjackStore.drawCardTo(hand.value)
      bestValue = blackjackStore.getBestHandValue(hand.value.cards)
    }

    blackjackStore.advanceTurn()
  }

  return { hand, dealerTotal, playTurn, resetHand }
})
