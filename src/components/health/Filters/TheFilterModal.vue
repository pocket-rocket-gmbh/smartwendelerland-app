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
        :filterKind="filterKind"
        :modelValue="filterStore.currentFacilityTags"
      />
    </ion-content>
    <ion-content v-if="currentStep === 'community'">
      <CommunityFilterModal />
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
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { defineEmits, defineProps, onMounted, ref, watch } from "vue";

const currentStep = ref("types");
const currenStepTitle = ref("Branche wählen");

const filterStore = useFilterStore();

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

const emit = defineEmits(["close"]);

const emitClose = () => {
  emit("close");
};

const startedAt = ref<null | "facilities" | "services" | "communities">(null);

const handleStartedAt = (origin: "facilities" | "services" | "communities") => {
  if (startedAt.value) {
    startedAt.value = origin;
    return;
  }

  if (
    filterStore.currentFacilityTags.length === 0 &&
    filterStore.currentServiceTags.length === 0 &&
    filterStore.currentZips.length === 0
  ) {
    if (startedAt.value) {
      startedAt.value = null;
      return;
    }
    startedAt.value = origin;
  }
};

watch(
  () => filterStore.currentFacilityTags,
  async () => {
    await filterStore.loadAllResults();

    handleStartedAt("facilities");

    if (startedAt.value !== "services") filterStore.loadAllServiceFilters();
    if (startedAt.value !== "communities") filterStore.loadFilteredCommunities();
  },
  {
    deep: true,
  }
);

watch(
  () => filterStore.currentZips,
  async () => {
    await filterStore.loadAllResults();

    handleStartedAt("communities");

    if (startedAt.value !== "services") filterStore.loadAllServiceFilters();
    if (startedAt.value !== "facilities") filterStore.loadFilteredFacilityMainFilters();
  },
  {
    deep: true,
  }
);

watch(
  () => filterStore.currentServiceTags,
  async () => {
    await filterStore.loadAllResults();

    handleStartedAt("services");

    if (startedAt.value !== "communities") filterStore.loadFilteredCommunities();
    if (startedAt.value !== "facilities") filterStore.loadFilteredFacilityMainFilters();
  },
  {
    deep: true,
  }
);


onMounted(async () => {
  currentStep.value = "types";
  await filterStore.loadAllResults();
  filterStore.loadAllServiceFilters();

  await filterStore.loadAllFacilityFilters();
  filterStore.loadFilteredFacilityMainFilters();
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
