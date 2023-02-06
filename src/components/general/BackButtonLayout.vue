<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-nav-link v-if="forceBack" :routerLink="forceBack">
            <IonIcon :icon="arrowBackOutline" />
          </ion-nav-link>
          <ion-back-button v-else text="" default-href="/" :icon="arrowBackOutline" />
        </ion-buttons>
        <ion-icon v-if="userStore.user === null" @click="router.push('/login')" router-link="/login" :ios="logInOutline" :md="logInSharp" slot="end"></ion-icon>
        <div v-else @click="router.push('/me')" router-link="/me" slot="end">
          <UserProfile
            :user="userStore.user"
          />
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonBackButton, IonButtons, IonNavLink } from '@ionic/vue'
import { logInOutline, logInSharp, personCircleOutline, personCircleSharp, arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserProfile from '@/components/UserProfile.vue'

export default defineComponent({
  name: 'BaseLayout',
  props: {
    forceBack: String
  },
  components: { IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonBackButton, IonButtons, UserProfile, IonNavLink },
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