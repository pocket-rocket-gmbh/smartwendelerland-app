<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Info</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Info</ion-title>
        </ion-toolbar>
      </ion-header>

      Infoseite

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/vue'

export default  defineComponent({
  name: 'AboutPage',
  components: { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent }
})
</script>
