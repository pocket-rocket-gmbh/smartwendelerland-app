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
        @ionChange="reloadProjects()"
        @ionClear="reloadProjects()"
      />

      <ion-select placeholder="Kategorien wählen" multiple="true" v-model="selectedCategories" @ionChange="debounce(reloadProjects)">
        <ion-select-option v-for="(category, index) in categories" :key="index" :value="category.id">{{ category.name }}</ion-select-option>
      </ion-select>

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
        <ion-infinite-scroll
          v-if="currentPage < totalPages"
          @ionInfinite="loadData($event)"
        >
          <ion-infinite-scroll-content>
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
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
import { IonContent, IonSearchbar, IonRefresher, IonRefresherContent, IonLoading, onIonViewWillEnter, RefresherCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import ParticipationProjectListPanel from '@/components/participation/ProjectListPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { RetrieveCollectionOptions } from '@/types/retrieveCollectionOptions'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonSearchbar, IonRefresher, IonRefresherContent, ParticipationProjectListPanel, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption },
  setup() {

    const publicApi = usePublicApi()
    const api = useCollectionApi()
    api.setBaseApi(publicApi)
    api.setEndpoint('projects')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)

    const categoriesApi = useCollectionApi()
    categoriesApi.setBaseApi(usePublicApi())
    categoriesApi.setEndpoint(`categories`)
    const categories = categoriesApi.items
    const selectedCategories = ref([])

    const projects = api.items

    const loadingInProgress = ref(false)

    onIonViewWillEnter(() => {
      reloadData()
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      reloadData()
      event.target.complete() // we have a separate loading indicator so we can complete the refresh indicator
    }

    const reloadData = async () => {
      loadingInProgress.value = true
      currentPage.value = 1
      Promise.all([
        getPublicProjects(false),
        getPublicCategories()
      ])      
      loadingInProgress.value = false
    }

    const reloadProjects = async () => {
      loadingInProgress.value = true
      currentPage.value = 1
      await getPublicProjects(false)
      loadingInProgress.value = false
    }

    const getPublicProjects = async (concat = true) => {

      const filters = []
      if (selectedCategories.value.length > 0) {
        filters.push({
          field: 'category',
          value: selectedCategories.value
        }) 
      }

      const options: RetrieveCollectionOptions = { 
        page: currentPage.value, 
        per_page: 5,
        sort_by: 'created_at', 
        sort_order: 'DESC', 
        searchQuery: searchQuery.value, 
        concat: concat, 
        filters: filters 
      }

      await api.retrieveCollection(options)      
      totalPages.value = api.totalPages.value
    }

    const getPublicCategories = async () => {
      await categoriesApi.retrieveCollection()
    }

    const loadData = (ev: InfiniteScrollCustomEvent) => {
      setTimeout(() => {
        currentPage.value += 1
        getPublicProjects(true)
        ev.target.complete()
      }, 300);
    }

    // The ionChange event of the ion-select element fires two times for multi item selects.
    // Adding a 10 milliseconds debounce here resolves this issue.
    function createDebounce() {
      let timeout: number = null;
      return function (fnc: any) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fnc()
        }, 10)
      }
    }

    return {
      loadingInProgress,
      doRefresh,
      projects,
      searchQuery,
      selectedCategories,
      reloadProjects,
      currentPage,
      totalPages,
      loadData,
      categories,
      debounce: createDebounce()
    }
  }
})
</script>
