<template>
  <ion-page class="main">
    <ion-content>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size-sm="12" size-md="6" size-lg="3">
            <ion-card>
              <div align="center">
                <img src="@/assets/images/logo.png" class="logo" />
                <div class="field">
                  <ion-input placeholder="E-Mail" type="email" v-model="email" :class="['input', { 'has-error' : error }]"></ion-input>
                </div>

                <div class="input-error is-narrow ion-margin-bottom" v-if="!error && passwordResetSuccessful">Ein neues Passwort wurde per E-Mail geschickt.</div>
                <div class="input-error is-narrow ion-margin-bottom" v-else-if="error">Benutzer nicht gefunden.</div>
                <ion-button @click="resetPassword" color="primary" :disabled="email === ''" v-if="!passwordResetSuccessful">Neues Passwort anfordern</ion-button>

                <div class="ion-margin"><ion-nav-link routerLink="/login">Zum Login</ion-nav-link></div>
              </div>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-loading
        :is-open="resetInProgress"
        message="Anmelden…"
      />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonButton, IonLoading, onIonViewWillEnter, IonInput, IonNavLink } from '@ionic/vue'
import { usePrivateApi } from '@/composables/api/private'
import { ResultStatus } from '@/types/serverCallResult'

export default defineComponent({
name: 'LoginPage',
components: { IonPage, IonContent, IonButton, IonLoading, IonInput, IonNavLink },
setup() {

  const router = useRouter()
  const privateApi = usePrivateApi()

  const email = ref('')
  const passwordResetSuccessful = ref(false)
  const error = ref(false)
  const resetInProgress = ref(false)

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
    if (localStorage.getItem('junghans_login_email')) {
      email.value = localStorage.getItem('junghans_login_email')
    }
  }) 

  return {
    passwordResetSuccessful,
    email,
    resetInProgress,
    router,
    resetPassword,
    error,
  }
}
})
</script>

<style lang="sass" scoped>
ion-content
  --background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)

ion-card
  margin-top: 100px

ion-input
  --background: #F5F5F5
  --padding-start: 10px
  height: 50px
  font-size: 20px

.field
  width: 90%
  margin: 16px

.logo
  width: 70%
</style>
