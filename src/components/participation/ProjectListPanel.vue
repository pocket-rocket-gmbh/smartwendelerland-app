<template>
  <ion-grid style="--ion-grid-column-padding: 0px;">
    <ion-row>
      <ion-col size="5"><img :src="project.image_url"/></ion-col>
      <ion-col style="background-color: grey;">
        <ion-grid>
          <ion-row>
            <ion-label>{{ project.name }}</ion-label>
          </ion-row>
          <ion-row>
            <ion-label>{{ useDatetime().getTimeRangeString(project) }}</ion-label>
          </ion-row>
          <ion-row>
            <ion-label>Baukosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</ion-label>
          </ion-row>
        </ion-grid>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonLabel, IonGrid, IonRow, IonCol } from '@ionic/vue'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'

export default defineComponent({
  name: 'ParticipationProjectListPanel',
  props: {
    project: Object
  },
  components: { IonLabel, IonGrid, IonRow, IonCol },
  setup() {
    return {
      useDatetime,
      useCurrency
    }
  }
})
</script>
