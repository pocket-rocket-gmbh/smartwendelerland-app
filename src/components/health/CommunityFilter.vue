<template>
  <ion-content class="ion-padding-top ">
    <div class="filter-options communities content-wrap">
      <label
        :for="community.id"
        class="option"
        v-for="community in communities"
        :key="community.id"
        :value="community"
      >
        <div
          :model-value="selectedFilter"
          v-if="community?.care_facilities_active_count > '0'"
          @click.prevent="selectCommunityFilterValue(community)"
          hide-details
          density="compact"
          class="options-select communities general-font-size"
          :class="{
            'is-selected': filterStore.currentZip === community.zip,
          }"
        >
          {{ community.name }}
        </div>
        <div
          v-else
          class="options-select is-disabled hypernate general-font-size"
          lang="de"
        >
          {{ community.name }}
        </div>
      </label>
    </div>
  </ion-content>
  <ion-loading
    class="is-dark-grey"
    mode="md"
    :is-open="loadingFilters"
    message="Gemeinde werden geladen..."
  />
</template>

<script setup lang="ts">
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { onMounted, ref, defineEmits, defineExpose } from "vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLoading,
} from "@ionic/vue";
const filterStore = useFilterStore();
const emit = defineEmits(["selectCommunityFilter"]);

const selectedFilter = ref(null);
const loadingFilters = ref(false);
const communitiesApi = useCollectionApi();
communitiesApi.setBaseApi(usePublicApi("health"));
communitiesApi.setEndpoint(`communities`);
const communities = communitiesApi.items;
const getCommunities = async () => {
  loadingFilters.value = true;
  await communitiesApi.retrieveCollection();
  loadingFilters.value = false;
};

const resetFilter = () => {
  selectedFilter.value = null;
};

onMounted(() => {
  getCommunities();
});

const selectCommunityFilterValue = (selectedFilter: any) => {
  selectedFilter.value = selectedFilter;
  emit("selectCommunityFilter", selectedFilter.value);
};

defineExpose({ resetFilter });
</script>

<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px
</style>
