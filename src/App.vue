<template>
  <ion-app>
    <div v-if="appState.isAppLoading" class="vertical-center">
      <div class="center">
        <ion-spinner />
        <div>{{ Math.round(appState.appLoadingProgress * 100) }} %</div>
      </div>
    </div>
    <ion-router-outlet v-else />
    <div class="staging-batch" v-if="isStaging" @click="toggleEnv">Testsystem verlassen</div>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonSpinner, IonRouterOutlet } from '@ionic/vue'
import { computed, onMounted } from 'vue'
import { usePollStore } from '@/stores/poll'
import { useAppStateStore } from '@/stores/appState'
import { useMe } from '@/composables/user/me'
import { useEnvStore } from './stores/env'
import { useFilterStore } from '@/stores/health/searchFilter'

const appState = useAppStateStore()

const isStaging = computed(() => {
  return useEnvStore().env === 'staging'
})

const toggleEnv = () => {
  localStorage.removeItem('smawela--env')
  window.location.reload()
}

onMounted(async () => {
  console.log('Loading App...')
  const startTime = Date.now()

  await useMe().fetchMyUser()
  useAppStateStore().setAppLoadingProgress(0.3)
  await usePollStore().setPublicPoll()
  
  // trigger load filters for health scope
  await useFilterStore().getMainFilters('filter_facility', 'facility')
  useAppStateStore().setAppLoadingProgress(0.75)
  await useFilterStore().getItems('facility')
  useAppStateStore().setAppLoadingProgress(0.90)
  await useFilterStore().loadAllResults();
  useAppStateStore().setAppLoadingProgress(1.0)
  console.log('App loaded - duration: ' + (Date.now() - startTime) + ' ms')
  useAppStateStore().setAppLoading(false)
})
</script>

<style scoped lang="sass">
.vertical-center
  display: flex
  align-items: center
  justify-content: center
  height: 100%
.staging-batch
  position: fixed
  bottom: 20px
  right: 20px
  background: orange
  color: white
  border-radius: 20px
  font-size: 20px
  padding: 10px
</style>