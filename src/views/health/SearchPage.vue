<template>
  <BackButtonLayout
    force-back="/health/categories"
    :show-login="false"
    :title="searchLabel"
    :show-bar="false"
    :view="view"
  >
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

    <div
      class="health-top-panel"
      v-if="view === 'list'"
      :class="[
        facilityKind !== 'facility' && facilityKind !== 'course' ? 'has-no-buttons' : '',
      ]"
    >
      <div
        :class="
          getPlatforms().some((platform) => platform === 'ios')
            ? 'search-col-ios'
            : 'search-col'
        "
      >
        <SearchBar @handleSearch="handleSearch" :placeHolderText="placeHolderText" />
      </div>

      <template v-if="!facilityKind">
        <div class="buttons flex-wrap">
          <ion-button
            mode="ios"
            v-for="kind in filteredKinds"
            :key="kind"
            expand="block"
            shape="round"
            class="transparent"
            @click="setFacilityKind(kind)"
            >{{ getMappedKindName(kind) }}</ion-button
          >
        </div>
      </template>
      <div
        :class="
          getPlatforms().some((platform) => platform === 'ios')
            ? 'grid-buttons-ios'
            : 'grid-buttons'
        "
        v-if="facilityKind === 'facility' || facilityKind === 'course'"
        mode="md"
      >
        <div>
          <div>
            <div class="filter-container">
              <img
                src="@/assets/images/filter.svg"
                class="filter-icon"
                @click="basicFilterModalOpen = true"
              />
              <span class="is-white counter">{{ countSelectedFilters }}</span>
            </div>
          </div>
        </div>
        <div>
          <ion-button
            v-if="
              (facilityKind && facilityKind === 'facility') || facilityKind === 'course'
            "
            mode="ios"
            class="transparent"
            expand="block"
            shape="round"
            @click="resetFilter"
            :disabled="!countSelectedFilters"
            >Filter löschen</ion-button
          >
        </div>
        <div>
          <div v-if="facilityKind === 'facility'">
            <ion-button
              mode="ios"
              :class="['white is-dark-grey', view === 'list' ? 'list' : 'map']"
              expand="block"
              shape="round"
              @click="toggleView"
              >{{ view === "list" ? "Kartenansicht" : "Listenansicht" }}</ion-button
            >
          </div>
        </div>
      </div>
    </div>
    <div
      class="has-bg-darken-grey general-font-size"
      :class="[view === 'list' ? 'bottom-actions' : 'bottom-actions absolute']"
    >
      <div v-if="filterStore.loading">Wird geladen...</div>
      <div class="general-font-size" v-else-if="filterStore.filteredResults.length">
        <span>{{ filterStore.filteredResults.length }}</span>
        <span v-if="facilityKind === 'facility'"> Anbieter </span>
        <span v-if="facilityKind === 'course'"> Kurse </span>
        <span v-if="facilityKind === 'event' && filterStore.filteredResults.length > 1">
          Veranstaltungen
        </span>
        <span v-if="facilityKind === 'event' && filterStore.filteredResults.length === 1">
          Veranstaltung
        </span>
        <span v-if="facilityKind === 'news' && filterStore.filteredResults.length > 1">
          Beiträge
        </span>
        <span v-if="facilityKind === 'news' && filterStore.filteredResults.length === 1">
          Beitrag
        </span>
        <span v-if="!facilityKind">
          Ergebnis<span v-if="filterStore.filteredResults.length > 1">se</span>
        </span>
        <span v-if="view === 'map'">in deiner Nähe</span>
        gefunden
      </div>
      <div class="general-font-size" v-else>Leider keine Ergebnisse gefunden.</div>
    </div>
    <IonIcon
      v-if="view === 'map'"
      class="back-button-icon"
      :icon="arrowBackOutline"
      @click="toggleView"
    />
    <div>
      <div :class="[view === 'list' ? 'facility-list' : 'map-view']">
        <FacilityList v-if="view === 'list'" :facility-kind="facilityKind" />
        <FacilityMap v-else-if="view === 'map'" />
      </div>
    </div>
    <ion-loading
      class="is-dark-grey"
      mode="md"
      :is-open="loading"
      message="Ergebnisse werden geladen..."
    />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BackButtonLayout from "@/components/general/BackButtonLayout.vue";
import BasicFilterModal from "../../components/health/BasicFilterModal.vue";
import AdvancedFilterModal from "../../components/health/AdvancedFilterModal.vue";
import CommunityFilter from "@/components/health/CommunityFilter.vue";
import FacilityList from "@/components/health/FacilityList.vue";
import FacilityMap from "@/components/health/FacilityMap.vue";
import { useFilterStore, FilterKind } from "@/stores/health/searchFilter";
import {
  IonLoading,
  onIonViewWillEnter,
  IonButton,
  onIonViewWillLeave,
  getPlatforms,
  IonIcon,
} from "@ionic/vue";
import { useRoute } from "vue-router";
import SearchBar from "@/components/health/SearchBar.vue";
import { debounce } from "@/utils/global.utils";
import router from "@/router";
import { MapLocation } from "@/types/MapLocation";
import { arrowBackOutline } from "ionicons/icons";

const filterStore = useFilterStore();
const advancedFilterModalOpen = ref(false);
const basicFilterModalOpen = ref(false);
const basicFilter = ref(null);
const advancedFilter = ref(null);
const communityFilter = ref(null);
const communityFilterRef = ref(null);
const view = ref("list");
const loading = ref(false);
const route = useRoute();
const locations = ref<MapLocation[]>([]);

