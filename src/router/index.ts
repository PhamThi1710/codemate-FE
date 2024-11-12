/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes as autoRoutes} from 'vue-router/auto-routes'

const StudentRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard/index.vue'),
  },

  {
    path: '/courselist',
    name: 'CourseList',
    component: () => import('@/pages/Course/CourseList/index.vue'),
  },
  {
    path: '/courselist/course/:id',
    name: 'CourseDetail',
    component: () => import('@/pages/Course/CourseDetail/index.vue'),
    props: true,
  },
  {
    path: '/',
    name: '',
    component: () => import('@/pages/Dashboard/index.vue'),
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts([...autoRoutes, ...StudentRoutes])
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
