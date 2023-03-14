<template>
  <ion-grid>
    <ion-row>
      <ion-col>
        <ion-label>Vorname:</ion-label>
      </ion-col>
      <ion-col>
        <ion-label>{{ userStore.user?.firstname }}</ion-label>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <ion-label>Nachname:</ion-label>
      </ion-col>
      <ion-col>
        <ion-label>{{ userStore.user?.lastname }}</ion-label>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <ion-label>E-Mail:</ion-label>
      </ion-col>
      <ion-col>
        <ion-label>{{ userStore.user?.email }}</ion-label>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <div class="field is-marginless">
          <ion-input v-model="password" type="password" placeholder="Neues Passwort"></ion-input>
        </div>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <div class="field is-marginless">
          <ion-input v-model="password_confirmation" type="password" placeholder="Passwort bestätigen"></ion-input>
        </div>
        <ion-item v-if="passwordError === true" color="danger">
          Das Passwort muss mindestens 5 Zeichen haben und beide Passwörter müssen übereinstimmen.
        </ion-item>
        <ion-item v-else-if="passwordError === false" color="success">
          Passwort erfolgreich geändert.
        </ion-item>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <ion-button @click="updatePassword">Passwort ändern</ion-button>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <div @click="closeAccountModalOpen = true" class="delete-account-button"><u>Account löschen</u></div>
      </ion-col>
    </ion-row>
  </ion-grid>
  <ion-modal :is-open="closeAccountModalOpen">
    <ion-header>
      <ion-toolbar>
        <ion-title slot="start">Account löschen</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeAccountModalOpen = false">X</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding has-background-white">
      Bist du sicher, dass du deinen Account löschen willst? Dein Fortschritt, deine Kommentare und deine Projektbewertungen gehen damit verloren.
      <ion-row>
        <ion-col>
          <ion-button @click="deleteAccount" color="danger" expand="block">Ja, Account löschen</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button @click="closeAccountModalOpen = false" expand="block">Abbrechen</ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonGrid, IonRow, IonCol, IonLabel, IonButton, IonInput, IonItem, toastController, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useUserStore } from '@/stores/user'
import { ResultStatus } from '@/types/serverCallResult'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: {
    IonGrid, IonRow, IonCol, IonLabel, IonButton, IonInput, IonItem, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const password = ref('')
    const password_confirmation = ref('')
    const passwordError = ref(null)
    const closeAccountModalOpen = ref(false)

    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())

    const updatePassword = async () => {
      passwordError.value = false
      api.setEndpoint(`users/${userStore.user.id}/update-password`)
      const data = {
        password: password.value,
        password_confirmation: password_confirmation.value
      }
      const result = await api.updateItem(data)
      if (result.status === ResultStatus.SUCCESSFUL) {
        passwordError.value = false
      } else {
        passwordError.value = true
      }
    }

    const deleteAccount = async () => {
      api.setEndpoint(`users/delete-me`)
      await api.deleteItem()
      localStorage.removeItem('auth._token.jwt')
      userStore.user = null
      closeAccountModalOpen.value = false
      router.push('/')

      const toast = await toastController
        .create({
          message: 'Dein Account wurde gelöscht',
          duration: 2000
        })
      return toast.present()
    }

    return {
      userStore,
      password,
      password_confirmation,
      passwordError,
      closeAccountModalOpen,
      deleteAccount,
      updatePassword
    }
  },
})
</script>

<style lang="sass" scoped>
.delete-account-button
  margin-top: 50px
</style>