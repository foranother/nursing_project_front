<template>
  <div class="home">
    <div class="hero-section text-center py-5">
      <h1 class="display-4 mb-4">간호 시뮬레이션 시나리오 플랫폼</h1>
      <p class="lead mb-5">
        간호 교육을 위한 현실적인 시뮬레이션 시나리오를 생성하고 관리하세요.<br>
        GPT-3.5 기반의 인공지능이 다양한 상황에 맞는 시나리오를 제공합니다.
      </p>
      <div class="d-flex justify-content-center gap-3">
        <router-link :to="{ name: 'ScenarioList' }" class="btn btn-primary btn-lg">
          시나리오 목록 보기
        </router-link>
        <router-link v-if="isAdmin" :to="{ name: 'ScenarioCreate' }" class="btn btn-outline-primary btn-lg">
          새 시나리오 생성
        </router-link>
        <router-link v-else-if="!isLoggedIn" :to="{ name: 'Login' }" class="btn btn-outline-primary btn-lg">
          로그인
        </router-link>
      </div>
    </div>
    
    <div class="features-section py-5">
      <div class="container">
        <h2 class="text-center mb-5">주요 기능</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-file-earmark-text display-4"></i>
                </div>
                <h3 class="card-title h5">시나리오 생성</h3>
                <p class="card-text">
                  관리자 계정을 통해 다양한 간호 상황에 맞는 시나리오를 생성할 수 있습니다.
                  기본 인적 사항, 주요 질병, 기타 사항 등을 입력하면 GPT-3.5가 현실적인 시나리오를 생성합니다.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-chat-dots display-4"></i>
                </div>
                <h3 class="card-title h5">챗봇 기반 수정</h3>
                <p class="card-text">
                  챗봇 인터페이스를 통해 시나리오를 쉽게 수정할 수 있습니다.
                  원하는 변경 사항을 자연어로 입력하면 GPT-3.5가 시나리오를 적절히 수정합니다.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-search display-4"></i>
                </div>
                <h3 class="card-title h5">시나리오 열람</h3>
                <p class="card-text">
                  생성된 모든 시나리오는 사용자들이 자유롭게 열람할 수 있습니다.
                  시나리오명, 주요 질병 등으로 검색하여 원하는 시나리오를 쉽게 찾을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="recent-scenarios-section py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-5">최근 생성된 시나리오</h2>
        
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
        </div>
        
        <div v-else-if="recentScenarios.length === 0" class="text-center">
          <p>아직 생성된 시나리오가 없습니다.</p>
        </div>
        
        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col" v-for="scenario in recentScenarios" :key="scenario.id">
            <div class="card h-100">
              <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0 text-truncate" :title="scenario.title">{{ scenario.title }}</h3>
              </div>
              <div class="card-body">
                <p class="card-text"><strong>주요 질병:</strong> {{ scenario.main_disease }}</p>
                <p class="card-text"><strong>생성일:</strong> {{ formatDate(scenario.created_at) }}</p>
              </div>
              <div class="card-footer bg-white border-top-0">
                <router-link 
                  :to="{ name: 'ScenarioDetail', params: { id: scenario.id } }" 
                  class="btn btn-outline-primary w-100"
                >
                  상세 보기
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <router-link :to="{ name: 'ScenarioList' }" class="btn btn-outline-primary">
            모든 시나리오 보기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  computed: {
    ...mapGetters(['scenarios', 'isLoading', 'isLoggedIn', 'isAdmin']),
    recentScenarios() {
      if (!this.scenarios || !Array.isArray(this.scenarios)) {
        console.warn('scenarios가 배열이 아닙니다:', this.scenarios);
        return [];
      }
      return this.scenarios.slice(0, 3);
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '알 수 없음'
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }
  },
  created() {
    // 시나리오 목록 로드
    this.$store.dispatch('fetchScenarios')
  }
}
</script>

<style scoped>
.hero-section {
  background-color: #f8f9fa;
  padding: 5rem 1rem;
  margin-bottom: 2rem;
  border-radius: 10px;
}

.features-section {
  margin-bottom: 2rem;
}

.feature-icon {
  color: #007bff;
}

.card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

/* Bootstrap Icons CDN */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css");
</style> 