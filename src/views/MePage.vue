<template>
  <BackButtonLayout>
    <ion-accordion-group>
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
      <ion-accordion value="fifth" toggleIcon="">
        <ion-item slot="header" color="light" @click="logout">
          <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
          <ion-label>Logout</ion-label>
        </ion-item>
      </ion-accordion>
    </ion-accordion-group>
  </BackButtonLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonLabel, onIonViewWillEnter, IonItem, IonAccordionGroup, IonAccordion, IonIcon, onIonViewDidEnter } from '@ionic/vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import { useUserStore } from '@/stores/user'
import { person, pencil, easelOutline, trophy, logOutOutline } from 'ionicons/icons'
import PersonalData from '@/components/me/PersonalData.vue'
import TrophiesMain from '@/components/trophies/TrophiesMain.vue'
import PlatformRules from '@/components/me/PlatformRules.vue'

export default defineComponent({
  name: 'MePage',
  components: { BackButtonLayout, IonLabel, IonItem, IonAccordionGroup, IonAccordion, PersonalData, IonIcon, TrophiesMain, PlatformRules },
  setup() {

    const router = useRouter()
    const userStore = useUserStore()
    const trophiesKey = ref(1)

    onIonViewWillEnter(() => {
      if (userStore.user === null) {
        router.push('/login')
      }
    }) 

    // We only remove the local JWT/user to prevent logout from wiiir-frontend.
    const logout = () => {
      localStorage.removeItem('auth._token.jwt')
      userStore.user = null
      router.push('/participation/projects')
    }

    const showTutorial = () => {
      localStorage.removeItem('projektplattform_tutorial_skipped')
      router.push('/')
    }

    onIonViewDidEnter(() => {
      trophiesKey.value += 1
    })

    return {
      userStore,
      logout,
      showTutorial,
      person,
      pencil,
      easelOutline,
      trophy,
      logOutOutline,
      trophiesKey
    }
  }
})
</script>

<style lang="sass" scoped>
</style>