<template>
  <BaseLayout>
    <div class="ion-padding">
      <ion-nav-link routerLink="/participation">
        <div class="box">
          <img src="@/assets/images/participation.png" class="has-drop-shadow has-border-radius-large is-fullwidth" />
          <div class="box-headline">Bürgerbeteiligung</div>
        </div>
      </ion-nav-link>
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { IonNavLink } from '@ionic/vue'
import { accessibilityOutline, accessibilitySharp } from 'ionicons/icons'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import BaseLayout from '@/components/general/BaseLayout.vue'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IonNavLink },
  setup() {

    const columnCountPortrait = 3
    const columnCountLandscape = 6

    const items = [
      {
        name: 'Bürgerbeteiligung',
        link: '/participation',
        iosIcon: accessibilityOutline,
        mdIcon: accessibilitySharp
      },
    ]

    const windowwidth = ref(window.innerWidth)
    const isLandscape = ref(false)

    onMounted(() => {
      updateOrientation()

      ScreenOrientation.onChange().subscribe(() => {
        updateOrientation()
      })

      window.onresize = () => {
        windowwidth.value = window.innerWidth
      }
    })

    function updateOrientation() {
      isLandscape.value = ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE || ScreenOrientation.type == ScreenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY
    }

    const rowCount = computed(() => {
      return Math.ceil(items.length / columnCount.value)
    })

    const columnCount = computed(() => {
      return isLandscape.value ? columnCountLandscape : columnCountPortrait
    })

    const padding = computed(() => {
      const result = (windowwidth.value - (buttonSizeNumeric.value * columnCount.value)) / paddingCount.value - 2 + 'px' // 2 pixel per padding removed to account for window border.
      return result
    })

    // Each button has left and right padding and the grid itself has left and right padding.
    const paddingCount = computed(() => {
      return columnCount.value * 2 + 2
    })

    const iconsize = computed(() => {
      return buttonSizeNumeric.value / 2 + 'px'
    })

    const buttonsize = computed(() => {
      return buttonSizeNumeric.value + 'px'
    })

    const buttonSizeNumeric = computed(() => {
      return windowwidth.value / (columnCount.value + columnCount.value / 3)
    })

    return {
      items,
      rowCount,
      columnCount,
      padding,
      buttonsize,
      iconsize
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

</style>
