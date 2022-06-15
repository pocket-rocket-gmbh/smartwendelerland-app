<template>
    <ion-page>
        <ion-content>
            <ion-item>
                <ion-label position="stacked">Benutzername</ion-label>
                <ion-input v-model="login" type="text" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Passwort</ion-label>
                <ion-input v-model="password" type="password" />
            </ion-item>
            <ion-button @click="doLogin" color="primary" expand="block">Anmelden</ion-button>

            <ion-loading
              :is-open="loginInProgress"
              message="Anmelden..."
            />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading, toastController } from '@ionic/vue'
import { useLoginApi } from '@/composables/api/loginApi'
import { ResultStatus } from '@/types/apiCallResult'

export default defineComponent({
  name: 'LoginPage',
  components: { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading },
  setup() {

    const router = useRouter()
    const loginApi = useLoginApi()

    const login = ref(null)
    const password = ref(null)
    const loginInProgress = ref(false)

    const doLogin = function () {
      loginInProgress.value = true
      loginApi.performLogin(login.value, password.value).then((result) => {

        loginInProgress.value = false

        if (result.status === ResultStatus.SUCCESSFUL) {
          router.replace({ path: '/main' })          
        }
        else {
          showLoginFailed()
        }
      })
    }

    async function showLoginFailed() {
      const toast = await toastController
        .create({
          message: 'Anmeldung fehlgeschlagen',
          duration: 2000
        })
      return toast.present();
    }

    return {
      login,
      password,
      loginInProgress,
      doLogin
    }
  }
})
</script>
