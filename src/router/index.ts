import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

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
    path: '/me',
    component: () => import('@/views/MePage.vue')
  },
  {
    path: '/participation',
    redirect: '/participation/projects'
  },
  {
    path: '/participation/projects',
    component: () => import('@/views/participation/ProjectListPage.vue')
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
