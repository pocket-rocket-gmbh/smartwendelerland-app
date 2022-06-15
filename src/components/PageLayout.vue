<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>        
        <ion-title size="small">{{ activeOrder?.id }}</ion-title>
        <slot name="header" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ title }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <slot />

    </ion-content>

    <ion-footer>
      <slot name="footer" />
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonFooter } from '@ionic/vue'
import { useOrdersStore } from '@/stores/server-cache/orders'

export default defineComponent({
  name: 'PageLayout',
  props: {
    title: String
  },
  components: { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonFooter },
  setup() {
    const route = useRoute()
    const orders = useOrdersStore()

    const activeOrder = computed(() => {
      return orders.getById(route.params.id?.toString())
    })

    return {
      activeOrder      
    }
  }
})
</script>
