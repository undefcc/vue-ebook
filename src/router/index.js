import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/store'
  },
  {
    path: '/ebook',
    component: () => import('../views/ebook/index.vue'),
    children: [
      {
        path: ':fileName',
        component: () => import('../components/ebook/EbookReader.vue')
      }
    ]
  },
  {
    path: '/store',
    component: () => import('../views/store/index.vue'),
    redirect: '/store/home',
    children: [
      {
        path: 'home', // 不要加斜杠，加斜杠是绝对路径（不加为相对路径）
        component: () => import('../views/store/storeHome.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history', // history -> hash
  base: process.env.BASE_URL,
  routes
})

export default router
