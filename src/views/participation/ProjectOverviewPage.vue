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
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="gap-1" />
      <ProjectList
        v-show="view === 'list'"
        :key="projectListKey"
      />
      <ProjectMap
        v-if="view === 'map'"
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, computed, ref, } from 'vue'
import { IonContent, IonToolbar, IonNavLink } from '@ionic/vue'
import ProjectList from '@/components/participation/ProjectList.vue'
import ProjectMap from '@/components/participation/ProjectMap.vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { useRouter, } from 'vue-router'
import { useUser } from '@/composables/user/user'
export default defineComponent({
  components: { BaseLayout, IonContent, IonToolbar, ProjectList, ProjectMap, IonNavLink },
  setup () {
    const router = useRouter()
    const projectListKey = ref(0)

    // needed because list does not refresh if coming from me page
    router.beforeEach((to, from, next) => {
      if (from.path === '/me') {
        projectListKey.value += 1
      }
      next()
      return false
    })

    const view = computed(() => {
      if (router.currentRoute.value.query.view === 'map') {
        return 'map'
      } else {
        return 'list'
      }
    })

    return {
      view,
      projectListKey
    }
  }
})
</script>

<style lang="sass" scoped>
ion-toolbar
  --background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  text-align: center
  color: white
  position: fixed
.toggle-button
  border: 1px solid white
  padding: 1px 8px
  margin: 0 10px
  border-radius: 5px
  opacity: 0.5
  &.is-active
    opacity: 1
</style>