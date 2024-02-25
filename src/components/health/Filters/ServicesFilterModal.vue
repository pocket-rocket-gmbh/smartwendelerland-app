<template>
  <div class="divider"></div>
  <ion-content class="ion-padding-top">
    <div class="filter-options content-wrap">
      <div v-for="filter in availableItemsForServiceList" :key="filter.id" class="">
        <div v-for="item in filter.next" :key="item.id">
          
          <div
            v-if="
              item.next.length &&
              item.next.reduce(
                (acc, subItem) => acc + parseInt(subItem.care_facilities_count),
                0
              )
            "
            class="general-font-size-subtitle font-weight-bold is-dark-grey"
          >
            {{ item.title }}
          </div>
          <div class="the-filter service-filters">
            <div
              class="align-center filter-options"
              v-for="subItem in item.next.filter(
                (subItem) => parseInt(subItem.care_facilities_count) > 0
              )"
              :key="subItem.id"
            >
              <div
                v-if="subItem"
                class="align-center"
                :class="{
                  selected:
                    isSelectedTagNext(subItem) || expandedItemIds.includes(subItem.id),
                }"
              >
                <div
                  @click.prevent="toggleSelection(subItem)"
                  hide-details
                  density="compact"
                  class="options-select general-font-size"
                  :class="{
                    'is-selected': filterStore.currentServiceTags.includes(subItem.id),
                  }"
                >
                  <span>
                    {{ subItem.title }}
                  </span>
                </div>

                <span v-if="subItem.next.length">
                  <v-icon
                    class="is-clickable"
                    v-if="expandedItemIds.includes(subItem.id)"
                    size="x-large"
                    >mdi-menu-up</v-icon
                  >
                  <span v-else>
                    <v-icon class="is-clickable" size="x-large">mdi-menu-down</v-icon>
                  </span>
                </span>
              </div>
              <div v-if="subItem.next.length && expandedItemIds.includes(subItem.id)">
                <div class="tag-select" v-for="tag in subItem.next" :key="tag.id">
                  <v-divider></v-divider>
                  <v-checkbox
                    :class="{ selected: isSelected(tag.id) }"
                    class="mb-n4"
                    :label="tag.title"
                    v-model="filterStore.currentServiceTags"
                    :value="tag.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { useFilterStore } from "@/stores/health/searchFilter";
import type { CollapsibleListItem } from "../../../types/collapsibleList";
import { IonContent, IonLoading } from "@ionic/vue";
import { watch, onMounted, ref } from "vue";
import { deepToRaw } from "@/utils/global.utils";

const filterStore = useFilterStore();

const dialog = ref(false);

const availableItemsForServiceList = ref<CollapsibleListItem[]>([]);
const expandedItemIds = ref([]);

const isSelected = (itemId: string) => {
  return filterStore.currentServiceTags.includes(itemId);
};

const isSelectedTagNext = (tag: CollapsibleListItem) => {
  if (tag.next?.length) {
    return tag.next.some((subTag) => isSelected(subTag.id));
  }
  return isSelected(tag.id);
};

const toggleSelection = (item: CollapsibleListItem) => {
  if (item.next?.length) {
    const index = expandedItemIds.value.findIndex(
      (expandedItemId: any) => expandedItemId === item.id
    );

    if (index === -1) {
      expandedItemIds.value.push(item.id);
    } else {
      expandedItemIds.value.splice(index, 1);
    }
    return;
  }

  if (isSelected(item.id)) {
    filterStore.currentServiceTags = filterStore.currentServiceTags.filter(
      (id: any) => id !== item.id
    );
  } else {
    filterStore.currentServiceTags.push(item.id);
  }
};

const checkIfFiltersAreInFacilities = (
  filters: CollapsibleListItem[],
  filterIdsInFacility: string[]
) => {
  filters = filters.filter((currentFilter) => {
    if (filterIdsInFacility.includes(currentFilter.id)) {
      return true;
    }

    if (currentFilter.next?.length) {
      currentFilter.next = checkIfFiltersAreInFacilities(
        currentFilter.next,
        filterIdsInFacility
      );
      return currentFilter.next.length;
    }

    return false;
  });
  return filters;
};

watch(
  () => filterStore.filteredResults,
  (newValue: any) => {
    availableItemsForServiceList.value = [...deepToRaw(filterStore.allServiceTags)];
    checkIfFiltersAreInFacilities(
      availableItemsForServiceList.value,
      newValue.map((facility: any) => facility.tag_category_ids).flat()
    );

    filterStore.loadAllFacilityFilters();
    emitFiltersUpdated();
  },
  {
    deep: true,
  }
);

const emitFiltersUpdated = () => {
  checkIfFiltersAreInFacilities(
    availableItemsForServiceList.value,
    filterStore.allResults.map((facility: any) => facility.tag_category_ids).flat()
  );
};
watch(
  () => filterStore.allServiceTags,
  () => {
    availableItemsForServiceList.value = [...deepToRaw(filterStore.allServiceTags)];
    checkIfFiltersAreInFacilities(
      availableItemsForServiceList.value,
      filterStore.allResults.map((facility: any) => facility.tag_category_ids).flat()
    );
  },
  {
    deep: true,
  }
);

onMounted(async () => {
  emitFiltersUpdated();
  await useFilterStore().loadAllServiceFilters();
});
</script>

<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px

.the-filter
  display: flex
  flex-wrap: wrap

.filter-options
  margin-bottom: 30px
</style>
