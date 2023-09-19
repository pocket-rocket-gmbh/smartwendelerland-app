<template>
  <BaseLayout>
    <ion-grid>
      <ion-row class="ion-justify-content-center">
        <ion-col size-sm="12" size-md="6" size-lg="3">
          <ion-nav-link routerLink="/landing/participation">
            <div class="pile has-background-project" align="center">
              <img src="@/assets/images/panel_project.svg" alt="project" />
              <div class="headline">Projekt- plattform</div>
            </div>
          </ion-nav-link>
        </ion-col>
      </ion-row>
      <ion-row class="ion-justify-content-center">
        <ion-col size-sm="12" size-md="6" size-lg="3">
          <ion-nav-link routerLink="/health/categories">
            <div class="pile has-background-health" align="center">
              <img src="@/assets/images/panel_health.svg" alt="health" />
              <div class="headline">Gesundheits- plattform</div>
            </div>
          </ion-nav-link>
        </ion-col>
      </ion-row>
    </ion-grid>
  </BaseLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

import { IonGrid, IonRow, IonCol, IonNavLink } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import { useRouter } from 'vue-router'

const windowwidth = ref(window.innerWidth)
const isLandscape = ref(false)
const router = useRouter()

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
</script>

<style lang="sass" scoped>
.pile
  width: 80%
  padding: 20px
  border-radius: 20px
  margin: 0 auto
  position: relative

  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

  font-size: 35px
  font-style: normal
  line-height: 35px
  letter-spacing: 2.25px
  text-transform: uppercase

  .headline
    text-transform: uppercase
    color: white
    text-align: center
    margin-top: 20px
</style>
