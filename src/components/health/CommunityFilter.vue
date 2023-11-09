<template>
  <ion-content>
    <div class="filter-options communities ion-padding">
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
</template>

<script setup lang="ts">
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { onMounted, ref, defineEmits, defineExpose } from "vue";
import {

  useFilterStore,
} from "@/stores/health/searchFilter";
const filterStore = useFilterStore();
const emit = defineEmits(["selectCommunityFilter"]);

const selectedFilter = ref(null);
const communitiesApi = useCollectionApi();
communitiesApi.setBaseApi(usePublicApi("health"));
communitiesApi.setEndpoint(`communities`);
const communities = communitiesApi.items;
const getCommunities = async () => {
  await communitiesApi.retrieveCollection();
};

const resetFilter = () => {
  selectedFilter.value = null;
};

onMounted(() => {
  getCommunities();
});

const selectCommunityFilterValue = (selectedFilter: any) => {
  console.log("selectedFilter", selectedFilter)
  selectedFilter.value = selectedFilter;
  emit("selectCommunityFilter", selectedFilter.value);
};


defineExpose({ resetFilter });
</script>

<style lang="sass" scoped>
ion-select
  background: white
  border-radius: 7px
  border: 1px solid black
</style>
