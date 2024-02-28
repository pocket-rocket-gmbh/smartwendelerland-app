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
        <ion-segment-button
          @click.prevent="changeCurrentStep('community')"
          value="community"
        >
          <ion-label class="general-font-size">Gemeinde</ion-label>
        </ion-segment-button>
        <ion-segment-button @click.prevent="changeCurrentStep('filter')" value="filter">
          <ion-label class="general-font-size">Leistung</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>
    <ion-loading
      class="is-dark-grey"
      mode="md"
      :is-open="loading"
      v-if="loading"
      message="Filtern werden geladen..."
    />
    <span v-show="!loading">
      <ion-content v-if="currentStep === 'types' || !currentStep.length">
        <MainFiltersFacilityModal
          :filterKind="filterKind"
          v-model="filterStore.currentFacilityTags"
        />
      </ion-content>
      <ion-content v-if="currentStep === 'community'">
        <CommunityFilterModal />
      </ion-content>
      <ion-content v-if="currentStep === 'filter'">
        <ServicesFilterModal :filter-kind="filterKind" />
      </ion-content>
    </span>
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
  IonLoading,
} from "@ionic/vue";
import { defineEmits, defineProps, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

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

watch(
  () => filterStore.currentFacilityTags,
  async () => {
    await filterStore.loadAllResults();

    filterStore.handleStartedAt("facilities");

    if (filterStore.startedAt !== "services") filterStore.loadAllServiceFilters();
    if (filterStore.startedAt !== "communities") filterStore.loadFilteredCommunities();
  },

  {
    deep: true,
  }
);

watch(
  () => filterStore.currentZips,
  async () => {
    await filterStore.loadAllResults();

    filterStore.handleStartedAt("communities");

    if (filterStore.startedAt !== "services") filterStore.loadAllServiceFilters();
    if (filterStore.startedAt !== "facilities")
      filterStore.loadFilteredFacilityMainFilters();
  },
  {
    deep: true,
  }
);

watch(
  () => filterStore.currentServiceTags,
  async () => {
    await filterStore.loadAllResults();

    filterStore.handleStartedAt("services");

    if (filterStore.startedAt !== "communities") filterStore.loadFilteredCommunities();
    if (filterStore.startedAt !== "facilities")
      filterStore.loadFilteredFacilityMainFilters();
  },
  {
    deep: true,
  }
);

const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  currentStep.value = "types";
  filterStore.loadAllServiceFilters();
  if (filterStore.startedAt !== "facilities") {
    await filterStore.loadAllFacilityFilters();
    filterStore.loadFilteredFacilityMainFilters();
  }

  loading.value = false;
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
