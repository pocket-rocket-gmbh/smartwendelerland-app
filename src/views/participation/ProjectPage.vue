<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project">
        <ion-row>
          <ion-col>
            <ion-button
              color="light"
              @click="$router.push({path: '/participation/projects'})"
            >
              zurück
            </ion-button>

            <ion-slides pager="true" :options="slideOpts">
              <ion-slide>
                <img :src="project.image_url"/>
              </ion-slide>
              <ion-slide v-for="(image, index) in project.sanitized_images" :key="index">
                <img :src="image.url"/>
              </ion-slide>
            </ion-slides>

            
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label class="headline">{{ project.name }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label>{{ useDatetime().getTimeRangeString(project) }}</ion-label>
          </ion-col>
        </ion-row>        
        <ion-row v-if="project.costs">
          <ion-col>
            <ion-label>Kosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row v-if="project.community && project.zip && project.town">
          <ion-col>
            <ion-label>Standort: {{ project.community }} | {{ project.zip }} - {{ project.town }}</ion-label>
          </ion-col>
        </ion-row> 
        <ion-row>
          <ion-col>
            <div v-html="project.description" />
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label><h1>Kommentare zum Projekt</h1></ion-label>
          </ion-col>
        </ion-row>
        <ion-row v-if="!useUserStore().user">
          <ion-col>
            <ion-label>Bitte einloggen, um die Kommentare zu sehen</ion-label>
          </ion-col>
        </ion-row>
        <template v-else>
          <ion-row>
            <ion-col>
              <ion-textarea v-model="newComment" inputmode="text" rows=5 placeholder="Kommentar verfassen ..."></ion-textarea>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col style="text-align: right">
              <ion-button @click="create()">Absenden</ion-button>
            </ion-col>
          </ion-row>
          <ion-row v-if="comments.length === 0">
            <ion-col>
              <ion-label>Keine Kommentare gefunden</ion-label>
            </ion-col>
          </ion-row>
          <ion-row v-else>
            <ion-col size="6">
              <ion-select interface="action-sheet" placeholder="Neuste zuerst" v-model="filter">
                <ion-select-option
                  v-for="(option, index) in filterOptions"
                  :key="index"
                  :value="option.id"
                >
                  {{ option.name }}
                </ion-select-option>
              </ion-select>
            </ion-col>
            <ion-col size="12">
              <ion-card v-for="comment in comments" :key="comment.id">
                <CommentPanel
                  :comment="comment"
                  @refreshCollection="reloadData()"
                />
              </ion-card>
              <ion-infinite-scroll
                v-if="currentPage < totalPages"
                @ionInfinite="loadData($event)"
              >
                <ion-infinite-scroll-content>
                </ion-infinite-scroll-content>
              </ion-infinite-scroll>
            </ion-col>
          </ion-row>
        </template>
      </ion-grid>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekt wird geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonTextarea, IonButton, IonLabel, IonLoading, onIonViewDidEnter, RefresherCustomEvent, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonSlides, IonSlide } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'
import CommentPanel from '../../components/participation/CommentPanel.vue'
import { ResultStatus } from '@/types/serverCallResult'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonTextarea, IonButton, IonLabel, IonLoading, CommentPanel, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, IonSlides, IonSlide },
  setup() {

    const route = useRoute()

    const publicApi = usePublicApi()
    const projectsApi = useCollectionApi()
    projectsApi.setBaseApi(publicApi)
    projectsApi.setEndpoint('projects')
    const filter = ref('all')
    const filterOptions = ref([
      { id: 'all', name: 'Neuste zuerst' },
      { id: 'relevant', name: 'Relevante zuerst' }
    ])

    const privateApi = usePrivateApi()
    const commentsApi = useCollectionApi()
    commentsApi.setBaseApi(privateApi)

    const project = projectsApi.item
    const comments = commentsApi.items
    const currentPage = ref(1)
    const totalPages = ref(1)

    const loadingInProgress = ref(false)
    const newComment = ref('')

    const slideOpts = {
      initialSlide: 0,
      speed: 400
    }

    onIonViewDidEnter(() => {
      currentPage.value = 1
      commentsApi.setEndpoint('comments/project/' + route.params.id?.toString())
      reloadData()
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      currentPage.value = 1
      reloadData()
      event.target.complete() // We have a separate loading indicator so we can complete the refresh indicator.
    }

    const reloadData = async () => {
      loadingInProgress.value = true

      await Promise.all([
        projectsApi.getItem(route.params.id?.toString()),
        loadComments(false)
      ])

      loadingInProgress.value = false
    }

    const loadComments = async (concat = true) => {
      await commentsApi.retrieveCollection({ page: currentPage.value, per_page: 5, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null, concat: concat })
      totalPages.value = commentsApi.totalPages.value
    }

    const create = async () => {
      loadingInProgress.value = true
      const result = await commentsApi.createItem({
        comment: newComment.value
      })

      if (result.status === ResultStatus.SUCCESSFUL) {
        newComment.value = ''
        await loadComments(false)
      }
      
      loadingInProgress.value = false
    }

    const loadData = (ev: InfiniteScrollCustomEvent) => {
      setTimeout(() => {
        currentPage.value += 1
        loadComments(true)
        ev.target.complete()
      }, 300);
    }

    return {
      loadingInProgress,
      newComment,
      doRefresh,
      reloadData,
      project,
      comments,
      useDatetime,
      useCurrency,
      useUserStore,
      create,
      filter,
      filterOptions,
      loadData,
      currentPage,
      totalPages,
      slideOpts
    }
  }
})
</script>

<style scoped>
.headline {
  font-size: 1.5em;
}
ion-textarea {
  --background: #F5F5F5;
  padding: 5px 10px;
}
</style>
