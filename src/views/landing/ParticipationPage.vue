<template>
  <BaseLayout>
    <IntroTutorial />
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

import IntroTutorial from '@/components/participation/IntroTutorial.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { onIonViewDidEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IntroTutorial },
  setup() {
    const router = useRouter()

    onIonViewDidEnter(() => {
      const projektplattformTutorialSkipped = localStorage.getItem('projektplattform_tutorial_skipped')
      if (projektplattformTutorialSkipped) {
        if (projektplattformTutorialSkipped === 'true') {
          router.push({ path: '/participation/projects'})
        }
      }
    })
  }
})
</script>

<style lang="sass" scoped>

</style>
