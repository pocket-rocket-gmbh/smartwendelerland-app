<template>
  <ion-row>
    <ion-col>
      <ion-textarea v-model="newComment" inputmode="text" :rows=5 :placeholder="placeholder"></ion-textarea>
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
  emits: ['refreshCollection', 'increaseRepliesCount'],
  props: {
    projectId: {
      type: String,
      required: true
    },
    parentId: String,
    placeholder: String
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
        parent_id: props.parentId,
        comment: newComment.value
      }, 'Kommentar erfolgreich erstellt')

      if (result.status === ResultStatus.SUCCESSFUL) {
        newComment.value = ''
        emit('increaseRepliesCount')
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
<style scoped lang="sass">
ion-textarea
  --background: #F5F5F5
  --padding-start: 5px
</style>