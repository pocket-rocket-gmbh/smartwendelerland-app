<template>
  <ion-row>
    <ion-col>
      <ion-textarea v-model="newComment" inputmode="text" rows=5 placeholder="Kommentar verfassen ..."></ion-textarea>
    </ion-col>
  </ion-row>
  <ion-row>
    <ion-col style="text-align: right">
      <ion-button @click="create()">Absenden</ion-button>
    </ion-col>
  </ion-row>
</template>
<script lang="ts">
import { defineComponent, ref} from 'vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import { ResultStatus } from '@/types/serverCallResult'
import { IonRow, IonCol, IonTextarea, IonButton } from '@ionic/vue'

export default defineComponent({
  components: { IonRow, IonCol, IonTextarea, IonButton },
  emits: ['refreshCollection'],
  props: {
    projectId: String
  },
  setup(props, { emit }) {
    const newComment = ref('')
    const loadingInProgress = ref(false)
    const privateApi = usePrivateApi()
    const commentsApi = useCollectionApi()
    commentsApi.setEndpoint('comments/project/' + props.projectId)
    commentsApi.setBaseApi(privateApi)

    const create = async () => {
      loadingInProgress.value = true
      const result = await commentsApi.createItem({
        comment: newComment.value
      })

      if (result.status === ResultStatus.SUCCESSFUL) {
        newComment.value = ''
        emit('refreshCollection')
      }
      
      loadingInProgress.value = false
    }

    return {
      newComment,
      loadingInProgress,
      create
    }
  },
})
</script>
