import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresAuthentication: false }
  },  
  {
    path: '/main',
    component: () => import('@/views/MainPage.vue'),
    children: [
      {
        path: '',
        redirect: '/main/overview'
      },
      {
        path: 'overview',
        component: () => import('@/views/OverviewPage.vue'),
        meta: { requiresAuthentication: true }
      },
      {
        path: 'list',
        component: () => import('@/views/ListPage.vue'),
        meta: { requiresAuthentication: true }
      },
      {
        path: 'pdfdownload',
        component: () => import('@/views/PdfDownloadPage.vue'),
        meta: { requiresAuthentication: true }
      },
      {
        path: 'upload',
        component: () => import('@/views/UploadPage.vue'),
        meta: { requiresAuthentication: true }
      },
      {
        path: 'fabric',                   
        component: () => import('@/views/FabricPage.vue'),
        meta: { requiresAuthentication: true }
      },
      {
        path: 'info',
        component: () => import('@/views/other/AboutPage.vue'),
        meta: { requiresAuthentication: true }
      }
    ]
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
