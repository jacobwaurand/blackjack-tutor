import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { Hand } from '../models/hand'
import { useBlackjackStore } from './blackjack'
import { useDeckStore } from './deck'
import { useBankStore } from './bank'

export const usePlayerStore = defineStore('player', () => {
  const blackjackStore = useBlackjackStore()
  const deckStore = useDeckStore()
  const bankStore = useBankStore()

  const hand: Ref<Hand> = ref(new Hand())
  const splitHand: Ref<Hand> = ref(new Hand())

  // track wagers on each hand separately; totalBet is computed
  const handBet: Ref<number> = ref(0)
  const splitBet: Ref<number> = ref(0)
  /** The bet value the player explicitly selected — never mutated by double/split. */
  const savedBet: Ref<number> = ref(0)

  const totalBet = computed(() => handBet.value + splitBet.value)

  const handTotal: Ref<number[]> = computed(() => hand.value.values)

  const splitTotal: Ref<number[]> = computed(() => splitHand.value.values)

  const didPlayerBust = computed(() => {
    return Math.min(...handTotal.value) > 21
  })

  const didSplitBust = computed(() => {
    return Math.min(...splitTotal.value) > 21
  })

  const canBet = computed(() => {
    return handBet.value >= 0 && handBet.value <= bankStore.bank
  })

  const canDouble = computed(() => {
    if (!myTurn.value) return false
    const activebet = blackjackStore.whosTurn === 'split' ? splitBet.value : handBet.value
    return activebet <= bankStore.bank
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
    if (hand.value.cards[0]?.rank.text === 'A' && splitHand.value.cards.length === 2) return false // disallow hitting after splitting Aces
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
    if (handToHit.value.bestValue > 21) {
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
    if (!myTurn.value || !canDouble.value) return
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

  /** Add a chip amount to the pending wager (capped at bank balance). */
  function addToBet(amount: number) {
    const max = bankStore.bank
    handBet.value = Math.min(handBet.value + amount, max)
    savedBet.value += amount
  }

  /** Clear the pending wager without deducting from the bank. */
  function clearBet() {
    handBet.value = 0
    savedBet.value = 0
  }

  /** Deduct the pending wager from the bank — call this when round starts. */
  function confirmBet() {
    if (handBet.value <= 0) return
    bankStore.subtractMoney(savedBet.value)
  }

  function resetHands() {
    hand.value = new Hand()
    splitHand.value = new Hand()
    // Restore to what the player explicitly selected, not the doubled/split amount
    handBet.value = savedBet.value
    splitBet.value = 0
  }

  function receiveWinnings(amount: number) {
    bankStore.addMoney(amount)
  }

  function setBetAmount(amount: number) {
    handBet.value = amount
    savedBet.value = amount
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
    savedBet,
    totalBet,
    canBet,
    canDouble,
    canSplit,
    myTurn,
    hit,
    stand,
    split,
    double,
    addToBet,
    clearBet,
    confirmBet,
    resetHands,
    receiveWinnings,
    setBetAmount,
  }
})
