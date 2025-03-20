<template>
  <div class="register-page">
    <div class="card">
      <div class="card-header bg-primary text-white text-center">
        <h1 class="h4 mb-0">회원가입</h1>
      </div>
      <div class="card-body">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <form @submit.prevent="register">
          <div class="mb-3">
            <label for="username" class="form-label">사용자명</label>
            <input 
              type="text" 
              class="form-control" 
              id="username" 
              v-model="form.username" 
              required
              :disabled="loading"
            >
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label">이메일</label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              v-model="form.email" 
              required
              :disabled="loading"
            >
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label">비밀번호</label>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              v-model="form.password" 
              required
              :disabled="loading"
              minlength="6"
            >
            <div class="form-text">비밀번호는 최소 6자 이상이어야 합니다.</div>
          </div>
          
          <div class="mb-4">
            <label for="password_confirm" class="form-label">비밀번호 확인</label>
            <input 
              type="password" 
              class="form-control" 
              id="password_confirm" 
              v-model="form.password_confirm" 
              required
              :disabled="loading"
            >
            <div v-if="passwordMismatch" class="text-danger mt-1">
              비밀번호가 일치하지 않습니다.
            </div>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary" :disabled="loading || passwordMismatch">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              회원가입
            </button>
          </div>
        </form>
        
        <div class="mt-4 text-center">
          <p>이미 계정이 있으신가요? <router-link :to="{ name: 'Login' }">로그인</router-link></p>
        </div>
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
  margin: 2rem auto;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  border-radius: 10px 10px 0 0;
}

.card-body {
  padding: 2rem;
}
</style> 