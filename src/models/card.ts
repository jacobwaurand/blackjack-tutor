import type { Rank } from './rank'
interface Card {
  suit: string
  rank: Rank
  isFaceUp: boolean
}

export type { Card }
