<template>
  <ion-card>
    <div class="image-wrapper">
      <img :src="project.image_url" />
    </div>
    
    <ion-card-header>
      <ion-card-subtitle v-if="project.category">{{ project.category.name }}</ion-card-subtitle>
      <ion-card-title>{{ project.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div>{{ useDatetime().getTimeRangeString(project) }}</div>
      <div v-if="project.costs">Kosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</div>
      <div v-if="project.community && project.zip && project.town">
        {{ project.community }} | {{ project.zip }} - {{ project.town }}
      </div>
      <div class="ion-margin-top">{{ project.excerpt }}</div>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCard, IonButton, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'

export default defineComponent({
  name: 'ParticipationProjectListPanel',
  props: {
    project: Object
  },
  components: { IonCard, IonButton, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent },
  setup() {
    return {
      useDatetime,
      useCurrency
    }
  }
})
</script>
<style scoped>
.image-wrapper {
  position: relative;
}
</style>
