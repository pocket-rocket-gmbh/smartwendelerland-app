<template>
  <LoginLayout>
    <div align="center">
      <ion-nav-link routerLink="/">
        <img src="@/assets/images/logo.png" class="logo" />
      </ion-nav-link>

      <div class="field">
        <ion-input v-model="email" type="text" placeholder="E-Mail" />
      </div>
      
      <div class="field">
        <ion-input v-model="password" type="password" placeholder="Passwort" />
      </div>
    
      <ion-button @click="doLogin" color="primary">Anmelden</ion-button>
      <div class="ion-margin">
        <ion-nav-link routerLink="/register">Noch keinen Account? Jetzt registrieren!</ion-nav-link>
      </div>
      <div class="ion-margin">
        <ion-nav-link routerLink="/password-forgotten">Password vergessen?</ion-nav-link>
      </div>
      <div class="ion-margin">
        <ion-nav-link routerLink="/">← zurück</ion-nav-link>
      </div>
    </div>
    
    <ion-loading
      :is-open="loginInProgress"
      message="Anmelden…"
    />
  </LoginLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonInput, IonButton, IonLoading, toastController, onIonViewWillEnter, IonNavLink } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { useUserStore } from '@/stores/user'
import { usePollStore } from '@/stores/poll'
import { ResultStatus } from '@/types/serverCallResult'
import LoginLayout from '@/components/general/LoginLayout.vue'

export default defineComponent({
  name: 'LoginPage',
  components: { LoginLayout, IonInput, IonButton, IonLoading, IonNavLink },
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

      const result = await privateApi.call('post', '/auth', data)
      if (result.status === ResultStatus.SUCCESSFUL) {
        const jwt = result.data.jwt_token
        localStorage.setItem('auth._token.jwt', jwt)
        localStorage.setItem('email', email.value)          
        userStore.user = result.data.user

        // update relevant data which is now available after login
        await usePollStore().setPublicPoll()

        if (lastPage.value && lastPage.value !== '/password-forgotten' && lastPage.value !== '/register') {
          router.push({ path: lastPage.value })
        } else {
          router.push({ path: '/' })
        }
      }
      else {
        loginInProgress.value = false
        showLoginFailed()
      }

      password.value = ''
      loginInProgress.value = false
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
<style lang="sass" scoped>
.logo
  width: 70%
  margin-top: 20px
</style>
