import type { Card } from './card'
interface Hand {
  cards: Card[]
  result?: 'win' | 'lose' | 'push' | null
}

export type { Hand }
