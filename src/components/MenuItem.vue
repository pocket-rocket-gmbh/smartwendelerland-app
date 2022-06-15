<template>
  <ion-menu-toggle auto-hide="false">
    <ion-item :router-link="link" lines="none" detail="false" class="hydrated">
      <ion-icon slot="start" :ios="iconIos" :md="iconMd"></ion-icon>
      <ion-label>{{ label }}</ion-label>
    </ion-item>
  </ion-menu-toggle>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonMenuToggle, IonItem, IonIcon, IonLabel } from '@ionic/vue'

export default defineComponent({
  name: 'MenuItem',
  components: { IonIcon, IonLabel, IonItem, IonMenuToggle },
  props: {
    label: String,
    link: String,
    iconIos: String,
    iconMd: String 
  }
});
</script>
