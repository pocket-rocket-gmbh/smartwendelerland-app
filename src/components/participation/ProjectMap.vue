<template>
  <div class="base">
    <div class="mapcontainer">
      <ion-searchbar
        placeholder="Name, PLZ …"
        v-model="searchQuery"
        :debounce="2000"
        @ionChange="reloadProjects()"
        @ionClear="reloadProjects()"
      />

      <ion-select cancel-text="Abbrechen" v-if="categories.length > 0" placeholder="Kategorien wählen" multiple="true" v-model="selectedCategoryIds" @ionChange="debounce(reloadProjects)">
        <ion-select-option v-for="(category, index) in categories" :key="index" :value="category.id">{{ category.name_with_projects_count }}</ion-select-option>
      </ion-select>

      <ion-select cancel-text="Abbrechen" v-if="communities.length > 0" placeholder="Gemeinden wählen" :multiple="true" v-model="selectedCommunityIds" @ionChange="debounce(reloadProjects)">
        <ion-select-option v-for="(community, index) in communities" :key="index" :value="community.id">{{ community.name_with_projects_count }}</ion-select-option>
      </ion-select>

      <MapWidget
        ref="map"
        :locations="locations"
        :zoomControl=false
        :center-point="{
          lng: 7.131735,
          lat: 49.523656
        }"
        :auto-fit=true
        :min-zoom=10
        @markerClick="mapMarkerClick"
      />
    </div>

    <ion-modal
      :is-open="showModal"
      :initial-breakpoint="0.15"
      :breakpoints="[0.15, 1.0]"
      :backdrop-dismiss="false"
      :backdrop-breakpoint="1.0"
      @ionBreakpointDidChange="handleBreakpointChange"
    >
      <div style="height: 40px; background: white;"></div>
      <div style="height: 60px; background: white; padding-bottom: 15px;" align="center">
        <span v-if="projectListHeadlineVisible">Projekte in Liste anzeigen</span>
      </div>
      <ion-content id="projectList">
        <div v-if="!loadingInProgress && projects.length <= 0" class="ion-text-center ion-padding-top">
          Keine Projekte gefunden
        </div>
        <div v-else>
          <div v-for="(project, index) in filteredProjects" :router-link="`projects/${project.id}`" :key="project.id" :class="{ 'last-item' : index === projects.length - 1, 'active' : activeProjectId === project.id, 'not-active' : activeProjectId !== null && activeProjectId !== project.id }">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonSearchbar, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonModal, IonContent } from '@ionic/vue'
import ParticipationProjectListPanel from '@/components/participation/ProjectListPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { usePrivateApi } from '@/composables/api/private'
import { useUser } from '@/composables/user/user'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { RetrieveCollectionOptions } from '@/types/retrieveCollectionOptions'
import { MapLocation } from '@/types/MapLocation'
import MapWidget from '@/components/MapWidget.vue'
import L from 'leaflet'

