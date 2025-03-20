<template>
  <div class="scenario-detail">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
      <p class="mt-3">시나리오를 불러오는 중입니다...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger my-5">
      {{ error }}
    </div>
    
    <div v-else-if="!currentScenario" class="alert alert-warning my-5">
      시나리오를 찾을 수 없습니다.
    </div>
    
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ currentScenario.title }}</h1>
        <div>
          <button class="btn btn-success me-2" @click="downloadPDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF 다운로드
          </button>
          <router-link :to="{ name: 'ScenarioList' }" class="btn btn-outline-secondary me-2">
            목록으로
          </router-link>
          <router-link 
            v-if="isLoggedIn" 
            :to="{ name: 'ScenarioModify', params: { id } }" 
            class="btn btn-primary me-2"
          >
            시나리오 수정
          </router-link>
          <button 
            v-if="isLoggedIn" 
            class="btn btn-danger"
            @click="showDeleteModal = true"
          >
            시나리오 삭제
          </button>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">시나리오 정보</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <h3 class="h6">주요 질병</h3>
              <p>{{ currentScenario.main_disease }}</p>
            </div>
            
            <div class="col-md-6 mb-3">
              <h3 class="h6">작성자</h3>
              <p>{{ currentScenario.created_by ? currentScenario.created_by.username : '알 수 없음' }}</p>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <h3 class="h6">생성일</h3>
              <p>{{ formatDate(currentScenario.created_at) }}</p>
            </div>
            
            <div class="col-md-6 mb-3">
              <h3 class="h6">수정일</h3>
              <p>{{ formatDate(currentScenario.updated_at) }}</p>
            </div>
          </div>
          
          <div v-if="currentScenario.personal_info" class="mt-3">
            <h3 class="h6">환자 정보</h3>
            <div class="row">
              <div v-for="(value, key) in currentScenario.personal_info" :key="key" class="col-md-4 mb-2">
                <strong>{{ formatKey(key) }}:</strong> {{ formatValue(value) }}
              </div>
            </div>
          </div>
          
          <div v-if="currentScenario.additional_info" class="mt-3">
            <h3 class="h6">기타 사항</h3>
            <p>{{ currentScenario.additional_info }}</p>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h2 class="h5 mb-0">시나리오 내용</h2>
            </div>
            <div class="card-body">
              <div class="scenario-content" id="scenario-content">
                <div class="scenario-text" v-html="formattedContent"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h2 class="h5 mb-0">환자와의 대화</h2>
            </div>
            <div class="card-body">
              <div v-if="hasPatientConversation" class="scenario-conversation" id="scenario-conversation">
                <div class="conversation-text" v-html="formattedConversation"></div>
              </div>
              <div v-else class="alert alert-warning">
                환자와의 대화 내용이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-wrapper">
      <div class="modal fade show modal-custom" tabindex="-1" style="display: block; z-index: 1051;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">시나리오 삭제 확인</h5>
              <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <p>'{{ currentScenario?.title }}' 시나리오를 정말 삭제하시겠습니까?</p>
              <p class="text-danger">이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">취소</button>
              <button type="button" class="btn btn-danger" @click="deleteScenario" :disabled="deleting">
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop-custom fade show"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import html2pdf from 'html2pdf.js'
import { marked } from 'marked'
import { getCurrentInstance } from 'vue'

