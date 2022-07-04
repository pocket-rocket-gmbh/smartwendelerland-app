<template>
  <base-layout>
    <ion-grid>
      <ion-row v-for="(row, rowIndex) in rowCount" :key="rowIndex">
        <ion-col v-for="(column, columnIndex) in columnCount" :key="columnIndex">
          <template v-if="items[rowIndex * columnCount + columnIndex] !== undefined">
            <ion-button :router-link="items[rowIndex * columnCount + columnIndex].link">
              <ion-icon :ios="items[rowIndex * columnCount + columnIndex].iosIcon" :md="items[rowIndex * columnCount + columnIndex].mdIcon"/>
            </ion-button>
            <div class="label">{{ items[rowIndex * columnCount + columnIndex].name }}</div>
          </template>
        </ion-col>        
      </ion-row>      
    </ion-grid>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { IonGrid, IonRow, IonCol, IonButton, IonIcon, } from '@ionic/vue'
import { accessibilityOutline, accessibilitySharp, logInOutline, logInSharp, constructOutline, constructSharp } from 'ionicons/icons'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation'
import BaseLayout from '@/components/general/BaseLayout.vue'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IonGrid, IonRow, IonCol, IonButton, IonIcon },
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
      {
        name: 'Login Test',
        link: '/login',
        iosIcon: logInOutline,
        mdIcon: logInSharp
      },
      {
        name: 'Placeholder',
        link: '/',
        iosIcon: constructOutline,
        mdIcon: constructSharp
      },
      {
        name: 'Placeholder',
        link: '/',
        iosIcon: constructOutline,
        mdIcon: constructSharp
      }
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

<style scoped>
ion-grid {
  --ion-grid-padding: v-bind('padding');
}

ion-col {
  --ion-grid-column-padding: v-bind('padding');
}

ion-button {
  width: v-bind('buttonsize');
  height: v-bind('buttonsize');
}

ion-icon {
  font-size: v-bind('iconsize');
}

div.label {
  padding-top: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: v-bind('buttonsize');
}
</style>
