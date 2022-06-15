<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Liste</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Liste</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="!loadingInProgress && orders.getCount <= 0" class="ion-text-center ion-padding-top">
        Keine Einträge gefunden
      </div>
      <ion-list v-else>
        <ion-item v-for="order in orders.list" :router-link="`orders/${order.id}`" :key="order.id">
          <ion-label>{{ order.id }}</ion-label> <ion-label>{{ order.name }}</ion-label>
        </ion-item>        
      </ion-list>      

      <ion-loading
        :is-open="loadingInProgress"
        message="Einträge werden geladen..."
      />

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading, onIonViewDidEnter, RefresherCustomEvent } from '@ionic/vue'
import { checkboxOutline, checkboxSharp } from 'ionicons/icons'
import { useOrdersStore } from '@/stores/server-cache/orders'
import { useOrdersApi } from '@/composables/api/ordersApi'

export default  defineComponent({
  name: 'ListPage',
  components: { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading },
  setup() {

    const orders = useOrdersStore()
    const ordersApi = useOrdersApi()

    const loadingInProgress = ref(false)

    onIonViewDidEnter(() => {
      if (!orders.list) {
        loadingInProgress.value = true
        ordersApi.loadOrders().then(() => {
          loadingInProgress.value = false
        })
      }
    });

    const doRefresh = (event: RefresherCustomEvent) => {
      loadingInProgress.value = true
      ordersApi.loadOrders().then(() => {
        loadingInProgress.value = false
      })
      event.target.complete() // we have a separate loading indicator so we can complete the refresh indicator
    }

    return {
      checkboxOutline,
      checkboxSharp,
      loadingInProgress,
      doRefresh,
      orders: orders
    }
  }
})
</script>
