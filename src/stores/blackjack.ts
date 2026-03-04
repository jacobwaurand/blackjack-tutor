import { computed, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from '../models/card'
import { useDeckStore } from './deck'
import { useDealerStore } from './dealer'
import { usePlayerStore } from './player'
import { Hand } from '@/models/hand'
import { useStatsStore } from './stats'

export const useBlackjackStore = defineStore('blackjack', () => {
  // global turn tracker
  const whosTurn: Ref<'player' | 'dealer' | 'split' | null> = ref('player')
  const gameState: Ref<'betting' | 'insurance' | 'inProgress' | 'roundOver'> = ref('betting')

  const deckStore = useDeckStore()
  const dealerStore = useDealerStore()
  const playerStore = usePlayerStore()
  const statsStore = useStatsStore()

  const shouldOfferInsurance = computed(() => {
    return (
      whosTurn.value === 'player' &&
      gameState.value === 'inProgress' &&
      dealerStore.hand.cards.length === 2 &&
      dealerStore.hand.cards.filter((c) => c.isFaceUp).map((c) => c.rank.text)[0] === 'A'
    )
  })

  function startRound() {
    if (deckStore.isPenetrationReached) {
      deckStore.initialize()
      deckStore.shuffle()
    }
    playerStore.confirmBet()
    gameState.value = 'inProgress'
    dealerStore.resetHand()
    playerStore.resetHands()
    deal()
    whosTurn.value = 'player'
  }

  function deal() {
    drawCardTo(playerStore.hand)
    drawCardTo(dealerStore.hand, false) // dealer's first card face down
    drawCardTo(playerStore.hand)
    drawCardTo(dealerStore.hand)

    if (dealerStore.hand.cards[1]?.rank?.text === 'A') {
      gameState.value = 'insurance'
    }

    // Check for player blackjack right after initial deal
    if (isBlackjack(playerStore.hand.cards)) {
      whosTurn.value = 'dealer'
      dealerStore.playTurn()
    }
  }

  function drawCardTo(hand: Hand, isFaceUp: boolean = true) {
    hand.cards.push(deckStore.drawCard(isFaceUp))
  }

  function advanceTurn() {
    if (whosTurn.value === 'dealer') {
      whosTurn.value = null
      gameState.value = 'roundOver'
      determineWinner()
    }

    if (whosTurn.value === 'split') {
      if (playerStore.didSplitBust && playerStore.didPlayerBust) {
        whosTurn.value = null
        gameState.value = 'roundOver'
        determineWinner()
      } else {
        whosTurn.value = 'dealer'
        dealerStore.playTurn()
      }
    }

    if (whosTurn.value === 'player') {
      const hasSplitHand = playerStore.splitHand.cards.length > 0
      if (hasSplitHand) {
        whosTurn.value = 'split'
      } else if (playerStore.didPlayerBust) {
        whosTurn.value = null
        gameState.value = 'roundOver'
        determineWinner()
      } else {
        whosTurn.value = 'dealer'
        dealerStore.playTurn()
      }
    }
  }

  function determineWinner(players: Array<ReturnType<typeof usePlayerStore>> = [playerStore]) {
    const dealerBest = getBestValue(dealerStore.hand.values)

    // helper used for both main and split hands
    const evaluate = (hand: Hand, betAmount: number, playerHasSplit: boolean): number /* payout amount */ => {
      const best = getBestValue(hand.values)
      const blackjack = isBlackjack(hand.cards)

      // bust
      if (best === 0) {
        hand.result = 'lose'
        statsStore.recordDealerWin()
        return 0
      }

      // push
      if (dealerBest !== 0 && best === dealerBest) {
        hand.result = 'push'
        statsStore.recordPush()
        return betAmount // return original stake
      }

      // player wins
      if (dealerBest === 0 || best > dealerBest) {
        hand.result = 'win'
        statsStore.recordPlayerWin()
        const multiplier = blackjack && !playerHasSplit ? 2.5 : 2
        return betAmount * multiplier
      }

      hand.result = 'lose'
      statsStore.recordDealerWin()
      return 0
    }

    for (const p of players) {
      let totalPayout = 0
      const playerHasSplit = p.splitHand.cards.length > 0
      // main hand
      totalPayout += evaluate(p.hand, p.handBet, playerHasSplit)
      // split hand (if any)
      if (playerHasSplit) {
        totalPayout += evaluate(p.splitHand, p.splitBet, playerHasSplit)
      }
      if (p.insuranceBet > 0) {
        // handle insurance payout
        if (isBlackjack(dealerStore.hand.cards)) {
          p.receiveWinnings(p.insuranceBet * 2)
        }
      }
      if (totalPayout > 0) {
        p.receiveWinnings(totalPayout)
      }
    }
  }

  function getBestValue(totals: number[]): number {
    const valid = totals.filter((v) => v <= 21)
    if (valid.length === 0) return 0
    return Math.max(...valid)
  }

  function isBlackjack(hand: Card[]): boolean {
    if (hand.length !== 2) return false
    const [a, b] = hand
    if (!a || !b) return false
    const isAce = (c: Card) => c.rank.text === 'A'
    const isTenValue = (c: Card) => c.rank.values.includes(10)
    return (isAce(a) && isTenValue(b)) || (isAce(b) && isTenValue(a))
  }

  return {
    gameState,
    whosTurn,
    startRound,
    drawCardTo,
    advanceTurn,
    determineWinner,
    shouldOfferInsurance,
  }
})
