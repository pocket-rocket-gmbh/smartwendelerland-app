<template>
  <div />
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useCollectionApi } from '@/composables/api/collectionApi'
import { usePrivateApi } from '@/composables/api/private'
import { useDatetime } from '@/composables/ui/datetime'
export default defineComponent({
  emits: ['setAccessiblePollId'],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  setup(props, { emit }) {
    const api = useCollectionApi()
    api.setBaseApi(usePrivateApi())
    if (props.projectId) {
      api.setEndpoint(`polls?is_active=true&project_id=${props.projectId}`)
    } else {
      api.setEndpoint(`polls?is_active=true&ignore_projects=true`)
    }

    const polls = api.items
    const loading = ref(false)
    const activePollId = ref(null)
    const showCurrentActivePoll = ref(true)

    // currently considers only one active poll
    const lastActivePoll = computed(() => {
      if (polls.value.length > 0) {
        emit('setAccessiblePollId', polls.value[0].id)
        return polls.value[0]
      }
      return null
    })

    const getActivePolls = async () => {
      loading.value = true
      await api.retrieveCollection({ page: 1, per_page: 5, sort_by: 'created_at', sort_order: 'DESC', searchQuery: null, concat: false, filters: null })
      loading.value = false
    }

    const setPoll = (id:any) => {
      activePollId.value = id
    }

    const pollAlreadyAnswered = computed(() => {
      if (lastActivePoll.value && localStorage.getItem(`smawela_poll_completed_${lastActivePoll.value.id}`)) {
        return true
      }
      return false
    })

    onMounted(() => {
      getActivePolls()
    })

    return {
      lastActivePoll,
      activePollId,
      setPoll,
      showCurrentActivePoll,
      pollAlreadyAnswered,
      useDatetime
    }
  },
})
</script>

<style lang="sass" scoped>
.polls
  position: relative
</style>