export default defineComponent({
  name: 'ParticipationProjectMapPage',
  components: { IonSearchbar, ParticipationProjectListPanel, IonLoading, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, MapWidget, IonModal, IonContent },
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {

    const router = useRouter()

    const publicApi = usePublicApi()
    const privateApi = usePrivateApi()
    const api = useCollectionApi()
    const searchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const projectListHeadlineVisible = ref(true)

    const categoriesApi = useCollectionApi()
    categoriesApi.setBaseApi(usePublicApi())
    categoriesApi.setEndpoint(`categories`)
    const categories = categoriesApi.items
    const selectedCategoryIds = ref([])
    const activeProjectId = ref(null)

    const communitiesApi = useCollectionApi()
    communitiesApi.setBaseApi(usePublicApi())
    communitiesApi.setEndpoint(`communities`)
    const communities = communitiesApi.items
    const selectedCommunityIds = ref([])

    const map = ref(null)
    const locations: Ref<MapLocation[]> = ref([])
    let lastLoadedMapBoundaries: L.LatLngBounds = null

    const projects = api.items
    const filteredProjects = ref([])
    const showProjectsList = ref(true)

    const loadingInProgress = ref(false)

    onMounted(() => {
      showProjectsList.value = true

      // Give the map time to initialize before loading data.
      setTimeout(() => { reloadData() }, 100)
    })

    onUnmounted(() => {
      projectListHeadlineVisible.value = true
      showProjectsList.value = false
    })

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
          value: selectedCategoryIds.value.toString()
        })
      }

      if (selectedCommunityIds.value.length > 0) {
        filters.push({
          field: 'community',
          value: selectedCommunityIds.value
        })
      }

      /* // Filter projects based on current map view windows (disabled to load all projects all the time).
      const longitude_min = map.value.getVisibleRectangle()._southWest.lng
      const latitude_min = map.value.getVisibleRectangle()._southWest.lat
      const longitude_max = map.value.getVisibleRectangle()._northEast.lng
      const latitude_max = map.value.getVisibleRectangle()._northEast.lat

      filters.push({
        field: 'georectangle',
        value: longitude_min + ',' + latitude_min + ',' + longitude_max + ',' + latitude_max
      })
      */

      const options: RetrieveCollectionOptions = {
        page: currentPage.value,
        per_page: 100,
        sort_by: 'created_at',
        sort_order: 'DESC',
        searchQuery: searchQuery.value,
        concat: concat,
        filters: filters
      }

      if (useUser().loggedIn()) {
        api.setBaseApi(privateApi)
      } else {
        api.setBaseApi(publicApi)
      }
      api.setEndpoint('projects')

      await api.retrieveCollection(options)
      filteredProjects.value = api.items.value
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
            draggable: false,
            tooltipHtml: null
          })
        })
      })

      // Give the ref some time to update.
      setTimeout(function () {
        map.value.refreshView()
      }, 10)
    }

    const getPublicCategories = async () => {
      await categoriesApi.retrieveCollection({ page: currentPage.value, per_page: 1000, sort_by: 'name', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
    }

    const getPublicCommunities = async () => {
      await communitiesApi.retrieveCollection({ page: currentPage.value, per_page: 1000, sort_by: 'name', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
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
      // Show project list modal and filter project list by marker id
      document.querySelector('ion-modal').setCurrentBreakpoint(1.0)
      // const yOffset = document.getElementById(marker.id).offsetTop
      // const projectList: any = document.querySelector('ion-content#projectList')
      // activeProjectId.value = marker.id
      filteredProjects.value = projects.value.filter((project:any) => project.id === marker.id)

      // projectList.scrollToPoint(0, yOffset, 500)
    }

    const handleBreakpointChange = (e:any) => {
      projectListHeadlineVisible.value = !projectListHeadlineVisible.value
      if (e.detail.breakpoint < 1) {
        filteredProjects.value = projects.value
      }
    }

    watch(() => props.showModal, (first, second) => {
      if (first === true) {
        map.value.refreshView()
        setTimeout(() => { reloadData() }, 100)
      }
    });

    return {
      loadingInProgress,
      projects,
      showProjectsList,
      searchQuery,
      selectedCategoryIds,
      selectedCommunityIds,
      reloadProjects,
      currentPage,
      totalPages,
      loadData,
      categories,
      communities,
      debounce: createDebounce(),
      navigateToProject,
      map,
      locations,
      mapMarkerClick,
      activeProjectId,
      projectListHeadlineVisible,
      filteredProjects,
      handleBreakpointChange
    }
  }
})
</script>

<style lang="sass" scoped>

div.base
  height: 75%

div.mapcontainer
  width: 100%
  height: 85%
  position: relative

ion-modal
  --ion-background-color: #ffffff00

ion-modal::part(handle)
  background: #007bbe
  width: 70px
  height: 7px

ion-modal::part(content)
  position: relative
  bottom: 0px
  height: 100%
  top: 5.2%

.last-item
  margin-bottom: 100px

// .not-active
//   opacity: 0.3

#projectList
  background-color: #ffffff
</style>