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
    path: '/polls/:id',
    component: () => import('@/views/polls/PollsPage.vue')
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

export default router
