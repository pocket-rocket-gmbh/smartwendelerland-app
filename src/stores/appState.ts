import { defineStore } from 'pinia'

export const useAppStateStore = defineStore({
  id: 'appState',
  state: () => ({
    appLoading: true,
    appLoadingProgress: 0.0
  }),
  getters: {
    isAppLoading: (state) => {
      return state.appLoading
    },
    getAppLoadingProgress: (state) => {
      return state.appLoadingProgress
    }
  },
  actions: {
    setAppLoading(appLoading = false) {
      this.appLoading = appLoading
    },
    setAppLoadingProgress(progress = 0.0) {
      this.appLoadingProgress = progress
    }
  }
})