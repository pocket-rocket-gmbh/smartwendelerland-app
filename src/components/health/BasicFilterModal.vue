<template>
  <ion-modal :is-open="true" :can-dismiss="true">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ currenStepTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose()">Fertig</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-header>
      
        <ion-segment>
          <ion-segment-button @click.prevent="changeCurrentStep('types')">
            <ion-label class="general-fint-size">Branche</ion-label>
          </ion-segment-button>
          <ion-segment-button @click.prevent="changeCurrentStep('community')">
            <ion-label>Gemeinde</ion-label>
          </ion-segment-button>
          <ion-segment-button @click.prevent="changeCurrentStep('filter')">
            <ion-label>Leistung</ion-label>
          </ion-segment-button>
        </ion-segment>
  
    </ion-header>
    <ion-content v-if="currentStep === 'types' || !currentStep.length">
      <div v-if="!loadingFilters" class="filters">
        <div v-for="filter in mainFilters" :key="filter.id">
          <div class="filter-name general-font-size-title is-dark-grey">
            {{ filter.name }}
          </div>
          <div class="filter-options">
            <label
              :for="option.id"
              class="option"
              v-for="(option, index) in filterOptions.find(
                ({ parentId }) => parentId === filter.id
              ).options"
              :key="index"
            >
              <div
                :model-value="modelValue.includes(option.id)"
                @click.prevent="handleOptionSelect(option)"
                hide-details
                density="compact"
                class="options-select"
                :class="{
                  'is-selected': selectedFilter?.id === option.id,
                }"
              >
                {{ option.name }}
              </div>
            </label>
          </div>
        </div>
      </div>
      <ion-loading
        :is-open="loadingFilters"
        message="Filter werden geladen..."
      />
    </ion-content>
    <ion-content v-if="currentStep === 'community'">
      <CommunityFilter
        ref="communityFilterRef"
        @selectCommunityFilter="selectCommunityFilter"
      />
    </ion-content>
    <ion-content v-if="currentStep === 'filter'">
      <AdvancedFilter
        :filter-kind="filterKind"
        :model-value="modelValue"
        @update:model-value="handleSelectAdvancedFilter"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import CommunityFilter from "@/components/health/CommunityFilter.vue";
import { FilterKind, useFilterStore } from "@/stores/health/searchFilter";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  IonToast,
} from "@ionic/vue";
import { defineEmits, defineProps, onMounted, ref } from "vue";
import AdvancedFilter from "./AdvancedFilter.vue";

const filterStore = useFilterStore();

type Filter = { id: string; name: string };
type FilterOption = {
  parentId: string;
  options: Filter[];
};
const currentStep = ref('types');
const currenStepTitle = ref("Branche wählen")

const tableTile = () => {
  if (currentStep.value === "types") {
    currenStepTitle.value = "Branche wählen";
  } else if (currentStep.value === "community") {
    currenStepTitle.value = "Gemeinde wählen";
  } else if (currentStep.value === "filter") {
    currenStepTitle.value = "Leistung wählen";
  }
}

const changeCurrentStep = (value: string) => {
  currentStep.value = value;
  tableTile();
};

const props = defineProps<{
  modelValue: string[];
  filterKind: FilterKind;
}>();

const emit = defineEmits(["selectBasicFilter", "close", "update:modelValue"]);

const selectedFilter = ref<Filter>();
const filterOptions = ref<FilterOption[]>([]);
const loadingFilters = ref(false);
const mainFilters = ref([]);

const propsModel = ref(props.modelValue);

const emitClose = () => {
  emit("close");
};

const communityFilter = ref(null);

const selectCommunityFilter = (filter: any) => {
  communityFilter.value = filter;
  filterStore.currentZip = filter.zip;
  startSearch();
};

const handleSelectAdvancedFilter = (filter: string[]) => {
  propsModel.value = filter;
  emit("update:modelValue", filter);
};

const startSearch = async () => {
  await filterStore.loadAllResults();
};

const handleOptionSelect = (option: Filter) => {
  if (selectedFilter.value && selectedFilter.value.id !== option.id) {
    const indexOfAlreadySetFilter = propsModel.value.findIndex(
      (item) => item === selectedFilter.value.id
    );

    if (indexOfAlreadySetFilter !== -1) {
      propsModel.value.splice(indexOfAlreadySetFilter, 1);
    }
  }

  const previousIndex = propsModel.value.findIndex(
    (item) => item === option.id
  );

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

  const allOptions = mainFilters.value.map((filter) =>
    allFilters.filter((item) => item.parent_id === filter.id)
  );

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
    const doesInclude = props.modelValue.find(
      (item: string) => item === option.id
    );
    return doesInclude;
  });

  selectedFilter.value = foundFilter;
});

onIonViewWillEnter(() => {
  currentStep.value = "types";
});
</script>

<style lang="sass" scoped>
ion-segment-button
  height: 50px
  min-height: 50px
  font-size: 1.2rem
</style>
