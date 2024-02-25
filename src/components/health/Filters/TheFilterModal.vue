<template>
  <ion-modal :is-open="true" :can-dismiss="true">
    <ion-header mode="md">
      <ion-toolbar>
        <ion-title class="general-font-size is-dark-grey modal-title" slot="start"
          >Verfeinere hier deine Suche!</ion-title
        >
        <ion-button
          mode="md"
          shape="round"
          expand="block"
          class="green-button"
          @click="emitClose"
          >Fertig</ion-button
        >
      </ion-toolbar>
    </ion-header>
    <ion-header>
      <ion-segment value="types" mode="md">
        <ion-segment-button @click.prevent="changeCurrentStep('types')" value="types">
          <ion-label class="general-font-size"
            ><span v-if="filterKind === 'course'">Themengebiet</span
            ><span v-else>Branche</span></ion-label
          >
        </ion-segment-button>
        <ion-segment-button @click.prevent="changeCurrentStep('community')">
          <ion-label class="general-font-size">Gemeinde</ion-label>
        </ion-segment-button>
        <ion-segment-button @click.prevent="changeCurrentStep('filter')">
          <ion-label class="general-font-size">Leistung</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>
    <ion-content v-if="currentStep === 'types' || !currentStep.length">
      <MainFiltersFacilityModal
        :filter-kind="filterKind"
      />
    </ion-content>
    <ion-content v-if="currentStep === 'community'">
      <CommunityFilterModal
        ref="communityFilterRef"
      />
    </ion-content>
    <ion-content v-if="currentStep === 'filter'">
      <ServicesFilterModal
        :filter-kind="filterKind"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import CommunityFilterModal from "@/components/health/Filters/CommunityFilterModal.vue";
import ServicesFilterModal from "@/components/health/Filters/ServicesFilterModal.vue";
import MainFiltersFacilityModal from "@/components/health/Filters/MainFiltersFacilityModal.vue";
import { FilterKind, useFilterStore } from "@/stores/health/searchFilter";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { defineEmits, defineProps, onMounted, ref } from "vue";



const filterStore = useFilterStore();

type Filter = { id: string; name: string };
type FilterOption = {
  parentId: string;
  options: Filter[];
};
const currentStep = ref("types");
const currenStepTitle = ref("Branche wählen");

const tableTile = () => {
  if (currentStep.value === "types") {
    currenStepTitle.value = "Branche wählen";
  } else if (currentStep.value === "community") {
    currenStepTitle.value = "Gemeinde wählen";
  } else if (currentStep.value === "filter") {
    currenStepTitle.value = "Leistung wählen";
  }
};

const changeCurrentStep = (value: string) => {
  currentStep.value = value;
  tableTile();
};

const props = defineProps<{
  filterKind: FilterKind;
}>();

const emit = defineEmits(["selectBasicFilter", "close"]);

const selectedFilter = ref<Filter>();
const filterOptions = ref<FilterOption[]>([]);
const loadingFilters = ref(false);
const mainFilters = ref([]);

const multipleSelections = ref<Filter[] | null>();

const emitClose = () => {
  emit("close");
};


onMounted(async () => {
  currentStep.value = "types";
});
</script>

<style lang="sass" scoped>
ion-segment-button
  --color-checked: #8ab61d

ion-segment-button::part(indicator-background)
  --color-checked: #8ab61d

.filters
  margin-bottom: 150px

.modal-title
  margin-left: -10px

ion-modal
  --width: 100%
  --height: 100%
</style>
