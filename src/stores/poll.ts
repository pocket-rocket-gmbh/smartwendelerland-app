import { defineStore } from 'pinia'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'

export const usePollStore = defineStore({
  id: 'poll',
  state: () => ({
    publicPoll: null
  }),
  actions: {
    async setPublicPoll() {
      console.log("enter")
      const api = useCollectionApi()
      api.setBaseApi(usePrivateApi())
      api.setEndpoint(`polls?is_active=true&ignore_projects=true`)
      const result = await api.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null, concat: false, filters: null })
      this.publicPoll = result.data.resources[0]
    },
  }
})