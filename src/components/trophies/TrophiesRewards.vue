<template>
  <div v-for="reward in gamificationRewards" :key="reward.id" :class="['reward-box mb-4', { 'active' : currentCountByKindAndThreshold(game.kind, reward.threshold) === reward.threshold}]">
    <div class="image">
      <img :src="`/gamification/${game.kind}.png`" />
    </div>
    <div class="right ml-3">
      <div class="headline">{{ reward.name }}</div>
      <div class="sub">{{ rewardTextByKindAndThreshold(game.kind, reward.threshold) }}</div>
      <div class="sub threshold">{{ currentCountByKindAndThreshold(game.kind, reward.threshold) }} / {{ reward.threshold }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useUserStore } from "@/stores/user"
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
export default defineComponent({
  props: {
    game: {
      required: true,
      type: Object
    }
  },
  setup(props) {
    const gamificationRewards = ref([])
    const loading = ref(false)

    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    api.setEndpoint(`gamification_rewards/gamification_game/${props.game.id}`)

    const user = computed(() => {
      return useUserStore().user
    })

    const currentCountByKindAndThreshold = (kind:string, threshold:number) => {
      let current = 0
      if (user.value) {
        if (kind === 'login') {
          current = user.value.login_count
        } else if (kind === 'rating') {
          current = user.value.project_ratings_count
        } else if (kind === 'poll') {
          current = user.value.poll_answers_count
        } else if (kind === 'comment') {
          current = user.value.comments_count
        }

        if (current > threshold) {
          current = threshold
        }
      }

      return current
    }

    const rewardTextByKindAndThreshold = (kind:string, threshold:number) => {
      let text = ''
      if (kind === 'login') {
        text = `Melde dich mindestens ${threshold} mal an.`
      } else if (kind === 'rating') {
        let mult = ''
        if (threshold > 1) {
          mult = 'e'
        }
        text = `Bewerte mindestens ${threshold} Projekt${mult}.`
      } else if (kind === 'poll') {
        let mult = ''
        if (threshold > 1) {
          mult = 'en'
        }
        text = `Gibt mindestens ${threshold} Antwort${mult} bei unseren Umfragen ab.`
      } else if (kind === 'comment') {
        let mult = ''
        if (threshold > 1) {
          mult = 'e'
        }
        text = `Verfasse mindestens ${threshold} Kommentar${mult}.`
      }

      return text
    }

    const getRewards = async () => {
      loading.value = true
      const options = { page: 1, per_page: 10000, sort_by: 'threshold', sort_order: 'ASC', searchQuery: null as any, concat: false, filters: null as any }
      await api.retrieveCollection(options)
      loading.value = false
      gamificationRewards.value = api.items.value
    }

    onMounted(() => {
      getRewards()
    })

    return {
      gamificationRewards,
      currentCountByKindAndThreshold,
      rewardTextByKindAndThreshold
    }
  },
})
</script>

<style lang="sass" scoped>
.reward-box
  background: #FFFFFF
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15)
  border-radius: 20px
  display: grid
  grid-template-columns: 50px auto
  gap: 10px
  padding: 10px
  margin-bottom: 10px
  .image
    display: grid
    align-items: center
    opacity: 0.5
  .image img
    height: 50px
  .right
    color: #58595E
    position: relative
    opacity: 0.5
    .headline
      font-weight: 600
      font-size: 18px
      text-transform: uppercase
      
    .sub
      font-weight: 500
      font-size: 13px
    .threshold
      position: absolute
      right: 10px
      top: 10px
  &.active
    .image
      opacity: 1
    .right
      opacity: 1
</style>