<template>
  <div v-for="game in gamificationGames" :key="game.id">
    <TrophiesRewards
      :game="game"
    />
  </div>
  <ion-loading
    :is-open="loading"
    message="Einen Moment bitte..."
  />
</template>

<script lang="ts">
import { IonLoading } from '@ionic/vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import TrophiesRewards from './TrophiesRewards.vue'
export default defineComponent({
  components: { IonLoading, TrophiesRewards },
  setup() {
    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    api.setEndpoint('gamification_games')
    const gamificationGames = ref([])
    const loading = ref(false)

    const getGames = async () => {
      loading.value = true
      const options = { page: 1, per_page: 25, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null as any, concat: false, filters: null as any }
      await api.retrieveCollection(options)
      loading.value = false
      gamificationGames.value = api.items.value.filter((game:any) => game.gamification_rewards_count > 0)
    }

    onMounted(() => {
      getGames()
    })

    return {
      loading,
      gamificationGames
    }
  },
})
</script>

<style lang="sass" scoped>

</style>