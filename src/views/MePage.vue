<template>
  <base-layout>
    <ion-grid>
      <ion-row>
        <ion-col>
          <ion-label class="headline">Ihre Daten</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-label>Vorname:</ion-label>
        </ion-col>
        <ion-col>
          <ion-label>{{ userStore.user?.firstname }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-label>Nachname:</ion-label>
        </ion-col>
        <ion-col>
          <ion-label>{{ userStore.user?.lastname }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-label>E-Mail:</ion-label>
        </ion-col>
        <ion-col>
          <ion-label>{{ userStore.user?.email }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-label>Landkreis:</ion-label>
        </ion-col>
        <ion-col>
          <ion-label>{{ userStore.user?.organization.name }}</ion-label>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button @click="logout">Abmelden</ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { IonGrid, IonRow, IonCol, IonLabel, IonButton, onIonViewWillEnter } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'MePage',
  components: { BaseLayout, IonGrid, IonRow, IonCol, IonLabel, IonButton },
  setup() {

    const router = useRouter()
    const userStore = useUserStore()

    onIonViewWillEnter(() => {
      if (userStore.user === null) {
        router.push('/login')
      }
    }) 

    // We only remove the local JWT/user to prevent logout from wiiir-frontend.
    const logout = () => {
      localStorage.removeItem('auth._token.jwt')
      userStore.user = null
      router.push('/')
    }

    return {
      userStore,
      logout
    }
  }
})
</script>

<style scoped>
.headline {
  font-size: 1.5em;
}
</style>