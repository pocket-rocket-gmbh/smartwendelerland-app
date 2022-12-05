import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePrivateApi } from '@/composables/api/private'
import { ResultStatus } from '@/types/serverCallResult'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/LandingPage.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/password-forgotten',
    component: () => import('@/views/PasswordForgottenPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/me',
    component: () => import('@/views/MePage.vue')
  },
  {
    path: '/participation',
    redirect: '/participation/projects'
  },
  {
    path: '/participation/projects',
    component: () => import('@/views/participation/ProjectMapPage.vue')
  },
  {
    path: '/participation/projects/:id',
    component: () => import('@/views/participation/ProjectPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {

  console.log("router before each")

  const userStore = useUserStore()
  const privateApi = usePrivateApi()

  const jwt = localStorage.getItem('auth._token.jwt')
  const user = userStore.user

  // User already logged in.
  if (jwt !== null && user !== null) {
    return
  }

  // Try to get user information if there is a token.
  if (jwt !== null && user === null) {
    const result = await privateApi.call('get', '/users/me', null)
    if (result.status === ResultStatus.SUCCESSFUL) {
      userStore.user = result.data.resource
    }
  }
})

export default router
