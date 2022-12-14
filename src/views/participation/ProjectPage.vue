<template>
  <BackButtonLayout>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project" class="expand">
        <ion-row>
          <ion-col>
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
          <PollsBox
            v-if="projectPoll"
            :is-public="false"
          />
          <ion-row>
            <ion-col class="header">
              <div class="headline">{{ project.name }}</div>
              <div class="headline ion-margin-top" v-if="project.community && project.zip && project.town">
                <strong v-if="project.community && project.zip && project.town">
                  <ion-icon :icon="location"></ion-icon> {{ project.community.name }} | {{ project.zip }} - {{ project.town }}
                </strong>
              </div>
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
              <div class="ion-margin-top ion-margin-bottom"><b>Abstimmung</b></div>
              <ProjectVotes
                :key="votePanelKey"
                :project="project"
              />
            </ion-col>
          </ion-row>
        </div>
        <ProjectMapPanel
          ref="map"
          :locations="locations"
        />
        <div align="center" class="ion-margin-top">
          <ion-button @click="(contactFormModalOpen = true)">Kontaktformular</ion-button>
        </div>

        <ContactForm
          v-if="contactFormModalOpen"
          :project-id="project.id"
          @close="(contactFormModalOpen = false)"
        />
        <div class="ion-padding">
          <ion-row>
            <ion-col>
              <ion-label><h1>Kommentare zum Projekt</h1></ion-label>
            </ion-col>
          </ion-row>
          <div v-if="useUser().loggedIn()">
            <CommentNew
              placeholder="Kommentar verfassen ..."
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
                <div v-for="comment in comments" :key="comment.id">
                  <ion-card>
                    <CommentPanel
                      :comment="comment"
                      @removeComment="removeComment"
                      @setCommentReported="setCommentReported"
                    />
                  </ion-card>
                  <CommentsReply
                    v-if="useUser().isAdmin()"
                    :comment="comment"
                  />
                </div>
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
  </BackButtonLayout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLabel, IonLoading, onIonViewDidEnter, RefresherCustomEvent, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonSlides, IonSlide, IonButton } from '@ionic/vue'
import BackButtonLayout from '@/components/general/BackButtonLayout.vue'
import ProjectMapPanel from '@/components/participation/ProjectMapPanel.vue'
import { usePublicApi } from '@/composables/api/public'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'
import { useUser } from '@/composables/user/user'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'
import CommentPanel from '@/components/participation/CommentPanel.vue'
import ProjectVotePanel from '@/components/participation/ProjectVotePanel.vue'
import ProjectMilestones from '@/components/participation/ProjectMilestones.vue'
import ProjectVotes from '@/components/participation/ProjectVotes.vue'
import { MapLocation } from '@/types/MapLocation'
import LoginHint from '@/components/participation/LoginHint.vue'
import CommentNew from '@/components/participation/CommentNew.vue'
import CommentsReply from '@/components/participation/CommentsReply.vue'
import { location } from 'ionicons/icons'
import { usePollStore } from '@/stores/poll'
import PollsBox from '@/components/polls/PollsBox.vue'
import ContactForm from '@/components/participation/ContactForm.vue'

export default defineComponent({
  name: 'ParticipationProjectListPage',
  components: { BackButtonLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLabel, IonLoading, CommentPanel, ProjectVotePanel, IonCard, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, IonSlides, IonSlide, ProjectMapPanel, ProjectMilestones, ProjectVotes, LoginHint, CommentNew, CommentsReply, PollsBox, ContactForm, IonButton },
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
    const projectPoll = ref(null)
    const contactFormModalOpen = ref(false)

    const loadingInProgress = ref(false)
    
    const locations = ref<MapLocation[]>([])
    const map = ref(null)
    const mapStyle = ref('')

    const slideOpts = {
      initialSlide: 0,
      speed: 400
    }

    onIonViewDidEnter(async () => {
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

      await usePollStore().setProjectPoll(route.params.id?.toString())
      projectPoll.value = usePollStore().projectPoll

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

    const removeComment = (commentId:string) => {
      const foundItem = comments.value.find(comment => comment.id === commentId)
      const index = comments.value.indexOf(foundItem)
      comments.value.splice(index, 1)
    }

    const setCommentReported = (commentId:string) => {
      const foundItem = comments.value.find(comment => comment.id === commentId)
      foundItem.has_already_reported_comment = true
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
      removeComment,
      setCommentReported,
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
      route,
      location,
      projectPoll,
      contactFormModalOpen
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

.swiper-slide img {
  width: 100%;
}
</style>
