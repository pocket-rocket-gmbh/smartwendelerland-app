<template>
  <ion-modal :is-open="true">
    <ion-header>
      <ion-toolbar>
        <ion-title slot="start">Idee erstellen</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Schließen</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding has-background-white">
      <div class="field">
        <ion-input v-model="item.headline" placeholder="Titel deiner Idee eingeben…" />
      </div>

      <div class="field">
        <ion-textarea :rows="4" v-model="item.content" placeholder="Beschreibe deine Idee…" />
      </div>
      
      <div class="field">
        <div v-for="(error, index) in errors" :key="index" class="has-error">
          {{ useErrors().mappedErrorCode(error['code']) }}
        </div>

        <ion-button @click="create">Neue Idee vorschlagen</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonTextarea } from '@ionic/vue';
import { defineProps, defineEmits, ref } from 'vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePrivateApi } from '@/composables/api/private';
import { ResultStatus } from '@/types/serverCallResult';
import { useErrors } from '@/composables/ui/errors';
const emit = defineEmits(['close', 'showSuccess'])
const props = defineProps({
  pinboardId: {
    type: String,
    required: true
  }
})

const item = ref({
  headline: '',
  content: '',
  status: 'is_checked'
})

const loading = ref(false)
const errors = ref({errors: []})

const createUpdateApi = useCollectionApi()
createUpdateApi.setBaseApi(usePrivateApi())

const create = async () => {
  loading.value = true
  createUpdateApi.setEndpoint(`pinboard_ideas/pinboard/${props.pinboardId}`)
  const result = await createUpdateApi.createItem(item.value, 'Vielen Dank. Deine Idee wird überprüft.')
  loading.value = false
  if (result.status === ResultStatus.SUCCESSFUL) {
    emit('close')
    emit('showSuccess')
  } else {
    errors.value = result.data['errors']
  }
}
</script>

<style lang="sass" scoped>

</style>