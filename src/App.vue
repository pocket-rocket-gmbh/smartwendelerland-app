<template>
  <ion-alert
    v-if="!online"
    trigger="present-alert"
    header="Es besteht momentan keine Internetverbindung. Bitte überprüfe deine Verbindung und versuche es später erneut."
    :buttons="alertButtons"
    backdropDismiss="false" 
  ></ion-alert>
  <ion-app v-else>
    <div v-if="appState.isAppLoading" class="vertical-center">
      <div class="center">
        <ion-spinner />
        <div>{{ Math.round(appState.appLoadingProgress * 100) }} %</div>
      </div>
    </div>
    <ion-router-outlet v-else />
    <div class="staging-batch" v-if="isStaging" @click="toggleEnv">
      Testsystem verlassen
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonSpinner, IonRouterOutlet, IonAlert } from "@ionic/vue";
import { computed, onMounted, ref, watch } from "vue";
import { usePollStore } from "@/stores/poll";
import { useAppStateStore } from "@/stores/appState";
import { useMe } from "@/composables/user/me";
import { useEnvStore } from "./stores/env";
import { useFilterStore } from "@/stores/health/searchFilter";
import { useOnline } from "@vueuse/core";

const online = useOnline();

const alertButtons = ref([
  {
    text: "Erneut versuchen",
    role: "confirmed",
    handler: () => {
      window.location.reload();
    },
  },
]);


watch(
  () => online.value,
  window.location.reload,
);

const appState = useAppStateStore();

const isStaging = computed(() => {
  return useEnvStore().env === "staging";
});

const toggleEnv = () => {
  localStorage.removeItem("smawela--env");
  window.location.reload();
};

onMounted(async () => {
  console.log("Loading App...");
  const startTime = Date.now();
  console.log(online.value);
  // Participation
  await useMe().fetchMyUser(),
    useAppStateStore().setAppLoadingProgress(0.3),
    await usePollStore().setPublicPoll(),
    useAppStateStore().setAppLoadingProgress(0.13),
    // health

    //load all filters
    await useFilterStore().loadAllFilters(),
    useAppStateStore().setAppLoadingProgress(0.32),
    //load communities

    await useFilterStore().loadAllCommunities(),
    useFilterStore().loadFilteredCommunities();
  useAppStateStore().setAppLoadingProgress(0.47),
    //load categories

    await useFilterStore().loadAllCategories(),
    useAppStateStore().setAppLoadingProgress(0.64),
    //load all results

    await useFilterStore().loadUnalteredAllResults(),
    await useFilterStore().loadAllResults();
  useAppStateStore().setAppLoadingProgress(0.69),
    //load all filters
    await useFilterStore().loadAllFacilityFilters(),
    useAppStateStore().setAppLoadingProgress(0.75),
    await useFilterStore().loadAllServiceFilters();
  useAppStateStore().setAppLoadingProgress(0.83),
    useFilterStore().loadFilteredFacilityMainFilters();
  useFilterStore().loadFilteredCategories();

  useAppStateStore().setAppLoadingProgress(0.95), useAppStateStore().setAppLoading(false);
  console.log("App loaded - duration: " + (Date.now() - startTime) + " ms");
  useAppStateStore().setAppLoadingProgress(0.99);
});
</script>

<style scoped lang="sass">
.vertical-center
  display: flex
  align-items: center
  justify-content: center
  height: 100%
.staging-batch
  position: fixed
  bottom: 20px
  right: 20px
  background: orange
  color: white
  border-radius: 20px
  font-size: 20px
  padding: 10px
</style>
