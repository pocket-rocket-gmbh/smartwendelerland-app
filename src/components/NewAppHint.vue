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
            v-if="isPlatform('ios')"
            expand="full"
          >
            meinWND im AppStore
          </IonButton>
          <IonButton
            href="https://play.google.com/store/apps/details?id=smawela.pocketrocket.io"
            v-if="isPlatform('android')"
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

const isOpen = useSessionStorage("meinWndHintOpen", true);
</script>

<style lang="css">
footer {
  position: fixed;

  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}
</style>
