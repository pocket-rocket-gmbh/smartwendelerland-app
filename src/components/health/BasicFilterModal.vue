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
        <div v-for="filter in basicFilters" :key="filter.id">
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
import { FilterKind, FilterType, useFilterStore } from "@/stores/health/searchFilter";
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

const loadingFilters = ref(false)
const basicFilters = ref([]);

onMounted(async () => {
  loadingFilters.value = true;
  basicFilters.value = useFilterStore().basicFilters

  const allOptionsPromises = basicFilters.value.map((filter) => useFilterStore().getFilters(filter.id));
  const allOptions = await Promise.all(allOptionsPromises);

  allOptions.forEach((options, index) => {
    filterOptions.value.push({
      parentId: basicFilters.value[index].id,
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
</style>