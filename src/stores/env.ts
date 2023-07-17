import { defineStore } from 'pinia'

export const useEnvStore = defineStore({
  id: 'env',
  state: () => ({
    env: 'production'
  })
})