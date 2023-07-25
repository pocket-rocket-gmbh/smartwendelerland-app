<template>
  <div class="search-panel">
    <div class="health-panel ion-padding">
      <div class="headline has-text-white" align="center">
        Herzlich Willkommen auf Deiner Gesundheitsplattform im Landkreis Sankt Wendel
      </div>
      <div class="font-size-small has-text-white" align="center">Finde Informationen zu Gesundheitsthemen, Präventionsmaßnahmen sowie umfangreiche Pflegeangebote.</div>

      <div class="wrap">
        <ion-searchbar
          class="has-background-white"
          placeholder="Suchbegriff eingeben"
          v-model="searchQuery"
          :debounce="2000"
          @ionChange="goToSearchPage"
          @ionClear="clearSearch"
        />
        <div class="popover" v-if="showPopover">
          hallo
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { IonSearchbar } from '@ionic/vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const searchQuery = ref("")
const showPopover = ref(false)

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
.search-panel
  .wrap
    position: relative
    .popover
      position: absolute
      bottom: 300px
      height: 200px
      background: white
      width: 100%
ion-searchbar
  background-color: white
  padding: 0
  margin: 0
  margin-top: 20px
  height: 35px
  border-radius: 58px
</style>