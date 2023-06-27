<template>
  <div class="milestones">
    <div v-if="milestones.length > 0">
      <div :class="['milestone-grid', { 'active' : useDatetime().isInPast(milestone.timestamp) }]" v-for="(milestone, index) in milestones" :key="index">
        <div :class="['milestone-slide', { 'first' : index == 0, 'last' : index == milestones.length - 1 }]">
          <div class="milestone-bubble">{{ index + 1 }}</div>
        </div>
        <div class="bottom">
          <div class="font-weight-bold">{{ milestone.name }}</div>
          <div v-if="milestone.timestamp">bis {{ useDatetime().parseDate(milestone.timestamp) }}</div>
          <div v-else>Noch kein Datum festgelegt</div>
        </div>
      </div>
    </div>
    <div v-else>
      Noch keine Meilensteine vorhanden.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePublicApi } from '@/composables/api/public'
import { useDatetime } from '@/composables/ui/datetime'
export default defineComponent({
  props: {
    projectId: String
  },
  setup (props) {
    const api = useCollectionApi()
    api.setBaseApi(usePublicApi())
    api.setEndpoint(`projects/${props.projectId}/milestones`)

    const milestones = api.items
    const loading = ref(false)

    onMounted(() => {
      getItems()
    })

    const getItems = async () => {
      loading.value = true
      await api.retrieveCollection({ page: 1, per_page: 1000, sort_by: 'menu_order', sort_order: 'ASC', searchQuery: null, concat: false, filters: null })
      loading.value = false
    }

    return {
      milestones,
      loading,
      getItems,
      useDatetime
    }
  }
})
</script>
<style lang="sass" scoped>
.milestones
  margin-top: 20px
.bottom
  margin-bottom: 20px

.font-weight-bold
  font-weight: 500
.milestone-grid
  color: #C2C2C2
  display: grid
  grid-template-columns: 50px auto
  &.active
    color: #58595E
  &.active .milestone-bubble
    background: #ABC812
.milestone-slide
  background: #F5F5F5
  width: 40px
.milestone-slide.first
  border-top-left-radius: 50%
  border-top-right-radius: 50%
.milestone-slide.last
  height: 40px
  border-bottom-left-radius: 50%
  border-bottom-right-radius: 50%
.milestone-bubble
  color: white
  display: grid
  place-items: center
  height: 40px
  width: 40px
  border-radius: 50%
  font-weight: bold
  background: #C2C2C2  
.milestone-bubble.active
  color: #58595E
.milestone-bubble.active .milestone-bubble
  background: #ABC812
</style>