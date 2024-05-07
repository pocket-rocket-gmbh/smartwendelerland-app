<template>
  <BaseLayout :show-login="false">
    <ion-content class="ion-padding">
      <MainCategories />
    </ion-content>
  </BaseLayout>
</template>

<script setup lang="ts">
import { IonContent, onIonViewWillEnter } from "@ionic/vue";
import BaseLayout from "@/components/general/BaseLayout.vue";
import MainCategories from "../../components/health/categories/MainCategories.vue";
import { useFilterStore } from "@/stores/health/searchFilter";
import { useRouter } from "vue-router";

onIonViewWillEnter(() => {
  useFilterStore().currentSearchTerm = "";
});
</script>

<style lang="sass" scoped></style>
