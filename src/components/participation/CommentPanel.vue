<template>
  <div :class="['comment-panel', { 'has-border': isReply }]" v-if="user">
    <ion-icon
      @click="showContext($event)"
      :ios="ellipsisVerticalOutline"
      :md="ellipsisVerticalSharp">
    </ion-icon>

    <div>
      <UserProfile
        :user="comment.user"
      />
      {{ comment.user.name }} schrieb am {{ useDatetime().parseDatetime(comment.created_at) }}
    </div>

    <div class="comment">{{ comment.comment }}</div>

    <LikePanel :comment="comment" />
    
    <ion-popover
      :is-open="popoverOpen"
      :translucent="true"
      :event="commentContextEvent"
      @didDismiss="closePopover"
    >
      <div
        @click="reportComment(comment.id)"
        v-if="(comment.user.id !== useUser().currentUser().id && !comment.has_already_reported_comment)"
        align="center" class="ion-margin">
        Melden
      </div>
      <div v-if="comment.has_already_reported_comment" align="center" class="ion-margin">
        Bereits gemeldet
      </div>
      <div
        v-if="comment.user.id === user.user.id || user.user.permissions.role === 'root' || user.user.permissions.role === 'admin'"
        @click="deleteComment()"
        align="center"
        class="ion-margin"
      >
        Löschen
      </div>
    </ion-popover>

    <div class="pl-5 has-text-danger" v-if="comment.has_already_reported_comment">Du hast diesen Kommentar gemeldet!</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { IonPopover } from '@ionic/vue'
import { ellipsisVerticalOutline, ellipsisVerticalSharp } from 'ionicons/icons'
import { useUser } from '@/composables/user/user'
import LikePanel from '@/components/participation/LikePanel.vue'
import { useDatetime } from '@/composables/ui/datetime'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useUserStore } from '@/stores/user'
import UserProfile from '@/components/UserProfile.vue'

export default defineComponent({
  name: 'ParticipationCommentPanel',
  props: {
    comment: {
      type: Object
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  emits: ['setCommentReported', 'removeComment'],
  components: { IonPopover, LikePanel, IonIcon, UserProfile },
  setup(props, { emit }) {

    const user = useUserStore()

    const privateApi = usePrivateApi()
    const commentsApi = useCollectionApi()
    commentsApi.setBaseApi(privateApi)
    commentsApi.setEndpoint('comments')

    const reportApi = useCollectionApi()
    reportApi.setBaseApi(privateApi)

    const popoverOpen = ref(false)
    const commentContextEvent = ref(null)

    const showContext = (event: PointerEvent) => {
      commentContextEvent.value = event
      popoverOpen.value = true
    }

    const closePopover = () => {
      commentContextEvent.value = null
      popoverOpen.value = false
    }

    const deleteComment = async () => {
      closePopover()
      commentsApi.setEndpoint('comments/' + props.comment.id)
      await commentsApi.deleteItem()
      emit('removeComment', props.comment.id)
    }

    const reportComment = async (commentId:string) => {
      reportApi.setEndpoint(`comment_reports/comments/${commentId}`)
      await reportApi.createItem({})
      popoverOpen.value = false
      emit('setCommentReported', commentId)
    }

    return {
      user,
      useDatetime,
      showContext,
      popoverOpen,
      commentContextEvent,
      closePopover,
      deleteComment,
      reportComment,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp,
      useUser
    }
  }
})
</script>
<style lang="sass" scoped>
.comment-panel
  position: relative
  padding: 10px
  &.has-border
    border-left: 1px solid lightgrey
ion-icon
  position: absolute
  font-size: 25px
  top: 5px
  right: 5px

.comment
  font-size: 17px
  margin: 10px 0
</style>
