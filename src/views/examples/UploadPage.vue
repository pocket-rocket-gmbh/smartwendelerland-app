<template>
  <page-layout title="Upload">
    <ion-grid>
      <ion-row>
        <ion-col>
          <form enctype="multipart/form-data" novalidate>
            <!-- hide the default view of the file input and trigger it via a button below instead -->
            <input ref="fileChooser" type="file" style="display:none;" @change="selectFile"/>
          </form>
          <ion-button expand="block" @click="$refs.fileChooser.click()">Datei auswählen</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <img v-if="previewImage" :src="previewImage"/>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button v-if="file" expand="block" @click="uploadFile">Hochladen</ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>

    <ion-loading
      :is-open="loadingInProgress"
    />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IonGrid, IonCol, IonRow, IonButton, IonLoading, toastController } from '@ionic/vue';
import { useUploadApi } from '@/composables/api/uploadApi'
import { ResultStatus } from '@/types/apiCallResult'
import PageLayout from '@/components/PageLayout.vue'

export default defineComponent({
  name: 'BlueprintPage',
  components: { PageLayout, IonGrid, IonCol, IonRow, IonButton, IonLoading },
  setup() {
    const uploadApi = useUploadApi()

    const loadingInProgress = ref(false)
    const previewImage = ref(null)
    const file = ref(null)

    const selectFile = (event: Event) => {

      const target = event.target as HTMLInputElement

      if (target && target.files && target.files.length > 0) {
        let reader = new FileReader();
        reader.onload = (event:any) => {
          previewImage.value = event.target.result;
        }

        reader.readAsDataURL(target.files[0]);
      }

      file.value = target.files[0]
    }

    const uploadFile = () => {
      if (file.value) {
        loadingInProgress.value = true
        uploadApi.upload(file.value).then((result) => {
          loadingInProgress.value = false          

          if (result.status === ResultStatus.FAILED) {

            file.value = null
            previewImage.value = null

            toastController.create({
              message: 'Hochladen fehlgeschlagen',
              duration: 2000
            }).then((toast) => toast.present())
          }
          else {

            file.value = null

            toastController.create({
              message: 'Hochladen erfolgreich',
              duration: 2000
            }).then((toast) => toast.present())
          }
        })
      }
    }

    return {
      previewImage,
      file,
      loadingInProgress,
      selectFile,
      uploadFile
    }
  }
})
</script>

<style scoped>
ion-icon.large {
  font-size: 32px;
}

div.status {
  font-size: 20px;
}

ion-row {
  display: flex;
  align-items: center;
  height: 100%;
}

ion-col {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
