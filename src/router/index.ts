import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useUser } from '@/composables/user/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/LandingPage.vue'),
    beforeEnter: (to, from, next) => {
      const projektplattformTutorialSkipped = localStorage.getItem('projektplattform_tutorial_skipped')
      if (projektplattformTutorialSkipped) {
        if (projektplattformTutorialSkipped === 'true') {
          next({ path: '/participation/projects'})
        } else {
          next()
        }
      } else {
        next()
      }
    }
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
    beforeEnter: (to, from, next) => {
      if (useUser().loggedIn()) {
        next({ path: from.path })
      } else {
        next()
      }
    }
  },
  {
    path: '/password-forgotten',
    component: () => import('@/views/PasswordForgottenPage.vue'),
    beforeEnter: (to, from, next) => {
      if (useUser().loggedIn()) {
        next({ path: '/participation/projects' })
      } else {
        next()
      }
    }
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue'),
    beforeEnter: (to, from, next) => {
      if (useUser().loggedIn()) {
        next({ path: '/participation/projects' })
      } else {
        next()
      }
    }
  },
  {
    path: '/me',
    component: () => import('@/views/MePage.vue'),
    beforeEnter: (to, from, next) => {
      if (!useUser().loggedIn()) {
        next({ path: '/participation/projects' })
      } else {
        next()
      }
    }
  },
  {
    path: '/pinboards',
    component: () => import('@/views/pinboards/PinboardPage.vue')
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
    component: () => import('@/views/participation/ProjectOverviewPage.vue')
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

// router.beforeEach((to) => {
//   const projektplattformTutorialSkipped = localStorage.getItem('projektplattform_tutorial_skipped')
//   if (projektplattformTutorialSkipped) {
//     if (projektplattformTutorialSkipped === 'true' && to.path === '/') {
//       router.push({ path: '/participation/projects'})
//     }
//   }
// })

export default router
