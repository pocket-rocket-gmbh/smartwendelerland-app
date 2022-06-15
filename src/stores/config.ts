import { defineStore } from 'pinia'

export const useConfigStore = defineStore({
    id: 'config',
    state: () => ({
      url: 'TODO',
      apiBase: '/web/api/v1'
    }),
    getters: {
        getUrl: (state) => {
          return (subUrl: string) => {
            return state.url + state.apiBase + '/' + subUrl
          }
        }
      }
})
