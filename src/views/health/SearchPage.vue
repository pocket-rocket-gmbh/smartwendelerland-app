<template>
  <BackButtonLayout force-back="/health/categories">
    <BasicFilterModal
      v-if="basicFilterModalOpen"
      @close="basicFilterModalOpen = false"
      @selectBasicFilter="selectBasicFilter"
    />
    <AdvancedFilterModal
      v-if="advancedFilterModalOpen"
      @close="advancedFilterModalOpen = false"
      @selectBasicFilter="selectAdvancedFilter"
    />
    <div class="health-top-panel">
      <div class="headline">Suche nach passenden Anbietern</div>
      <div class="gap-1" />
      <div class="gap-1" />
      <div class="label font-size-small">Suchbegriff</div>
      <div :class="['filter-button', { 'is-active' : basicFilter !== null }]" @click="basicFilterModalOpen = true">
        <span v-if="basicFilter">{{ basicFilter.name }}</span>
        <span v-else class="placeholder">Filter wählen</span>
      </div>

      <div class="grid-2">
        <div>
          <div class="label font-size-small">Gemeinde</div>
          <CommunityFilter
            ref="communityFilterRef"
            @selectCommunityFilter="selectCommunityFilter"
          />
        </div>
        <div>
          <div class="label font-size-small">&nbsp;</div>
          <button class="filter-button is-fullwidth" @click="advancedFilterModalOpen = true">
            weitere Filter
            <img src="@/assets/images/filter.svg" class="icon" />
          </button>
        </div>

      </div>

      <div class="buttons">
        <ion-button class="transparent" expand="block" @click="resetFilter">Auswahl zurücksetzen</ion-button>
        <ion-button class="white" expand="block" @click="startSearch">Suche starten</ion-button>
      </div>
    </div>

    <div class="buttons ion-padding">
      <ion-button :class="['white has-border', { 'is-active' : view === 'list' }]" expand="block" @click="view = 'list'">Listenansicht</ion-button>
      <ion-button :class="['white has-border', { 'is-active' : view === 'map' }]" expand="block" @click="view = 'map'">Kartenansicht</ion-button>
    </div>

    <div class="ion-padding">
      <FacilityList v-if="view === 'list'"/>
      <FacilityMap v-else-if="view === 'map'"/>
    </div>

    <ion-loading
      :is-open="loading"
      message="Ergebnisse werden geladen..."
    />
  </BackButtonLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import BasicFilterModal from '../../components/health/BasicFilterModal.vue';
import AdvancedFilterModal from '../../components/health/AdvancedFilterModal.vue';
import CommunityFilter from '@/components/health/CommunityFilter.vue';
import FacilityList from '@/components/health/FacilityList.vue';
import FacilityMap from '@/components/health/FacilityMap.vue';
import { useFilterStore } from '@/stores/health/searchFilter';
import { IonLoading, onIonViewWillEnter, IonButton } from '@ionic/vue';

const filterStore = useFilterStore()
const advancedFilterModalOpen = ref(false)
const basicFilterModalOpen = ref(false)
const basicFilter = ref(null)
const advancedFilter = ref(null)
const communityFilter = ref(null)
const communityFilterRef = ref(null)
const view = ref('list')
const loading = ref(false)

const selectBasicFilter = (filter:any) => {
  basicFilter.value = filter
  // currently supporting only one filter
  filterStore.currentTags = [filter]
}

const selectAdvancedFilter = (filter:any) => {
  console.log(filter)
}

const selectCommunityFilter = (filter:any) => {
  communityFilter.value = filter
  filterStore.currentZip = filter.zip
}

const resetFilter = () => {
  basicFilter.value = null
  communityFilter.value = null
  communityFilterRef.value.resetFilter()

  filterStore.currentTags = []
  filterStore.currentZip = null
}

const startSearch = async () => {
  loading.value = true
  filterStore.currentKinds = ["facility"]
  await filterStore.loadAllResults()
  loading.value = false
}

onIonViewWillEnter(() => {
  startSearch()
})

</script>

<style lang="sass" scoped>
.label
  font-weight: bold
  color: white
.grid-2
  display: grid
  grid-template-columns: 64% 34%
  gap: 2%
.filter-button
  border-radius: 7px
  background: #FFF
  padding: 10px 20px
  position: relative
  .placeholder
    color: var(--placeholder-color)
    opacity: 0.33
  border: 1px solid black
  height: 43.5px
  margin-bottom: 10px
  &.is-active
    color: black
  .icon
    position: absolute
    right: 7px
    top: 14px
    width: 15px
    height: 15px

.buttons
  display: flex
  gap: 10px
  margin-top: 15px
  justify-content: space-between
  ion-button
    flex: 1

</style>