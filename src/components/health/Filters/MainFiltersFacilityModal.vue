<template>
  <div class="divider"></div>
  <ion-content class="ion-padding-top">
    <div class="filter-options content-wrap">
      <div v-for="filter in filterStore.filteredFacilityMainFilters" :key="filter.id">
        <div
          v-if="hasActiveOptions(filter.id)"
          class="general-font-size-subtitle font-weight-bold is-dark-grey the-filters"
        >
          <div>{{ filter.name }}</div>
        <div>
          <ion-button
            mode="md"
            class=""
            :class="areAllSelected(filter) ? 'green-button' : 'green-button-plus'"
            @click="handleToggleAll(filter)"
          >
            <span>
              {{ areAllSelected(filter) ? "Alle abwählen" : "Alle auswählen" }}</span
            ></ion-button
          >
        </div>

        </div>
        <div class="the-filter">
          <label class="option" v-for="option in filter.options" :key="option.id">
            <div
              @click.prevent="handleOptionSelect(option)"
              hide-details
              class="options-select communities general-font-size"
              :class="{
                'is-selected': filterStore.filteredFacilityMainFilters.includes(option),
              }"
            >
              {{ option.name }}
            </div>
          </label>
        </div>
      </div>
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
import { useFilterStore } from "@/stores/health/searchFilter";
import { ref, watch, onMounted } from "vue";
type Filter = {
  id: string;
  name: string;
  care_facilities_active_count: number;
};

const hasActiveOptions = (filterId: string) => {
  const options = filterStore.allFacilityMainFilters.find(({ id }) => id === filterId)
    ?.options;
  return (
    options && options.some((option) => Number(option?.care_facilities_active_count) > 0)
  );
};

const multipleSelections = ref<Filter[]>([]);

const loadingFilters = ref(false);
const filterStore = useFilterStore();

const handleClearTermSearch = () => {
  if (filterStore.currentSearchTerm) {
    filterStore.clearTermSearch();
  }
  return;
};
const handleOptionSelect = (option: Filter) => {
  const indexOfAlreadySetFilter = filterStore.filteredFacilityMainFilters.findIndex(
    (item) => item.id === option.id
  );

  if (indexOfAlreadySetFilter !== -1) {
    filterStore.filteredFacilityMainFilters.splice(indexOfAlreadySetFilter, 1);
    multipleSelections.value = multipleSelections.value?.filter(
      (item) => item.id !== option.id
    );
  } else {
    filterStore.filteredFacilityMainFilters.push(option);
    multipleSelections.value.push(option);
  }
};

const handleToggleAll = (filter: any) => {
  const options = filterStore.allFacilityMainFilters.find(({ id }) => id === filter.id)
    ?.options;
  const relevantOptions = options.filter(
    (option) => !!option?.care_facilities_active_count
  );

  const selectAll = !areAllSelected(filter);

  if (selectAll) {
    relevantOptions.forEach((option) => {
      if (!filterStore.filteredFacilityMainFilters.includes(option)) {
        multipleSelections.value.push(option);
      }
    });
  } else {
    relevantOptions.forEach((option) => {
      const indexOfAlreadySetFilter = filterStore.filteredFacilityMainFilters.findIndex(
        (item) => item.id === option.id
      );
      if (indexOfAlreadySetFilter !== -1) {
        filterStore.filteredFacilityMainFilters.splice(indexOfAlreadySetFilter, 1);
      }
    });

    multipleSelections.value = multipleSelections.value.filter(
      (item) => !relevantOptions.find((option) => option.id === item.id)
    );
  }
};

const areAllSelected = (filter: any) => {
  const options = filterStore.allFacilityMainFilters.find(({ id }) => id === filter.id)
    ?.options;
  const relevantOptions = options.filter(
    (option) => !!option?.care_facilities_active_count
  );

  return relevantOptions.every((option) =>
    multipleSelections.value.find((item) => item.id === option.id)
  );
};

watch(
  () => filterStore.filteredFacilityMainFilters,
  () => {
    multipleSelections.value = filterStore.allFacilityMainFilters.reduce((prev, curr) => {
      const foundOptions = curr.options.filter((option) =>
        filterStore.filteredFacilityMainFilters.includes(option.id)
      );
      return [...prev, ...foundOptions];
    }, [] as Filter[]);
  }
);

onMounted(async () => {
  await useFilterStore().loadAllFacilityFilters(),
    useFilterStore().loadFilteredFacilityMainFilters();
});
</script>
<style lang="sass" scoped>
.content-wrap
  padding-bottom: 150px

.the-filters
  display: flex
  flex-wrap: wrap
  align-items: center
  align-content: center
  gap: 30px
  margin: 20px 0

.the-filter
  display: flex
  flex-wrap: wrap

.filter-options
  margin-bottom: 30px
</style>
