import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'pay',
      component: () => import('../views/thb/QRPayment.vue')
    }
  ]
})

export default router 