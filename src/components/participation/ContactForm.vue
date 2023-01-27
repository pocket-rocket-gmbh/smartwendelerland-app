<template>
  <ion-modal
    :is-open="true"
    @didDismiss="emitClose"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title slot="start">Kontaktformular</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose">X</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding has-background-white">
      <div class="field">
        <ion-input
          v-model="item.firstname"
          placeholder="Vorname"
        />
      </div>
      <div class="field">
        <ion-input
          v-model="item.lastname"
          placeholder="Nachname"
        />
      </div>
      <div class="field">
        <ion-input
          v-model="item.email"
          placeholder="E-Mail *"
        />
      </div>
      <div class="field">
        <ion-input
          v-model="item.subject"
          placeholder="Betreff *"
        />
      </div>
      <div class="field">
        <ion-textarea
          v-model="item.message"
          placeholder="Ihre Nachricht *"
        />
      </div>
      <div class="field">
        <label for="policy" class="ion-padding has-font-face-meta-pro-normal is-narrow custom-checkbox">
          <input type="checkbox" v-model="policyCheckboxChecked" id="policy" class="ion-margin-right" />
          <span class="label-text">Die Datenschutzerklärung habe ich zur Kenntnis genommen.</span>
          <span class="checkmark"></span>
        </label>
        <span @click="isOpen = !isOpen"><u>Zur Datenschutzerklärung</u></span>
      </div>
      
      <ion-modal :is-open="isOpen">
        <ion-header>
          <ion-toolbar>
            <ion-title slot="start">Datenschutzerklärung</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isOpen = !isOpen">X</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding has-background-white">
          <PrivacyPolicy />
        </ion-content>
      </ion-modal>
      <div class="field">
        <ion-button @click="send()" :disabled="(!policyCheckboxChecked || item.subject === '' || item.message === '' || item.email === '')">Abschicken</ion-button>
      </div>
      <div v-for="(error, index) in errors" :key="index" class="has-error">
        {{ useErrors().mappedErrorCode(error['code']) }}
      </div>
    </ion-content>
  </ion-modal>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonTextarea, toastController } from '@ionic/vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePublicApi } from '@/composables/api/public'
import { ResultStatus } from '@/types/serverCallResult'
import { useErrors } from '@/composables/ui/errors'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
export default defineComponent({
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonTextarea, PrivacyPolicy },
  name: 'PublicProjectsContactForm',
  emits: ['close'],
  props: {
    projectId: String
  },
  setup(props, { emit }) {
    const item = ref({
      firstname: '',
      lastname: '',
      email: '',
      subject: '',
      message: '',
      project_id: props.projectId
    })

    const errors = ref([])
    const dialog = ref(true)
    const loading = ref(false)
    const createApi = useCollectionApi()
    createApi.setBaseApi(usePublicApi())
    const policyCheckboxChecked = ref(false)
    const isOpen = ref(false)

    const emitClose = () => {
      emit('close')
    }

    const send = async () => {
      createApi.setEndpoint(`messages`)
      loading.value = true
      const result = await createApi.createItem(item.value)
      loading.value = false
      if (result.status === ResultStatus.SUCCESSFUL) {
        showSuccessfullySent()
        emit('close')
      } else {
        console.log(result.data)
        errors.value = result.data['errors']
      }
    }

    const showSuccessfullySent = async () => {
      const toast = await toastController
        .create({
          message: 'Nachricht erfolgreich gesendet',
          duration: 2000
        })
      return toast.present()
    }

    return {
      item,
      errors,
      emitClose,
      dialog,
      loading,
      send,
      useErrors,
      policyCheckboxChecked,
      isOpen
    }
  }
})
</script>