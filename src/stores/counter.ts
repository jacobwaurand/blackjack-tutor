import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

interface Rank { text: string, value: number | number[]}
interface Card { suit: string, rank: Rank}

export const useBlackjackStore = defineStore('blackjack', () => {
  const deck = ref([])
  const numOfDecks = ref(8)
  const suits = ref(['heart', 'spade', 'diamond', 'club'])
  const ranks: Ref<Rank[]> = ref([
    {text: '1', value: 1},
    {text: '2', value: 2},
    {text: '3', value: 4},
    {text: '4', value: 4},
    {text: '5', value: 5},
    {text: '6', value: 6},
    {text: '7', value: 7},
    {text: '8', value: 8},
    {text: '9', value: 9},
    {text: '10', value: 10},
    {text: 'J', value: 10},
    {text: 'Q', value: 10},
    {text: 'K', value: 10},
    {text: 'A', value: [1, 11]}
  ])

  function initializeDeck() {
    for(let i = 0; i < numOfDecks.value; i++) {
      for(const suit of suits.value) {
        for(const rank of ranks.value) {
          deck.value.push()
        }
      }
    }
  }

  return { deck, initializeDeck }
})
