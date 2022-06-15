<template>
  <canvas id="signaturepad" width="360" height="400"></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { fabric } from 'fabric'

export default defineComponent({
  name: 'SignaturePad',
  setup() {

    let signaturePad: any = null

    const initialize = () => {

      if (!signaturePad) {
        signaturePad = new fabric.Canvas('signaturepad')
      }

      signaturePad.setBackgroundColor('rgb(255,255,255)')
      signaturePad.selection = false
      signaturePad.isDrawingMode = true
      signaturePad.freeDrawingBrush.width = 5
      signaturePad.requestRenderAll()
    }

    const reset = () => {
      signaturePad.clear()
      initialize()
    }

    const getImageDataUrl = () => {
      return signaturePad.toDataURL({
        format: 'png'
      })
    }

    return {
      initialize,
      reset,
      getImageDataUrl
    }
  }
})
</script>

<style scoped>
</style>