<template>
  <BaseLayout>
    <IntroTutorial />
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

import IntroTutorial from '@/components/participation/IntroTutorial.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import { onIonViewDidEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IntroTutorial },
  setup() {
    const windowwidth = ref(window.innerWidth)
    const isLandscape = ref(false)
    const router = useRouter()

    const updateOrientation = () => {
      isLandscape.value = ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE || ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY
    }

    onIonViewDidEnter(() => {
      const projektplattformTutorialSkipped = localStorage.getItem('projektplattform_tutorial_skipped')
      if (projektplattformTutorialSkipped) {
        if (projektplattformTutorialSkipped === 'true') {
          router.push({ path: '/participation/projects'})
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
  }
})
</script>

<style lang="sass" scoped>

</style>
