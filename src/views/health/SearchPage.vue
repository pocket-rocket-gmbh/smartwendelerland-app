<template>
  <BackButtonLayout
    force-back="/health/categories"
    :show-login="false"
    :title="searchLabel"
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
    <div class="health-top-panel">
      <div class="gap-1"></div>
      <div class="gap-1"></div>
      <div class="gap-1"></div>
      <ion-row>
        <ion-col class="search-wrap" size="10" size-sm="8">
          <SearchBar @handleSearch="handleSearch" :placeHolderText="placeHolderText" />
        </ion-col>
        <ion-col v-if="facilityKind" size-sm="4" class="icon-container">
          <div v-if="facilityKind === 'facility' || facilityKind === 'course'">
            <div class="filter-container">
              <img
                src="@/assets/images/filter.svg"
                class="filter-icon"
                @click="basicFilterModalOpen = true"
              />
              <span class="is-white counter">{{ countSelectedFilters }}</span>
            </div>
          </div>
        </ion-col>
      </ion-row>
      <template v-if="!facilityKind">
        <div class="buttons flex-wrap">
          <button
            v-for="kind in filteredKinds"
            :key="kind"
            class="filter-button"
            @click="setFacilityKind(kind)"
          >
            {{ getMappedKindName(kind) }}
          </button>
        </div>
      </template>

      <div class="buttons">
        <ion-button class="transparent" expand="block" shape="round" @click="resetFilter"
          >Zurücksetzen</ion-button
        >
        <div v-if="facilityKind === 'facility'">
          <ion-button
            :class="['white has-border', view === 'list' ? 'list' : 'map']"
            expand="block"
            @click="toggleView"
            >{{ view === "list" ? "Kartenansicht" : "Listenansicht" }}</ion-button
          >
        </div>
      </div>
    </div>
    <div class="bottom-actions has-bg-darken-grey general-font-size">
      <div v-if="filterStore.loading">Lade...</div>

      <div class="general-font-size" v-else-if="filterStore.filteredResults.length">
        {{ filterStore.filteredResults.length }} Treffer
      </div>
      <div class="general-font-size" v-else>
        Leider keine Ergebnisse gefunden. Bitte passe deine Suche an.
      </div>
    </div>
    <div>
      <div class="ion-padding">
        <FacilityList v-if="view === 'list'" :facility-kind="facilityKind" />
        <FacilityMap v-else-if="view === 'map'" />
      </div>
    </div>
    <ion-loading :is-open="loading" message="Ergebnisse werden geladen..." />
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
} from "@ionic/vue";
import { useRoute } from "vue-router";
import SearchBar from "@/components/health/SearchBar.vue";
import { debounce } from "@/utils/global.utils";

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

const placeHolderText = computed(() => {
  if (facilityKind.value === "facility") return "Name, Fachrichtung,…";
  if (facilityKind.value === "course") return "Name, Kursinhalt,…";
  if (facilityKind.value === "event") return "Name, Thema, Angebote,…";
  if (facilityKind.value === "news") return "Nachrichten suchen";
  return "";
});

const pageTile = computed(() => {
  if (facilityKind.value === "facility") {
    return "Anbietern";
  } else if (facilityKind.value === "course") {
    return "Kursen";
  } else if (facilityKind.value === "event") {
    return "Veranstaltungen";
  } else if (facilityKind.value === "news") {
    return "Beiträgen";
  } else {
    return "Allgemeine Suche";
  }
});

const countSelectedFilters = computed(() => {
  if (filterStore.currentZip) {
    return filterStore.currentTags?.length + 1;
  } else {
    return filterStore.currentTags?.length;
  }
});

const searchLabel = computed(() => {
  if (facilityKind.value) {
    return `Suche nach passenden ${pageTile.value}`;
  } else {
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
  if (kind === "facility") return "Zu den Einrichtungen";
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
  facilityKind.value = undefined;
});
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


.icon-container
  display: flex
  flex-wrap: wrap
  align-content: center
  align-items: center
  margin-top: -1rem
  .flex-wrap
  flex-wrap: wrap
  justify-content: start

.bottom-actions
  display: flex
  flex-wrap: wrap
  align-content: center
  align-items: center
  height: 50px
  width: 100%
  justify-content: center
  background: #636362
  color: white
  text-align: center

.filter-container
  margin-top: -10px
  display: flex
  align-items: center
  justify-content: center
  .counter
    color: #8ab61d
    margin-top: -40px
    margin-left: -12px
    background-color: #ffffff
    padding: 2px 9px
    border-radius: 50%
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
.filter-icon
  color: white
  width: 30px
</style>
