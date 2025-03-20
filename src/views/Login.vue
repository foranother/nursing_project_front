<template>
  <div class="login-page">
    <div class="card">
      <div class="card-header bg-primary text-white text-center">
        <h1 class="h4 mb-0">로그인</h1>
      </div>
      <div class="card-body">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <form @submit.prevent="login">
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
          
          <div class="mb-4">
            <label for="password" class="form-label">비밀번호</label>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              v-model="form.password" 
              required
              :disabled="loading"
            >
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              로그인
            </button>
          </div>
        </form>
        
        <div class="mt-4 text-center">
          <p>계정이 없으신가요? <router-link :to="{ name: 'Register' }">회원가입</router-link></p>
        </div>
        
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