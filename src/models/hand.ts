import type { Card } from './card'

export class Hand {
  cards: Card[] = []
  result: 'win' | 'lose' | 'push' | null = null

  /** All possible totals for the current cards (e.g. [6, 16] for A+5). */
  get values(): number[] {
    let totals: number[] = [0]
    for (const card of this.cards) {
      const newTotals: number[] = []
      for (const t of totals) {
        for (const v of card.rank.values) {
          newTotals.push(t + v)
        }
      }
      totals = [...new Set(newTotals)]
    }
    return totals.sort((a, b) => a - b)
  }

  /**
   * The highest total that does not exceed 21.
   * Returns the lowest bust total if all totals are over 21 (mirrors getBestHandValue behaviour).
   */
  get bestValue(): number {
    const valid = this.values.filter((t) => t <= 21)
    if (valid.length === 0) return Math.min(...this.values)
    return Math.max(...valid)
  }

  get isBust(): boolean {
    return this.values.every((t) => t > 21)
  }

  /** True when an Ace is counted as 11 (multiple valid totals below 21). */
  get isSoft(): boolean {
    const valid = this.values.filter((t) => t <= 21)
    return valid.length > 1 && this.bestValue < 21
  }
}
