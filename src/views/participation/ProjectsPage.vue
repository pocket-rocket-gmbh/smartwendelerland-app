<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="!loadingInProgress && projects.getCount <= 0" class="ion-text-center ion-padding-top">
        Keine Projekte gefunden
      </div>
      <ion-list v-else>
        <ion-item v-for="project in projects.list" :router-link="`project/${project.id}`" :key="project.id">
          <ion-label>{{ project.id }}</ion-label> <ion-label>{{ project.name }}</ion-label>
        </ion-item>        
      </ion-list>      

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekte werden geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading, onIonViewDidEnter, RefresherCustomEvent } from '@ionic/vue'
import { checkboxOutline, checkboxSharp } from 'ionicons/icons'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { useOrdersStore } from '@/stores/server-cache/orders'
import { useOrdersApi } from '@/composables/api/ordersApi'

export default  defineComponent({
  name: 'ListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonLoading },
  setup() {

    const projects = useOrdersStore()
    const projectsApi = useOrdersApi()

    const loadingInProgress = ref(false)

    onIonViewDidEnter(() => {
      if (!projects.list) {
        loadingInProgress.value = true
        projectsApi.loadOrders().then(() => {
          loadingInProgress.value = false
        })
      }
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      loadingInProgress.value = true
      projectsApi.loadOrders().then(() => {
        loadingInProgress.value = false
      })
      event.target.complete() // we have a separate loading indicator so we can complete the refresh indicator
    }

    return {
      checkboxOutline,
      checkboxSharp,
      loadingInProgress,
      doRefresh,
      projects
    }
  }
})
</script>
