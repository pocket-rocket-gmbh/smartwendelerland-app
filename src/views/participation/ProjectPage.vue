<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="project">{{ project.name }}</div>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekt wird geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonContent, IonRefresher, IonRefresherContent, IonLoading, onIonViewWillEnter, RefresherCustomEvent } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonLoading },
  setup() {

    const route = useRoute()
    const publicApi = usePublicApi()
    const api = useCollectionApi()
    api.setBaseApi(publicApi)
    api.setEndpoint('projects')

    const project = api.item

    const loadingInProgress = ref(false)

    onIonViewWillEnter(() => {
      loadProject()
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      loadProject()
      event.target.complete() // We have a separate loading indicator so we can complete the refresh indicator.
    }

    const loadProject = () => {
      loadingInProgress.value = true
      api.getItem(route.params.id?.toString()).then(() => {
        loadingInProgress.value = false
      })      
    }

    return {
      loadingInProgress,
      doRefresh,
      project
    }
  }
})
</script>
