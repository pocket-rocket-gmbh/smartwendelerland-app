<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project">
        <ion-row>
          <img :src="project.image_url"/>
        </ion-row>
        <ion-row>
          <ion-label class="headline">{{ project.name }}</ion-label>
        </ion-row>
        <ion-row>
          <ion-label>{{ useDatetime().getTimeRangeString(project) }}</ion-label>
        </ion-row>
        <ion-row>
          <ion-label>Baukosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</ion-label>
        </ion-row>
        <ion-row>
          <ion-label>{{ project.description }}</ion-label>
        </ion-row>
      </ion-grid>
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
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonLabel, IonLoading, onIonViewWillEnter, RefresherCustomEvent } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonLabel, IonLoading },
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
        console.log(project.value)
      })      
    }

    return {
      loadingInProgress,
      doRefresh,
      project,
      useDatetime,
      useCurrency
    }
  }
})
</script>

<style scoped>
.headline {
  font-size: 1.5em;
}
</style>
