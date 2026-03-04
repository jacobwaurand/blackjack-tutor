import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useBankStore = defineStore('bank', () => {
  const bank: Ref<number> = ref(100)

  function addMoney(amount: number) {
    bank.value += amount
  }

  function subtractMoney(amount: number) {
    if (amount > bank.value) {
      throw new Error('Not enough funds in bank')
    }
    bank.value -= amount
  }

  return { bank, addMoney, subtractMoney }
})