export default {
  name: 'ScenarioDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      showDeleteModal: false,
      deleting: false
    }
  },
  setup() {
    const { proxy } = getCurrentInstance()
    return { proxy }
  },
  computed: {
    ...mapGetters(['currentScenario', 'isLoading', 'error', 'isLoggedIn']),
    loading() {
      return this.isLoading
    },
    hasPatientConversation() {
      return this.currentScenario && 
             this.currentScenario.patient_conversation && 
             this.currentScenario.patient_conversation.trim() !== ''
    },
    formattedContent() {
      if (!this.currentScenario || !this.currentScenario.content) return ''
      return marked(this.currentScenario.content)
    },
    formattedConversation() {
      if (!this.hasPatientConversation) return ''
      return marked(this.currentScenario.patient_conversation)
    }
  },
  methods: {
    formatKey(key) {
      const keyMap = {
        gender: '성별',
        age: '나이',
        medical_history: '과거력',
        family_history: '가족력',
        allergies: '알레르기',
        vital_signs: '활력징후',
        symptoms: '주요증상'
      }
      
      return keyMap[key] || key
    },
    formatValue(value) {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      
      // 나이 값의 '세세' 문제 해결
      if (typeof value === 'string' && value.endsWith('세')) {
        // 이미 '세'로 끝나는 경우 그대로 반환
        return value;
      }
      
      return value
    },
    formatDate(dateString) {
      if (!dateString) return '알 수 없음'
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    },
    downloadPDF() {
      // 로딩 메시지 설정
      this.proxy.$mitt.emit('set-loading', [true, 'PDF 파일을 생성하는 중입니다. 잠시만 기다려주세요...']);
      
      // 현재 페이지의 내용을 복제하여 PDF 생성용 요소 생성
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: 'Noto Sans KR', sans-serif;">
          <h1 style="text-align: center; margin-bottom: 20px;">${this.currentScenario.title}</h1>
          
          <div style="margin-bottom: 20px;">
            <h2>시나리오 정보</h2>
            <p><strong>주요 질병:</strong> ${this.currentScenario.main_disease}</p>
            <p><strong>작성자:</strong> ${this.currentScenario.created_by ? this.currentScenario.created_by.username : '알 수 없음'}</p>
            <p><strong>생성일:</strong> ${this.formatDate(this.currentScenario.created_at)}</p>
            <p><strong>수정일:</strong> ${this.formatDate(this.currentScenario.updated_at)}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2>환자 정보</h2>
            ${Object.entries(this.currentScenario.personal_info || {}).map(([key, value]) => 
              `<p><strong>${this.formatKey(key)}:</strong> ${this.formatValue(value)}</p>`
            ).join('')}
          </div>
          
          ${this.currentScenario.additional_info ? `
            <div style="margin-bottom: 20px;">
              <h2>기타 사항</h2>
              <p>${this.currentScenario.additional_info}</p>
            </div>
          ` : ''}
          
          <div style="margin-bottom: 20px;">
            <h2>시나리오 내용</h2>
            <div>${this.formattedContent}</div>
          </div>
          
          ${this.hasPatientConversation ? `
            <div>
              <h2>환자와의 대화</h2>
              <div>${this.formattedConversation}</div>
            </div>
          ` : ''}
        </div>
      `;
      
      // PDF 옵션 설정
      const options = {
        margin: 10,
        filename: `${this.currentScenario.title}_시나리오.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // PDF 생성 및 다운로드
      html2pdf().from(element).set(options).save().then(() => {
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
      }).catch(error => {
        console.error('PDF 생성 오류:', error);
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
      });
    },
    async deleteScenario() {
      try {
        this.deleting = true;
        // 로딩 메시지 설정
        this.proxy.$mitt.emit('set-loading', [true, '시나리오를 삭제하는 중입니다...']);
        
        await this.$store.dispatch('deleteScenario', this.id);
        
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
        this.showDeleteModal = false;
        
        // 삭제 성공 후 목록 페이지로 이동
        this.$router.push({ name: 'ScenarioList' });
      } catch (error) {
        console.error('시나리오 삭제 실패:', error);
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
        this.deleting = false;
        alert('시나리오 삭제 중 오류가 발생했습니다: ' + error.message);
      }
    }
  },
  async created() {
    // 시나리오 정보 로드
    if (!this.currentScenario || this.currentScenario.id !== parseInt(this.id)) {
      try {
        // 로딩 메시지 설정
        this.proxy.$mitt.emit('set-loading', [true, '시나리오를 불러오는 중입니다...']);
        
        await this.$store.dispatch('fetchScenario', this.id)
        console.log('로드된 시나리오:', this.currentScenario)
        
        // 환자와의 대화 확인
        if (this.currentScenario && !this.currentScenario.patient_conversation) {
          console.warn('환자와의 대화가 없습니다.')
        }
        
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
      } catch (error) {
        console.error('시나리오 로드 실패:', error)
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
      }
    }
  }
}
</script>

<style scoped>
.scenario-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.scenario-content, .scenario-conversation {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
  height: 100%;
  min-height: 400px;
  overflow-y: auto;
}

.scenario-text, .conversation-text {
  white-space: pre-wrap;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 모달 관련 스타일 */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}

.modal-custom {
  position: relative;
  z-index: 1060;
  pointer-events: auto;
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  pointer-events: none;
}

/* Markdown 스타일 */
:deep(h1) {
  font-size: 1.8rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

:deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
}

:deep(h3) {
  font-size: 1.3rem;
  margin-top: 1rem;
  margin-bottom: 0.6rem;
}

:deep(ul), :deep(ol) {
  padding-left: 1.5rem;
}

:deep(li) {
  margin-bottom: 0.3rem;
}

:deep(p) {
  margin-bottom: 0.8rem;
}

:deep(strong) {
  font-weight: 600;
}
</style> 