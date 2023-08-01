<template>
  <BaseLayout>
    Platzhalter Tutorial
    <ion-nav-link routerLink="/health/categories">
      Weiter
    </ion-nav-link>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

import { IonNavLink } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import { onIonViewDidEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useFilterStore } from '@/stores/health/searchFilter'

const windowwidth = ref(window.innerWidth)
const isLandscape = ref(false)
const router = useRouter()
const filterStore = useFilterStore()

const updateOrientation = () => {
  isLandscape.value = ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE || ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY
}

onIonViewDidEnter(() => {
  const projektplattformTutorialSkipped = localStorage.getItem('gesundheitsplattform_tutorial_skipped')
  if (projektplattformTutorialSkipped) {
    if (projektplattformTutorialSkipped === 'true') {
      router.push({ path: '/health'})
    }
  }
})

onMounted(() => {
  updateOrientation()

  ScreenOrientation.onChange().subscribe(() => {
    updateOrientation()
  })

  window.onresize = () => {
    windowwidth.value = window.innerWidth
  }
})
</script>

<style lang="sass" scoped>

</style>
