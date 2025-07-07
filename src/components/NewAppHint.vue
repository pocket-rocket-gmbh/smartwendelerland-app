<template>
  <IonModal :isOpen="isOpen">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton @click="isOpen = false">Schließen</IonButton>
        </IonButtons>
        <IonTitle> Hinweis </IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <div id="hint">
        <p>
          Diese App wird bald aus den AppStores entfernt und durch die neue App
          meinWND ersetzt.
        </p>

        <footer class="ion-padding">
          <IonButton
            href="https://apps.apple.com/de/app/meinwnd/id6741873749"
            v-if="isIOSDevice"
            expand="full"
          >
            meinWND im AppStore
          </IonButton>
          <IonButton
            href="https://play.google.com/store/apps/details?id=smawela.pocketrocket.io"
            v-if="isAndroidDevice"
            expand="full"
          >
            meinWND im PlayStore
          </IonButton>
        </footer>
      </div>
    </IonContent>
  </IonModal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  isPlatform,
} from "@ionic/vue";
import { useSessionStorage } from "@vueuse/core";
import { computed } from "vue";

const isOpen = useSessionStorage("meinWndHintOpen", true);

const isIOSDevice = computed(() => {
  if (isPlatform("ios")) return true;

  const userAgent = navigator.userAgent || navigator.vendor;
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;

  if (navigator.platform) {
    return ["iPhone", "iPad", "iPod"].includes(navigator.platform);
  }

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
});

const isAndroidDevice = computed(() => {
  if (isPlatform("android")) return true;

  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
});
</script>

<style lang="css">
footer {
  position: fixed;

  left: 0;
  right: 0;
  bottom: 2vh;
  width: 100%;
}
</style>
