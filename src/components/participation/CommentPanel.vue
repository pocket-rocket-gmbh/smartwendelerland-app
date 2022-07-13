<template>
  <div class="comment-panel">

    <ion-icon
      v-if="comment.user.id === user.user.id || user.user.permissions.role === 'root'"
      @click="showContext($event)"
      :ios="ellipsisVerticalOutline"
      :md="ellipsisVerticalSharp">
    </ion-icon>

    <div>{{ comment.user.name }} schrieb am {{ useDatetime().parseDatetime(comment.created_at) }}</div>

    <div class="comment">{{ comment.comment }}</div>

    <LikeDislikePanel :comment="comment"></LikeDislikePanel>
    
    <ion-popover
      :is-open="popoverOpen"
      :translucent="true"
      :event="commentContextEvent"
      @didDismiss="closePopover"
    >
      <div @click="deleteComment()" align="center" class="ion-margin">Löschen</div>
    </ion-popover>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { IonPopover } from '@ionic/vue'
import { ellipsisVerticalOutline, ellipsisVerticalSharp } from 'ionicons/icons'

import LikeDislikePanel from '@/components/participation/LikeDislikePanel.vue'
import { useDatetime } from '@/composables/ui/datetime'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'ParticipationCommentPanel',
  props: {
    comment: Object
  },
  emits: ['refreshCollection'],
  components: { IonPopover, LikeDislikePanel, IonIcon },
  setup(props, { emit }) {

    const route = useRoute()
    const user = useUserStore()

    const privateApi = usePrivateApi()
    const commentsApi = useCollectionApi()
    commentsApi.setBaseApi(privateApi)
    commentsApi.setEndpoint('comments')

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
      commentsApi.setEndpoint('comments/' + props.comment.id)
      const result = await commentsApi.deleteItem()
      emit('refreshCollection')
      closePopover()
    }

    return {
      user,
      useDatetime,
      showContext,
      popoverOpen,
      commentContextEvent,
      closePopover,
      deleteComment,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp
    }
  }
})
</script>
<style scoped>
.comment-panel {
  position: relative;
  padding: 10px;
}
ion-icon {
  position: absolute;
  font-size: 25px;
  top: 5px;
  right: 5px;
}

.comment {
  font-size: 17px;
  margin: 10px 0;
}
</style>
