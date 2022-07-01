<template>
  <page-layout title="PDF Download">

    <ion-grid>
      <ion-row>
        <ion-col><ion-label>Beispieldownload:</ion-label></ion-col>
      </ion-row>      
      <ion-row>
        <ion-col><ion-button @click="downloadAndShowPdf()">Download PDF</ion-button></ion-col>
      </ion-row>
    </ion-grid>

    <ion-loading
      :is-open="loadingInProgress"
    />

  </page-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonGrid, IonRow, IonCol, IonButton, IonLabel, IonLoading, isPlatform } from '@ionic/vue'
import { usePdfDownloadApi } from '@/composables/api/pdfDownloadApi'
import PageLayout from '@/components/PageLayout.vue'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { FileOpener } from '@awesome-cordova-plugins/file-opener'

export default defineComponent({
  name: 'PdfDownloadPage',
  components: { PageLayout, IonGrid, IonRow, IonCol, IonLabel, IonButton, IonLoading },
  setup() {
    const pdfDownloadApi = usePdfDownloadApi()

    const loadingInProgress = ref(false)

    const downloadAndShowPdf = () => {

      loadingInProgress.value = true

      pdfDownloadApi.downloadPdf().then(() => {

        // Cordova to only match real android/ios devices or emulators
        if (isPlatform('cordova')) {
          const pdfContentBase64 = convertToBase64(pdfDownloadApi.getDownloadedPdf())

          Filesystem.writeFile({
            path: 'example.pdf',
            data: pdfContentBase64,
            directory: Directory.Data
          }).then((result) => {
            FileOpener.open(result.uri, 'application/pdf')
          })
        }
        else {
          const pdfContent: any = pdfDownloadApi.getDownloadedPdf()
          const url = URL.createObjectURL(new Blob([pdfContent], { type: 'application/pdf' }))
          window.open(url)
        }
      }).finally( () => loadingInProgress.value = false ) 
    }

    const convertToBase64 = (data: Uint8Array) => {
        let binary = '';
        for (var i = 0; i < data.byteLength; i++) {
          binary += String.fromCharCode( data[ i ] );
        }

        return btoa(binary)
    }

    return {
      loadingInProgress,
      downloadAndShowPdf
    }
  }
})
</script>

<style scoped>
</style>
