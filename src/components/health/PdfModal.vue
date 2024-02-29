<template>
  <ion-modal :is-open="true" :can-dismiss="true" :onDidDismiss="emitClose">
    <ion-header mode="md">
      <ion-toolbar>
        <ion-button
          :key="key"
          mode="md"
          shape="round"
          class="green-button close-pdf"
          slot="end"
          @click="emitClose"
          >Fertig</ion-button
        >
      </ion-toolbar>
    </ion-header>
    <ion-loading :is-open="!loaded" />
    <iframe
      :key="key"
      style="width: 100%; height: 100%"
      src="https://docs.google.com/viewer?url=https://www.kvhs-wnd.de/fileadmin/user_upload/Kursprogramm/KVHS_Programm_2023.pdf&embedded=true"
      frameborder="0"
      @load="loaded = true"
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
  onIonViewWillEnter,
  onIonViewDidEnter,
} from "@ionic/vue";
import { defineEmits, defineProps, onMounted, ref } from "vue";

const key = ref(1);
const loaded = ref(false);

onMounted(() => {
  const interval = setInterval(() => {
    if (loaded.value) {
      clearInterval(interval);

      return;
    }

    key.value++;
  }, 1000);
  loaded.value = true;
});

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

.close-pdf
  margin-right: 10px
</style>
