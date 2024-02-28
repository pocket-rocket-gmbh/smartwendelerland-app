<template>
  <ion-modal :is-open="true" :can-dismiss="true" :onDidDismiss="emitClose">
    <ion-header mode="md">
      <ion-toolbar>
        <ion-button
          mode="md"
          shape="round"
          class="green-button"
          slot="end"
          @click="emitClose"
          >Fertig</ion-button
        >
      </ion-toolbar>
    </ion-header>
    <ion-loading :is-open="loading" />
    <iframe
      v-if="!loading"
      :src="`https://docs.google.com/gview?url=${subSubCategory}&embedded=true`"
      style="width: 100%; height: 100%"
      frameborder="0"
    ></iframe>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonHeader,
  IonModal,
  IonToolbar,
  IonLoading,
} from "@ionic/vue";
import { defineEmits, defineProps, ref } from "vue";

const props = defineProps({
  subSubCategory: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const emitClose = () => {
  emit("close");
};

const loading = ref(true);

setTimeout(() => {
  loading.value = false;
}, 2000);
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
