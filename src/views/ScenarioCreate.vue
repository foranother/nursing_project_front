<template>
  <div class="scenario-create">
    <h1 class="mb-4">시나리오 생성</h1>
    
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <form @submit.prevent="createScenario" class="card">
      <div class="card-body">
        <div class="mb-3">
          <label for="title" class="form-label">시나리오명 *</label>
          <input type="text" class="form-control" id="title" v-model="form.title" required>
        </div>
        
        <div class="mb-3">
          <label for="main_disease" class="form-label">주요 질병 *</label>
          <input type="text" class="form-control" id="main_disease" v-model="form.main_disease" required>
        </div>
        
        <div class="mb-4">
          <label class="form-label">기본 인적 사항</label>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">성별</h5>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="gender" id="gender-male" value="남" v-model="form.personal_info.gender">
                <label class="form-check-label" for="gender-male">남</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="gender" id="gender-female" value="여" v-model="form.personal_info.gender">
                <label class="form-check-label" for="gender-female">여</label>
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">나이</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check form-check-inline" v-for="(age, index) in ageOptions" :key="index">
                    <input class="form-check-input" type="radio" name="age" :id="'age-' + index" :value="age" v-model="ageType" @change="generateRandomAge">
                    <label class="form-check-label" :for="'age-' + index">{{ age }}</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="age" id="age-custom" value="custom" v-model="ageType">
                    <label class="form-check-label" for="age-custom">직접 입력</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="input-group" v-if="ageType === 'custom'">
                    <input type="number" class="form-control" placeholder="나이 입력" v-model="customAge" min="1" max="120">
                    <span class="input-group-text">세</span>
                  </div>
                  <div v-else-if="ageType && form.personal_info.age" class="mt-2">
                    선택된 나이: {{ form.personal_info.age }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">과거력</h5>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="history-none" value="없음" v-model="form.personal_info.medical_history_none" @change="toggleNone('medical_history')">
                <label class="form-check-label" for="history-none">없음</label>
              </div>
              <div v-if="!form.personal_info.medical_history_none">
                <div class="form-check" v-for="(history, index) in medicalHistoryOptions" :key="index">
                  <input class="form-check-input" type="checkbox" :id="'history-' + index" :value="history" v-model="form.personal_info.medical_history">
                  <label class="form-check-label" :for="'history-' + index">{{ history }}</label>
                </div>
                <div class="mt-2" v-if="form.personal_info.medical_history.includes('기타')">
                  <input type="text" class="form-control" placeholder="기타 과거력을 입력하세요" v-model="form.personal_info.medical_history_other">
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">가족력</h5>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="family-none" value="없음" v-model="form.personal_info.family_history_none" @change="toggleNone('family_history')">
                <label class="form-check-label" for="family-none">없음</label>
              </div>
              <div v-if="!form.personal_info.family_history_none">
                <div class="form-check" v-for="(history, index) in familyHistoryOptions" :key="index">
                  <input class="form-check-input" type="checkbox" :id="'family-' + index" :value="history" v-model="form.personal_info.family_history">
                  <label class="form-check-label" :for="'family-' + index">{{ history }}</label>
                </div>
                <div class="mt-2" v-if="form.personal_info.family_history.includes('기타')">
                  <input type="text" class="form-control" placeholder="기타 가족력을 입력하세요" v-model="form.personal_info.family_history_other">
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">알레르기</h5>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="allergy-none" value="없음" v-model="form.personal_info.allergies_none" @change="toggleNone('allergies')">
                <label class="form-check-label" for="allergy-none">없음</label>
              </div>
              <div v-if="!form.personal_info.allergies_none">
                <div class="form-check" v-for="(allergy, index) in allergyOptions" :key="index">
                  <input class="form-check-input" type="checkbox" :id="'allergy-' + index" :value="allergy" v-model="form.personal_info.allergies">
                  <label class="form-check-label" :for="'allergy-' + index">{{ allergy }}</label>
                </div>
                <div class="mt-2" v-if="form.personal_info.allergies.includes('기타')">
                  <input type="text" class="form-control" placeholder="기타 알레르기를 입력하세요" v-model="form.personal_info.allergies_other">
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">활력징후</h5>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="vital_signs" id="vital-normal" value="정상" v-model="form.personal_info.vital_signs">
                <label class="form-check-label" for="vital-normal">정상</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="vital_signs" id="vital-abnormal" value="비정상" v-model="form.personal_info.vital_signs">
                <label class="form-check-label" for="vital-abnormal">비정상</label>
              </div>
              <div class="mt-2" v-if="form.personal_info.vital_signs === '비정상'">
                <input type="text" class="form-control" placeholder="비정상 활력징후를 입력하세요" v-model="form.personal_info.vital_signs_detail">
              </div>
            </div>
          </div>
          
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">주요증상</h5>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="symptom-none" value="없음" v-model="form.personal_info.symptoms_none" @change="toggleNone('symptoms')">
                <label class="form-check-label" for="symptom-none">없음</label>
              </div>
              <div v-if="!form.personal_info.symptoms_none">
                <div class="form-check" v-for="(symptom, index) in symptomOptions" :key="index">
                  <input class="form-check-input" type="checkbox" :id="'symptom-' + index" :value="symptom" v-model="form.personal_info.symptoms">
                  <label class="form-check-label" :for="'symptom-' + index">{{ symptom }}</label>
                </div>
                <div class="mt-2" v-if="form.personal_info.symptoms.includes('기타')">
                  <input type="text" class="form-control" placeholder="기타 증상을 입력하세요" v-model="form.personal_info.symptoms_other">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-3">
          <label for="additional_info" class="form-label">기타 사항</label>
          <textarea class="form-control" id="additional_info" rows="5" v-model="form.additional_info" placeholder="환자의 상태, 상황 등 추가 정보를 입력하세요"></textarea>
        </div>
        
        <div class="d-grid">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            시나리오 생성
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCurrentInstance } from 'vue'

