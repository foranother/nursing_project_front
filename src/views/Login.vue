<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>로그인</h1>
        <p class="subheading">간호 시뮬레이션 플랫폼에 오신 것을 환영합니다</p>
      </div>
      
      <div class="login-body">
        <div v-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
        
        <form @submit.prevent="login">
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
          
          <div class="form-floating mb-4">
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              placeholder="비밀번호" 
              v-model="form.password" 
              required
              :disabled="loading"
            >
            <label for="password">비밀번호</label>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-else><i class="bi bi-box-arrow-in-right me-2"></i></span>
              로그인
            </button>
          </div>
        </form>
        
        <div class="mt-4 text-center register-link">
          <p>계정이 없으신가요? <router-link :to="{ name: 'Register' }">회원가입</router-link></p>
        </div>
      </div>
      
      <div class="login-background">
        <div class="shape shape1"></div>
        <div class="shape shape2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isLoading', 'error'])
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', this.form)
        
        // 리다이렉트 처리
        const redirectPath = this.$route.query.redirect || '/'
        this.$router.push(redirectPath)
      } catch (error) {
        console.error('로그인 실패:', error)
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  max-width: 450px;
  margin: 3rem auto;
  position: relative;
}

.login-card {
  border-radius: var(--border-radius);
  background-color: white;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.login-header {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.login-header h1 {
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

.login-body {
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

.submit-btn {
  padding: 0.75rem 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.register-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px dashed;
  transition: all 0.2s ease;
}

.register-link a:hover {
  color: var(--primary-dark);
}

.login-background {
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
  top: -150px;
  right: -80px;
}

.shape2 {
  background-color: var(--accent-color);
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -60px;
}

.alert {
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 576px) {
  .login-page {
    margin: 2rem 1rem;
  }
  
  .login-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .login-body {
    padding: 1rem 1.5rem 2rem;
  }
}
</style> 
