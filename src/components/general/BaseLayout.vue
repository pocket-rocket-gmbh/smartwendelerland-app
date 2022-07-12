<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <img @click="$router.push({path: `/`})" src="@/assets/images/logo.png" class="logo" slot="start"/>
        <ion-icon v-if="userStore.user === null" @click="router.push('/login')" router-link="/login" :ios="logInOutline" :md="logInSharp" slot="end"></ion-icon>
        <ion-icon v-else  @click="router.push('/me')" router-link="/me" :ios="personCircleOutline" :md="personCircleSharp" slot="end"></ion-icon>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent } from '@ionic/vue'
import { logInOutline, logInSharp, personCircleOutline, personCircleSharp } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'BaseLayout',
  components: { IonPage, IonHeader, IonToolbar, IonIcon, IonContent },
  setup () {

    const router = useRouter()
    const userStore = useUserStore()

    return {
      logInOutline,
      logInSharp,
      personCircleOutline,
      personCircleSharp,
      router,
      userStore
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