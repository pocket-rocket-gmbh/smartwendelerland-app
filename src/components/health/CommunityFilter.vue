<template>
  <ion-select
    :toggle-icon="caretDownSharp"
    interface="popover"
    placeholder="Gemeinde wählen"
    v-model="selectedFilter"
  >
    <ion-select-option
      v-for="community in communities"
      :key="community.id"
      :value="community"
    >
      {{ community.name }}
    </ion-select-option>
  </ion-select>
</template>

<script setup lang="ts">
import { useCollectionApi } from "@/composables/api/collectionApi";
import { usePublicApi } from "@/composables/api/public";
import { onMounted, ref, watch, defineEmits, defineExpose } from "vue";
import { IonSelect, IonSelectOption } from "@ionic/vue";
const emit = defineEmits(["selectCommunityFilter"]);

const selectedFilter = ref(null);
const communitiesApi = useCollectionApi();
communitiesApi.setBaseApi(usePublicApi("health"));
communitiesApi.setEndpoint(`communities`);
const communities = communitiesApi.items;
const getCommunities = async () => {
  await communitiesApi.retrieveCollection();
};

const resetFilter = () => {
  selectedFilter.value = null;
};

onMounted(() => {
  getCommunities();
});

watch(selectedFilter, () => {
  emit("selectCommunityFilter", selectedFilter.value);
});

defineExpose({ resetFilter });
</script>

<style lang="sass" scoped>
ion-select
  background: white
  border-radius: 7px
  border: 1px solid black
</style>
