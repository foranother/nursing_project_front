<template>
  <div class="scenario-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>시나리오 목록</h1>
      <router-link v-if="isAdmin" :to="{ name: 'ScenarioCreate' }" class="btn btn-primary">
        새 시나리오 생성
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
      <p class="mt-3">시나리오를 불러오는 중입니다...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger my-5">
      {{ error }}
    </div>
    
    <div v-else-if="scenarios.length === 0" class="alert alert-info my-5">
      등록된 시나리오가 없습니다.
      <span v-if="isAdmin">
        <router-link :to="{ name: 'ScenarioCreate' }" class="alert-link">
          새 시나리오를 생성
        </router-link>해 보세요.
      </span>
    </div>
    
    <div v-else>
      <div class="mb-4">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="시나리오명, 질병명으로 검색" 
            v-model="searchQuery"
          >
          <button class="btn btn-outline-secondary" type="button" @click="search">
            검색
          </button>
        </div>
      </div>
      
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="scenario in filteredScenarios" :key="scenario.id">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h2 class="h5 mb-0 text-truncate" :title="scenario.title">{{ scenario.title }}</h2>
            </div>
            <div class="card-body">
              <p class="card-text mb-2"><strong>주요 질병:</strong> {{ scenario.main_disease }}</p>
              <p class="card-text mb-2">
                <strong>작성자:</strong> {{ scenario.created_by ? scenario.created_by.username : '알 수 없음' }}
              </p>
              <p class="card-text mb-0">
                <strong>생성일:</strong> {{ formatDate(scenario.created_at) }}
              </p>
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
      
      <div class="register-background">
        <div class="shape shape1"></div>
        <div class="shape shape2"></div>
        <div class="shape shape3"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScenarioList',
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    ...mapGetters(['scenarios', 'isLoading', 'error', 'isAdmin']),
    filteredScenarios() {
      if (!this.searchQuery) {
        return this.scenarios;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.scenarios.filter(scenario => 
        scenario.title.toLowerCase().includes(query) || 
        scenario.main_disease.toLowerCase().includes(query)
      );
    },
    loading() {
      return this.isLoading;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '알 수 없음';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    },
    search() {
      // 검색 실행 (현재는 클라이언트 측 필터링이므로 추가 액션 필요 없음)
      console.log('시나리오 검색:', this.searchQuery);
    }
  },
  created() {
    // 시나리오 목록을 불러옵니다
    this.$store.dispatch('fetchScenarios');
  }
}
</script>

<style scoped>
.scenario-list {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1rem;
}

.card-body {
  padding: 1.25rem;
}

.card-footer {
  padding: 1rem;
}
</style> 
