<template>
    <ion-page>
        <ion-content>
            <ion-item>
                <ion-label position="stacked">E-Mail</ion-label>
                <ion-input v-model="email" type="text" />
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
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading, toastController, onIonViewWillEnter } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { useUserStore } from '@/stores/user'
import { ServerCallResult, ResultStatus } from '@/types/serverCallResult'

export default defineComponent({
  name: 'LoginPage',
  components: { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading },
  setup() {

    const router = useRouter()
    const privateApi = usePrivateApi()
    const userStore = useUserStore()

    const lastPage = ref(null)

    const email = ref(localStorage.getItem('email'))
    const password = ref('')
    const loginInProgress = ref(false)

    const doLogin = async () => {
      loginInProgress.value = true
      const data = { email: email.value, password: password.value }

      privateApi.call('post', '/auth', data).then(result => {
        if (result.status === ResultStatus.SUCCESSFUL) {
          const jwt = result.data.jwt_token
          localStorage.setItem('auth._token.jwt', jwt)
          localStorage.setItem('email', email.value)          
          userStore.user = result.data.user
          router.push({ path: lastPage.value })
        }
        else {
          showLoginFailed()
        }

        password.value = ''
        loginInProgress.value = false
      })
    }

    async function showLoginFailed() {
      const toast = await toastController
        .create({
          message: 'Anmeldung fehlgeschlagen',
          duration: 2000
        })
      return toast.present()
    }

    onIonViewWillEnter(() => {
      lastPage.value = router.options.history.state.back
    }) 

    return {
      email,
      password,
      loginInProgress,
      doLogin
    }
  }
})
</script>
