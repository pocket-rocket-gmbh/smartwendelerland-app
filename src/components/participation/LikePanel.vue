<template>
  <span class="like-dislike-panel">
    <span @click="handleLike('upvote')">
      <ion-icon :ios="heart" :md="heart" v-if="commentUpvoted" class="upvoted"></ion-icon>
      <ion-icon :ios="heartOutline" :md="heartOutline" v-else></ion-icon>
    </span>
    <div class="score">{{ commentScore }}</div>
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import { heartOutline, heart } from 'ionicons/icons'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { Vibration } from '@awesome-cordova-plugins/vibration'

export default defineComponent({
  components: { IonIcon },
  props: {
    comment: Object
  },
  setup (props) {
    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    const loading = ref(false)

    const commentUpvoted = ref(false)
    const commentDownvoted = ref(false)
    const upvoteCount = ref(0)
    const downvoteCount = ref(0)
    const commentScore = ref(0)

    onMounted(() => {
      if (props.comment.has_upvoted_comment) {
        commentUpvoted.value = true
      } else if (props.comment.has_downvoted_comment) {
        commentDownvoted.value = true
      }

      upvoteCount.value = props.comment.upvote_count
      downvoteCount.value = props.comment.downvote_count
      commentScore.value = props.comment.score
    })

    const getButtonColorUpvoted = () => {
      if (commentUpvoted.value) {
        return 'primary'
      }
      return 'light'
    }

    const getButtonColorDownvoted = () => {
      if (commentDownvoted.value) {
        return 'primary'
      }
      return 'light'
    }

    const handleLike = async (kind: string) => {
      loading.value = true
      if (kind === 'upvote' && commentUpvoted.value || kind === 'downvote' && commentDownvoted.value) {
        api.setEndpoint(`comments/${props.comment.id}/remove_vote`)
        await api.deleteItem()
        commentUpvoted.value = false
        commentDownvoted.value = false
        if (kind === 'upvote') {
          upvoteCount.value -= 1
          commentScore.value -= 1
        } else if (kind === 'downvote') {
          downvoteCount.value -= 1
          commentScore.value += 1
        }
      } else {
        api.setEndpoint(`comments/${props.comment.id}/${kind}`)
        await api.updateItem({})

        if (kind === 'upvote' && !commentUpvoted.value) {
          if (commentDownvoted.value) {
            downvoteCount.value -= 1
            commentScore.value += 1
          }
          commentScore.value += 1
          commentDownvoted.value = false
          commentUpvoted.value = true
          upvoteCount.value += 1
        } else if (kind === 'downvote' && !commentDownvoted.value) {
          if (commentUpvoted.value) {
            upvoteCount.value -= 1
            commentScore.value -= 1
          }
          commentScore.value -= 1
          commentUpvoted.value = false
          commentDownvoted.value = true
          downvoteCount.value += 1
        }
      }

      Vibration.vibrate(500)
      loading.value = false
    }

    return {
      heartOutline,
      heart,
      loading,
      handleLike,
      commentUpvoted,
      commentDownvoted,
      upvoteCount,
      downvoteCount,
      commentScore,
      getButtonColorUpvoted,
      getButtonColorDownvoted
    }
  }
})
</script>
<style scoped>
.like-dislike-panel {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-content: center;
}
.score {
  display: inline;
  font-size: 18px;
  margin-top: 2px;
}
ion-icon {
  margin-right: 3px;
  font-size: 25px;
}

ion-icon.upvoted {
  color: #015281;
}
</style>
