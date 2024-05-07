<template>
  <div class="divider"></div>
  <ion-content class="ion-padding-top" overflow-scroll="true">
    <div class="filter-options communities content-wrap">
      <label
        :for="community.id"
        class="option"
        v-for="community in filterStore.filteredCommunities"
        :key="community.id"
        :value="community"
      >
        <div
          @click.prevent="handleOptionSelectCommunity(community)"
          hide-details
          class="options-select communities general-font-size"
          :class="{
            'is-selected': filterStore.currentZips.includes(community.zip),
          }"
        >
          {{ community.name }}
        </div>
      </label>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { useFilterStore } from "@/stores/health/searchFilter";
import { IonContent } from "@ionic/vue";
import { onMounted } from "vue";

const filterStore = useFilterStore();

const handleOptionSelectCommunity = (community: any) => {
  if (filterStore.currentZips.includes(community?.zip)) {
    filterStore.currentZips = filterStore.currentZips.filter(
      (item: any) => item !== community.zip
    );
  } else {
    filterStore.currentZips.push(community.zip);
  }
  filterStore.loadAllResults();
};

const handleClearTermSearch = () => {
  if (filterStore.currentSearchTerm) {
    filterStore.clearTermSearch();
  }
  return;
};

onMounted(async () => {
  await filterStore.loadAllCommunities();
  filterStore.loadFilteredCommunities();
  handleClearTermSearch();
});
</script>

<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px
</style>
