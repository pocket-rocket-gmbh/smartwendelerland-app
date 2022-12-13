<template>
  <ion-page>
    <ion-content>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size-sm="12" size-md="6" size-lg="3">
            <ion-card>
              <slot />
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonCard, IonContent, IonGrid, IonRow, IonCol } from '@ionic/vue'
export default defineComponent({
  name: 'LoginLayout',
  components: { IonPage, IonCard, IonContent, IonGrid, IonRow, IonCol }
})

</script>
<style lang="sass" scoped>
ion-content
  //--background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  --background: no-repeat center/100% url('@/assets/images/login-background.png')
ion-card
  margin-top: 100px
</style>