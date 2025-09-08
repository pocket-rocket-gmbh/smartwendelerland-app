<template>
  <IonModal :isOpen="isOpen">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton @click="emit('update:isOpen', false)">Schließen</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <div class="ion-text-center">
        <h2 class="is-dark-grey">Mach gesundesWND noch besser!</h2>

        <p class="general-font-size-subtitle is-dark-grey text-wrap">
          Teile deine Erfahrung mit uns – schnell und unkompliziert in nur 5 Minuten. Und mit etwas Glück gewinnst du einen von 8 Gutscheinen!
        </p>

        <div>
          <ion-button
            mode="md"
            class="green-button"
            @click="handleLinkClick('https://survey.lamapoll.de/Evaluation-GPP-Start/de')"
          >
            <span>Jetzt mitmachen</span>
          </ion-button>
        </div>
      </div>
    </IonContent>
  </IonModal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonContent } from "@ionic/vue";
import { defineProps, defineEmits } from "vue";
import { Browser } from "@capacitor/browser";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["update:isOpen"]);

const handleLinkClick = async (url: string) => {
  await Browser.open({ url: url });
  emit("update:isOpen", false);
};
</script>

<style lang="css" scoped>
#hint {
  padding-bottom: 20vh;
}
</style>
