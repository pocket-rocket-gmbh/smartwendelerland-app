<template>
  <div>
    <span @click="handleComment('upvote')">
      <ion-button>
        <ion-icon class="ion-margin-right" :ios="thumbsUpOutline" :md="thumbsUpSharp"></ion-icon>
        Gefällt mir   
      </ion-button>
    </span>
    <span @click="handleComment('downvote')">
      <ion-button>
        <ion-icon :ios="thumbsDownOutline" :md="thumbsDownSharp"></ion-icon>
        Gefällt mir nicht
      </ion-button>
    </span>
    <div>Punktzahl: {{ commentScore }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import { thumbsDownOutline, thumbsDownSharp, thumbsUpOutline, thumbsUpSharp } from 'ionicons/icons'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'


export default defineComponent({
  name: 'ParticipationLikeDislikePanel',
  components: { IonIcon },
  props: {
    comment: Object
  },
  setup (props, { emit }) {
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

    const handleComment = async (kind: string) => {
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

      loading.value = false
    }

    return {
      thumbsDownOutline,
      thumbsDownSharp,
      thumbsUpOutline,
      thumbsUpSharp,
      loading,
      handleComment,
      commentUpvoted,
      commentDownvoted,
      upvoteCount,
      downvoteCount,
      commentScore
    }
  }
})
</script>
