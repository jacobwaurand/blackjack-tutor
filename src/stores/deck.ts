import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from '../models/card'
import type { Rank } from '../models/rank'

export const useDeckStore = defineStore('deck', () => {
  const deck: Ref<Card[]> = ref([])
  const numOfDecks = ref(8)
  const suits = ref(['heart', 'spade', 'diamond', 'club'])
  const ranks: Ref<Rank[]> = ref([
    { text: '2', values: [2] },
    { text: '3', values: [3] },
    { text: '4', values: [4] },
    { text: '5', values: [5] },
    { text: '6', values: [6] },
    { text: '7', values: [7] },
    { text: '8', values: [8] },
    { text: '9', values: [9] },
    { text: '10', values: [10] },
    { text: 'J', values: [10] },
    { text: 'Q', values: [10] },
    { text: 'K', values: [10] },
    { text: 'A', values: [1, 11] },
  ])
  const penetrationPercentage = 25

  const cardsRemaining = computed(() => deck.value.length)
  const currentPenetration = computed(() => Math.round(((numOfDecks.value * 52 - deck.value.length) / (numOfDecks.value * 52)) * 100))
  const isPenetrationReached = computed(() => currentPenetration.value >= penetrationPercentage)

  const averageCardValue = computed(() => {
    if (deck.value.length === 0) return 0
    const totalValue = deck.value.reduce((sum, card) => {
      return sum + (card.rank ? Math.max(...card.rank.values) : 0)
    }, 0)
    return Math.round((totalValue / deck.value.length) * 100) / 100
  })

  const medianCardValue = computed(() => {
    if (deck.value.length === 0) return 0
    const values = deck.value.map((card) => (card.rank ? Math.max(...card.rank.values) : 0)).sort((a, b) => a - b)
    const mid = Math.floor(values.length / 2)
    return values.length % 2 !== 0 ? values[mid] : ((values[mid - 1] ?? 0) + (values[mid] ?? 0)) / 2
  })

  const highCardPercentage = computed(() => {
    if (deck.value.length === 0) return 0
    const highCards = deck.value.filter((card) => card.rank && Math.max(...card.rank.values) >= 10).length
    return Math.round((highCards / deck.value.length) * 100)
  })

  function initialize() {
    deck.value = []
    for (let i = 0; i < numOfDecks.value; i++) {
      for (const suit of suits.value) {
        for (const rank of ranks.value) {
          deck.value.push({ suit, rank, isFaceUp: false })
        }
      }
    }
  }

  function shuffle() {
    let currentIndex = deck.value.length,
      temporaryValue,
      randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = deck.value[currentIndex]
      deck.value[currentIndex] = deck.value[randomIndex]!
      deck.value[randomIndex] = temporaryValue!
    }
  }

  function drawCard(isFaceUp: boolean = true): Card {
    if (deck.value.length === 0) {
      throw new Error('Deck is empty')
    }
    const card = deck.value.pop()!
    card.isFaceUp = isFaceUp
    return card
  }

  return {
    deck,
    initialize,
    shuffle,
    drawCard,
    currentPenetration,
    isPenetrationReached,
    cardsRemaining,
    averageCardValue,
    medianCardValue,
    highCardPercentage,
  }
})
