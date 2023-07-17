<template>
  <div class="ion-padding public-pinboard" v-if="pinboard">
    <div class="headline ion-margin-bottom">Ideen zu {{ pinboard.headline }}</div>
    <div v-if="showSuccess" class="success-box">Vielen Dank für deinen Vorschlag. Unser Team überprüft nun deine Idee und gibt dir Bescheid sobald diese veröffentlicht wurde.</div>
    <ion-grid v-if="pinboardIdeas.length > 0">
      <ion-row>
        <ion-col size-xs="12" size-sm="12" size-lg="6" v-for="(idea, index ) in pinboardIdeas" :key="index" class="pinboard-box">
          <div class="content ion-margin-bottom" >
            <div class="header">
              <h3>{{ idea.headline }} <span v-if="idea.user.name" class="from">von {{ idea.user.name }}</span></h3>
              <UserProfile :user="idea.user" />
            </div>
            
            <p v-html="idea.content"></p>
            <span
              class="chip"
              v-for="(category, index) in idea.categories" :key="index"
            >
              <ion-icon :icon="copyOutline" />
              {{ category.name }}
            </span>
            <div class="divider" />
            <div class="footer">
              <div v-if="idea.approved_at">Akzeptiert am: {{ useDatetime().parseDate(idea.approved_at) }}</div>
              <div align="right" v-if="useUser().loggedIn()">
                <LikePanel
                  :item="idea"
                  :endpoint="`pinboard_ideas/${idea.id}`"
                  scope="pinboard_idea"
                  :is-white="true"
                />
              </div>
            </div>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
    <div v-else><h3>Aktuell wurden noch keine Ideen eingereicht</h3></div>
  </div>

  <CreateIdea
    v-if="createIdeaModalOpen && !useDatetime().isInPast(pinboard.end_time)"
    :pinboard-id="pinboardId"
    @close="createIdeaModalOpen = false"
    @showSuccess="showSuccess = true"
  />

  <div v-if="pinboard && !useDatetime().isInPast(pinboard.end_time)">
    <div class="create-idea-button" @click="createIdeaModalOpen = true" v-if="useUser().loggedIn()">Eine Idee erstellen</div>
    <ion-nav-link class="create-idea-button" routerLink="/login" v-else>Anmelden um eine Idee zu erstellen</ion-nav-link>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDatetime } from '@/composables/ui/datetime';
import { calendarOutline, copyOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { IonLoading, IonNavLink } from '@ionic/vue';
import { useCollectionApi } from '@/composables/api/collectionApi';
import { usePublicApi } from '@/composables/api/public';
import CreateIdea from './CreateIdea.vue';
import LikePanel from '../LikePanel.vue';
import { useUser } from '@/composables/user/user';
import { usePrivateApi } from '@/composables/api/private';
import UserProfile from '../UserProfile.vue';

const pinboardId = computed(() => {
  return `${route.params.id}`
})

const createIdeaModalOpen = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const route = useRoute()
const api = useCollectionApi()
const pinboardIdeas = api.items
const showApi = useCollectionApi()
const pinboard = showApi.item

const getItem = async () => {
  showApi.setBaseApi(usePublicApi())
  showApi.setEndpoint(`pinboards`)
  loading.value = true
  await showApi.getItem(pinboardId.value)
  loading.value = false
}

const getItems = async () => {
  if (useUser().loggedIn()) {
    api.setBaseApi(usePrivateApi())
  } else {
    api.setBaseApi(usePublicApi())
  }
  api.setEndpoint(`pinboard_ideas/pinboard/${pinboardId.value}`)

  loading.value = true
  const options = { page: 1, per_page: 1000, sort_order: 'ASC', searchQuery: null, concat: false, filters: [] }
  await api.retrieveCollection(options)
  loading.value = false
}

onMounted(() => {
  getItem()
  getItems()
})

</script>

<style lang="sass" scoped>
.from
  font-size: 14px
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
.footer
  display: grid
  grid-template-columns: auto 50px
.header
  display: grid
  grid-template-columns: auto 50px
.public-pinboard
  margin-bottom: 80px
</style>