<template>
  <ion-modal :is-open="true" :can-dismiss="true">
    <ion-header>
      <ion-toolbar>
        <ion-title>Filter</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose()">Schließen</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="!loadingFilters" class="filters">
        <div v-for="filter in itemsForServiceList" :key="filter.key">
          <div v-for="item in filter.next" :key="item.id">
            <div v-if="item.next.length" class="filter-name">{{ item.title }}</div>
            <div class="filter-options">
              <div
                v-for="subItem in item.next"
                :key="subItem.id"
              >
                <label
                  class="option is-fullwidth"
                  :for="subItem.id"
                >
                  <input type="checkbox" :value="subItem" v-model="selectedFilters" :id="subItem.id">
                  {{ subItem.title }} <span v-if="subItem.next.length > 0" class="font-size-small">(Weitere Einträge)</span>
                </label>

                <div v-if="subItem.next.length > 0 && selectedFilters.includes(subItem)">
                  <label
                    v-for="tag in subItem.next"
                    class="option indent is-fullwidth"
                    :for="tag.id"
                    :key="tag.id"
                  >
                    <input
                      type="checkbox"
                      v-model="filterStore.currentTags"
                      :value="tag.id"
                      :id="tag.id"
                    />{{ tag.title }}
                  </label>
                </div>
              </div>
              <!-- <div v-if="subItem.next.length && expandedItemIds.includes(subItem.id)" class="tag-select">
                <input
                  type="checkbox"
                  v-for="tag in subItem.next"
                  v-model="filterStore.currentTags"
                  :value="tag.id"
                  :key="tag.id"
                />
              </div> -->


              <!-- <div
                v-for="subItem in item.next"
                :key="subItem.id"
              >
                <div
                  class="filter-tile"
                  :class="{ selected: isSelected(subItem.id) }"
                  @click="toggleSelection(subItem)"
                >
                  {{ subItem.title }}
                </div>

                
              </div> -->
            </div>
          </div>
        </div>
      </div>
      <ion-loading
        :is-open="loadingFilters"
        message="Filter werden geladen..."
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ResultStatus } from '@/types/serverCallResult'
import { Facility, FilterKind, FilterType, useFilterStore } from "@/stores/health/searchFilter";
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading } from '@ionic/vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import { CollapsibleListItem, EmitAction } from "../../../types/collapsibleList";

const filterStore = useFilterStore()
const itemsForServiceList = ref<CollapsibleListItem[]>([]);
const expandedItemIds = ref([]);

type FilterResponse = {
  id: string;
  name: string;
  menu_order: number;
};

const selectedFilters = ref([])
const emit = defineEmits(["selectAdvancedFilter", "close"])
const props = defineProps<{
  filterKind: FilterKind;
}>();

const emitClose = () => {
  emit('close')
}

const toggleSelection = (item: CollapsibleListItem) => {
  if (item.next?.length) {
    const index = expandedItemIds.value.findIndex((expandedItemId) => expandedItemId === item.id);

    if (index === -1) {
      expandedItemIds.value.push(item.id);
    } else {
      expandedItemIds.value.splice(index, 1);
    }
    return;
  }

  if (isSelected(item.id)) {
    filterStore.currentTags = filterStore.currentTags.filter((id) => id !== item.id);
  } else {
    filterStore.currentTags.push(item.id);
  }
};

const isSelected = (itemId: string) => {
  return filterStore.currentTags.includes(itemId);
};

const api = useCollectionApi();
api.setBaseApi(usePublicApi('health'));

const getItemsAndNext = async (filter: FilterResponse, arrayToAdd: CollapsibleListItem[], layer: number) => {
  api.setEndpoint(`tag_categories?parent_id=${filter.id}`);
  const options = {
    page: 1,
    per_page: 999,
    sort_by: "menu_order",
    sort_order: "asc",
    searchQuery: null as any,
    concat: false,
    filters: [] as any,
  };

  const filterItem: CollapsibleListItem = {
    id: filter.id,
    title: filter.name,
    menuOrder: filter.menu_order,
    layer,
    next: [],
  };

  arrayToAdd.push(filterItem);

  const response = await api.retrieveCollection(options);
  if (response.status === ResultStatus.FAILED) {
    console.error(response);
    throw "Api failure";
  }
  const filterItems: FilterResponse[] = response?.data?.resources;
  if (!filterItems) {
    console.error("No filterItems!");
    return false;
  }

  const nextLayerWave: any[] = filterItems.map((filterItemFromResponse) =>
    getItemsAndNext(filterItemFromResponse, filterItem.next || [], layer + 1)
  );
  return Promise.all(nextLayerWave);
};

const getItems = async () => {
  api.setEndpoint(`tag_categories`);

  const options = {
    page: 1,
    per_page: 999,
    sort_by: "menu_order",
    sort_order: "asc",
    searchQuery: null as any,
    concat: false,
    filters: [] as any,
  };

  const result = await api.retrieveCollection(options);

  if (result.status === ResultStatus.FAILED) {
    console.error(result);
    return;
  }

  const filters: any[] = result?.data?.resources?.filter((item: Facility) => props.filterKind === item.kind); // Filter items for current kind (event/facility/news/course) // hereeeeee!!!!
  if (!filters) {
    console.error("No filters!");
    return;
  }

  const serviceFilters = filters.filter((filter) => filter.filter_type === "filter_service");

  const tmpItemsForServiceList: CollapsibleListItem[] = [];

  const nextLayerWavePromisesService = serviceFilters.map((filter) =>
    getItemsAndNext(filter, tmpItemsForServiceList, 0)
  );
  await Promise.all([...nextLayerWavePromisesService]);

  itemsForServiceList.value = [...tmpItemsForServiceList];
};


const loadingFilters = ref(false)
const mainFilters = ref([]);

onMounted(async () => {
  loadingFilters.value = true;
  await getItems();
  loadingFilters.value = false;
});

watch(selectedFilters, () => {
  emit('selectAdvancedFilter', selectedFilters.value)
})

</script>

<style lang="sass" scoped>
.filters .option
  display: block
  padding: 0px 10px 11px 10px
  margin-top: 10px
  &.indent
    margin-left: 10%
    width: 90%
</style>