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
        <div v-for="filter in mainFilters" :key="filter.id">
          <div class="filter-name">
            {{ filter.name }}
          </div>
          <div class="filter-options">
            <label
              :for="option.id"
              class="option"
              v-for="(option, index) in filterOptions.find(({ parentId }) => parentId === filter.id).options"
              :key="index"
            >
              <input type="radio" :value="option" v-model="selectedFilter" :id="option.id">{{ option.name }}
            </label>
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
import { FilterKind, FilterType } from "@/stores/health/searchFilter";
import { defineEmits, onMounted, ref, watch } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading } from '@ionic/vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';

type Filter = { id: string; name: string };
type FilterOption = {
  parentId: string;
  options: Filter[];
};
const selectedFilter = ref<Filter>();
const emit = defineEmits(["selectBasicFilter", "close"])

const emitClose = () => {
  emit('close')
}
const filterOptions = ref<FilterOption[]>([]);

const getMainFilters = async (filterType: FilterType, filterKind: FilterKind) => {
  const api = useCollectionApi();
  api.setBaseApi(usePublicApi('health'));
  api.setEndpoint(`tag_categories`);

  const response = await api.retrieveCollection();
  if (response.status === ResultStatus.FAILED) {
    throw response;
  }

  const filters: any[] = response?.data?.resources || [];
  const relevantFilter = filters.find(
    (filter) =>
      filter.filter_type === filterType &&
      (filterKind === "course" || filterKind === "event"
        ? filter.kind === "course" || filter.kind === "event"
        : filter.kind === filterKind)
  );

  if (!relevantFilter) return [];

  return await getFilters(relevantFilter.id);
};

const getFilters = async (parentId: string) => {
  const api = useCollectionApi();
  api.setBaseApi(usePublicApi('health'));
  api.setEndpoint(`tag_categories?parent_id=${parentId}`);

  const relevantFilterResponse = await api.retrieveCollection({
    page: 1,
    per_page: 999,
    sort_by: "menu_order",
    sort_order: "asc",
    searchQuery: null as any,
    concat: false,
    filters: [] as any,
  });
  if (relevantFilterResponse.status === ResultStatus.FAILED) {
    throw relevantFilterResponse;
  }
  const filterItemOptions: any[] = relevantFilterResponse?.data?.resources || [];
  return filterItemOptions;
};

const loadingFilters = ref(false)
const mainFilters = ref([]);

onMounted(async () => {
  loadingFilters.value = true;
  mainFilters.value = await getMainFilters('filter_facility', 'facility');

  const allOptionsPromises = mainFilters.value.map((filter) => getFilters(filter.id));
  const allOptions = await Promise.all(allOptionsPromises);

  allOptions.forEach((options, index) => {
    filterOptions.value.push({
      parentId: mainFilters.value[index].id,
      options,
    });
  });
  loadingFilters.value = false;
})

watch(selectedFilter, () => {
  emit('selectBasicFilter', selectedFilter.value)
})

</script>

<style lang="sass" scoped>
.filters
  padding: 10px
  margin-bottom: 20px
  .option
    border-radius: 7px
    padding: 5px
    border: 1px solid black
    margin-right: 10px
    white-space: nowrap
  .filter-name
    font-size: 18px
    font-weight: bold
    margin-top: 10px
  input
    margin-top: 20px
    margin-bottom: 10px
    margin-right: 10px
</style>