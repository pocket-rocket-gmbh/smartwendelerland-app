<template>
  <LoginLayout>
    <div align="center">
      <img src="@/assets/images/logo.png" class="logo" />
      <div class="field">
        <ion-input placeholder="E-Mail" type="email" v-model="email" :class="['input', { 'has-error' : error }]"></ion-input>
      </div>

      <div class="input-error is-narrow ion-margin-bottom" v-if="!error && passwordResetSuccessful">Ein neues Passwort wurde per E-Mail geschickt.</div>
      <div class="input-error is-narrow ion-margin-bottom" v-else-if="error">Benutzer nicht gefunden.</div>
      <ion-button @click="resetPassword" color="primary" :disabled="!isValidEmail(email)" v-if="!passwordResetSuccessful">Neues Passwort anfordern</ion-button>

      <div class="ion-margin"><ion-nav-link routerLink="/login">Zum Login</ion-nav-link></div>
    </div>
    <ion-loading
      :is-open="resetInProgress"
      message="Anmelden…"
    />
  </LoginLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonButton, IonLoading, onIonViewWillEnter, IonInput, IonNavLink } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { ResultStatus } from '@/types/serverCallResult'
import LoginLayout from '@/components/general/LoginLayout.vue'

export default defineComponent({
name: 'LoginPage',
components: { LoginLayout, IonButton, IonLoading, IonInput, IonNavLink },
setup() {

  const router = useRouter()
  const privateApi = usePrivateApi()

  const email = ref('')
  const passwordResetSuccessful = ref(false)
  const error = ref(false)
  const resetInProgress = ref(false)

  const isValidEmail = (email:string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email);
  }

  const resetPassword = async () => {
    resetInProgress.value = true
    error.value = false

    privateApi.call('post', '/public/users/reset-password', { email: email.value }).then(result => {
      if (result.status === ResultStatus.SUCCESSFUL) {
        passwordResetSuccessful.value = true
        resetInProgress.value = false
      }
      else {
        passwordResetSuccessful.value = false
        error.value = true
        resetInProgress.value = false
      }
    })
  }

  onIonViewWillEnter(() => {
    passwordResetSuccessful.value = false
    if (localStorage.getItem('smawela_login_email')) {
      email.value = localStorage.getItem('smawela_login_email')
    }
  }) 

  return {
    passwordResetSuccessful,
    email,
    resetInProgress,
    router,
    resetPassword,
    error,
    isValidEmail
  }
}
})
</script>

<style lang="sass" scoped>
.logo
  width: 70%
  margin-top: 20px
</style>
