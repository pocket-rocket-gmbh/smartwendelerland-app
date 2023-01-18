<template>
  <ion-app>
    <div v-if="appState.isAppLoading" class="vertical-center">
      <div class="center">
        <ion-spinner />
        <div>{{ Math.round(appState.appLoadingProgress * 100) }} %</div>
      </div>
    </div>
    <ion-router-outlet v-else />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonSpinner, IonRouterOutlet, onIonViewWillEnter } from '@ionic/vue'
import { defineComponent, onMounted } from 'vue'
import { usePollStore } from '@/stores/poll'
import { useAppStateStore } from '@/stores/appState'
import { useMe } from '@/composables/user/me'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonSpinner,
    IonRouterOutlet
  },
  setup() {

    const appState = useAppStateStore()
    const router = useRouter()

    onMounted(async () => {
      const projektplattformTutorialSkipped = localStorage.getItem('projektplattform_tutorial_skipped')
      if (projektplattformTutorialSkipped) {
        if (projektplattformTutorialSkipped === 'true') {
          router.push({ path: '/participation/projects'})
        }
      }
      console.log('Loading App...')
      const startTime = Date.now()

      await useMe().fetchMyUser()
      useAppStateStore().setAppLoadingProgress(0.5)
      await usePollStore().setPublicPoll()
      useAppStateStore().setAppLoadingProgress(1.0)
      console.log('App loaded - duration: ' + (Date.now() - startTime) + ' ms')
      useAppStateStore().setAppLoading(false)

      
    })

    return {
      appState
    }
  }
})
</script>

<style scoped lang="sass">
.vertical-center
  display: flex
  align-items: center
  justify-content: center
  height: 100%
</style>