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

      ]
    },

    // ── Login ──
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },

    // ── Compatibility: legacy admin knowledge path ──
    {
      path: '/admin/knowledge',
      redirect: '/knowledge'
    },

    // ── Redirect old materials to new product material page ──
    {
      path: '/materials/:category?',
      redirect: '/products'
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
          path: 'products',
          name: 'products',
          component: () => import('../views/ProductMaterial.vue')
        },
        {
          path: 'knowledge',
          name: 'admin-knowledge',
          component: () => import('../views/AdminKnowledge.vue')
        },
        {
          path: 'knowledge/manual-entry',
          name: 'manual-wiki-entry',
          component: () => import('../views/ManualWikiEntry.vue')
        },
        {
          path: 'help',
          name: 'help',
          component: () => import('../views/HelpCenter.vue')
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
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  // 尝试恢复登录状态
  if (!auth.isLoggedIn && localStorage.getItem('auth-token')) {
    await auth.restore()
  }
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login' })
  } else if (to.name === 'login' && auth.isLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
