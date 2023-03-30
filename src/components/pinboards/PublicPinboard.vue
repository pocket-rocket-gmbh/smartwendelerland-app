<template>
  <div class="ion-padding">
    <div class="headline">Ideenpinnwände</div>
    <div v-if="showSuccess" class="success-box">Vielen Dank für deinen Vorschlag. Unser Team überprüft nun deine Idee und gibt dir Bescheid sobald diese veröffentlicht wurde.</div>
    <div v-if="pinboardIdeas.length > 0">
      <div v-for="(idea, index ) in pinboardIdeas" :key="index" class="pinboard-box">
        <div class="content ion-margin-bottom" >
          <h3>{{ idea.headline }}</h3>
          <p v-html="idea.content"></p>
          <span
            class="chip"
            v-for="(category, index) in idea.categories" :key="index"
          >
            <ion-icon :icon="copyOutline" />
            {{ category.name }}
          </span>
          <div class="divider" />
          <div>
            <span>Erstellt am: {{ useDatetime().parseDate(idea.created_at) }}</span>
            <span class="ion-margin-start">Likes: {{ idea.score }}</span>
          </div>
        </div>
      </div>
      <ion-loading
        :is-open="loading"
        message="Einen Momemt bitte..."
      />
    </div>
  </div>

  <CreateIdea
    v-if="createIdeaModalOpen"
    :pinboard-id="pinboardId"
    @close="createIdeaModalOpen = false"
    @showSuccess="showSuccess = true"
  />

  <div class="create-idea-button" @click="createIdeaModalOpen = true">Eine Idee erstellen</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDatetime } from '@/composables/ui/datetime';
import { calendarOutline, copyOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { IonLoading } from '@ionic/vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import CreateIdea from './CreateIdea.vue';

const pinboardId = computed(() => {
  return route.params.id
})

const createIdeaModalOpen = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const route = useRoute()
const api = useCollectionApi()
api.setBaseApi(usePublicApi())
api.setEndpoint(`pinboard_ideas/pinboard/${pinboardId.value}`)
const pinboardIdeas = api.items

const getItems = async () => {
  loading.value = true
  const options = { page: 1, per_page: 1000, sort_order: 'ASC', searchQuery: null, concat: false, filters: [] }
  await api.retrieveCollection(options)
  loading.value = false
}

onMounted(() => {
  getItems()
})

</script>

<style lang="sass" scoped>
.create-idea-button
  background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  display: grid
  place-items: center
  padding: 20px
  position: fixed
  bottom: 0
  width: 100%
  color: white
.success-box
  padding: 10px
  margin: 10px 0
  background: linear-gradient(96.86deg, #ABC711 21.73%, #C9CF03 35.08%, #187628 84.5%)
  color: white
  border-radius: 20px
</style>