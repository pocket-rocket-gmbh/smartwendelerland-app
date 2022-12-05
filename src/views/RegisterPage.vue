<template>
  <ion-page class="main">
    <ion-content>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size-sm="12" size-md="6" size-lg="3">
            <ion-card>
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

                  <div class="policy">
                    <label for="policy" class="ion-padding has-font-face-meta-pro-normal is-narrow custom-checkbox">
                      <input type="checkbox" v-model="policyCheckboxChecked" id="policy" class="ion-margin-right" />
                      <span class="label-text">Die <span @click="isOpen = !isOpen"><u>Datenschutzerklärung</u></span> habe ich zur Kenntnis genommen.</span>
                      <span class="checkmark"></span>
                    </label>
                    <div v-if="showErrorPolicy && !policyCheckboxChecked" class="input-error is-narrow ion-margin-bottom">Sie müssen die Datenschutzerklärung akzeptieren.</div>
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
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-loading
        :is-open="registerInProgress"
        message="Registrieren…"
      />
        
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonButton, IonLoading, toastController, onIonViewWillEnter, IonModal, IonTitle, IonInput, IonNavLink } from '@ionic/vue'
import { usePublicApi } from '@/composables/api/public'
import { ResultStatus } from '@/types/serverCallResult'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'

export default defineComponent({
name: 'LoginPage',
components: { PrivacyPolicy, IonPage, IonContent, IonButton, IonLoading, IonModal, IonTitle, IonInput, IonNavLink },
setup() {

  const router = useRouter()
  const publicApi = usePublicApi()

  const lastPage = ref(null)

  const modalOpen = ref(false)
  const isOpen = ref(false)
  const policyCheckboxChecked = ref(false)
  const showErrorPolicy = ref(false)

  const item = ref({email: '', firstname: '', lastname: '', role: 'admin', never_expire: true})
  const registerInProgress = ref(false)
  const registerSuccessful = ref(false)
  const error = ref(false)

  const doRegister = async () => {
    registerInProgress.value = true

    // TODO: outsource in ENV
    // this is the public register token for Landkreis St. Wendel Org
    publicApi.call('post', `/users/register/LkQ7fagZR4eHTiTDqMYpS9ozZTSWrspKUZMR`, item.value).then(result => {
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
.policy
  margin: 10px 0
  input
    margin-right: 10px
</style>
