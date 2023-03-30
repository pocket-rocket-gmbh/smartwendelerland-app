<template>
  <ion-nav-link :routerLink="pollLink" v-if="pollId && !pollCompleted">
    <div class="box">
      <img src="@/assets/images/poll-teaser.svg" class="has-drop-shadow is-fullwidth" />
      <div class="box-headline-right">
        <span v-if="useUser().loggedIn()">Sag uns deine Meinung!</span>
        <span v-else>Jetzt anmelden um an<br/>Umfragen teilzunehmen</span>
      </div>
    </div>
  </ion-nav-link>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useUser } from '@/composables/user/user'
import { usePollStore } from '@/stores/poll'
import { IonNavLink } from '@ionic/vue'
export default defineComponent({
  components: { IonNavLink },
  emits: ['setAccessiblePollId'],
  props: {
    projectId: {
      type: String,
      default: null
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const pollCompleted = computed(() => {
      const completed = localStorage.getItem(`smawela_poll_completed_${pollId.value}`)
      return completed === 'true'
    })

    const pollId = computed(() => {
      usePollStore().publicPoll?.id
      if (!props.isPublic) {
        return usePollStore().projectPoll?.id
      }
      return usePollStore().publicPoll?.id
    })

    const pollLink = computed(() => {
      if (useUser().loggedIn() && pollId.value) {
        return `/polls/${pollId.value}?is_public=${props.isPublic}`
      } else {
        return '/login'
      }
    })

    return {
      useUser,
      pollLink,
      pollId,
      pollCompleted
    }
  },
})
</script>

<style lang="sass" scoped>
</style>