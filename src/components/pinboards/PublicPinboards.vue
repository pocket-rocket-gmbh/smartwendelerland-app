<template>
  <div class="ion-padding">
    <div class="headline">Ideenpinnwände</div>
    <p>Hier findest du aktuelle Themen und Anregungen aus dem Landkreis. 
    Zu jeder Pinnwand kannst du deine eigene Idee beitragen oder die Ideen 
    von anderen Nutzern lesen.</p>
    <div v-if="pinboards.length > 0">
      <ion-nav-link v-for="(pinboard, index ) in pinboards" :key="index" :routerLink="`/pinboards/${pinboard.id}`" class="pinboard-box">
        <div class="content ion-margin-bottom" v-if="pinboard.is_active" :class="[(!useDatetime().isInPast(pinboard.end_time) ? 'bg-white is-clickable' : 'bg-inactive')]">
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
          <div>
            <span>{{ useDatetime().parseDate(pinboard.created_at) }}</span>
            <ion-icon :icon="calendarOutline" class="ion-margin-start ion-margin-end" />
            <span v-if="pinboard.end_time && !useDatetime().isInPast(pinboard.end_time)" class="mx-3">Pinnwand online bis: {{ useDatetime().parseDate(pinboard.end_time) }}</span>
            <span v-if="pinboard.end_time && useDatetime().isInPast(pinboard.end_time)" class="mx-3">Pinnwand abgelaufen </span>
            <span class="mx-10">Ideen: {{ pinboard.pinboard_ideas_count }}</span>
          </div>
        </div>
      </ion-nav-link>
    </div>
    <div v-else>
      <h3 class="pa-1">Aktuell sind keine Pinnwände online</h3>
    </div>
    <ion-loading
      :is-open="loading"
      message="Einen Momemt bitte..."
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonNavLink, IonIcon } from '@ionic/vue';
import { useDatetime } from '@/composables/ui/datetime';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import { calendarOutline, copyOutline } from 'ionicons/icons';
const loading = ref(false)
const api = useCollectionApi()
api.setBaseApi(usePublicApi())
api.setEndpoint('pinboards')

const pinboards = api.items

const getItems = async () => {
  loading.value = true
  const options = { page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'DESC', searchQuery: null, concat: false, filters: [] }
  await api.retrieveCollection(options)
  loading.value = false
}

onMounted(() => {
  getItems()
})
</script>

<style lang="sass" scoped>
</style>