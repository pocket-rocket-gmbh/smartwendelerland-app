<template>
  <ion-grid class="no-margin-padding">
    <ion-row>
      <ion-col v-for="category in categories" :key="category.id" size-xs="6" size-sm="4" size-lg="3">
        <div class="health-category-box" @click="router.push({ path: `/health/categories/${category.id}`})">
          <div align="center">
            <img src="@/assets/images/prevention.svg" v-if="category.name.includes('Prävention')" />
            <img src="@/assets/images/sick.svg" v-else />
          </div>
          <div class="headline">{{ category.name }}</div>
        </div>
      </ion-col>
      <ion-col size-xs="6" size-sm="4" size-lg="3" @click="router.push({ path: `/health/search`, query: { kind: 'event' }})">
        <div class="health-category-box">
          <div align="center">
            <img src="@/assets/images/calendar.svg" />
          </div>
          <div class="headline">Veranstaltungen</div>
        </div>
      </ion-col>
      <ion-col size-xs="6" size-sm="4" size-lg="3" @click="router.push({ path: `/health/search`, query: { kind: 'course' }})">
        <div class="health-category-box">
          <div align="center">
            <img src="@/assets/images/courses.svg" />
          </div>
          <div class="headline">Kurse</div>
        </div>
      </ion-col>
      <ion-col size-xs="6" size-sm="4" size-lg="3">
        <div class="health-category-box" @click="router.push({ path: `/health/search`, query: { kind: 'facility' }})">
          <div align="center">
            <img src="@/assets/images/given-heart.svg" />
          </div>
          <div class="headline">Anbietersuche</div>
        </div>
      </ion-col>
      <ion-col size-xs="6" size-sm="4" size-lg="3">
        <div class="health-category-box" @click="router.push({ path: `/health/search`, query: { kind: 'news' }})">
          <div align="center">
            <img src="@/assets/images/news.svg" />
          </div>
          <div class="headline">Beiträge</div>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
  <div class="ion-padding">
    <div class="headline">Du benötigst dringend Hilfe?</div>

    <div class="ion-margin-top">
      <div><b>Rettungsdienste</b></div>
      Rufe den Rettungsdienst, wenn Du akut medizinische Hilfe benötigst. Egal ob es sich um die Folgen eines Unfalls handelt oder plötzliche starke gesundheitliche Beschwerden auftreten.</div>
    <div class="signal">Wähle den Notruf 112</div>

    <div class="ion-margin-top">
      <div><b>Apothekennotdienst</b></div>
      Es ist Wochenende und Du benötigst dringend Medikamente? Rufe sofort den Apothekennotdienst an und erfahre, welche Apotheke im Landkreis Sankt Wendel für Dich da ist.</div>
    <div class="signal">Wähle den Notruf 22833</div>
  </div>


  <ion-loading
    :is-open="loading"
    message="Kategorien werden geladen..."
  />
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonLoading } from '@ionic/vue';
import { ref } from 'vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const loading = ref(false)
const categories = ref([])
const categoriesApi = useCollectionApi()
categoriesApi.setBaseApi(usePublicApi('health'))

const getCategories = async () => {
  loading.value = true
  categoriesApi.setEndpoint(`categories`)
  const options = { page: 1, per_page: 25, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: [] }
  await categoriesApi.retrieveCollection(options)
  categories.value = categoriesApi.items.value
  loading.value = false
}

onMounted(() => {
  getCategories()
})
</script>

<style lang="sass" scoped>
ion-col
  padding: 2px
.signal
  color: #e84040

ion-grid.no-margin-padding
  margin: -5px
  padding: 0
</style>