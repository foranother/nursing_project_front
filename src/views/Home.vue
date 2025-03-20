<template>
  <div class="home">
    <div class="hero-section text-center">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8 mx-auto">
            <h1 class="fw-bold mb-4">간호 시뮬레이션 시나리오 플랫폼</h1>
            <p class="lead mb-5">
              간호 교육을 위한 현실적인 시뮬레이션 시나리오를 생성하고 관리하세요.<br>
              <span class="highlight">GPT-3.5 기반의 인공지능</span>이 다양한 상황에 맞는 시나리오를 제공합니다.
            </p>
            <div class="d-flex justify-content-center gap-3">
              <router-link :to="{ name: 'ScenarioList' }" class="btn btn-primary btn-lg">
                <i class="bi bi-collection me-2"></i>시나리오 목록
              </router-link>
              <router-link v-if="isAdmin" :to="{ name: 'ScenarioCreate' }" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-plus-circle me-2"></i>새 시나리오 생성
              </router-link>
              <router-link v-else-if="!isLoggedIn" :to="{ name: 'Login' }" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-box-arrow-in-right me-2"></i>로그인
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="features-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">주요 기능</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-file-earmark-text"></i>
              </div>
              <h3>시나리오 생성</h3>
              <p>
                관리자 계정을 통해 다양한 간호 상황에 맞는 시나리오를 생성할 수 있습니다.
                기본 인적 사항, 주요 질병, 기타 사항 등을 입력하면 GPT-3.5가 현실적인 시나리오를 생성합니다.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-chat-dots"></i>
              </div>
              <h3>챗봇 기반 수정</h3>
              <p>
                챗봇 인터페이스를 통해 시나리오를 쉽게 수정할 수 있습니다.
                원하는 변경 사항을 자연어로 입력하면 GPT-3.5가 시나리오를 적절히 수정합니다.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-search"></i>
              </div>
              <h3>시나리오 열람</h3>
              <p>
                생성된 모든 시나리오는 사용자들이 자유롭게 열람할 수 있습니다.
                시나리오명, 주요 질병 등으로 검색하여 원하는 시나리오를 쉽게 찾을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="recent-scenarios-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">최근 생성된 시나리오</h2>
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
        </div>
        
        <div v-else-if="recentScenarios.length === 0" class="empty-state text-center py-5">
          <i class="bi bi-inbox display-4 mb-3"></i>
          <p>아직 생성된 시나리오가 없습니다.</p>
        </div>
        
        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col" v-for="scenario in recentScenarios" :key="scenario.id">
            <div class="scenario-card">
              <div class="scenario-header">
                <h3 :title="scenario.title">{{ scenario.title }}</h3>
              </div>
              <div class="scenario-body">
                <div class="scenario-info">
                  <div class="info-item">
                    <i class="bi bi-activity me-2"></i>
                    <span>{{ scenario.main_disease }}</span>
                  </div>
                  <div class="info-item">
                    <i class="bi bi-calendar-date me-2"></i>
                    <span>{{ formatDate(scenario.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="scenario-footer">
                <router-link 
                  :to="{ name: 'ScenarioDetail', params: { id: scenario.id } }" 
                  class="btn btn-primary w-100"
                >
                  <i class="bi bi-eye me-1"></i> 상세 보기
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <router-link :to="{ name: 'ScenarioList' }" class="btn btn-outline-primary btn-lg">
            <i class="bi bi-grid-3x3-gap me-1"></i> 모든 시나리오 보기
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
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
  color: white;
  padding: 6rem 1rem;
  margin-bottom: 3rem;
  border-radius: var(--border-radius);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;charset=utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"%3E%3Cpath fill="%23ffffff" fill-opacity="0.1" d="M0,96L48,128C96,160,192,224,288,213.3C384,203,480,117,576,117.3C672,117,768,203,864,202.7C960,203,1056,117,1152,96C1248,75,1344,117,1392,138.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"%3E%3C/path%3E%3C/svg%3E') no-repeat bottom center;
  background-size: cover;
  z-index: 0;
}

.hero-section .container {
  position: relative;
  z-index: 1;
}

.hero-section h1 {
  font-size: 3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.highlight {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.section-title {
  font-weight: 700;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.section-title::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.features-section {
  margin-bottom: 3rem;
}

.feature-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  height: 100%;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: white;
  margin-bottom: 1.5rem;
}

.feature-icon i {
  font-size: 2.5rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-dark);
}

.recent-scenarios-section {
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  padding: 3rem 1rem;
}

.scenario-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scenario-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.scenario-header {
  background-color: var(--primary-color);
  color: white;
  padding: 1.25rem;
}

.scenario-header h3 {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scenario-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.scenario-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.info-item i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.scenario-footer {
  padding: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.empty-state {
  color: #aaa;
}

.empty-state i {
  color: var(--primary-light);
}

/* 애니메이션 추가 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.feature-card, .scenario-card {
  animation: fadeIn 0.5s ease forwards;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.4s;
}

.scenario-card:nth-child(2) {
  animation-delay: 0.2s;
}

.scenario-card:nth-child(3) {
  animation-delay: 0.4s;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 1rem;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
}
</style> 
