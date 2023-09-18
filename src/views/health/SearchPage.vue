<template>
  <BackButtonLayout force-back="/health/categories">
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
        {{ facilityKind }}
        <span v-if="facilityKind">Suche nach passenden </span>
        <span v-else>Allgemeine Suche</span>

        <span v-if="facilityKind === 'facility'">Anbietern</span>
        <span v-else-if="facilityKind === 'event'">Kursen</span>
        <span v-else-if="facilityKind === 'news'">Beiträgen</span>
      </div>
      <div class="gap-1" />
      <div class="gap-1" />
      <template v-if="facilityKind">
        <div class="label font-size-small">Filter</div>
        <div :class="['filter-button', { 'is-active' : basicFilter !== null }]" @click="basicFilterModalOpen = true">
          <span v-if="basicFilter">{{ basicFilter.name }}</span>
          <span v-else class="placeholder">Filter wählen</span>
        </div>

        <div class="grid-2">
          <div>
            <div class="label font-size-small">Gemeinde</div>
            <CommunityFilter
              ref="communityFilterRef"
              @selectCommunityFilter="selectCommunityFilter"
            />
          </div>
          <div>
            <div class="label font-size-small">&nbsp;</div>
            <button class="filter-button is-fullwidth" @click="advancedFilterModalOpen = true">
              weitere Filter
              <img src="@/assets/images/filter.svg" class="icon" />
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="buttons flex-wrap">
          <button v-for="kind in filteredKinds" :key="kind" class="filter-button" @click="setFacilityKind(kind)">{{ getMappedKindName(kind) }}</button>
        </div>
      </template>
      

      <div class="label font-size-small pull-up">{{ facilityKind ? 'Spezifische' : 'Allgemeine' }} Suche</div>
      <div class="search-wrap">
        <SearchBar
          @handleSearch="handleSearch"
        />
      </div>

      <div class="buttons">
        <ion-button class="transparent" expand="block" @click="resetFilter">Auswahl zurücksetzen</ion-button>
        <ion-button class="white" expand="block" @click="startSearch">Suche starten</ion-button>
      </div>
    </div>

    <div class="buttons ion-padding" v-if="facilityKind === 'facility'">
      <ion-button :class="['white has-border', { 'is-active' : view === 'list' }]" expand="block" @click="view = 'list'">Listenansicht</ion-button>
      <ion-button :class="['white has-border', { 'is-active' : view === 'map' }]" expand="block" @click="view = 'map'">Kartenansicht</ion-button>
    </div>

    <div class="ion-padding">
      <FacilityList v-if="view === 'list'" :facility-kind="facilityKind" />
      <FacilityMap v-else-if="view === 'map'"/>
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
  margin-top: -15px
.grid-2
  display: grid
  grid-template-columns: 64% 34%
  gap: 2%
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
  display: flex
  gap: 10px
  margin-top: 15px
  justify-content: space-between
  ion-button
    flex: 1

.flex-wrap
  flex-wrap: wrap
  justify-content: start

</style>