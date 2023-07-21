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
      @ionChange="goToSearchPage"
      @ionClear="clearSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { IonSearchbar } from '@ionic/vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const searchQuery = ref("")

const goToSearchPage = () => {
  if (searchQuery.value.length > 0) {
    router.push({ path: '/health/search', query: { search: searchQuery.value }})
  }
}

const clearSearch = () => {
  searchQuery.value = ''
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