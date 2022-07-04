import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/LandingPage.vue'),
    meta: { requiresAuthentication: false }
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresAuthentication: false }
  },
  {
    path: '/participation',
    redirect: '/participation/projects'
  },
  {
    path: '/participation/projects',
    component: () => import('@/views/participation/ProjectListPage.vue'),
    meta: { requiresAuthentication: false }
  },
  {
    path: '/participation/projects/:id',
    component: () => import('@/views/participation/ProjectPage.vue'),
    meta: { requiresAuthentication: false }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuthentication && useUserStore().user === null) {
      return '/login'
  }  
})

export default router
