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
    redirect: '/participation/projects',    
  },
  {
    path: '/participation/projects',
    component: () => import('@/views/participation/ProjectsPage.vue')
  }  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuthentication && useUserStore().current === null) {
      return '/login'
  }  
})

export default router
