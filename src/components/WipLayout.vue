<template>
  <ion-grid>
    <ion-row class="ion-align-items-end">
      <ion-col>
        <ion-icon :ios="constructOutline" :md="constructSharp" />
      </ion-col>
    </ion-row>
    <ion-row class="ion-align-items-start">
      <ion-col>
        WIP
      </ion-col>        
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonGrid, IonRow, IonCol, IonIcon } from '@ionic/vue'
import { constructOutline, constructSharp } from 'ionicons/icons'

export default defineComponent({
  name: 'WipLayout',
  components: { IonGrid, IonRow, IonCol, IonIcon },
  setup() {
    return {
      constructOutline,
      constructSharp
    }
  }
})
</script>

<style scoped>
ion-icon {
  font-size: 64px;
}

ion-grid {
  height: 100%;
  display: flex;
  flex-flow: column;
}

ion-row {
  height: 100%
}

ion-col {
  text-align: center
}
</style>