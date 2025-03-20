<template>
  <div class="scenario-modify">
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
        <h1>시나리오 수정</h1>
        <router-link :to="{ name: 'ScenarioDetail', params: { id } }" class="btn btn-outline-secondary">
          돌아가기
        </router-link>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">{{ currentScenario.title }}</h2>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <h3 class="h6">주요 질병</h3>
            <p>{{ currentScenario.main_disease }}</p>
          </div>
          
          <div class="mb-3">
            <h3 class="h6">기본 인적 사항</h3>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="(value, key) in currentScenario.personal_info" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ formatValue(value) }}
              </li>
            </ul>
          </div>
          
          <div v-if="currentScenario.additional_info">
            <h3 class="h6">기타 사항</h3>
            <p>{{ currentScenario.additional_info }}</p>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 class="h5 mb-0">현재 시나리오 내용</h3>
          <button 
            v-if="!isEditing" 
            @click="startEditing" 
            class="btn btn-sm btn-outline-primary"
            :disabled="modifying"
          >
            직접 편집
          </button>
          <div v-else>
            <button 
              @click="saveContent" 
              class="btn btn-sm btn-success me-2"
              :disabled="savingContent"
            >
              <span v-if="savingContent" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              저장
            </button>
            <button 
              @click="cancelEditing" 
              class="btn btn-sm btn-outline-secondary"
              :disabled="savingContent"
            >
              취소
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="scenario-content" v-if="!isEditing">
            <pre class="scenario-text">{{ currentScenario.content }}</pre>
          </div>
          <div v-else>
            <textarea 
              class="form-control scenario-editor" 
              v-model="editedContent"
              rows="15"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 class="h5 mb-0">환자와의 대화</h3>
          <button 
            v-if="!isEditingConversation" 
            @click="startEditingConversation" 
            class="btn btn-sm btn-outline-primary"
            :disabled="modifying"
          >
            직접 편집
          </button>
          <div v-else>
            <button 
              @click="saveConversation" 
              class="btn btn-sm btn-success me-2"
              :disabled="savingContent"
            >
              <span v-if="savingContent" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              저장
            </button>
            <button 
              @click="cancelEditingConversation" 
              class="btn btn-sm btn-outline-secondary"
              :disabled="savingContent"
            >
              취소
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="scenario-content" v-if="!isEditingConversation">
            <pre class="scenario-text">{{ currentScenario.patient_conversation }}</pre>
          </div>
          <div v-else>
            <textarea 
              class="form-control scenario-editor" 
              v-model="editedConversation"
              rows="15"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header bg-light">
          <h3 class="h5 mb-0">챗봇을 통한 시나리오 수정</h3>
        </div>
        <div class="card-body">
          <div class="chat-container mb-4">
            <div v-for="(message, index) in chatHistory" :key="index" 
                 :class="['chat-message', message.sender === 'user' ? 'user-message' : 'bot-message']">
              <div class="message-content">
                <p v-if="message.sender === 'user'">
                  <strong>사용자:</strong> {{ message.content }}
                </p>
                <div v-else>
                  <p><strong>챗봇:</strong></p>
                  <pre class="bot-response">{{ message.content }}</pre>
                </div>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="sendMessage" class="chat-input">
            <div class="input-group">
              <textarea 
                class="form-control" 
                v-model="userInput" 
                placeholder="시나리오 수정 요청을 입력하세요. 예: '환자의 나이를 65세로 변경해주세요.'" 
                rows="3"
                :disabled="modifying"
              ></textarea>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="!userInput.trim() || modifying"
              >
                <span v-if="modifying" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                전송
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScenarioModify',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      userInput: '',
      chatHistory: [],
      modifying: false,
      isEditing: false,
      isEditingConversation: false,
      editedContent: '',
      editedConversation: '',
      savingContent: false
    }
  },
  computed: {
    ...mapGetters(['currentScenario', 'isLoading', 'error'])
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
    // 시나리오 내용 직접 편집 관련 메서드
    startEditing() {
      this.editedContent = this.currentScenario.content
      this.isEditing = true
    },
    
    cancelEditing() {
      this.isEditing = false
      this.editedContent = ''
    },
    
    async saveContent() {
      if (!this.editedContent.trim()) return
      
      this.savingContent = true
      
      try {
        // 직접 편집한 내용 저장
        await this.$store.dispatch('updateScenarioContent', {
          scenarioId: this.id,
          content: this.editedContent
        })
        
        // 시나리오 내용 새로고침
        await this.$store.dispatch('fetchScenario', this.id)
        
        // 편집 모드 종료
        this.isEditing = false
        this.editedContent = ''
        
        // 알림 메시지 추가
        this.chatHistory.push({
          sender: 'bot',
          content: '시나리오 내용이 성공적으로 수정되었습니다.'
        })
      } catch (error) {
        // 오류 메시지 추가
        this.chatHistory.push({
          sender: 'bot',
          content: `시나리오 내용 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
        })
      } finally {
        this.savingContent = false
      }
    },
    
    // 환자와의 대화 직접 편집 관련 메서드
    startEditingConversation() {
      this.editedConversation = this.currentScenario.patient_conversation
      this.isEditingConversation = true
    },
    
    cancelEditingConversation() {
      this.isEditingConversation = false
      this.editedConversation = ''
    },
    
    async saveConversation() {
      if (!this.editedConversation.trim()) return
      
      this.savingContent = true
      
      try {
        // 직접 편집한 대화 내용 저장
        await this.$store.dispatch('updateScenarioConversation', {
          scenarioId: this.id,
          conversation: this.editedConversation
        })
        
        // 시나리오 내용 새로고침
        await this.$store.dispatch('fetchScenario', this.id)
        
        // 편집 모드 종료
        this.isEditingConversation = false
        this.editedConversation = ''
        
        // 알림 메시지 추가
        this.chatHistory.push({
          sender: 'bot',
          content: '환자와의 대화 내용이 성공적으로 수정되었습니다.'
        })
      } catch (error) {
        // 오류 메시지 추가
        this.chatHistory.push({
          sender: 'bot',
          content: `환자와의 대화 내용 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
        })
      } finally {
        this.savingContent = false
      }
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.modifying) return
      
      // 사용자 메시지 추가
      this.chatHistory.push({
        sender: 'user',
        content: this.userInput
      })
      
      // 입력 필드 초기화
      const userInput = this.userInput
      this.userInput = ''
      
      // 수정 중 상태로 변경
      this.modifying = true
      
      try {
        // 시나리오 수정 요청
        const response = await this.$store.dispatch('modifyScenario', {
          scenarioId: this.id,
          userInput: userInput
        })
        
        // 챗봇 응답 추가
        this.chatHistory.push({
          sender: 'bot',
          content: '시나리오가 성공적으로 수정되었습니다.'
        })
        
        // 시나리오 내용 새로고침
        await this.$store.dispatch('fetchScenario', this.id)
      } catch (error) {
        // 오류 메시지 추가
        this.chatHistory.push({
          sender: 'bot',
          content: `오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
        })
      } finally {
        // 수정 중 상태 해제
        this.modifying = false
      }
    }
  },
  async created() {
    // 시나리오 정보 로드
    if (!this.currentScenario || this.currentScenario.id !== parseInt(this.id)) {
      await this.$store.dispatch('fetchScenario', this.id)
    }
    
    // 초기 챗봇 메시지 추가
    this.chatHistory.push({
      sender: 'bot',
      content: '안녕하세요! 시나리오 수정을 도와드리겠습니다. 어떤 부분을 수정하고 싶으신가요?'
    })
  }
}
</script>

<style scoped>
.scenario-modify {
  max-width: 900px;
  margin: 0 auto;
}

.scenario-content {
  max-height: 300px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
}

.scenario-text {
  white-space: pre-wrap;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  margin: 0;
}

.scenario-editor {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  min-height: 300px;
  resize: vertical;
}

.chat-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  background-color: #f8f9fa;
}

.chat-message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.user-message {
  align-items: flex-end;
}

.bot-message {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 10px;
}

.user-message .message-content {
  background-color: #007bff;
  color: white;
}

.bot-message .message-content {
  background-color: #e9ecef;
  color: #212529;
}

.bot-response {
  white-space: pre-wrap;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  margin: 0;
}

.chat-input {
  margin-top: 15px;
}
</style> 