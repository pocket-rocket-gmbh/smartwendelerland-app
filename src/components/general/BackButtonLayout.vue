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
        <ion-icon v-if="!useUser().loggedIn() && showLogin" @click="router.push('/login')" router-link="/login" :ios="logInOutline" :md="logInSharp" slot="end"></ion-icon>
        <div v-else-if="showLogin" @click="router.push('/me')" router-link="/me" slot="end">
          <UserProfile
            :user="useUser().currentUser()"
          />
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent, IonBackButton, IonButtons, IonNavLink } from '@ionic/vue'
import { logInOutline, logInSharp, personCircleOutline, personCircleSharp, arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/user/user'
import UserProfile from '@/components/UserProfile.vue'

const props = defineProps({
  forceBack: {
    type: String
  },
  showLogin: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

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