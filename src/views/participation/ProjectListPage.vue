<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-searchbar
        placeholder="Suchen"
        v-model="searchQuery"
        debounce="500"
        @ionChange="getPublicProjects()"
        @ionClear="clearSearch"
      />

      <div v-if="!loadingInProgress && projects.length <= 0" class="ion-text-center ion-padding-top">
        Keine Projekte gefunden
      </div>
      <div v-else>
        <div v-for="project in projects" :router-link="`projects/${project.id}`" :key="project.id">
          <ParticipationProjectListPanel
            @click="$router.push({path: `/participation/projects/${project.id}`})"
            :project="project"
          />
        </div>
      </div>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekte werden geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonContent, IonSearchbar, IonRefresher, IonRefresherContent, IonLoading, onIonViewWillEnter, RefresherCustomEvent } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import ParticipationProjectListPanel from '@/components/participation/ProjectListPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonSearchbar, IonRefresher, IonRefresherContent, ParticipationProjectListPanel, IonLoading },
  setup() {

    const publicApi = usePublicApi()
    const api = useCollectionApi()
    api.setBaseApi(publicApi)
    api.setEndpoint('projects')
    const searchQuery = ref("")

    const projects = api.items

    const loadingInProgress = ref(false)

    onIonViewWillEnter(() => {
      loadingInProgress.value = true
      getPublicProjects()     
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      getPublicProjects()
      event.target.complete() // we have a separate loading indicator so we can complete the refresh indicator
    }

    const clearSearch = () => {
      getPublicProjects()
    }

    const getPublicProjects = async () => {
      const options = { page: 1, per_page: 25, sort_by: 'created_at', sort_order: 'DESC', searchQuery: searchQuery.value, concat: false }
      api.retrieveCollection(options).then(() => {
        loadingInProgress.value = false
      })
    }

    return {
      loadingInProgress,
      doRefresh,
      projects,
      searchQuery,
      getPublicProjects,
      clearSearch
    }
  }
})
</script>
