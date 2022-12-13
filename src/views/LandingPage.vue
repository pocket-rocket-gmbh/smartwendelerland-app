<template>
  <BaseLayout>
    <ion-grid>
      <ion-row class="ion-justify-content-center">
        <ion-col size-sm="12" size-md="6" size-lg="3">
          <div class="ion-padding">
            <ion-nav-link routerLink="/participation">
              <div class="box">
                <img src="@/assets/images/participation.png" class="has-drop-shadow has-border-radius-large is-fullwidth" />
                <div class="box-headline">Bürgerbeteiligung</div>
              </div>
            </ion-nav-link>

            <ion-nav-link :routerLink="pollLink">
              <div class="box">
                <img src="@/assets/images/poll-teaser.svg" class="has-drop-shadow is-fullwidth" />
                <div class="box-headline-right">
                  <span v-if="useUser().loggedIn()">Sag uns Deine Meinung!<br/>Zur aktuellen Umfrage</span>
                  <span v-else>Jetzt anmelden um an<br/>Umfragen teilzunehmen</span>
                </div>
              </div>
            </ion-nav-link>
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
import { useUser } from '@/composables/user/user'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePollStore } from '@/stores/poll'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IonNavLink, IonGrid, IonRow, IonCol },
  setup() {
    const windowwidth = ref(window.innerWidth)
    const isLandscape = ref(false)
    const publicPoll = usePollStore().publicPoll

    const pollLink = computed(() => {
      if (useUser().loggedIn() && publicPoll) {
        return `/polls/${publicPoll.id}`
      } else {
        return '/login'
      }
    })

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

    return {
      useUser,
      pollLink
    }
  }
})
</script>

<style lang="sass" scoped>
.box
  position: relative
  text-align: center
  .box-headline
    position: absolute
    color: white
    bottom: 10px
    left: 50%
    font-size: 25px
    letter-spacing: 0.09em
    text-transform: uppercase
    font-weight: 500
    transform: translateX(-50%) translateY(-50%)

  .box-headline-right
    position: absolute
    color: white
    right: 3%
    bottom: 21%
    font-size: 17px
    letter-spacing: 0.09em
    text-transform: uppercase
    transform: translateY(-50%)
</style>
