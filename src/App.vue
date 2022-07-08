<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { defineComponent, onBeforeMount } from 'vue'
import { useRouter, useRoute, RouteLocationNormalized } from "vue-router"
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const privateApi = usePrivateApi()

    onBeforeMount(() => {
      // Register navigation handling for all route changes.
      router.beforeEach(async (to) => {
        navigationTo(to)
      })

      // Trigger entry page navigation as it is not considered a route change.
      navigationTo(route)
    })

    const navigationTo = async (to: RouteLocationNormalized) => {

      const jwt = localStorage.getItem('auth._token.jwt')
      const user = userStore.user

      // User already logged in.
      if (jwt !== null && user !== null) {
        return
      }

      // Try to get user information if there is a token.
      if (jwt !== null && user === null) {
        const result = await privateApi.call('get', '/users/me', null)
        userStore.user = result.data.resource
      }
    }
  }
})
</script>