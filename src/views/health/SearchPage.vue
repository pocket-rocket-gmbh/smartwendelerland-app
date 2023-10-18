<template>
  <BackButtonLayout force-back="/health/categories" :show-login="false">
    <BasicFilterModal
      :filter-kind="facilityKind"
      v-model="filterStore.currentTags"
      v-if="basicFilterModalOpen"
      @close="basicFilterModalOpen = false"
      @selectBasicFilter="selectBasicFilter"
    />
    <AdvancedFilterModal
      v-if="advancedFilterModalOpen"
      v-model="filterStore.currentTags"
      :filter-kind="facilityKind"
      @close="advancedFilterModalOpen = false"
    />
    <div class="health-top-panel">
      <div class="headline">
        <span v-if="facilityKind">Suche nach passenden </span>
        <span v-else>Allgemeine Suche</span>

        <span v-if="facilityKind === 'facility'">Anbietern</span>
        <span v-else-if="facilityKind === 'course'">Kursen</span>
        <span v-else-if="facilityKind === 'event'">Veranstaltungen</span>
        <span v-else-if="facilityKind === 'news'">Beiträgen</span>
      </div>
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="label pull-up">
        <span v-if="facilityKind === 'facility'">Anbieter suchen</span>
        <span v-else-if="facilityKind === 'course'">Kurs suchen</span>
        <span v-else-if="facilityKind === 'event'">Veranstaltung suchen</span>
        <span v-else-if="facilityKind === 'news'">Nachrichten suchen</span>
      </div>
      <div class="search-wrap">
        <SearchBar
          @handleSearch="handleSearch"
          :placeHolderText="placeHolderText"
        />
      </div>
      <template v-if="facilityKind">
        <template v-if="facilityKind === 'facility' || facilityKind === 'course'">
          <div class="label">Branche</div>
          <div :class="['filter-button', { 'is-active' : basicFilter !== null }]" @click="basicFilterModalOpen = true">
            <span v-if="basicFilter">{{ basicFilter.name }}</span>
            <span v-else class="placeholder">Branche wählen</span>
          </div>
        </template>

        <div :class="(facilityKind === 'facility' || facilityKind === 'course') ? 'grid-2' : 'grid-1'">
          <div>
            <div class="label">Gemeinde</div>
            <CommunityFilter
              ref="communityFilterRef"
              @selectCommunityFilter="selectCommunityFilter"
            />
          </div>
          <div v-if="facilityKind === 'facility' || facilityKind === 'course'">
            <div class="label">&nbsp;</div>
            <img src="@/assets/images/filter.svg" class="filter-icon" @click="advancedFilterModalOpen = true"/>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="buttons flex-wrap">
          <button v-for="kind in filteredKinds" :key="kind" class="filter-button" @click="setFacilityKind(kind)">{{ getMappedKindName(kind) }}</button>
        </div>
      </template>
      
      <div class="buttons">
        <ion-button class="transparent" expand="block" shape="round" @click="resetFilter">Zurücksetzen</ion-button>
        <div v-if="facilityKind === 'facility'">
          <ion-button :class="['white has-border', view === 'list' ? 'list' : 'map']" expand="block" @click="toggleView">{{ view === 'list' ? 'Kartenansicht' : 'Listenansicht' }}</ion-button>
        </div>
      </div>
    </div>
    <div>
      <div class="ion-padding">
        <FacilityList v-if="view === 'list'" :facility-kind="facilityKind" />
        <FacilityMap v-else-if="view === 'map'"/>
      </div>
    </div>
    <ion-loading
      :is-open="loading"
      message="Ergebnisse werden geladen..."
    />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import BasicFilterModal from '../../components/health/BasicFilterModal.vue';
import AdvancedFilterModal from '../../components/health/AdvancedFilterModal.vue';
import CommunityFilter from '@/components/health/CommunityFilter.vue';
import FacilityList from '@/components/health/FacilityList.vue';
import FacilityMap from '@/components/health/FacilityMap.vue';
import { useFilterStore, FilterKind } from '@/stores/health/searchFilter';
import { IonLoading, onIonViewWillEnter, IonButton, onIonViewWillLeave } from '@ionic/vue';
import { useRoute } from 'vue-router';
import SearchBar from '@/components/health/SearchBar.vue';
import { debounce } from "@/utils/global.utils";

