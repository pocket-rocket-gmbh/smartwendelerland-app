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
              @click.prevent="handleOptionSelect(option)"
            >
              <input type="radio" :checked="selectedFilter?.id === option.id" :id="option.id">
              {{ `${option.name}${selectedFilter?.id === option.id ? '' : '' }` }}
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
import { FilterKind, FilterType, useFilterStore } from "@/stores/health/searchFilter";
import { defineEmits, onMounted, ref, defineProps } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading } from '@ionic/vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';

type Filter = { id: string; name: string };
type FilterOption = {
  parentId: string;
  options: Filter[];
};

const props = defineProps<{
  modelValue: string[];
  filterKind: FilterKind;
}>()

const emit = defineEmits(["selectBasicFilter", "close", "update:modelValue"])

const selectedFilter = ref<Filter>();
const filterOptions = ref<FilterOption[]>([]);
const loadingFilters = ref(false)
const mainFilters = ref([]);

const propsModel = ref(props.modelValue);

const emitClose = () => {
  emit('close')
}

const handleOptionSelect = (option: Filter) => {
  if (selectedFilter.value && selectedFilter.value.id !== option.id) {
    const indexOfAlreadySetFilter = propsModel.value.findIndex((item) => item === selectedFilter.value.id);

    if (indexOfAlreadySetFilter !== -1) {
      propsModel.value.splice(indexOfAlreadySetFilter, 1);
    }
  }

  const previousIndex = propsModel.value.findIndex((item) => item === option.id);

  if (previousIndex !== -1) {
    propsModel.value.splice(previousIndex, 1);
    selectedFilter.value = null;
    emit("selectBasicFilter", null);
  } else if (option) {
    propsModel.value.push(option.id);
    selectedFilter.value = option;
    emit("selectBasicFilter", option);
  }

  emit("update:modelValue", propsModel.value);
};

onMounted(async () => {
  loadingFilters.value = true;
  await useFilterStore().getMainFilters("filter_facility", props.filterKind);
  mainFilters.value = useFilterStore().basicFilters;
  const allFilters = await useFilterStore().getAllFilters();

  const allOptions = mainFilters.value.map((filter) => allFilters.filter(item => item.parent_id === filter.id));

  allOptions.forEach((options, index) => {
    filterOptions.value.push({
      parentId: mainFilters.value[index].id,
      options,
    });
  });

  loadingFilters.value = false;

  const allAvailableOptions = filterOptions.value.reduce((prev, curr) => {
    return [...prev, ...curr.options];
  }, [] as Filter[]);

  const foundFilter = allAvailableOptions.find((option) => {
    const doesInclude = props.modelValue.find((item: string) => item === option.id);
    return doesInclude;
  });

  selectedFilter.value = foundFilter;
})

</script>

<style lang="sass" scoped>
</style>