<template>
  <ion-page>
    <ion-searchbar
    class="has-background-white"
    :placeholder="placeholder"
    v-model="filterStore.currentSearchTerm"
    :debounce="2000"
    @ionChange="emitHandleSearch"
    @ionClear="clearSearch"
  />
  </ion-page>
 
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue';
import { IonSearchbar } from '@ionic/vue';
import { useFilterStore } from '@/stores/health/searchFilter';
const emit = defineEmits(['handleSearch'])

const props = defineProps({
  placeHolderText: {
    type: String,
    required: true
  }
})

const placeholder = computed(() => {
  if (props.placeHolderText) {
    return props.placeHolderText
  } else {
    return 'Suche nach Themen, Anbietern, Kursen,…'
  }
})  



const filterStore = useFilterStore()

const emitHandleSearch = () => {
  emit('handleSearch')
}

const clearSearch = () => {
  filterStore.filteredResults = []
  filterStore.currentSearchTerm = ''
  filterStore.filteredResults = filterStore.allResults
}

</script>

<style lang="sass" scoped>
ion-searchbar
  --background: white
  --background-color: white
  padding: 0
  margin: 0
  margin-top: 20px
  height: 35px
  --border-radius: 7px
  --box-shadow: none
</style>