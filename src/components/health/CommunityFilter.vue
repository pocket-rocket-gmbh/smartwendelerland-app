<template>
  <ion-content class="ion-padding-top">
    <div class="filter-options communities">
      <label
        :for="community.id"
        class="option"
        v-for="community in communities"
        :key="community.id"
        :value="community"
      >
        <div
          :model-value="selectedFilter"
          @click.prevent="selectCommunityFilterValue(community)"
          hide-details
          density="compact"
          class="options-select communities"
          :class="{
            'is-selected': filterStore.currentZip === community.zip,
          }"
        >
          {{ community.name }}
        </div>
      </label>
    </div>
  </ion-content>
  <ion-loading :is-open="loadingFilters" message="Gemeinde werden geladen..." />
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

</style>
