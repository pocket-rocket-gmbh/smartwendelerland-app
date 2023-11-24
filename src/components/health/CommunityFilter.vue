<template>
  <ion-content>
    <div class="filter-options communities">
      <label
        :for="community.id"
        class="option"
        v-for="community in communities"
        :key="community.id"
        :value="community"
      >
        <div
          :model-value="selectedFilter"
          @click.prevent="selectCommunityFilterValue(community)"
          hide-details
          density="compact"
          class="options-select communities"
          :class="{
            'is-selected': filterStore.currentZip === community.zip,
          }"
        >
          {{ community.name }}
        </div>
      </label>
    </div>
  </ion-content>
  <ion-loading :is-open="loadingFilters" message="Gemeinde werden geladen..." />
</template>

<script setup lang="ts">
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { onMounted, ref, defineEmits, defineExpose } from "vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToast,
  IonToolbar,
  IonLoading,
  toastController,
} from "@ionic/vue";
const filterStore = useFilterStore();
const emit = defineEmits(["selectCommunityFilter"]);

const selectedFilter = ref(null);
const loadingFilters = ref(false);
const communitiesApi = useCollectionApi();
communitiesApi.setBaseApi(usePublicApi("health"));
communitiesApi.setEndpoint(`communities`);
const communities = communitiesApi.items;
const getCommunities = async () => {
  loadingFilters.value = true;
  await communitiesApi.retrieveCollection();
  loadingFilters.value = false;
};

const resetFilter = () => {
  selectedFilter.value = null;
};

const presentToast = async (selectedFilter: any) => {
  const toast = await toastController.create({
    message: `Gemeinde ${selectedFilter.name} ausgewählt`,
    duration: 3000,
    cssClass: "custom-toast",
   
  });

  await toast.present();
};

onMounted(() => {
  getCommunities();
});

const selectCommunityFilterValue = (selectedFilter: any) => {
  console.log("selectedFilter", selectedFilter);
  selectedFilter.value = selectedFilter;
  emit("selectCommunityFilter", selectedFilter.value);
  presentToast(selectedFilter);
};

defineExpose({ resetFilter });
</script>

<style>
ion-toast.custom-toast {
  --background: #8ab61d;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: #4b4a50;
}

ion-toast.custom-toast::part(message) {
  font-style: italic;
  color: white;
  font-size: 1.2rem;
}

</style>
