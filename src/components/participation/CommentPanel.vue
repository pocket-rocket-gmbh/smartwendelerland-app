<template>
  <ion-item>
    <ion-grid>
      <ion-row>
        <ion-col>
          {{ comment.user.name }}
        </ion-col>
        <ion-col style="text-align: right">
          <ion-label @click="showContext($event)">...</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          schrieb am {{ useDatetime().parseDatetime(comment.created_at) }}
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          {{ comment.comment }}
        </ion-col>
      </ion-row>
    </ion-grid>
    
    <ion-popover
      :is-open="popoverOpen"
      :translucent="true"
      :event="commentContextEvent"
      @didDismiss="closePopover"
    >
      <ion-button @click="deleteComment()">Löschen</ion-button>
    </ion-popover>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonItem, IonGrid, IonRow, IonCol, IonLabel, IonPopover, IonButton } from '@ionic/vue'
import { useDatetime } from '@/composables/ui/datetime'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'

export default defineComponent({
  name: 'ParticipationCommentPanel',
  props: {
    comment: Object
  },
  emits: ['comment-deleted'],
  components: { IonItem, IonGrid, IonRow, IonCol, IonLabel, IonPopover, IonButton },
  setup(props, { emit }) {

    const route = useRoute()

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

    const deleteComment = () => {
      commentsApi.setEndpoint('comments')
      commentsApi.deleteItem(props.comment.id)
      emit('comment-deleted')
      closePopover()
    }

    return {
      useDatetime,
      showContext,
      popoverOpen,
      commentContextEvent,
      closePopover,
      deleteComment
    }
  }
})
</script>
