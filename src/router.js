import { createRouter, createWebHashHistory } from 'vue-router'
import BibliotecaPage from '@/pages/BibliotecaPage.vue'
import AutoresPage from '@/pages/AutoresPage.vue'
import EstatisticasPage from '@/pages/EstatisticasPage.vue'

const routes = [
  { path: '/', name: 'biblioteca', component: BibliotecaPage },
  { path: '/autores', name: 'autores', component: AutoresPage },
  { path: '/estatisticas', name: 'estatisticas', component: EstatisticasPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
