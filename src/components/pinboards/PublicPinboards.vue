<template>
  <div class="ion-padding">
    <div class="headline">Ideenpinnwände</div>
    <p>Hier findest du aktuelle Themen und Anregungen aus dem Landkreis. 
    Zu jeder Pinnwand kannst du deine eigene Idee beitragen oder die Ideen 
    von anderen Nutzern lesen.</p>
    <ion-select class="ion-margin-bottom" cancel-text="Abbrechen" placeholder="Kategorien wählen" :multiple="true" v-model="selectedCategoryIds" @ionChange="getItems">
      <ion-select-option v-for="(category, index) in categories" :key="index" :value="category.id">{{ category.name_with_pinboards_count }}</ion-select-option>
    </ion-select>
    <ion-grid v-if="pinboards.length > 0">
      <ion-row>
        <ion-col size-xs="12" size-sm="12" size-lg="6" v-for="(pinboard, index ) in pinboards" :key="index">
          <ion-nav-link :routerLink="`/pinboards/${pinboard.id}`" class="pinboard-box">
            <div class="content ion-margin-bottom" v-if="pinboard.is_active" :class="[(useDatetime().isInPast(pinboard.end_time) ? 'bg-inactive' : 'bg-white is-clickable')]">
              <h3>{{ pinboard.headline }}</h3>
              <p class="my-3" v-html="pinboard.content"></p>
              <span
                class="chip"
                v-for="(category, index) in pinboard.categories" :key="index"
              >
                <ion-icon :icon="copyOutline" />
                {{ category.name }}
              </span>
              <div class="divider" />
              <div class="footer">
                <ion-icon :icon="calendarOutline"/>
                <span v-if="pinboard.end_time && !useDatetime().isInPast(pinboard.end_time)"> Aktiv bis: {{ useDatetime().parseDate(pinboard.end_time) }}</span>
                <span v-else-if="pinboard.end_time && useDatetime().isInPast(pinboard.end_time)">Pinnwand abgelaufen</span>
                <span class="ion-margin-start">Ideen: {{ pinboard.pinboard_confirmed_ideas_count }}</span>
              </div>
            </div>
          </ion-nav-link>
        </ion-col>
      </ion-row>
    </ion-grid>
    <div v-else>
      <h3>Aktuell sind keine Pinnwände online</h3>
    </div>
    <ion-loading
      :is-open="loading"
      message="Einen Momemt bitte..."
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonNavLink, IonIcon, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { useDatetime } from '@/composables/ui/datetime';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import { calendarOutline, copyOutline } from 'ionicons/icons';
const loading = ref(false)
const api = useCollectionApi()
api.setBaseApi(usePublicApi())
api.setEndpoint('pinboards')

const pinboards = api.items
const selectedCategoryIds = ref([])

const getItems = async () => {
  loading.value = true
  const filters = []
  if (selectedCategoryIds.value.length > 0) {
    filters.push({
      field: 'pinboard_category',
      value: selectedCategoryIds.value
    }) 
  }
  const options = { page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'DESC', searchQuery: null, concat: false, filters: filters }
  await api.retrieveCollection(options)
  loading.value = false
}

const categoriesApi = useCollectionApi()
categoriesApi.setBaseApi(usePublicApi())
categoriesApi.setEndpoint('categories?scope=pinboard')
const categories = categoriesApi.items

const getPublicCategories = async () => {
  loading.value = true
  await categoriesApi.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
  loading.value = false
}

onMounted(() => {
  getPublicCategories()
  getItems()
})
</script>

<style lang="sass" scoped>
</style>