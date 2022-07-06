<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project">
        <ion-row>
          <ion-col>
            <img :src="project.image_url"/>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label class="headline">{{ project.name }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label>{{ useDatetime().getTimeRangeString(project) }}</ion-label>
          </ion-col>
        </ion-row>        
        <ion-row>
          <ion-col>
            <ion-label>Baukosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label>{{ project.description }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label>Kommentare</ion-label>
          </ion-col>
        </ion-row>
        <ion-row v-if="!useUserStore().user">
          <ion-col>
            <ion-label>Bitte einloggen, um die Kommentare zu sehen</ion-label>
          </ion-col>
        </ion-row>
        <template v-else>
          <ion-row v-if="comments.length === 0">
            <ion-col>
              <ion-label>Keine Kommentare gefunden</ion-label>
            </ion-col>
          </ion-row>
          <ion-row v-else v-for="comment in comments" :key="comment.id">
            <ion-col>
              <ion-label>Kommentar: {{ comment }}</ion-label>
            </ion-col>
          </ion-row>
        </template>
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
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLabel, IonLoading, onIonViewWillEnter, RefresherCustomEvent } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLabel, IonLoading },
  setup() {

    const route = useRoute()

    const publicApi = usePublicApi()
    const projectsApi = useCollectionApi()
    projectsApi.setBaseApi(publicApi)
    projectsApi.setEndpoint('projects')

    const privateApi = usePrivateApi()
    const commentsApi = useCollectionApi()
    commentsApi.setBaseApi(privateApi)

    const project = projectsApi.item
    const comments = commentsApi.items

    const loadingInProgress = ref(false)

    onIonViewWillEnter(() => {
      reloadData()
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      reloadData()
      event.target.complete() // We have a separate loading indicator so we can complete the refresh indicator.
    }

    const reloadData = async () => {
      loadingInProgress.value = true

      await Promise.all([
        projectsApi.getItem(route.params.id?.toString()),
        loadComments()
      ])

      loadingInProgress.value = false      
    }

    const loadComments = async () => {
      if (useUserStore().user) {
        commentsApi.setEndpoint('comments/project/' + route.params.id?.toString())
        commentsApi.retrieveCollection()
      }
    }

    return {
      loadingInProgress,
      doRefresh,
      project,
      comments,
      useDatetime,
      useCurrency,
      useUserStore
    }
  }
})
</script>

<style scoped>
.headline {
  font-size: 1.5em;
}
</style>
