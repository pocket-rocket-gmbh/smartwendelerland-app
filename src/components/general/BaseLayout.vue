<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <img @click="$router.push({ path: '/' })" src="@/assets/images/logo.png" class="logo" slot="start" />
        <ion-icon
          v-if="!useUser().loggedIn() && projekRoute"
          @click="router.push('/login')"
          router-link="/login"
          slot="end"
        ></ion-icon>
        <div
          v-else-if="projekRoute"
          @click="router.push('/me')"
          router-link="/me"
          slot="end"
        >
          <UserProfile :user="useUser().currentUser()" />
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonIcon, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import UserProfile from '@/components/UserProfile.vue'
import { useUser } from '@/composables/user/user'

const router = useRouter()
const route = router.currentRoute

const projekRoute = computed(() => {
  if (route.value.path.includes('participation')) {
    return true
  }
  return false;
});
</script>

<style lang="sass" scoped>
.logo
  width: 100px
  margin-left: 10px
ion-icon
  font-size: 32px
  padding-right: 20px

ion-toolbar 
  --border-width: 4px 0
  --border-style: double
  --min-height: 80px
</style>