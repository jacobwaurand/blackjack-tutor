import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Hand } from '../models/hand'
import { useBlackjackStore } from './blackjack'
import { useDeckStore } from './deck'
import { useBankStore } from './bank'

export const usePlayerStore = defineStore('player', () => {
  const blackjackStore = useBlackjackStore()
  const deckStore = useDeckStore()
  const bankStore = useBankStore()

  const hand: Ref<Hand> = ref({ cards: [], result: null })
  const splitHand: Ref<Hand> = ref({ cards: [], result: null })

  // track wagers on each hand separately; totalBet is computed
  const betAmount: Ref<number> = ref(0)
  const handBet: Ref<number> = ref(0)
  const splitBet: Ref<number> = ref(0)

  const totalBet = computed(() => handBet.value + splitBet.value)

  const handTotal: Ref<number[]> = computed(() => {
    return blackjackStore.calculateHandValues(hand.value.cards)
  })

  const splitTotal: Ref<number[]> = computed(() => {
    return blackjackStore.calculateHandValues(splitHand.value.cards)
  })

  const didPlayerBust = computed(() => {
    return Math.min(...handTotal.value) > 21
  })

  const didSplitBust = computed(() => {
    return Math.min(...splitTotal.value) > 21
  })

  const canBet = computed(() => {
    return handBet.value >= 0 && handBet.value <= bankStore.bank
  })

  const canSplit = computed(() => {
    if (!canBet.value) return false
    if (hand.value.cards[0]?.rank.text && hand.value.cards[1]?.rank.text) {
      return hand.value.cards[0].rank.text === hand.value.cards[1].rank.text
    }
    return false
  })

  const canHitHand = computed(() => {
    if (hand.value.cards.length === 0) return false
    if (hand.value.cards[0]?.rank.text === 'A' && hand.value.cards.length === 2) return false // disallow hitting after splitting Aces
    return blackjackStore.whosTurn === 'player' && handTotal.value.some((t) => t < 21)
  })

  const canHitSplit = computed(() => {
    if (splitHand.value.cards.length === 0) return false
    if (splitHand.value.cards[0]?.rank.text === 'A' && splitHand.value.cards.length === 2) return false // disallow hitting after splitting Aces
    return blackjackStore.whosTurn === 'split' && splitTotal.value.some((t) => t < 21)
  })

  const myTurn = computed(() => blackjackStore.whosTurn === 'player' || blackjackStore.whosTurn === 'split')

  function hit() {
    if (blackjackStore.whosTurn === 'player' && !canHitHand.value) return
    if (blackjackStore.whosTurn === 'split' && !canHitSplit.value) return
    const handToHit = blackjackStore.whosTurn === 'player' ? hand : splitHand
    blackjackStore.drawCardTo(handToHit.value)
    if (blackjackStore.getBestHandValue(handToHit.value.cards) > 21) {
      blackjackStore.advanceTurn()
    }
  }

  function stand() {
    if (!myTurn.value) return
    blackjackStore.advanceTurn()
  }

  function split() {
    if (!canBet.value || !canSplit.value) return
    // move half wager to second hand and deduct same amount from bank
    splitBet.value = handBet.value
    bankStore.subtractMoney(splitBet.value)
    splitHand.value.cards.push(hand.value.cards.pop()!)
    hand.value.cards.push(deckStore.drawCard())
    splitHand.value.cards.push(deckStore.drawCard())
  }

  function double() {
    if (!myTurn.value || !canBet.value) return
    // determine which hand is being doubled and deduct additional wager
    if (blackjackStore.whosTurn === 'split') {
      bankStore.subtractMoney(splitBet.value)
      splitBet.value *= 2
    } else {
      bankStore.subtractMoney(handBet.value)
      handBet.value *= 2
    }
    hit()
    stand()
  }

  function resetHands() {
    hand.value = { cards: [], result: null }
    splitHand.value = { cards: [], result: null }
    handBet.value = 0
    splitBet.value = 0
  }

  function receiveWinnings(amount: number) {
    bankStore.addMoney(amount)
  }

  function setBetAmount(amount: number) {
    handBet.value = amount
  }

  return {
    hand,
    handTotal,
    splitHand,
    splitTotal,
    didPlayerBust,
    didSplitBust,
    handBet,
    splitBet,
    totalBet,
    canBet,
    canSplit,
    myTurn,
    hit,
    stand,
    split,
    double,
    resetHands,
    receiveWinnings,
    setBetAmount,
  }
})
