<template>
  <div class="search-panel">
    <div class="health-panel ion-padding">
      <div class="headline has-text-white" align="center">
        Herzlich Willkommen auf Deiner Gesundheitsplattform im Landkreis Sankt Wendel
      </div>
      <div class="font-size-small has-text-white" align="center">Finde Informationen zu Gesundheitsthemen, Präventionsmaßnahmen sowie umfangreiche Pflegeangebote.</div>

      <SearchBar
        @handleSearch="handleSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterStore } from '@/stores/health/searchFilter';
import { useRouter } from 'vue-router';
import SearchBar from '@/components/health/SearchBar.vue'

const router = useRouter()

const filterStore = useFilterStore()

const handleSearch = async () => {
  filterStore.currentKinds = [];
  filterStore.onlySearchInTitle = false;
  if (filterStore.currentSearchTerm.length > 0) {
    await filterStore.loadAllResults();
    router.push({ path: '/health/search' })
  }
}

</script>

<style lang="sass" scoped>
</style>