<template>
  <div v-if="filterStore.filteredResults.length > 0">
    {{ filterStore.filteredResults.length  }}
    <div v-for="facility in filterStore.filteredResults" :key="facility.id" class="facility-box" @click="router.push({ path: `/health/care_facilities/${facility.id}`})">
      <div class="general-font-size-title is-dark-grey">{{ facility.name }}</div>
      <!-- <div class="tag-chips" v-if="facility.tags.length">
        <ion-chip v-for="tag in displayedTags(facility)" :key="tag.id">
          <span @click.stop="emitSearch(tag.name)" class="break-text">{{ tag.name }}</span>
        </ion-chip>
        <ion-chip v-if="facility.tags.length > 3 && !facility.showAllTags" @click.stop="showAllTags(facility)">
          <span >+ {{ facility.tags.length - 1 }}</span>
        </ion-chip>
      </div> -->
      <div class="general-font-size is-dark-grey">
        <div class="contact " v-if="facilityKind !== 'news'">
          <div class="informations">
           <div class="icon-contact">
              <img src="@/assets/images/facilities/icon_address.svg" />
           </div>
           <div>
            <div class="ion-padding">
              <div>
                {{ facility.street }}
              </div>
              <span class="zip-code">
                {{ facility.zip }}
              </span>
              <span>
                {{ facility.town }}
              </span>
              </div>
            </div>
          </div>
        </div>
  

        <div class="contact" v-if="facilityKind === 'news'">
          <div><span><img src="@/assets/images/watch.svg"></span> {{ useDatetime().parseDatetime(facility.created_at) }}</div>
        </div>
        <div class="contact" v-if="facilityKind === 'news'">
          <div v-if="facility.user"><span><img src="@/assets/images/user.svg"></span> {{ facility.user.name }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Keine Ergebnisse gefunden.</div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, defineEmits } from 'vue'
import { useFilterStore, filterSortingDirections } from "@/stores/health/searchFilter";
import { useRouter } from "vue-router";
import { useDatetime } from '@/composables/ui/datetime';

const router = useRouter()
const filterStore = useFilterStore();

defineProps(['facilityKind'])

/* const emitSearch = (tag:string) => {
  filterStore.currentSearchTerm = tag
  filterStore.loadFilteredResults()
}

const showMoreButton = ref(true)

const showAllTags = (facility: { showAllTags: boolean; }) => {
  facility.showAllTags = true;
  showMoreButton.value = false
};

const displayedTags = computed(() => (facility: { showAllTags: any; tags: string|any[]; }) => {
  return facility.showAllTags ? facility.tags : facility.tags.slice(0, 3);
}); */

const formatFacilityKind = (facilityKind:string) => {
  switch (facilityKind) {
    case 'facility':
      return 'Anbieter'
    case 'news':
      return 'News'
    case 'event':
      return 'Veranstaltung'
    case 'course':
      return 'Kurs'
    default:
      return ''
  }
}
</script>

<style lang="sass" scoped>
.kind
  background: lightgrey
  color: white
  padding: 3px 7px
  font-style: normal
  font-size: 12px
  font-weight: 600
  line-height: normal
  text-transform: none
  border-radius: 30px
  margin-left: 10px
.facility-box
  padding: 10px
  border-radius: 10px
  background: #FFF
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.15)
  margin-bottom: 10px
  .headline
    color: #636362
    font-style: normal
    font-weight: 600
    line-height: normal
    text-transform: uppercase
  .tags
    span
      margin-right: 10px
  .informations
    display: flex
  .zip-code
    padding-right: 5px

.icon-contact
  display: flex
  align-content: center
  width: 30px
  margin-right: 10px

.tag-chips
  display: flex
  align-content: center
  flex-wrap: wrap

ion-chip
  --background: var(--ion-color-health)
  --color: white
  font-size: 1.2rem
  </style>