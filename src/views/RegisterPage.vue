<template>
  <LoginLayout>
    <div align="center">
      <img src="@/assets/images/logo.png" routerLink="/" class="logo" />

      <div class="box ion-padding" v-if="!registerSuccessful">
        <div class="field">
          <ion-input placeholder="E-Mail eintragen" type="email" v-model="item.email" :class="['input', { 'has-error' : error }]"></ion-input>
        </div>
        <div class="field">
          <ion-input placeholder="Vorname eintragen" type="text" v-model="item.firstname" class="input"></ion-input>
        </div>

        <div class="field">
          <ion-input placeholder="Nachname eintragen" type="text" v-model="item.lastname" class="input"></ion-input>
        </div>

        <div class="field">
          <div class="policy">
            <label for="policy" class="ion-padding has-font-face-meta-pro-normal is-narrow custom-checkbox">
              <input type="checkbox" v-model="policyCheckboxChecked" id="policy" class="ion-margin-right" />
              <span class="label-text">Die Datenschutzerklärung habe ich zur Kenntnis genommen.</span>
              <span class="checkmark"></span>
            </label>
            <div v-if="showErrorPolicy && !policyCheckboxChecked" class="input-error is-narrow ion-margin-bottom">Sie müssen die Datenschutzerklärung akzeptieren.</div>
            <span @click="isOpen = !isOpen"><u>Zur Datenschutzerklärung</u></span>
          </div>
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
        <div class="input-error is-narrow ion-margin-bottom" v-if="error">Fehler beim Registrieren. Benutzer vegeben oder E-Mail nicht korrekt.</div>
        <ion-button @click="doRegister" color="primary" :disabled="!policyCheckboxChecked">Kostenlos registrieren</ion-button>
        <div class="ion-margin"><ion-nav-link routerLink="/login">Zum Login</ion-nav-link></div>
      </div>

      <div v-else class="ion-padding has-font-face-meta-pro-normal is-narrow">
        <div class="headline-manrope">Registrierung erfolgreich</div><br />
        Bitte schau in Dein E-Mail Postfach. Wir haben Dir ein temporäres Passwort zum Anmelden geschickt.
        <ion-button routerLink="/login" expand="full" class="cta ion-margin-top">Zum Login</ion-button>
      </div>
    </div>
    <ion-loading
      :is-open="registerInProgress"
      message="Registrieren…"
    />
  </LoginLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonButton, IonLoading, toastController, onIonViewWillEnter, IonModal, IonTitle, IonInput, IonNavLink } from '@ionic/vue'
import { usePublicApi } from '@/composables/api/public'
import { ResultStatus } from '@/types/serverCallResult'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import LoginLayout from '@/components/general/LoginLayout.vue'
export default defineComponent({
name: 'LoginPage',
components: { LoginLayout, PrivacyPolicy, IonButton, IonLoading, IonModal, IonTitle, IonInput, IonNavLink },
setup() {

  const router = useRouter()
  const publicApi = usePublicApi()

  const lastPage = ref(null)

  const modalOpen = ref(false)
  const isOpen = ref(false)
  const policyCheckboxChecked = ref(false)
  const showErrorPolicy = ref(false)

  const item = ref({email: '', firstname: '', lastname: ''})
  const registerInProgress = ref(false)
  const registerSuccessful = ref(false)
  const error = ref(false)

  const doRegister = async () => {
    registerInProgress.value = true

    // TODO: outsource in ENV
    // this is the public register token for Landkreis St. Wendel Org
    publicApi.call('post', `/users/register/hsvW7eyxvuaRZ25LJaPRMp7TgYGK5dDMyHUB`, item.value).then(result => {
      if (result.status === ResultStatus.SUCCESSFUL) {
        localStorage.setItem('junghans_login_email', item.value.email)
        registerSuccessful.value = true
        error.value = false
        showErrorPolicy.value = false
      }
      else {
        showErrorPolicy.value = true
        error.value = true
        showRegisterFailed()
      }
      registerInProgress.value = false
    })
  }

  const showErrorPolicyMessage = () => {
    showErrorPolicy.value = !showErrorPolicy.value
  }

  const showRegisterFailed = async () => {
    const toast = await toastController
      .create({
        message: 'Registrierung fehlgeschlagen',
        duration: 2000
      })
    return toast.present()
  }

  onIonViewWillEnter(() => {
    lastPage.value = router.options.history.state.back
    registerSuccessful.value = false
  })

  return {
    item,
    registerInProgress,
    doRegister,
    router,
    registerSuccessful,
    error,
    modalOpen,
    isOpen,
    policyCheckboxChecked,
    showErrorPolicy,
    showErrorPolicyMessage
  }
}
})
</script>

<style lang="sass" scoped>
.logo
  width: 70%
  margin-top: 20px
.policy
  margin: 10px 0
  input
    margin-right: 10px
</style>
