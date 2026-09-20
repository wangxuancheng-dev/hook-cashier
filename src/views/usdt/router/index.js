import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'pay',
      component: () => import('../views/usdt/QRPayment.vue')
    }
  ]
})

export default router 