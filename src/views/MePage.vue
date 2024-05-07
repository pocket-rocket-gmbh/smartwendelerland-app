<template>
  <BackButtonLayout v-if="useUser().currentUser()" :is-project="true" title="Mein Konto" force-back="/participation/projects/">
    <ion-accordion-group class="ion-margin-top">
      <ion-accordion value="first">
        <ion-item slot="header" color="light">
          <ion-icon :icon="person" slot="start"></ion-icon>
          <ion-label>Persönliche Daten</ion-label>
        </ion-item>
        <div class="ion-padding" slot="content">
          <PersonalData />
        </div>
      </ion-accordion>
      <ion-accordion value="second">
        <ion-item slot="header" color="light">
          <ion-icon :icon="pencil" slot="start"></ion-icon>
          <ion-label>Regeln</ion-label>
        </ion-item>
        <div class="ion-padding" slot="content">
          <PlatformRules />
        </div>
      </ion-accordion>
      <ion-accordion value="third">
        <ion-item slot="header" color="light">
          <ion-icon :icon="trophy" slot="start"></ion-icon>
          <ion-label>Erfolge</ion-label>
        </ion-item>
        <div class="ion-padding" slot="content">
          <TrophiesMain
            :key="trophiesKey"
          />
        </div>
      </ion-accordion>
      <ion-accordion value="fourth" toggleIcon="">
        <ion-item slot="header" color="light" @click="showTutorial">
          <ion-icon :icon="easelOutline" slot="start"></ion-icon>
          <ion-label>Tutorial</ion-label>
        </ion-item>
      </ion-accordion>
      <ion-accordion value="fifth" toggleIcon="" v-if="useUser().isAdmin() && useEnvStore().env === 'production'">
        <ion-item slot="header" color="light" @click="toggleEnv">
          <ion-icon :icon="cogOutline" slot="start"></ion-icon>
          <ion-label>
            Zum Testsystem wechseln
          </ion-label>
        </ion-item>
      </ion-accordion>
      <ion-accordion value="sixth" toggleIcon="">
        <ion-item slot="header" color="light" @click="logout">
          <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
          <ion-label>Logout</ion-label>
        </ion-item>
      </ion-accordion>
    </ion-accordion-group>
    <div class="ion-padding"><PinboardBox /></div>
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonLabel, onIonViewWillEnter, IonItem, IonAccordionGroup, IonAccordion, IonIcon, onIonViewDidEnter } from '@ionic/vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import { useUserStore } from '@/stores/user'
import { person, pencil, easelOutline, trophy, logOutOutline, cogOutline } from 'ionicons/icons'
import PersonalData from '@/components/me/PersonalData.vue'
import TrophiesMain from '@/components/trophies/TrophiesMain.vue'
import PlatformRules from '@/components/me/PlatformRules.vue'
import PinboardBox from '@/components/pinboards/PinboardBox.vue'
import { useUser } from '@/composables/user/user'
import { useEnvStore } from '@/stores/env'

const router = useRouter()
const userStore = useUserStore()
const trophiesKey = ref(1)
const envStore = useEnvStore()

onIonViewWillEnter(() => {
  if (userStore.user === null) {
    router.push('/login')
  }
}) 

// We only remove the local JWT/user to prevent logout from wiiir-frontend.
const logout = () => {
  console.log("logout")
  localStorage.removeItem('auth._token.jwt')
  userStore.user = null
  userStore.$patch({
    user: null
  })
  router.push('/participation/projects')
}

const showTutorial = () => {
  localStorage.removeItem('projektplattform_tutorial_skipped')
  router.push('/')
}

const toggleEnv = () => {
  localStorage.setItem('smawela--env', 'staging')
  window.location.reload()
}

onIonViewDidEnter(() => {
  trophiesKey.value += 1
})
</script>

<style lang="sass" scoped>
</style>