<template>
  <BackButtonLayout>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid v-if="project" class="expand">
        <swiper
          :slides-per-view="1"
          :space-between="20"
          :modules="modules"
          :pagination="{ el: '.pagination' }"
          v-if="project.image_url"
          class="item-box swiper"
        >
          <swiper-slide>
            <img :src="imageCache.cacheableImageUrl(project.image_url)" class="showroom"/>
          </swiper-slide>
          <swiper-slide v-for="(image, index) in project.sanitized_images" :key="index">
            <img :src="imageCache.cacheableImageUrl(image.url)" class="showroom"/>
          </swiper-slide>
          <div class="pagination" />
        </swiper>

        <div class="item-box ion-margin-top">
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
        </div>
        <div class="item-box ion-padding ion-margin-top">
          <PollsBox
            v-if="projectPoll"
            :is-public="false"
          />
          <ion-row v-if="project.description">
            <ion-col>
              <div class="headline ion-margin-bottom">{{ project.name }}</div>
              <div v-html="project.description" />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <div class="headline ion-margin-top" v-if="project.community && project.zip && project.town">
                <strong v-if="project.community && project.zip && project.town">
                  <ion-icon :icon="locationOutline"></ion-icon> {{ project.community.name }} | {{ project.zip }} - {{ project.town }}
                </strong>
              </div>
              <div class="ion-margin-top">
                <ion-icon :icon="calendarOutline"></ion-icon> {{ useDatetime().getTimeRangeString(project) }}
              </div>
              <div v-if="project.costs"><ion-icon :icon="cashOutline"></ion-icon> {{ useCurrency().getCurrencyFromNumber(project.costs) }}</div>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ProjectMilestones
                :projectId="project.id"
              />
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
          <ion-row>
            <ion-col>
              <div class="ion-margin-top ion-margin-bottom"><b>Standorte des Projekts</b></div>
              <ProjectMapPanel
                ref="map"
                :locations="locations"
              />
            </ion-col>
          </ion-row>

          <div align="center" class="ion-margin-top">
            <ion-button @click="(contactFormModalOpen = true)" class="contact">Kontaktformular</ion-button>
          </div>
          <ContactForm
            v-if="contactFormModalOpen"
            :project-id="project.id"
            @close="(contactFormModalOpen = false)"
          />
        </div>
      </ion-grid>

      <div class="ion-margin-top item-box ion-padding" v-if="project && useUser().loggedIn()">
        <h1 id="comments">Verfasse Deinen Kommentar</h1>
        <CommentNew
          placeholder="Kommentar verfassen ..."
          :project-id="route.params.id?.toString()"
          @refreshCollection="reloadComments()"
        />
        <div v-if="comments.length === 0">
          Keine Kommentare gefunden
        </div>
      </div>
      <div class="ion-margin-top comments-wrap" v-else-if="project && !useUser().loggedIn()">
        <LoginHint
          label="Bitte melden Sie sich an um dieses Projekt zu kommentieren"
        />
      </div>

      <div class="ion-margin-top item-box ion-padding" v-if="project && useUser().loggedIn()">
        <ion-select interface="action-sheet" placeholder="Neuste zuerst" v-model="filter" @ionChange="reloadComments" cancel-text="Abbrechen">
          <ion-select-option
            v-for="(option, index) in filterOptions"
            :key="index"
            :value="option.id"
          >
            {{ option.name }}
          </ion-select-option>
        </ion-select>
      </div>

      <div class="comments-wrap" v-if="project && useUser().loggedIn()">
        <div class="ion-margin-top item-box ion-padding" v-for="comment in comments" :key="comment.id">
          <CommentPanel
            :comment="comment"
            @removeComment="removeComment"
            @setCommentReported="setCommentReported"
          />
          <CommentsReply
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
      </div>

      <ion-loading
        :is-open="loadingInProgress"
        message="Projekt wird geladen..."
      />
    </ion-content>
  </BackButtonLayout>
</template>

<script lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper'
import 'swiper/css'
import "swiper/css/pagination"
import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLoading, onIonViewDidEnter, RefresherCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, IonSelect, IonSelectOption, IonButton } from '@ionic/vue'
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
import { locationOutline, calendarOutline, cashOutline } from 'ionicons/icons'
import { usePollStore } from '@/stores/poll'
import PollsBox from '@/components/polls/PollsBox.vue'
import ContactForm from '@/components/participation/ContactForm.vue'
import { useImageCache } from '@/composables/ui/imageCache'

export default defineComponent({
  name: 'ParticipationProjectPage',
  components: { BackButtonLayout, IonContent, IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonLoading, CommentPanel, ProjectVotePanel, IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, ProjectMapPanel, ProjectMilestones, ProjectVotes, LoginHint, CommentNew, CommentsReply, PollsBox, ContactForm, IonButton, Swiper, SwiperSlide },
  setup() {

    const route = useRoute()

    const publicApi = usePublicApi()
    const privateApi = usePrivateApi()

    const projectsApi = useCollectionApi()
    const imageCache = useImageCache()

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
      loadingInProgress.value = true

      if (useUser().loggedIn()) {
        projectsApi.setBaseApi(privateApi)
      } else {
        projectsApi.setBaseApi(publicApi)
      }

      commentsApi.setEndpoint('comments/project/' + route.params.id?.toString())

      await reloadData()
      if (route.query['scroll_to']) {
        setTimeout(() => {
          const commentSection: any = document.querySelector('h1#comments')
          console.log(commentSection)
          commentSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 100);
      }
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
          draggable: false,
          tooltipHtml: null
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
      locationOutline,
      calendarOutline,
      cashOutline,
      projectPoll,
      contactFormModalOpen,
      modules: [Pagination],
      imageCache
    }
  }
})
</script>

<style lang="sass" scoped>
.expand
  margin-left: -10px
  margin-right: -10px
  margin-top: -10px
.header
  line-height: 22px
  margin-top: 10px
.showroom
  display: block
  width: 100%
  height: 100%
  object-fit: cover
ion-textarea
  --background: #F5F5F5
  padding: 5px 10px

.pagination
  text-align: center
  z-index: 1
  position: absolute
  bottom: 0px

.item-box
  background: white
  border-radius: 20px
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15)

.comments-wrap
  margin-bottom: 100px
.swiper img
  height: 100%
  width: 100%

ion-button.contact
  width: 100%
  --background: linear-gradient(270deg, #017DC2 0.29%, #015281 100%)
  --border-radius: 38px
  height: 30px
</style>
