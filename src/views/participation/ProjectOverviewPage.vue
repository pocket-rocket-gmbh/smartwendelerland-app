<template>
  <base-layout>
    <ion-toolbar>
      <span @click="view = 'list'" :class="['toggle-button', {'is-active' : view === 'list'}]">Liste</span>
      <span @click="view = 'map'" :class="['toggle-button', {'is-active' : view === 'map'}]">Karte</span>
    </ion-toolbar>
    <ion-content :fullscreen="true">
      <project-list
        v-show="view === 'list'"
      />
      <project-map
        :show-modal="view === 'map'"
        v-show="view === 'map'"
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonContent, IonToolbar, onIonViewWillLeave } from '@ionic/vue'
import ProjectList from '@/components/participation/ProjectList.vue'
import ProjectMap from '@/components/participation/ProjectMap.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
export default defineComponent({
  components: { BaseLayout, IonContent, IonToolbar, ProjectList, ProjectMap },
  setup () {
    const view = ref('list')

    onIonViewWillLeave(() => {
      view.value = 'list'
    });

    return {
      view
    }
  }
})
</script>

<style lang="sass" scoped>
ion-toolbar
  --background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  text-align: center
  color: white
.toggle-button
  border: 1px solid white
  padding: 1px 8px
  margin: 0 10px
  border-radius: 5px
  opacity: 0.5
  &.is-active
    opacity: 1
</style>