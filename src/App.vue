<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-heart-pulse me-2"></i>간호 시뮬레이션 플랫폼
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house-door me-1"></i>홈
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/scenarios">
                <i class="bi bi-collection me-1"></i>시나리오 목록
              </router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link class="nav-link" to="/create">
                <i class="bi bi-plus-circle me-1"></i>시나리오 생성
              </router-link>
            </li>
          </ul>
          <div class="d-flex">
            <template v-if="isLoggedIn">
              <div class="user-profile me-3">
                <i class="bi bi-person-circle me-1"></i>
                <span>{{ currentUser.username }}</span>
              </div>
              <button class="btn btn-outline-light btn-sm" @click="logout">
                <i class="bi bi-box-arrow-right me-1"></i>로그아웃
              </button>
            </template>
            <template v-else>
              <router-link class="btn btn-outline-light btn-sm me-2" to="/login">
                <i class="bi bi-box-arrow-in-right me-1"></i>로그인
              </router-link>
              <router-link class="btn btn-light btn-sm" to="/register">
                <i class="bi bi-person-plus me-1"></i>회원가입
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4 main-content">
      <router-view />
    </div>

    <footer class="footer py-4">
      <div class="container text-center">
        <div class="row">
          <div class="col-md-6 text-md-start">
            <h5 class="mb-2">간호 시뮬레이션 시나리오 플랫폼</h5>
            <p class="mb-0 small">효과적인 간호 교육을 위한 AI 기반 시뮬레이션 플랫폼</p>
          </div>
          <div class="col-md-6 text-md-end">
            <p class="mb-0 copyright">&copy; 2023 간호 시뮬레이션 시나리오 플랫폼. All rights reserved.</p>
          </div>
        </div>
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
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

:root {
  --primary-color: #1976d2;
  --primary-dark: #0d47a1;
  --primary-light: #63a4ff;
  --secondary-color: #f5f5f5;
  --accent-color: #ff4081;
  --text-dark: #212121;
  --text-light: #f8f9fa;
  --gray-light: #f0f2f5;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --border-radius: 10px;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: var(--gray-light);
  color: var(--text-dark);
  transition: all 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  padding: 1rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: -0.5px;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem;
  margin: 0 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  padding-bottom: 2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  color: white;
  font-weight: 500;
}

.btn {
  font-weight: 500;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.footer {
  background-color: var(--primary-color);
  color: var(--text-light);
  margin-top: auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.copyright {
  opacity: 0.8;
  font-size: 0.9rem;
}
</style> 
