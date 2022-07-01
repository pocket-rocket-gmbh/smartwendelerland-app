<template>
  <page-layout title="Auftragsbestätigung">
    <signature-pad ref="signaturepad"></signature-pad>
    <ion-button @click="reset()">Reset</ion-button>
    <ion-button @click="imageTest()">Get Image</ion-button>
  </page-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonButton, onIonViewDidEnter } from '@ionic/vue'
import PageLayout from '@/components/PageLayout.vue'
import SignaturePad from '@/components/SignaturePad.vue'

export default defineComponent({
  name: 'OfferConfirmationPage',
  components: { PageLayout, SignaturePad, IonButton },
  setup() {

    const signaturepad = ref(null)

    onIonViewDidEnter(() => {
      signaturepad.value.initialize()
    })

    const reset = () => {
      signaturepad.value.reset()
    }

    const imageTest = () => {
        const result = signaturepad.value.getImageDataUrl()
        console.log(result)
    }

    return {
      signaturepad,
      reset,
      imageTest
    }
  }
})
</script>

<style scoped>
</style>
