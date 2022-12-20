<template>
  <div>
    <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    <ion-searchbar
      placeholder="Suchen"
      v-model="searchQuery"
      :debounce="500"
      @ionChange="reloadProjects()"
      @ionClear="reloadProjects()"
    />

    <ion-select placeholder="Kategorien wählen" :multiple="true" v-model="selectedCategoryIds" @ionChange="debounce(reloadProjects)">
      <ion-select-option v-for="(category, index) in categories" :key="index" :value="category.id">{{ category.name }}</ion-select-option>
    </ion-select>

    <ion-select placeholder="Gemeinden wählen" :multiple="true" v-model="selectedCommunityIds" @ionChange="debounce(reloadProjects)">
      <ion-select-option v-for="(community, index) in communities" :key="index" :value="community.id">{{ community.name }}</ion-select-option>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { IonSearchbar, IonRefresher, IonRefresherContent, IonLoading, RefresherCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption } from '@ionic/vue'
import ParticipationProjectListPanel from '@/components/participation/ProjectListPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { RetrieveCollectionOptions } from '@/types/retrieveCollectionOptions'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { IonSearchbar, IonRefresher, IonRefresherContent, ParticipationProjectListPanel, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption },
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
    const selectedCategoryIds = ref([])

    const communitiesApi = useCollectionApi()
    communitiesApi.setBaseApi(usePublicApi())
    communitiesApi.setEndpoint(`communities`)
    const communities = communitiesApi.items
    const selectedCommunityIds = ref([])

    const projects = api.items

    const loadingInProgress = ref(false)

    onMounted(() => {
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
        getPublicCategories(),
        getPublicCommunities()
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
      if (selectedCategoryIds.value.length > 0) {
        filters.push({
          field: 'category',
          value: selectedCategoryIds.value
        }) 
      }

      if (selectedCommunityIds.value.length > 0) {
        filters.push({
          field: 'community',
          value: selectedCommunityIds.value
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
      await categoriesApi.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'name', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
    }

    const getPublicCommunities = async () => {
      await communitiesApi.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'name', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
    }

    const loadData = (ev: InfiniteScrollCustomEvent) => {
      setTimeout(() => {
        currentPage.value += 1
        getPublicProjects(true)
        getPublicCategories()
        getPublicCommunities()
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
      selectedCategoryIds,
      selectedCommunityIds,
      reloadProjects,
      currentPage,
      totalPages,
      loadData,
      categories,
      communities,
      debounce: createDebounce()
    }
  }
})
</script>
