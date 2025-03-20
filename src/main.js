import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mitt from 'mitt'
import axios from 'axios'

// 이벤트 버스 생성
const emitter = mitt()

// API 기본 URL 설정
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8000'

// 샘플 시나리오 생성 함수 수정 (GPT API 호출로 변경)
async function createSampleScenarios() {
  try {
    // 백엔드 API를 통해 샘플 시나리오가 있는지 확인
    const response = await axios.get('/api/scenarios/', {
      params: { is_sample: true },
      withCredentials: true
    });
    
    if (response.data.length === 0) {
      console.log('샘플 시나리오 생성 시작 (GPT API 사용)');
      
      // 샘플 시나리오 1: 급성 심근경색 (GPT API 호출)
      const scenario1Data = {
        title: "급성 심근경색 환자 간호",
        main_disease: "급성 심근경색",
        personal_info: {
          age: "65",
          gender: "남성",
          occupation: "회사원"
        },
        additional_info: {
          past_medical_history: "고혈압, 당뇨병",
          family_history: "부친이 심근경색으로 사망",
          allergies: "없음",
          major_symptoms: "가슴 통증, 호흡곤란, 발한"
        },
        include_conversation: true,
        is_sample: true
      };
      
      try {
        // GPT API를 통해 시나리오 생성 
        const gptResponse1 = await axios.post('/api/scenarios/generate/', scenario1Data, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('급성 심근경색 시나리오 생성 완료:', gptResponse1.data);
        
        // 이미 저장되어 있어 별도 저장 불필요
      } catch (scenario1Error) {
        console.error('급성 심근경색 시나리오 생성 실패:', scenario1Error);
        // 실패 시에는 로컬 스토리지에 저장
        saveSampleToLocalStorage("급성 심근경색 환자 간호", "급성 심근경색");
      }
      
      // 샘플 시나리오 2: 당뇨병성 케톤산증 (GPT API 호출)
      const scenario2Data = {
        title: "당뇨병성 케톤산증 환자 간호",
        main_disease: "당뇨병성 케톤산증",
        personal_info: {
          age: "22",
          gender: "여성",
          occupation: "대학생"
        },
        additional_info: {
          past_medical_history: "제1형 당뇨병(10년)",
          family_history: "없음",
          allergies: "페니실린",
          major_symptoms: "구갈, 다뇨, 복통, 오심, 구토"
        },
        include_conversation: true,
        is_sample: true
      };
      
      try {
        // GPT API를 통해 시나리오 생성
        const gptResponse2 = await axios.post('/api/scenarios/generate/', scenario2Data, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('당뇨병성 케톤산증 시나리오 생성 완료:', gptResponse2.data);
        
        // 이미 저장되어 있어 별도 저장 불필요
      } catch (scenario2Error) {
        console.error('당뇨병성 케톤산증 시나리오 생성 실패:', scenario2Error);
        // 실패 시에는 로컬 스토리지에 저장
        saveSampleToLocalStorage("당뇨병성 케톤산증 환자 간호", "당뇨병성 케톤산증");
      }
      
      console.log('샘플 시나리오 생성 완료');
    } else {
      console.log('이미 샘플 시나리오가 존재합니다');
    }
  } catch (error) {
    console.error('샘플 시나리오 생성 중 오류 발생:', error);
    
    // 오류 시 로컬 저장 시도 (개발 단계에서)
    try {
      console.log('로컬 저장소에 샘플 시나리오 저장 시도');
      
      // 샘플 시나리오 로컬에 저장
      const hasSamples = checkLocalSamplesExist();
      if (!hasSamples) {
        // 샘플 시나리오 생성 및 저장
        saveSampleToLocalStorage("급성 심근경색 환자 간호", "급성 심근경색");
        saveSampleToLocalStorage("당뇨병성 케톤산증 환자 간호", "당뇨병성 케톤산증");
        console.log('로컬 저장소에 샘플 시나리오 저장 완료');
      } else {
        console.log('로컬 저장소에 이미 샘플 시나리오가 존재합니다');
      }
    } catch (localError) {
      console.error('로컬 저장소에 샘플 시나리오 저장 실패:', localError);
    }
  }
}

// 로컬 샘플 존재 여부 확인 함수
function checkLocalSamplesExist() {
  try {
    const localScenarios = localStorage.getItem('tempScenarios');
    if (localScenarios) {
      const tempScenarios = JSON.parse(localScenarios);
      return tempScenarios.some(s => s.is_sample === true);
    }
  } catch (e) {
    console.error('로컬 저장소 확인 중 오류:', e);
  }
  return false;
}

// 로컬 저장소에 샘플 시나리오 저장 함수
function saveSampleToLocalStorage(title, mainDisease) {
  try {
    // 기존 로컬 시나리오 불러오기
    let tempScenarios = [];
    const localScenarios = localStorage.getItem('tempScenarios');
    if (localScenarios) {
      tempScenarios = JSON.parse(localScenarios);
    }
    
    // 샘플 시나리오 생성
    const sampleScenario = {
      id: Date.now().toString(),
      title: title,
      main_disease: mainDisease,
      is_sample: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: {
        id: "admin-user-id",
        username: "Admin",
        email: "admin@example.com",
        is_admin: true
      },
      personal_info: {
        age: title.includes("급성 심근경색") ? "65세" : "22세",
        gender: title.includes("급성 심근경색") ? "남성" : "여성",
        occupation: title.includes("급성 심근경색") ? "회사원" : "대학생"
      },
      additional_info: {
        past_medical_history: title.includes("급성 심근경색") 
          ? "고혈압, 당뇨병" 
          : "제1형 당뇨병(10년)",
        family_history: title.includes("급성 심근경색") 
          ? "부친이 심근경색으로 사망" 
          : "없음",
        allergies: title.includes("급성 심근경색") 
          ? "없음" 
          : "페니실린",
        major_symptoms: title.includes("급성 심근경색") 
          ? "가슴 통증, 호흡곤란, 발한" 
          : "구갈, 다뇨, 복통, 오심, 구토"
      },
      content: `# ${title} 시나리오

## 환자 정보
- 이름: 환자 (가명)
- 나이: ${title.includes("급성 심근경색") ? "65세" : "22세"}
- 성별: ${title.includes("급성 심근경색") ? "남성" : "여성"}
- 직업: ${title.includes("급성 심근경색") ? "회사원" : "대학생"}
- 과거력: ${title.includes("급성 심근경색") ? "고혈압, 당뇨병" : "제1형 당뇨병(10년)"}
- 가족력: ${title.includes("급성 심근경색") ? "부친이 심근경색으로 사망" : "없음"}
- 알레르기: ${title.includes("급성 심근경색") ? "없음" : "페니실린"}

## 주 증상
- ${mainDisease}
- ${title.includes("급성 심근경색") ? "가슴 통증, 호흡곤란, 발한" : "구갈, 다뇨, 복통, 오심, 구토"}

## 현재 상태
- 의식: 명료
- 활력징후: ${title.includes("급성 심근경색") ? "BP 150/90 mmHg, HR 100 bpm, RR 22/min, SpO2 94%, BT 37.2°C" : "BP 110/70 mmHg, HR 120 bpm, RR 24/min, SpO2 96%, BT 37.5°C"}

## 간호 중재
1. 활력징후 모니터링
2. 투약 관리
3. 환자 교육
4. 정서적 지지
5. 의사와의 협력 및 소통

## 간호 평가
- 증상 완화 여부
- 활력징후 안정화
- 환자의 자가 관리 능력 향상
`,
      patient_conversation: `# 환자와의 대화

## 초기 평가
**간호사**: 안녕하세요, 저는 오늘 담당 간호사입니다. 어떻게 지내세요? 어디가 불편하신가요?

**환자**: 안녕하세요, 간호사님. ${title.includes("급성 심근경색") ? "가슴이 너무 아파서 견딜 수가 없어요. 숨도 잘 안 쉬어지고 식은땀이 나요." : "계속 목이 마르고 물을 많이 마셔도 갈증이 해소가 안 돼요. 그리고 소변을 자주 봐야 해서 힘들어요. 며칠 전부터는 배도 아프고 구역감도 있어요."}

**간호사**: 언제부터 이런 증상이 있었나요?

**환자**: ${title.includes("급성 심근경색") ? "오늘 아침에 갑자기 시작됐어요. 처음에는 소화가 안 되는 줄 알았는데, 점점 심해져서 병원에 왔어요." : "약 3일 전부터 시작됐어요. 평소보다 당 조절이 잘 안 되는 것 같았는데, 어제부터 급격히 상태가 나빠졌어요."}

## 검사 및 치료 중
**간호사**: 검사 결과가 나왔습니다. ${mainDisease}로 확인되었습니다. 의사 선생님께서 곧 자세한 설명과 치료 계획을 알려주실 거예요.

**환자**: 그렇군요. 치료는 어떻게 진행되나요?

**간호사**: ${title.includes("급성 심근경색") ? "현재 심장 손상을 최소화하기 위한 약물 치료를 시작했어요. 혈전을 녹이는 약물과 혈액 순환을 돕는 약물이 투여되고 있습니다. 심장 전문의 선생님과 상담 후 추가적인 시술이 필요한지 결정될 예정입니다." : "현재 탈수와 전해질 불균형 교정을 위해 수액 요법을 시작했어요. 인슐린 치료로 고혈당을 조절하고 있으며, 산-염기 균형을 회복하기 위한 치료도 병행됩니다. 당뇨병 전문의 선생님이 정기적으로 상태를 확인하실 거예요."}

## 회복기
**간호사**: 치료 후에 상태가 많이 좋아지셨네요. 앞으로의 관리 방법에 대해 알려드릴게요.

**환자**: 네, 많이 나아진 것 같아요. 앞으로 어떻게 관리해야 할까요?

**간호사**: ${title.includes("급성 심근경색") ? "규칙적인 약물 복용과 정기적인 검진이 중요합니다. 저지방 식이, 금연, 적절한 운동을 권장드립니다. 특히 가슴 통증이나 호흡곤란 같은 증상이 다시 나타나면 즉시 병원을 방문하셔야 합니다." : "인슐린 용량 조절과 규칙적인 혈당 모니터링이 매우 중요합니다. 적절한 식이 요법과 수분 섭취, 규칙적인 검진을 통해 당뇨병 관리를 잘하셔야 합니다. 특히 케톤산증의 초기 증상을 알고 계시면 빠른 대처가 가능합니다."}`
    };
    
    // 로컬 저장소에 추가
    tempScenarios.push(sampleScenario);
    localStorage.setItem('tempScenarios', JSON.stringify(tempScenarios));
    
    // 상태 업데이트
    store.commit('SET_SCENARIOS', tempScenarios);
    
    return sampleScenario;
  } catch (error) {
    console.error('로컬 저장소에 샘플 시나리오 저장 실패:', error);
    return null;
  }
}

// Vue 앱 생성 및 마운트
const app = createApp(App);

// 전역 속성 설정 - $emitter로 접근할 수 있도록 변경
app.config.globalProperties.$emitter = emitter;

// 이전 코드와의 호환성을 위해 $mitt도 추가
app.config.globalProperties.$mitt = emitter;

// 스토어와 라우터 연결
app.use(store);
app.use(router);

// 마운트
app.mount('#app');

// 앱 초기화 후 샘플 시나리오 생성 시도
store.dispatch('checkAuth').then(() => {
  createSampleScenarios();
}); 