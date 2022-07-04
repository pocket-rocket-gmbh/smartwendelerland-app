<template>
  <base-layout>
    <ion-grid>
      <ion-row>
        <ion-col><ion-button router-link="/participation"><ion-icon :ios="accessibilityOutline" :md="accessibilitySharp"/></ion-button></ion-col>
        <ion-col><ion-button router-link="/login"><ion-icon :ios="logInOutline" :md="logInSharp"/></ion-button></ion-col>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
      </ion-row>
      <ion-row>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
      </ion-row>
      <ion-row>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
        <ion-col><ion-button><ion-icon :ios="constructOutline" :md="constructSharp"/></ion-button></ion-col>
      </ion-row>
    </ion-grid>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { IonGrid, IonRow, IonCol, IonButton, IonIcon, onIonViewDidEnter } from '@ionic/vue'
import { accessibilityOutline, accessibilitySharp, logInOutline, logInSharp, constructOutline, constructSharp } from 'ionicons/icons'
import BaseLayout from '@/components/general/BaseLayout.vue'

export default defineComponent({
  name: 'LandingPage',
  components: { BaseLayout, IonGrid, IonRow, IonCol, IonButton, IonIcon },
  setup() {

    const windowwidth = ref(window.innerWidth)

    onIonViewDidEnter(() => {
      window.onresize = () => {
        windowwidth.value = window.innerWidth
      }
    })

    const padding = computed(() => {
      return windowwidth.value * 0.025 + 'px'
    })

    const iconsize = computed(() => {
      return windowwidth.value * 0.125 + 'px'
    })

    const buttonsize = computed(() => {
      return windowwidth.value * 0.25 + 'px'
    })

    return {
      accessibilityOutline,
      accessibilitySharp,
      logInOutline,
      logInSharp,
      constructOutline,
      constructSharp,
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
</style>
