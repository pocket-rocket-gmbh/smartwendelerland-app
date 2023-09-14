<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <img @click="$router.push({path: `/`})" src="@/assets/images/logo.png" class="logo" slot="start"/>
        <ion-icon v-if="!useUser().loggedIn()" @click="router.push('/login')" router-link="/login" :ios="logInOutline" :md="logInSharp" slot="end"></ion-icon>
        <div v-else @click="router.push('/me')" router-link="/me" slot="end">
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
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent } from '@ionic/vue'
import { logInOutline, logInSharp, personCircleOutline, personCircleSharp } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import UserProfile from '@/components/UserProfile.vue'
import { useUser } from '@/composables/user/user'

const router = useRouter()

</script>

<style lang="sass" scoped>
.logo
  width: 80px
  margin-left: 10px
ion-icon
  font-size: 32px
  padding-right: 20px
</style>