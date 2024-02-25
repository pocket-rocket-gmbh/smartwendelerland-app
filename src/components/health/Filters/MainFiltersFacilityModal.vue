<template>
  <div class="divider"></div>
  <ion-content class="ion-padding-top">
    <div class="filter-options communities content-wrap">
      <label :for="community.id" class="option" v-for="community in communities" :key="community.id" :value="community">
        <div
          v-if="community && community.care_facilities_active_count > '0'"
          :model-value="selectedCommunityFilter"
          @click.prevent="selectCommunityFilterValue(community)"
          hide-details
          density="compact"
          class="options-select communities general-font-size"
          :class="{
            'is-selected': community && filterStore.currentZip === community.zip,
          }"
        >
          {{ community && community.name }}
        </div>
        <div v-else class="options-select is-disabled hypernate general-font-size" lang="de">
          {{ community && community.name }}
        </div>
      </label>
    </div>
  </ion-content>
  <ion-loading class="is-dark-grey" mode="md" :is-open="loadingFilters" message="Gemeinde werden geladen..." />
</template>

<script setup lang="ts">
import { useFilterStore } from "@/stores/health/searchFilter";
import { IonContent, IonLoading } from "@ionic/vue";
import { defineEmits, defineExpose, onMounted, ref } from "vue";

const filterStore = useFilterStore();
const emit = defineEmits(["selectCommunityFilter"]);

const selectedCommunityFilter = ref(null);
const loadingFilters = ref(false);
const communities = ref([]);

const resetFilter = () => {
  selectedCommunityFilter.value = null;
};

onMounted(async () => {
  communities.value = await filterStore.loadAllCommunities();
});

const selectCommunityFilterValue = (community: any) => {
  if (selectedCommunityFilter.value === community) {
    // Deselect if the same community is clicked again
    selectedCommunityFilter.value = [];
  } else {
    selectedCommunityFilter.value = community;
  }
  emit("selectCommunityFilter", selectedCommunityFilter.value);
};

defineExpose({ resetFilter });
</script>

<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px
</style>
