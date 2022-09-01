<template>
  <base-layout>
    <ion-content>

      <ion-searchbar
        placeholder="Suchen"
        v-model="searchQuery"
        :debounce="1000"
        @ionChange="reloadProjects()"
        @ionClear="reloadProjects()"
      />

      <ion-select placeholder="Kategorien wählen" multiple="true" v-model="selectedCategories" @ionChange="debounce(reloadProjects)">
        <ion-select-option v-for="(category, index) in categories" :key="index" :value="category.id">{{ category.name }}</ion-select-option>
      </ion-select>

      <div class="mapcontainer">
        <MapWidget
          ref="map"
          :locations="locations"
          :zoomControl=false
          :center-point="{
            lng: 7.131735,
            lat: 49.523656
          }"
          :default-zoom=11
          @markerClick="mapMarkerClick"
          @scroll="scroll"
        />
      </div>

      <ion-modal
        :is-open="showProjectsList"
        :initial-breakpoint="0.1"
        :breakpoints="[0.1, 1.0]"
        :backdrop-dismiss="false"
        :backdrop-breakpoint="1.0"
      >
        <div style="height: 80px; background: white;"></div>
        <ion-content id="projectList">
          <div v-if="!loadingInProgress && projects.length <= 0" class="ion-text-center ion-padding-top">
            Keine Projekte gefunden
          </div>
          <div v-else>
            <div v-for="project in projects" :router-link="`projects/${project.id}`" :key="project.id">
              <ParticipationProjectListPanel
                @click="navigateToProject(project.id)"
                :project="project"
                :id="project.id"
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
        </ion-content>
      </ion-modal>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekte werden geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonSearchbar, IonLoading, onIonViewDidEnter, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonModal, onIonViewWillLeave, IonIcon } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import ParticipationProjectListPanel from '@/components/participation/ProjectListPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { RetrieveCollectionOptions } from '@/types/retrieveCollectionOptions'
import { MapLocation } from '@/types/MapLocation'
import MapWidget from '@/components/MapWidget.vue'
import L from 'leaflet'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonSearchbar, ParticipationProjectListPanel, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, MapWidget, IonModal },
  setup() {

    const router = useRouter()

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

    const map = ref(null)
    const locations: Ref<MapLocation[]> = ref([])
    let lastLoadedMapBoundaries: L.LatLngBounds = null

    const projects = api.items
    const showProjectsList = ref(true)

    const loadingInProgress = ref(false)

    onIonViewDidEnter(() => {
      showProjectsList.value = true
      
      // Give the map time to initialize before loading data.
      setTimeout(() => { reloadData() }, 100)
    })

    onIonViewWillLeave(() => {
      showProjectsList.value = false
    })

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
          value: selectedCategories.value.toString()
        }) 
      }

      const longitude_min = map.value.getVisibleRectangle()._southWest.lng
      const latitude_min = map.value.getVisibleRectangle()._southWest.lat
      const longitude_max = map.value.getVisibleRectangle()._northEast.lng
      const latitude_max = map.value.getVisibleRectangle()._northEast.lat

      filters.push({
        field: 'georectangle',
        value: longitude_min + ',' + latitude_min + ',' + longitude_max + ',' + latitude_max
      })

      const options: RetrieveCollectionOptions = { 
        page: currentPage.value, 
        per_page: 100,
        sort_by: 'created_at', 
        sort_order: 'DESC', 
        searchQuery: searchQuery.value, 
        concat: concat, 
        filters: filters
      }

      await api.retrieveCollection(options)      
      totalPages.value = api.totalPages.value

      updateLocations()

      lastLoadedMapBoundaries = map.value.getVisibleRectangle()
    }

    const updateLocations = () => {

      locations.value = []

      projects.value.forEach((project) => {
        project.locations.forEach((location: any) => {
          locations.value.push({
            id: project.id,
            longitude: parseFloat(location.longitude),
            latitude: parseFloat(location.latitude),
            draggable: false
          })
        })
      })

      // Give the ref some time to update.
      setTimeout(function () {
        map.value.refreshView()
      }, 10)
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

    const navigateToProject = (projectId: string) => {
      router.push({path: `/participation/projects/${projectId}`})      
    }

    const mapMarkerClick = (marker: MapLocation) => {
      // Show project list modal and scroll relevant project into view.
      document.querySelector('ion-modal').setCurrentBreakpoint(1.0)
      const yOffset = document.getElementById(marker.id).offsetTop
      const projectList: any = document.querySelector('ion-content#projectList')
      projectList.scrollToPoint(0, yOffset, 500)
    }

    const scroll = () => {
      if (!lastLoadedMapBoundaries.contains(map.value.getVisibleRectangle())) {
        lastLoadedMapBoundaries = map.value.getVisibleRectangle()
        reloadProjects()
      }      
    }

    return {
      loadingInProgress,
      projects,
      showProjectsList,
      searchQuery,
      selectedCategories,
      reloadProjects,
      currentPage,
      totalPages,
      loadData,
      categories,
      debounce: createDebounce(),
      navigateToProject,
      map,
      locations,
      mapMarkerClick,
      scroll
    }
  }
})
</script>

<style>
div.mapcontainer {
  width: 100%;
  height: 85%;
  position: relative;
}

ion-modal {
  --ion-background-color: #ffffff00;
}

ion-modal::part(handle) {
  background: #007bbe;
  width: 70px;
  height: 7px;
}

ion-modal::part(content) {
  position: relative;
  bottom: 0px;
  height: 60%;
  top: 21%;
}

#projectList {
  background-color: #ffffff;
}
</style>