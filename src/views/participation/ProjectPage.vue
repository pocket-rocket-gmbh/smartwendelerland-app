<template>
  <base-layout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project" class="expand">
        <ion-row>
          <ion-col>
            <div
              class="back-button"
              @click="$router.push({path: '/participation/projects'})"
            >
              &lt; zurück
            </div>

            <ion-slides pager="true" :options="slideOpts">
              <ion-slide>
                <img :src="project.image_url"/>
              </ion-slide>
              <ion-slide v-for="(image, index) in project.sanitized_images" :key="index">
                <img :src="image.url"/>
              </ion-slide>
            </ion-slides>
            
            <ProjectVotePanel
              v-if="useUser().loggedIn()"
              :key="votePanelKey"
              :project="project"
              @updateProject="reloadData()"
            />
            <LoginHint
              v-else
              label="Bitte melden Sie sich an um dieses Projekt zu bewerten"
            />
          </ion-col>
        </ion-row>
        <div class="ion-padding">
          <ion-row>
            <ion-col class="header">
              <div class="headline">{{ project.name }}</div>
              <div class="ion-margin-top">{{ useDatetime().getTimeRangeString(project) }}</div>
              <div v-if="project.costs">Kosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</div>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ProjectMilestones
                :projectId="project.id"
              />
            </ion-col>
          </ion-row>
          <ion-row v-if="project.description">
            <ion-col>
              <div v-html="project.description" />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <div class="ion-margin-top ion-margin-bottom"><b>Abstimmungen</b></div>
              <ProjectVotes
                :key="votePanelKey"
                :project="project"
              />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <div class="headline ion-margin-bottom" v-if="project.community && project.zip && project.town">Projekt Standort:<br/>{{ project.community }} | {{ project.zip }} - {{ project.town }}</div>
            </ion-col>
          </ion-row>
        </div>
        <ProjectMapPanel
          ref="map"
          :locations="locations"
        />
        <div class="ion-padding">
          <ion-row>
            <ion-col>
              <ion-label><h1>Kommentare zum Projekt</h1></ion-label>
            </ion-col>
          </ion-row>
          <div v-if="useUser().loggedIn()">
            <CommentNew
              :project-id="route.params.id?.toString()"
              @refreshCollection="reloadComments()"
            />
            <ion-row v-if="comments.length === 0">
              <ion-col>
                <ion-label>Keine Kommentare gefunden</ion-label>
              </ion-col>
            </ion-row>
            <ion-row v-else>
              <ion-col size="6">
                <ion-select interface="action-sheet" placeholder="Neuste zuerst" v-model="filter" @ionChange="reloadComments">
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
                    @refreshCollection="reloadComments()"
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
          </div>
          <LoginHint
            v-else
            label="Bitte melden Sie sich an um Kommentare zu sehen"
          />
        </div>
      </ion-grid>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekt wird geladen..."
      />
    </ion-content>
  </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonTextarea, IonButton, IonLabel, IonLoading, onIonViewDidEnter, RefresherCustomEvent, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonSlides, IonSlide } from '@ionic/vue'
import BaseLayout from '@/components/general/BaseLayout.vue'
import ProjectMapPanel from '@/components/participation/ProjectMapPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'
import { useUser } from '@/composables/user/user'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'
import CommentPanel from '../../components/participation/CommentPanel.vue'
import ProjectVotePanel from '../../components/participation/ProjectVotePanel.vue'
import ProjectMilestones from '../../components/participation/ProjectMilestones.vue'
import ProjectVotes from '../../components/participation/ProjectVotes.vue'
import { MapLocation } from '@/types/MapLocation'
import LoginHint from '@/components/participation/LoginHint.vue'
import CommentNew from '@/components/participation/CommentNew.vue'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BaseLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonTextarea, IonButton, IonLabel, IonLoading, CommentPanel, ProjectVotePanel, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, IonSlides, IonSlide, ProjectMapPanel, ProjectMilestones, ProjectVotes, LoginHint, CommentNew },
  setup() {

    const route = useRoute()

    const publicApi = usePublicApi()
    const privateApi = usePrivateApi()

    const projectsApi = useCollectionApi()

    projectsApi.setEndpoint('projects')
    const filter = ref('newest')
    const filterOptions = ref([
      { id: 'newest', name: 'Neuste zuerst', apiField: 'created_at' },
      { id: 'relevant', name: 'Relevante zuerst', apiField: 'score' }
    ])

    const commentsApi = useCollectionApi()
    commentsApi.setBaseApi(privateApi)

    const project = projectsApi.item
    const comments = commentsApi.items
    const currentPage = ref(1)
    const totalPages = ref(1)
    const votePanelKey = ref(1)

    const loadingInProgress = ref(false)
    
    const locations = ref<MapLocation[]>([])
    const map = ref(null)
    const mapStyle = ref('')

    const slideOpts = {
      initialSlide: 0,
      speed: 400
    }

    onIonViewDidEnter(() => {
      if (useUser().loggedIn()) {
        projectsApi.setBaseApi(privateApi)
      } else {
        projectsApi.setBaseApi(publicApi)
      }

      commentsApi.setEndpoint('comments/project/' + route.params.id?.toString())
      reloadData()
    })

    const doRefresh = (event: RefresherCustomEvent) => {
      reloadData()
      event.target.complete() // We have a separate loading indicator so we can complete the refresh indicator.
    }

    const reloadData = async () => {
      loadingInProgress.value = true

      locations.value = []

      await Promise.all([
        projectsApi.getItem(route.params.id?.toString()),
        reloadComments()
      ])

      project.value.locations?.forEach((location: any) => {
        locations.value.push({
          id: location.id,
          longitude: parseFloat(location.longitude),
          latitude: parseFloat(location.latitude),
          draggable: false
        })
      })

      map.value.refresh()

      loadingInProgress.value = false
    }

    const reloadComments = async () => {
      if (useUser().loggedIn()) {
        currentPage.value = 1
        await loadComments(false)
      }
    }

    const loadComments = async (concat = true) => {
      const sortField = filterOptions.value.find((element) => element.id === filter.value).apiField
      await commentsApi.retrieveCollection({ page: currentPage.value, per_page: 5, sort_by: sortField, sort_order: 'DESC', searchQuery: null, concat: concat, filters: null })
      totalPages.value = commentsApi.totalPages.value
    }

    const loadData = (ev: InfiniteScrollCustomEvent) => {
      setTimeout(() => {
        currentPage.value += 1
        loadComments(true)
        ev.target.complete()
      }, 300);
    }

    watch(project, () => {
      votePanelKey.value += 1
    })

    return {
      loadingInProgress,
      locations,
      doRefresh,
      reloadData,
      reloadComments,
      project,
      comments,
      useDatetime,
      useCurrency,
      useUserStore,
      useUser,
      filter,
      filterOptions,
      loadData,
      currentPage,
      totalPages,
      slideOpts,
      map,
      mapStyle,
      votePanelKey,
      route
    }
  }
})
</script>

<style scoped>
.expand {
  margin-left: -10px;
  margin-right: -10px;
  margin-top: -10px;
}
.header {
  line-height: 22px;
  margin-top: 10px;
}

ion-textarea {
  --background: #F5F5F5;
  padding: 5px 10px;
}

.back-button {
  background: #FFFFFF;
  border-radius: 20px;
  position: absolute;
  font-size: 13px;
  top: 20px;
  left: 15px;
  z-index: 1000;
  padding: 10px 20px;
  font-weight: 500;
}

.swiper-slide img {
  width: 100%;
}
</style>
