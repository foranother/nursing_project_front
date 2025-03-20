<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h1>회원가입</h1>
        <p class="subheading">새로운 계정을 만들어 시나리오를 이용해보세요</p>
      </div>
      
      <div class="register-body">
        <div v-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
        
        <form @submit.prevent="register">
          <div class="form-floating mb-3">
            <input 
              type="text" 
              class="form-control" 
              id="username" 
              placeholder="사용자명"
              v-model="form.username" 
              required
              :disabled="loading"
            >
            <label for="username">사용자명</label>
          </div>
          
          <div class="form-floating mb-3">
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              placeholder="name@example.com"
              v-model="form.email" 
              required
              :disabled="loading"
            >
            <label for="email">이메일</label>
          </div>
          
          <div class="form-floating mb-3">
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              placeholder="비밀번호"
              v-model="form.password" 
              required
              :disabled="loading"
              minlength="6"
            >
            <label for="password">비밀번호</label>
            <div class="form-text mt-1">
              <i class="bi bi-info-circle me-1"></i>비밀번호는 최소 6자 이상이어야 합니다.
            </div>
          </div>
          
          <div class="form-floating mb-4">
            <input 
              type="password" 
              class="form-control" 
              :class="{'is-invalid': passwordMismatch}"
              id="password_confirm" 
              placeholder="비밀번호 확인"
              v-model="form.password_confirm" 
              required
              :disabled="loading"
            >
            <label for="password_confirm">비밀번호 확인</label>
            <div v-if="passwordMismatch" class="invalid-feedback">
              비밀번호가 일치하지 않습니다.
            </div>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="loading || passwordMismatch">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-else><i class="bi bi-person-plus me-2"></i></span>
              회원가입
            </button>
          </div>
        </form>
        
        <div class="mt-4 text-center login-link">
          <p>이미 계정이 있으신가요? <router-link :to="{ name: 'Login' }">로그인</router-link></p>
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
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        password_confirm: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isLoading', 'error']),
    passwordMismatch() {
      return this.form.password && 
             this.form.password_confirm && 
             this.form.password !== this.form.password_confirm
    }
  },
  methods: {
    async register() {
      if (this.passwordMismatch) {
        return
      }
      
      try {
        await this.$store.dispatch('register', {
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        })
        
        // 회원가입 성공 시 홈으로 이동
        this.$router.push('/')
      } catch (error) {
        console.error('회원가입 실패:', error)
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  max-width: 450px;
  margin: 3rem auto;
  position: relative;
}

.register-card {
  border-radius: var(--border-radius);
  background-color: white;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.register-header {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.register-header h1 {
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--primary-dark);
}

.subheading {
  color: #777;
  font-size: 0.95rem;
  margin-bottom: 0;
}

.register-body {
  padding: 1.5rem 2rem 2.5rem;
  position: relative;
  z-index: 1;
}

.form-floating > label {
  color: #777;
}

.form-control {
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  height: calc(3.5rem + 2px);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(25, 118, 210, 0.15);
}

.form-text {
  font-size: 0.85rem;
  color: #6c757d;
}

.submit-btn {
  padding: 0.75rem 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px dashed;
  transition: all 0.2s ease;
}

.login-link a:hover {
  color: var(--primary-dark);
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  filter: blur(40px);
  opacity: 0.1;
  border-radius: 50%;
}

.shape1 {
  background-color: var(--primary-color);
  width: 300px;
  height: 300px;
  top: -100px;
  right: -80px;
}

.shape2 {
  background-color: var(--accent-color);
  width: 200px;
  height: 200px;
  bottom: -70px;
  left: -60px;
}

.shape3 {
  background-color: #4caf50;
  width: 150px;
  height: 150px;
  top: 40%;
  left: 60%;
}

.alert {
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 576px) {
  .register-page {
    margin: 2rem 1rem;
  }
  
  .register-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .register-body {
    padding: 1rem 1.5rem 2rem;
  }
}
</style> 
