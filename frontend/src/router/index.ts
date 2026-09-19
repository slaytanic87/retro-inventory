import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import GamesView from '../views/GamesView.vue'
import ConsolesView from '../views/ConsolesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
    {
      path: '/library/games',
      name: 'games',
      component: GamesView,
      meta: { title: 'Games' },
    },
    {
      path: '/library/consoles',
      name: 'consoles',
      component: ConsolesView,
      meta: { title: 'Consoles' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'Collection'
  document.title = `${title} · Retro Inventory`
})

export default router