const filterStore = useFilterStore()
const advancedFilterModalOpen = ref(false)
const basicFilterModalOpen = ref(false)
const basicFilter = ref(null)
const advancedFilter = ref(null)
const communityFilter = ref(null)
const communityFilterRef = ref(null)
const view = ref('list')
const loading = ref(false)
const route = useRoute()

const placeHolderText = computed(() => {
  if (facilityKind.value === 'facility') return 'Name, Fachrichtung,…'
  if (facilityKind.value === 'course') return 'Name, Kursinhalt,…'
  if (facilityKind.value === 'event') return 'Name, Thema, Angebote,…'
  if (facilityKind.value === 'news') return 'Nachrichten suchen'
  return ''
})


watch(
  () => filterStore.currentTags,
  debounce(() => {
    filterStore.loadAllResults();
  }),
  {
    deep: true,
  }
);

const addParamsToLocation = (params: any) => {
  history.pushState(
    {},
    null,
    route.path +
      '?' +
      Object.keys(params)
        .map(key => {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
          )
        })
        .join('&')
  )
}

const setFacilityKind = (kind: FilterKind) => {
  facilityKind.value = kind
  filterStore.currentKinds = [kind]
  addParamsToLocation({ kind })
  startSearch()
}

const toggleView = () => {
  view.value = view.value === 'list' ? 'map' : 'list';
};

const filteredKinds = computed(() => {
  return Array.from(new Set(filterStore.filteredResults.map((result) => result.kind)));
});

const getMappedKindName = (kind: "facility" | "news" | "event" | "course") => {
  if (kind === "facility") return "Zu den Einrichtungen";
  if (kind === "news") return "Zu den Beiträgen";
  if (kind === "course") return "Zu den Kursen";
  if (kind === "event") return "Zu den Veranstaltungen";
};

const selectBasicFilter = (filter:any) => {
  basicFilter.value = filter
  // currently supporting only one filter
  // filterStore.currentTags = [filter.id]
  // startSearch()
}

const selectCommunityFilter = (filter:any) => {
  communityFilter.value = filter
  filterStore.currentZip = filter.zip
  startSearch()
}

const resetFilter = () => {
  basicFilter.value = null
  communityFilter.value = null
  communityFilterRef.value.resetFilter()
  filterStore.currentSearchTerm = ''
  filterStore.currentTags = []
  filterStore.currentZip = null
}

const startSearch = async () => {
  loading.value = true
  if (facilityKind.value) {
    filterStore.currentKinds = [facilityKind.value]
  }
  await filterStore.loadAllResults()
  loading.value = false
}

const facilityKind = ref<FilterKind>();

const handleSearch = () => {
  filterStore.onlySearchInTitle = false
  filterStore.loadFilteredResults()
}

onIonViewWillEnter(async () => {
  facilityKind.value = route.query.kind as FilterKind;
  // if (facilityKind.value) {
  // }
  filterStore.filteredResults = []
  await startSearch()
})

onIonViewWillLeave(() => {
  facilityKind.value = undefined;
})

</script>

<style lang="sass" scoped>
.label
  font-weight: bold
  color: white
.search-wrap
  margin: -15px 0 10px 0
.grid-2
  align-items: end
  display: grid
  grid-template-columns: 75% 25%
  gap: 15%
.grid-1
  display: grid
  grid-template-columns: 100%
.filter-button
  border-radius: 7px
  background: #FFF
  padding: 10px 20px
  position: relative
  .placeholder
    color: var(--placeholder-color)
    opacity: 0.33
  border: 1px solid black
  height: 43.5px
  margin-bottom: 10px
  &.is-active
    color: black
  .icon
    position: absolute
    right: 7px
    top: 14px
    width: 15px
    height: 15px

.buttons
  display: grid
  grid-template-columns: 49% 49%
  gap: 2%
  margin-top: 15px
  justify-content: space-between
  ion-button
    flex: 1

.filter-icon
  color: white
  width: 30px
  .flex-wrap
  flex-wrap: wrap
  justify-content: start

</style>