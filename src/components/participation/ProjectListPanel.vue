<template>
  <ion-card>
    <div class="image-wrapper">
      <img :src="imageCache.cacheableImageUrl(project.image_url)" />
      <div class="voted-up" v-if="project.has_upvoted_project">
        <img src="@/assets/images/like-white.png" />
        Gefällt mir
      </div>
    </div>
    
    <ion-card-header>
      <ion-card-title>{{ project.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <strong v-if="project.community && project.zip && project.town">
        <ion-icon :icon="location"></ion-icon> {{ project.community.name }} | {{ project.zip }} - {{ project.town }}
      </strong>
      <div>{{ useDatetime().getTimeRangeString(project) }}</div>
      <div v-if="project.costs">Kosten: {{ useCurrency().getCurrencyFromNumber(project.costs) }}</div>
      
      <div class="ion-margin-top">{{ project.excerpt }}</div>

      <div :class="['metrics', { 'has-vote-count' : project.rating_results_public }]">
        <div v-if="project.rating_results_public">{{ project.total_vote_count }} abgegebene Stimmen</div>
        <div><strong>{{ project.comment_count }} Kommentar<span v-if="project.comment_count > 1">e</span></strong></div>
      </div>
    </ion-card-content>
    <div class="footer">
      Projekt ansehen
    </div>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/vue'
import { useDatetime } from '@/composables/ui/datetime'
import { useCurrency } from '@/composables/ui/currency'
import { location } from 'ionicons/icons'
import { useImageCache } from '@/composables/ui/imageCache'

export default defineComponent({
  name: 'ParticipationProjectListPanel',
  props: {
    project: Object
  },
  components: { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon },
  setup() {
    const imageCache = useImageCache()
    return {
      useDatetime,
      useCurrency,
      location,
      imageCache
    }
  }
})
</script>
<style lang="sass" scoped>
.image-wrapper
  position: relative

  .voted-up
    position: absolute
    top: 0
    right: 10px
    z-index: 999
    padding: 10px
    border-radius: 30px
    margin: 20px 5px
    align-items: center
    font-weight: 700
    border: 2px solid #D3D3D3
    color: white
    background-color: rgba(171, 200,18,0.5)
    img
      width: 16px
      margin-right: 5px
.metrics
  border-top: 2px solid #D3D3D3
  margin: 20px -20px 0 -20px
  padding-top: 20px
  text-align: center
  &.has-vote-count
    display: grid
    grid-template-columns: 50% 50%
.footer
  background: #358BBC
  color: white
  display: grid
  place-items: center
  padding: 25px
  font-weight: 600
  font-size: 16px
  line-height: 22px
  text-transform: uppercase
</style>
