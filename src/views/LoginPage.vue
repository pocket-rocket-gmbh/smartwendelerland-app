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
import { useRouter } from 'vue-router'
import { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading, toastController } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'LoginPage',
  components: { IonPage, IonItem, IonLabel, IonInput, IonContent, IonButton, IonLoading },
  setup() {

    const router = useRouter()
    const privateApi = usePrivateApi()
    const userStore = useUserStore()

    const email = ref(null)
    const password = ref(null)
    const loginInProgress = ref(false)

    const doLogin = async () => {
      loginInProgress.value = true
      const data = { email: email.value, password: password.value }

      try {
        await privateApi.call('post', '/auth', data).then(res => {

          const jwt = res.data.jwt_token
          localStorage.setItem('auth._token.jwt', jwt)

          userStore.user = res.data.user

          if (userStore.user) {
            // move to dashboard
            router.push({ path: '/admin' })
          }

          loginInProgress.value = true
        })
      } catch (error) {
        showLoginFailed()
      }
    }

    async function showLoginFailed() {
      const toast = await toastController
        .create({
          message: 'Anmeldung fehlgeschlagen',
          duration: 2000
        })
      loginInProgress.value = true
      return toast.present()
    }

    return {
      email,
      password,
      loginInProgress,
      doLogin
    }
  }
})
</script>
