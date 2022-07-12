<template>
    <ion-page class="main">
        <ion-content>
          <ion-card>
            <div align="center">
              <img src="@/assets/images/logo.png" class="logo" />

              <div class="field">
                <ion-input v-model="email" type="text" placeholder="E-Mail" />
              </div>
              
              <div class="field">
                <ion-input v-model="password" type="password" placeholder="Passwort" />
              </div>
            
              <ion-button @click="doLogin" color="primary">Anmelden</ion-button>
            </div>
            
            <ion-loading
              :is-open="loginInProgress"
              message="Anmelden..."
            />
          </ion-card>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { IonPage, IonCard, IonInput, IonContent, IonButton, IonLoading, toastController, onIonViewWillEnter } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { useUserStore } from '@/stores/user'
import { ServerCallResult, ResultStatus } from '@/types/serverCallResult'

export default defineComponent({
  name: 'LoginPage',
  components: { IonPage, IonCard, IonInput, IonContent, IonButton, IonLoading },
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
<style scoped>
ion-content {
  --background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%);
}

ion-card {
  margin-top: 100px;
}

ion-input {
  --background: #F5F5F5;
  --padding-start: 10px;
  height: 50px;
  font-size: 20px;
}

.field {
  width: 90%;
  margin: 16px;
}

.logo {
  width: 70%;
}
</style>
