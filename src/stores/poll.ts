import { defineStore } from 'pinia'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'

export const usePollStore = defineStore({
  id: 'poll',
  state: () => ({
    publicPoll: null,
    projectPoll: null
  }),
  actions: {
    async setPublicPoll() {
      const api = useCollectionApi()
      api.setBaseApi(usePrivateApi())
      api.setEndpoint(`polls?is_active=true&ignore_projects=true`)
      const result = await api.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null, concat: false, filters: null })
      if (result.data) {
        this.publicPoll = result.data.resources[0]
      }
    },
    async setProjectPoll(projectId:string) {
      const api = useCollectionApi()
      api.setBaseApi(usePrivateApi())
      api.setEndpoint(`polls?is_active=true&project_id=${projectId}`)
      const result = await api.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null, concat: false, filters: null })
      if (result.data) {
        this.projectPoll = result.data.resources[0]
      }
    },
  }
})