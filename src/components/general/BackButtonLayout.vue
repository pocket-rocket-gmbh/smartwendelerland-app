<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="" default-href="/" :icon="arrowBackOutline" />
        </ion-buttons>
        <ion-icon v-if="userStore.user === null" @click="router.push('/login')" router-link="/login" :ios="logInOutline" :md="logInSharp" slot="end"></ion-icon>
        <img v-else  @click="router.push('/me')" router-link="/me" src="@/assets/images/user-standard.png" slot="end" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonBackButton, IonButtons } from '@ionic/vue'
import { logInOutline, logInSharp, personCircleOutline, personCircleSharp, arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'BaseLayout',
  components: { IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonBackButton, IonButtons },
  setup () {

    const router = useRouter()
    const userStore = useUserStore()

    return {
      logInOutline,
      logInSharp,
      personCircleOutline,
      personCircleSharp,
      router,
      userStore,
      arrowBackOutline
    }
  }
})
</script>

<style scoped>
.logo {
  height: 40px;
  margin-left: 10px;
}
ion-icon {
  font-size: 32px;
  padding-right: 20px;
}
</style>