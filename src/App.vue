<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">간호 시뮬레이션 시나리오 플랫폼</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">홈</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/scenarios">시나리오 목록</router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link class="nav-link" to="/create">시나리오 생성</router-link>
            </li>
          </ul>
          <div class="d-flex">
            <template v-if="isLoggedIn">
              <span class="navbar-text me-3">{{ currentUser.username }}</span>
              <button class="btn btn-outline-light" @click="logout">로그아웃</button>
            </template>
            <template v-else>
              <router-link class="btn btn-outline-light me-2" to="/login">로그인</router-link>
              <router-link class="btn btn-light" to="/register">회원가입</router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-view />
    </div>

    <footer class="bg-light py-4 mt-5">
      <div class="container text-center">
        <p class="mb-0">&copy; 2023 간호 시뮬레이션 시나리오 플랫폼. All rights reserved.</p>
      </div>
    </footer>
    
    <!-- 로딩 스피너 -->
    <loading-spinner :loading="isLoading" :message="loadingMessage" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'App',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      loadingMessage: ''
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'currentUser', 'isAdmin', 'isLoading'])
  },
  methods: {
    ...mapActions(['logout']),
    updateLoadingMessage(loading, message) {
      if (loading) {
        this.loadingMessage = message || '처리 중입니다. 잠시만 기다려주세요...';
      }
    }
  },
  created() {
    // 페이지 로드 시 사용자 인증 상태 확인
    this.$store.dispatch('checkAuth')
    
    // 이벤트 버스 대신 mitt 이벤트 리스너 사용
    this.$mitt.on('set-loading', (data) => {
      if (Array.isArray(data)) {
        const [loading, message] = data;
        this.updateLoadingMessage(loading, message);
      } else if (typeof data === 'object') {
        const { loading, message } = data;
        this.updateLoadingMessage(loading, message);
      }
    });
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    this.$mitt.off('set-loading');
  }
}
</script>

<style>
@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f8f9fa;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  flex: 1;
}

.navbar-brand {
  font-weight: 700;
}

.nav-link {
  font-weight: 500;
}

footer {
  margin-top: auto;
}
</style> 