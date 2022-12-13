<template>
  <BackButtonLayout>
    <ion-grid>
      <ion-row>
        <ion-col>
          <ion-label class="headline">Ihre Daten</ion-label>
        </ion-col>
      </ion-row>
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
          <ion-label>Landkreis:</ion-label>
        </ion-col>
        <ion-col>
          <ion-label>{{ userStore.user?.organization.name }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button @click="logout">Abmelden</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-input v-model="password" type="password" placeholder="Neues Passwort"></ion-input>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-input v-model="password_confirmation" type="password" placeholder="Passwort bestätigen"></ion-input>
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
    </ion-grid>
  </BackButtonLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonGrid, IonRow, IonCol, IonLabel, IonButton, onIonViewWillEnter, IonInput, IonItem } from '@ionic/vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { ResultStatus } from '@/types/serverCallResult'

export default defineComponent({
  name: 'MePage',
  components: { BackButtonLayout, IonGrid, IonRow, IonCol, IonLabel, IonButton, IonInput, IonItem },
  setup() {

    const router = useRouter()
    const userStore = useUserStore()

    const password = ref('')
    const password_confirmation = ref('')
    const passwordError = ref(null)

    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())

    onIonViewWillEnter(() => {
      if (userStore.user === null) {
        router.push('/login')
      }
    }) 

    // We only remove the local JWT/user to prevent logout from wiiir-frontend.
    const logout = () => {
      localStorage.removeItem('auth._token.jwt')
      userStore.user = null
      router.push('/')
    }

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

    return {
      userStore,
      updatePassword,
      password_confirmation,
      password,
      passwordError,
      logout
    }
  }
})
</script>

<style scoped>
.headline {
  font-size: 1.5em;
}
</style>