const placeHolderText = computed(() => {
  if (facilityKind.value === "facility") return "Name, Fachrichtung,…";
  if (facilityKind.value === "course") return "Name, Kursinhalt,…";
  if (facilityKind.value === "event") return "Name, Thema, Angebote,…";
  if (facilityKind.value === "news") return "Beiträge suchen";
  return "";
});

const pageTile = computed(() => {
  if (facilityKind.value === "facility") {
    return "Anbieter";
  } else if (facilityKind.value === "course") {
    return "Kurs";
  } else if (facilityKind.value === "event") {
    return "Veranstaltung";
  } else if (facilityKind.value === "news") {
    return "Beitrag";
  } else {
    return "Allgemeine Suche";
  }
});

const countSelectedFilters = computed(() => {
  let results = 0;
  if (filterStore.currentSearchTerm.length) {
    results += 1;
  }
  if (filterStore.currentTags.length) {
    results += filterStore.currentTags.length;
  }
  if (filterStore.currentZip) {
    results += 1;
  }
  return results;
});

const searchLabel = computed(() => {
  const pageTitle = pageTile.value;

  switch (facilityKind.value) {
    case "facility":
    case "course":
    case "news":
      return `Finde den passenden ${pageTitle}`;
    case "event":
      return `Finde die passende ${pageTitle}`;
    default:
      return "Allgemeine Suche";
  }
});

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
      "?" +
      Object.keys(params)
        .map((key) => {
          return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
        })
        .join("&")
  );
};

const setFacilityKind = (kind: FilterKind) => {
  facilityKind.value = kind;
  filterStore.currentKinds = [kind];
  addParamsToLocation({ kind });
  startSearch();
};

const toggleView = () => {
  view.value = view.value === "list" ? "map" : "list";
};

const filteredKinds = computed(() => {
  return Array.from(new Set(filterStore.filteredResults.map((result) => result.kind)));
});

const getMappedKindName = (kind: "facility" | "news" | "event" | "course") => {
  if (kind === "facility") return "Zu den Anbietern";
  if (kind === "news") return "Zu den Beiträgen";
  if (kind === "course") return "Zu den Kursen";
  if (kind === "event") return "Zu den Veranstaltungen";
};

const selectBasicFilter = (filter: any) => {
  basicFilter.value = filter;
  // currently supporting only one filter
  // filterStore.currentTags = [filter.id]
  // startSearch()
};

const resetFilter = () => {
  basicFilter.value = null;
  communityFilter.value = null;
  communityFilterRef.value = null;
  filterStore.currentSearchTerm = "";
  filterStore.currentTags = [];
  filterStore.currentZip = null;
};

const lastRoute = router.options.history.state.back;

onIonViewWillLeave(() => {
  if (typeof lastRoute === "string" && lastRoute.includes("categories")) {
    filterStore.currentTags = [];
    filterStore.currentZip = null;
  }
  //resetFilter();
});

onIonViewWillEnter(() => {
  if (router.currentRoute.value.query.tags) {
    filterStore.currentTags = JSON.parse(router.currentRoute.value.query.tags as string);
  }
  if (router.currentRoute.value.query.community) {
    filterStore.currentZip = router.currentRoute.value.query.community as string;
  }
  if (router.currentRoute.value.query.tags && router.currentRoute.value.query.community) {
    router.push({ path: `/health/search?kind=${facilityKind.value}` });
  }
});

const startSearch = async () => {
  loading.value = true;
  if (facilityKind.value) {
    filterStore.currentKinds = [facilityKind.value];
  }
  await filterStore.loadAllResults();
  loading.value = false;
};

const facilityKind = ref<FilterKind>();

const handleSearch = () => {
  filterStore.onlySearchInTitle = false;
  filterStore.loadFilteredResults();
};

onIonViewWillEnter(async () => {
  facilityKind.value = route.query.kind as FilterKind;
  // if (facilityKind.value) {
  // }
  filterStore.filteredResults = [];
  await startSearch();
});

onIonViewWillLeave(() => {
  view.value = "list";
});
</script>

<style lang="sass" scoped>
.label
  font-weight: bold
  color: white

.grid-buttons
  margin: 20px 0 10px 0
  display: grid
  grid-template-columns: 9% 44% 44%
  gap: 2%
  align-items: center

.grid-buttons-ios
  margin: -5px 0 10px 0
  display: grid
  grid-template-columns: 11% 42% 43%
  gap: 2%
  align-items: center

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
  margin: 20px 0
  grid-template-columns: 49% 49%
  gap: 2%
  justify-content: space-between
  ion-button
    flex: 1

.bottom-actions
  display: flex
  flex-wrap: wrap
  align-content: center
  align-items: center
  height: 50px
  width: 100%
  justify-content: center
  color: white
  text-align: center

.absolute
  position: absolute
  z-index: 99999
  height: 65px

.map-view
  margin-top: -40px
.filter-container
  display: flex
  align-items: center
  .counter
    color: #8ab61d
    margin-top: -40px
    margin-left: -15px
    background-color: #ffffff
    padding: 2px 9px
    border-radius: 50%
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
.filter-icon
  color: white
  width: 50px

.search-col
  margin: 10px 0 0 0

.search-col-ios
  margin: 10px 0 30px 0

ion-button
  --background-activated: none
  --border-color: var(--ion-color-health)
  --color-activated: white
  --background-hover: var(--ion-color-health)
  --color-hover: white

.back-button-icon
  position: absolute
  z-index: 9999
  font-size: 12px
  padding: 10px
  border-radius: 50%
  background: white
  width: 20px
  height: 20px
  margin-left: 4px
  margin-top: 10px
  margin-bottom: 15px
  border: 1px solid #636362
  z-index: 99999

.facility-list
  padding: 10px

.has-no-buttons
  padding-bottom: 20px
</style>
