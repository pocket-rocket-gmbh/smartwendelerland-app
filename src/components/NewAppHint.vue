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
        <h2>🔄 Wir entwickeln uns weiter!</h2>
        <p>Liebe Nutzerinnen und Nutzer,</p>
        <p>
          wir freuen uns, Ihnen mitteilen zu können, dass wir kontinuierlich
          daran arbeiten, Ihre Erfahrung mit unserer App zu verbessern.
        </p>
        <p>
          <strong
            >Diese Version der App wird in Kürze durch unsere neue, verbesserte
            App "meinWND" ersetzt.</strong
          >
        </p>

        <h2>✨ Was bedeutet das für Sie?</h2>
        <ul>
          <li>Diese aktuelle App wird bald aus den App Stores entfernt</li>
          <li>
            Die neue App <strong>meinWND</strong> bietet Ihnen alle gewohnten
            Funktionen und noch mehr
          </li>
          <li>
            Wir haben das Design überarbeitet und die Benutzerfreundlichkeit
            optimiert
          </li>
          <li>Neue Features und Verbesserungen warten auf Sie</li>
        </ul>

        <h2>📱 Nächste Schritte</h2>
        <p>
          Um auch weiterhin von unserem Service zu profitieren, laden Sie bitte
          rechtzeitig die neue App <strong>meinWND</strong> aus dem App Store
          herunter.
        </p>

        <p>
          <strong>Suchen Sie einfach nach "meinWND" in Ihrem App Store.</strong>
        </p>

        <p><em>Ihr meinWND-Team</em></p>

        <footer>
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
