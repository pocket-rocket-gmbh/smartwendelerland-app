<template>
  <base-layout>
    <ion-toolbar>
      <ion-nav-link routerLink="/participation/projects">
        <span :class="['toggle-button', {'is-active' : view === 'list'}]">Liste</span>
      </ion-nav-link>

      <ion-nav-link routerLink="/participation/projects?view=map">
        <span :class="['toggle-button', {'is-active' : view === 'map'}]">Karte</span>
      </ion-nav-link>
    </ion-toolbar>
    <ion-content :fullscreen="true">
      <ProjectList
        v-show="view === 'list'"
      />
      <ProjectMap
        :show-modal="view === 'map'"
        v-show="view === 'map'"
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { IonContent, IonToolbar, onIonViewWillLeave, IonNavLink } from '@ionic/vue'
import ProjectList from '@/components/participation/ProjectList.vue'
import ProjectMap from '@/components/participation/ProjectMap.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: { BaseLayout, IonContent, IonToolbar, ProjectList, ProjectMap, IonNavLink },
  setup () {
    const router = useRouter()

    const view = computed(() => {
      if (router.currentRoute.value.query.view === 'map') {
        return 'map'
      } else {
        return 'list'
      }
    })

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