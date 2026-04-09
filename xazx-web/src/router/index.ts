import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    // ── Public Portal (no auth required) ──
    {
      path: '/portal',
      component: () => import('../views/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'portal-home',
          component: () => import('../views/portal/PortalHome.vue')
        },
        {
          path: 'resources',
          name: 'resource-gallery',
          component: () => import('../views/portal/ResourceGallery.vue')
        },
        {
          path: 'resources/:id',
          name: 'resource-detail',
          component: () => import('../views/portal/ResourceDetail.vue')
        },
        {
          path: 'knowledge',
          name: 'knowledge-base',
          component: () => import('../views/portal/KnowledgeBase.vue')
        },
        {
          path: 'about',
          name: 'about-us',
          component: () => import('../views/portal/AboutUs.vue')
        }
      ]
    },

    // ── Login ──
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },

    // ── Admin Backend (auth required) ──
    {
      path: '/',
      name: 'layout',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: () => import('../views/AccountManagement.vue')
        },
        {
          path: 'materials/:category',
          name: 'materials',
          component: () => import('../views/MaterialManagement.vue')
        },
        {
          path: 'knowledge',
          name: 'admin-knowledge',
          component: () => import('../views/portal/KnowledgeBase.vue')
        }
      ]
    },

    // ── 404 Catch-All ──
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

// Route Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) {
    next({ name: 'login' })
  } else if (to.name === 'login' && auth.user) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
