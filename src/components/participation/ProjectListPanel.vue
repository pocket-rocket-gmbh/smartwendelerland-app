<template>
  <ion-card>
    <div class="image-wrapper">
      <img :src="project.image_url" />
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
      <div class="ion-margin-top ion-margin-bottom"><b>Abstimmung</b></div>
      <ProjectVotes
        :project="project"
        :show-vote-count="false"
      />
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
import ProjectVotes from '../../components/participation/ProjectVotes.vue'
import { location } from 'ionicons/icons'

export default defineComponent({
  name: 'ParticipationProjectListPanel',
  props: {
    project: Object
  },
  components: { IonCard, IonCardHeader, IonCardTitle, IonCardContent, ProjectVotes, IonIcon },
  setup() {
    return {
      useDatetime,
      useCurrency,
      location
    }
  }
})
</script>
<style lang="sass" scoped>
.image-wrapper
  position: relative

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
