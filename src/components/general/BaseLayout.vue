<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Wiiir - Landkreis St. Wendel</ion-title>        
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Wiiir - Landkreis St. Wendel</ion-title>
        </ion-toolbar>
      </ion-header>

      <slot />

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, onIonViewDidEnter } from '@ionic/vue'

export default defineComponent({
  name: 'BaseLayout',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent },
  setup() {
    onIonViewDidEnter(() => {
      console.log('BaseLayout: onIonViewDidEnter')
    })
  }
})
</script>
