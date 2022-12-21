<template>
  <base-layout>
    <ion-toolbar>
      <span @click="view = 'list'">Liste</span> | <span @click="view = 'map'">Karte</span>
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
import { IonContent, IonToolbar } from '@ionic/vue'
import ProjectList from '@/components/participation/ProjectList.vue'
import ProjectMap from '@/components/participation/ProjectMap.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
export default defineComponent({
  components: { BaseLayout, IonContent, IonToolbar, ProjectList, ProjectMap },
  setup () {
    const view = ref('list')

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
</style>