export default {
  name: 'ScenarioCreate',
  data() {
    return {
      form: {
        title: '',
        main_disease: '',
        personal_info: {
          gender: '',
          age: '',
          medical_history: [],
          medical_history_other: '',
          medical_history_none: false,
          family_history: [],
          family_history_other: '',
          family_history_none: false,
          allergies: [],
          allergies_other: '',
          allergies_none: false,
          vital_signs: '정상',
          vital_signs_detail: '',
          symptoms: [],
          symptoms_other: '',
          symptoms_none: false
        },
        additional_info: ''
      },
      ageType: '',
      customAge: '',
      ageOptions: ['영아', '소아', '청소년', '성인', '노인'],
      medicalHistoryOptions: ['고혈압', '당뇨', '심장질환', '기타'],
      familyHistoryOptions: ['고혈압', '당뇨', '심장질환', '기타'],
      allergyOptions: ['약물', '음식', '기타'],
      symptomOptions: ['호흡곤란', '흉통', '발열', '기타']
    }
  },
  computed: {
    ...mapGetters(['isLoading', 'error']),
    loading() {
      return this.isLoading
    }
  },
  setup() {
    const { proxy } = getCurrentInstance()
    return { proxy }
  },
  watch: {
    customAge(newVal) {
      if (this.ageType === 'custom' && newVal) {
        this.form.personal_info.age = newVal + '세'
      }
    }
  },
  methods: {
    // 연령대에 따른 랜덤 나이 생성
    generateRandomAge() {
      if (this.ageType === 'custom') return;
      
      let min, max;
      switch(this.ageType) {
        case '영아':
          min = 0; max = 1;
          break;
        case '소아':
          min = 2; max = 12;
          break;
        case '청소년':
          min = 13; max = 19;
          break;
        case '성인':
          min = 20; max = 64;
          break;
        case '노인':
          min = 65; max = 90;
          break;
        default:
          return;
      }
      
      // 범위 내 랜덤 나이 생성
      const randomAge = Math.floor(Math.random() * (max - min + 1)) + min;
      this.form.personal_info.age = randomAge + '세';
    },
    toggleNone(field) {
      if (field === 'medical_history') {
        if (this.form.personal_info.medical_history_none) {
          this.form.personal_info.medical_history = []
        }
      } else if (field === 'family_history') {
        if (this.form.personal_info.family_history_none) {
          this.form.personal_info.family_history = []
        }
      } else if (field === 'allergies') {
        if (this.form.personal_info.allergies_none) {
          this.form.personal_info.allergies = []
        }
      } else if (field === 'symptoms') {
        if (this.form.personal_info.symptoms_none) {
          this.form.personal_info.symptoms = []
        }
      }
    },
    async createScenario() {
      try {
        // 로딩 메시지 설정
        this.proxy.$mitt.emit('set-loading', [true, '시나리오를 생성하는 중입니다. 이 작업은 최대 1분 정도 소요될 수 있습니다.']);
        
        // 개인 정보 처리
        const personalInfo = { ...this.form.personal_info }
        
        // 나이 처리
        if (this.ageType === 'custom' && this.customAge) {
          personalInfo.age = this.customAge + '세'
        }
        
        // 과거력 처리
        if (personalInfo.medical_history_none) {
          personalInfo.medical_history = ['없음']
        } else if (personalInfo.medical_history.includes('기타') && personalInfo.medical_history_other) {
          const index = personalInfo.medical_history.indexOf('기타')
          personalInfo.medical_history[index] = '기타: ' + personalInfo.medical_history_other
        }
        
        // 가족력 처리
        if (personalInfo.family_history_none) {
          personalInfo.family_history = ['없음']
        } else if (personalInfo.family_history.includes('기타') && personalInfo.family_history_other) {
          const index = personalInfo.family_history.indexOf('기타')
          personalInfo.family_history[index] = '기타: ' + personalInfo.family_history_other
        }
        
        // 알레르기 처리
        if (personalInfo.allergies_none) {
          personalInfo.allergies = ['없음']
        } else if (personalInfo.allergies.includes('기타') && personalInfo.allergies_other) {
          const index = personalInfo.allergies.indexOf('기타')
          personalInfo.allergies[index] = '기타: ' + personalInfo.allergies_other
        }
        
        // 증상 처리
        if (personalInfo.symptoms_none) {
          personalInfo.symptoms = ['없음']
        } else if (personalInfo.symptoms.includes('기타') && personalInfo.symptoms_other) {
          const index = personalInfo.symptoms.indexOf('기타')
          personalInfo.symptoms[index] = '기타: ' + personalInfo.symptoms_other
        }
        
        // 활력징후 처리
        if (personalInfo.vital_signs === '비정상' && personalInfo.vital_signs_detail) {
          personalInfo.vital_signs = '비정상: ' + personalInfo.vital_signs_detail
        }
        
        // 불필요한 필드 제거
        delete personalInfo.medical_history_other
        delete personalInfo.medical_history_none
        delete personalInfo.family_history_other
        delete personalInfo.family_history_none
        delete personalInfo.allergies_other
        delete personalInfo.allergies_none
        delete personalInfo.symptoms_other
        delete personalInfo.symptoms_none
        delete personalInfo.vital_signs_detail
        
        // 시나리오 데이터 준비
        const scenarioData = {
          title: this.form.title,
          main_disease: this.form.main_disease,
          personal_info: personalInfo,
          additional_info: {
            past_medical_history: personalInfo.medical_history.join(', '),
            family_history: personalInfo.family_history.join(', '),
            allergies: personalInfo.allergies.join(', '),
            major_symptoms: personalInfo.symptoms.join(', '),
            description: this.form.additional_info
          }
        }
        
        // 시나리오 생성 요청
        const scenario = await this.$store.dispatch('createScenario', scenarioData)
        
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
        
        // 생성된 시나리오 페이지로 이동
        this.$router.push({ name: 'ScenarioDetail', params: { id: scenario.id } })
      } catch (error) {
        // 로딩 메시지 해제
        this.proxy.$mitt.emit('set-loading', [false, '']);
        console.error('시나리오 생성 오류:', error)
      }
    }
  }
}
</script>

<style scoped>
.scenario-create {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
</style> 