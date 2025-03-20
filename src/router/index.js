import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ScenarioList from '../views/ScenarioList.vue'
import ScenarioDetail from '../views/ScenarioDetail.vue'
import ScenarioCreate from '../views/ScenarioCreate.vue'
import ScenarioModify from '../views/ScenarioModify.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/scenarios',
    name: 'ScenarioList',
    component: ScenarioList,
    meta: { requiresAuth: false }
  },
  {
    path: '/scenarios/:id',
    name: 'ScenarioDetail',
    component: ScenarioDetail,
    props: true
  },
  {
    path: '/create',
    name: 'ScenarioCreate',
    component: ScenarioCreate,
    meta: { requiresAdmin: true }
  },
  {
    path: '/scenarios/:id/modify',
    name: 'ScenarioModify',
    component: ScenarioModify,
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 네비게이션 가드 설정
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const isAdmin = store.getters.isAdmin
  
  // 관리자 권한이 필요한 페이지
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isLoggedIn || !isAdmin) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
  // 인증이 필요한 페이지
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
  // 게스트만 접근 가능한 페이지 (로그인, 회원가입)
  else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isLoggedIn) {
      next({ name: 'Home' })
    } else {
      next()
    }
  }
  // 그 외 페이지
  else {
    next()
  }
})

export default router
