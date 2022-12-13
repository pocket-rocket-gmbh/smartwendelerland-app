<template>
  <BaseLayout>
    <ion-grid>
      <ion-row class="ion-justify-content-center">
        <ion-col size-sm="12" size-md="6" size-lg="3">
          <div class="ion-padding">
            <ion-nav-link routerLink="/participation">
              <div class="box">
                <img src="@/assets/images/participation.png" class="has-drop-shadow has-border-radius-large is-fullwidth" />
                <div class="box-headline">Bürgerplattform</div>
              </div>
            </ion-nav-link>

            <PollsBox
              :is-public="true"
            />
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { IonNavLink, IonGrid, IonRow, IonCol } from '@ionic/vue'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import BaseLayout from '@/components/general/BaseLayout.vue'
import PollsBox from '@/components/polls/PollsBox.vue'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IonNavLink, IonGrid, IonRow, IonCol, PollsBox },
  setup() {
    const windowwidth = ref(window.innerWidth)
    const isLandscape = ref(false)

    const updateOrientation = () => {
      isLandscape.value = ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE || ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY
    }

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
