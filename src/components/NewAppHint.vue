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
        <h2>Liebe Nutzer,</h2>

        <p>
          Wir arbeiten kontinuierlich daran, unsere App für Sie zu verbessern.
          Deshalb haben wir eine neue Version entwickelt, die noch informativer,
          interaktiver und benutzerfreundlicher ist.
        </p>

        <p>
          Diese Version der App wird in Kürze durch unsere neue, verbesserte App
          <strong>meinWND</strong> ersetzt.
        </p>

        <p>
          <strong>
            Hier klicken und die neue Landkreis App meinWND direkt
            herunterladen!
          </strong>
        </p>

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

        <p>
          <strong>meinWND</strong> ist die neue App für den ganzen Landkreis
          Sankt Wendel.
        </p>

        <p>
          Neben den bekannten Funktionen warten zahlreiche neue Features auf
          Sie. Darunter Informationen zu Veranstaltungen, Restaurants,
          Freizeitangeboten, Abfallkalender und vieles mehr.
        </p>

        <p><strong>Viel Spaß beim Ausprobieren!</strong></p>

        <p>Ihr meinWND-Team</p>
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
import { Capacitor } from "@capacitor/core";
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

  const userAgent = navigator.userAgent || navigator.vendor || "";
  if (/android/i.test(userAgent)) return true;

  if (navigator.platform && /android/i.test(navigator.platform)) return true;

  if (/linux/i.test(userAgent) && /mobile/i.test(userAgent)) return true;

  try {
    if (Capacitor.getPlatform() === "android") return true;
  } catch (e) {
    // Capacitor not available, continue with other methods
  }

  return false;
});
</script>

<style lang="css" scopen>
#hint {
  padding-bottom: 20vh;
}
</style>
