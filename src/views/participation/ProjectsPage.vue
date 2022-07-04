<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="!loadingInProgress && projects.length <= 0" class="ion-text-center ion-padding-top">
        Keine Projekte gefunden
      </div>
      <ion-list v-else>
        <ion-item v-for="project in projects" :router-link="`project/${project.id}`" :key="project.id">
          <ion-label>{{ project.id }}</ion-label> <ion-label>{{ project.name }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekte werden geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading, onIonViewWillEnter, RefresherCustomEvent } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'

export default defineComponent({
  name: 'ParticipationProjectsPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading },
  setup() {

    const publicApi = usePublicApi()
    const api = useCollectionApi()
    api.setBaseApi(publicApi)
    api.setEndpoint('projects')

    const projects = api.items

    const loadingInProgress = ref(false)

    onIonViewWillEnter(() => {
      loadingInProgress.value = true
      api.retrieveCollection().then(() => {
        loadingInProgress.value = false
      })      
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      loadingInProgress.value = true
      api.retrieveCollection().then(() => {
        loadingInProgress.value = false
      })
      event.target.complete() // we have a separate loading indicator so we can complete the refresh indicator
    }

    return {
      loadingInProgress,
      doRefresh,
      projects
    }
  }
})
</script>
