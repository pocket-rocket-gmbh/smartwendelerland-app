<template>
  <div class="health-panel ion-padding">
    <div class="headline has-text-white" align="center">
      Herzlich Willkommen auf Deiner Gesundheitsplattform im Landkreis Sankt Wendel
    </div>
    <div class="font-size-small has-text-white" align="center">Finde Informationen zu Gesundheitsthemen, Präventionsmaßnahmen sowie umfangreiche Pflegeangebote.</div>

    <ion-searchbar
      class="has-background-white"
      placeholder="Suchbgeriff eingeben"
      v-model="searchQuery"
      :debounce="2000"
      @ionChange="emitSearch"
      @ionClear="emitSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { IonSearchbar } from '@ionic/vue';
const emit = defineEmits(['search'])
const searchQuery = ref("")

const emitSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<style lang="sass" scoped>
ion-searchbar
  background-color: white
  padding: 0
  margin: 0
  margin-top: 20px
  height: 35px
  border-radius: 58px
</style>