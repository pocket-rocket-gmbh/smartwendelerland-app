<template>
  <ion-row no-gutters :class="['vote-panel', votedClass]" align="center">
    <ion-col>
      <img src="@/assets/images/dislike.png" @click="handleVote('downvote')" v-if="project.rating_kind === 'upvote_downvote' && projectDownvoted" />
      <img src="@/assets/images/dislike-inactive.png" @click="handleVote('downvote')" v-else-if="project.rating_kind === 'upvote_downvote'" />
    </ion-col>
    <ion-col>
      <div v-if="votedClass" class="your-vote">
        <div v-if="projectUpvoted" class="has-text-white">Dir gefällt dieses Projekt</div>
        <div v-else-if="projectDownvoted" class="has-text-white">Dir gefällt dieses Projekt nicht</div>
      </div>
      <div v-else class="your-vote">Gib deine Stimme ab</div>
    </ion-col>
    <ion-col>
      <img src="@/assets/images/like.png" @click="handleVote('upvote')" v-if="projectUpvoted" />
      <img src="@/assets/images/like-inactive.png" @click="handleVote('upvote')" v-else />
    </ion-col>
  </ion-row>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import { IonRow, IonCol } from '@ionic/vue'
import { Vibration } from '@awesome-cordova-plugins/vibration'
export default defineComponent({
  emits: ['updateProject'],
  components: { IonRow, IonCol },
  props: {
    project: Object
  },
  setup (props, { emit }) {
    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    const loading = ref(false)

    const projectUpvoted = ref(false)
    const projectDownvoted = ref(false)

    const hasVoted = computed(() => {
      return projectUpvoted.value || projectDownvoted.value
    })

    const votedClass = computed(() => {
      if (projectUpvoted.value === true) {
        return 'upvoted'
      } else if (projectDownvoted.value === true) {
        return 'downvoted'
      }
      return null
    })

    onMounted(() => {
      if (props.project.has_upvoted_project) {
        projectUpvoted.value = true
      } else if (props.project.has_downvoted_project) {
        projectDownvoted.value = true
      }
    })

    const handleVote = async (kind: string) => {
      loading.value = true
      if (kind === 'upvote' && projectUpvoted.value || kind === 'downvote' && projectDownvoted.value) {
        api.setEndpoint(`projects/${props.project.id}/remove_vote`)
        await api.deleteItem()
        projectUpvoted.value = false
        projectDownvoted.value = false
        emit('updateProject')
      } else {
        api.setEndpoint(`projects/${props.project.id}/${kind}`)
        await api.updateItem({})

        if (kind === 'upvote' && !projectUpvoted.value) {
          projectDownvoted.value = false
          projectUpvoted.value = true
        } else if (kind === 'downvote' && !projectDownvoted.value) {
          projectUpvoted.value = false
          projectDownvoted.value = true
        }
        emit('updateProject')
      }
      Vibration.vibrate(500)
      loading.value = false
    }

    return {
      loading,
      handleVote,
      projectUpvoted,
      projectDownvoted,
      hasVoted,
      votedClass
    }
  }
})
</script>
<style lang="sass" scoped>
.vote-panel
  padding-top: 10px
  color: rgb(68, 68, 68)
  border-bottom: 1px solid rgb(229, 229, 229)
  border-radius: 20px

.vote-panel.upvoted
  border: none
  background: #ABC812
.vote-panel.downvoted
  color: black
  border: none
  background: #A42258
.your-vote
  margin-top: 13px
  font-weight: 600
.has-text-white
  color: white
</style>