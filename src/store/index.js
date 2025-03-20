import { createStore } from 'vuex'
import axios from 'axios'
// Firebase 관련 import 제거
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
// import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, query, orderBy, where } from 'firebase/firestore'

// API 기본 URL 설정
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8000'

// 로컬 수정 처리 헬퍼 함수
function handleLocalModification(content, userInput) {
  if (!content) return '';
  
  // 간단한 수정 로직 (실제로는 GPT API를 사용하는 것이 좋음)
  let modifiedContent = content;
  
  // 섹션 식별 및 수정에 사용할 유틸리티 함수
  function findSectionAndModify(sectionName, newContent, defaultText) {
    const sectionIndex = modifiedContent.indexOf(`## ${sectionName}`);
    if (sectionIndex !== -1) {
      const nextSectionIndex = modifiedContent.indexOf('##', sectionIndex + 1);
      if (nextSectionIndex !== -1) {
        const sectionContent = modifiedContent.substring(sectionIndex, nextSectionIndex);
        const lines = sectionContent.split('\n');
        
        // 첫 번째 줄 이후에 내용 추가
        if (lines.length > 1) {
          lines[1] = `- ${newContent}`;
          
          const updatedSection = lines.join('\n');
          modifiedContent = modifiedContent.substring(0, sectionIndex) + 
            updatedSection + 
            modifiedContent.substring(nextSectionIndex);
        } else {
          // 섹션은 있지만 내용이 없는 경우
          const updatedSection = `## ${sectionName}\n- ${newContent}\n`;
          modifiedContent = modifiedContent.substring(0, sectionIndex) + 
            updatedSection + 
            modifiedContent.substring(nextSectionIndex);
        }
      } else {
        // 마지막 섹션인 경우
        const sectionContent = modifiedContent.substring(sectionIndex);
        const lines = sectionContent.split('\n');
        
        if (lines.length > 1) {
          lines[1] = `- ${newContent}`;
          const updatedSection = lines.join('\n');
          modifiedContent = modifiedContent.substring(0, sectionIndex) + updatedSection;
        } else {
          // 섹션은 있지만 내용이 없는 경우
          const updatedSection = `## ${sectionName}\n- ${newContent}\n`;
          modifiedContent = modifiedContent.substring(0, sectionIndex) + updatedSection;
        }
      }
    } else if (defaultText) {
      // 섹션이 없는 경우 추가
      modifiedContent += `\n\n## ${sectionName}\n- ${newContent}`;
    }
    
    return modifiedContent;
  }
  
  // 환자 정보 항목 추가/수정 유틸리티 함수
  function updatePatientInfo(fieldPattern, fieldName, newValue) {
    const regex = new RegExp(`${fieldPattern}:\\s*[^\\n]+`);
    
    if (modifiedContent.match(regex)) {
      // 필드가 이미 존재하면 교체
      modifiedContent = modifiedContent.replace(regex, `${fieldName}: ${newValue}`);
    } else {
      // 필드가 없으면 환자 정보 섹션에 추가
      const patientInfoIndex = modifiedContent.indexOf('## 환자 정보');
      if (patientInfoIndex !== -1) {
        // 환자 정보 섹션의 끝 찾기
        const nextSectionIndex = modifiedContent.indexOf('##', patientInfoIndex + 1);
        const insertPosition = nextSectionIndex !== -1 ? 
          nextSectionIndex : 
          patientInfoIndex + modifiedContent.substring(patientInfoIndex).indexOf('\n\n');
        
        if (insertPosition !== -1) {
          modifiedContent = modifiedContent.substring(0, insertPosition) + 
            `\n- ${fieldName}: ${newValue}` + 
            modifiedContent.substring(insertPosition);
        }
      }
    }
    
    return modifiedContent;
  }
  
  // 1. 나이 수정 (기존 로직 개선)
  if (userInput.includes('나이') || userInput.includes('연령')) {
    const ageMatch = userInput.match(/(\d+)[세살]/) || userInput.match(/나이[를을]?\s*(\d+)[세살]?/);
    if (ageMatch && ageMatch[1]) {
      modifiedContent = updatePatientInfo('나이', '나이', `${ageMatch[1]}세`);
    }
  }
  
  // 2. 성별 수정 (기존 로직 개선)
  if (userInput.includes('성별') || userInput.includes('남자') || userInput.includes('여자') || 
      userInput.includes('남성') || userInput.includes('여성')) {
    let newGender = null;
    
    if (userInput.includes('남자') || userInput.includes('남성')) {
      newGender = '남성';
    } else if (userInput.includes('여자') || userInput.includes('여성')) {
      newGender = '여성';
    }
    
    if (newGender) {
      modifiedContent = updatePatientInfo('성별', '성별', newGender);
    }
  }
  
  // 3. 직업 수정 (기존 로직 개선)
  if (userInput.includes('직업')) {
    const jobMatch = userInput.match(/직업(?:을|를|은|는)?\s*([가-힣a-zA-Z\s]+)(?:으로|로|으로\s변경|로\s변경)?/) || 
                    userInput.match(/직업[이]?\s*([가-힣a-zA-Z\s]+)/);
    if (jobMatch && jobMatch[1].trim()) {
      const newJob = jobMatch[1].trim();
      modifiedContent = updatePatientInfo('직업', '직업', newJob);
    }
  }
  
  // 4. 과거력 수정 (기존 로직 개선)
  if (userInput.includes('과거력') || userInput.includes('병력')) {
    const historyMatch = userInput.match(/(?:과거력|병력)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                         userInput.match(/(?:과거력|병력)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (historyMatch && historyMatch[1].trim()) {
      const newHistory = historyMatch[1].trim();
      modifiedContent = updatePatientInfo('과거력', '과거력', newHistory);
    }
  }
  
  // 5. 가족력 수정 (기존 로직 개선)
  if (userInput.includes('가족력')) {
    const familyMatch = userInput.match(/가족력(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                       userInput.match(/가족력[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (familyMatch && familyMatch[1].trim()) {
      const newFamily = familyMatch[1].trim();
      modifiedContent = updatePatientInfo('가족력', '가족력', newFamily);
    }
  }
  
  // 6. 알레르기 수정 (기존 로직 개선)
  if (userInput.includes('알레르기')) {
    const allergyMatch = userInput.match(/알레르기(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                        userInput.match(/알레르기[가]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (allergyMatch && allergyMatch[1].trim()) {
      const newAllergy = allergyMatch[1].trim();
      modifiedContent = updatePatientInfo('알레르기', '알레르기', newAllergy);
    }
  }
  
  // 7. 투약 정보 수정 (새로운 필드)
  if (userInput.includes('투약') || userInput.includes('약물') || userInput.includes('복용') || userInput.includes('주사')) {
    const medicationMatch = userInput.match(/(?:투약|약물|복용|주사)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                           userInput.match(/(?:투약|약물|복용|주사)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (medicationMatch && medicationMatch[1].trim()) {
      const newMedication = medicationMatch[1].trim();
      modifiedContent = updatePatientInfo('투약 정보', '투약 정보', newMedication);
    }
  }
  
  // 8. 키와 체중 수정 (새로운 필드)
  if (userInput.includes('키') || userInput.includes('신장')) {
    const heightMatch = userInput.match(/(?:키|신장)(?:을|를|은|는)?\s*(\d+)(?:cm|센티미터|센치)?/) ||
                       userInput.match(/(\d+)(?:cm|센티미터|센치)/);
    if (heightMatch && heightMatch[1]) {
      const newHeight = heightMatch[1];
      modifiedContent = updatePatientInfo('키', '키', `${newHeight}cm`);
    }
  }
  
  if (userInput.includes('체중') || userInput.includes('몸무게')) {
    const weightMatch = userInput.match(/(?:체중|몸무게)(?:을|를|은|는)?\s*(\d+)(?:kg|킬로그램|킬로)?/) ||
                       userInput.match(/(\d+)(?:kg|킬로그램|킬로)/);
    if (weightMatch && weightMatch[1]) {
      const newWeight = weightMatch[1];
      modifiedContent = updatePatientInfo('체중', '체중', `${newWeight}kg`);
    }
  }
  
  // 9. 혈액형 수정 (새로운 필드)
  if (userInput.includes('혈액형')) {
    const bloodTypeMatch = userInput.match(/혈액형(?:을|를|은|는)?\s*([ABO]|AB)형?\s*([+-])?/) ||
                          userInput.match(/([ABO]|AB)형?\s*([+-])?/);
    if (bloodTypeMatch) {
      let newBloodType = bloodTypeMatch[1];
      if (bloodTypeMatch[2]) {
        newBloodType += bloodTypeMatch[2];
      }
      newBloodType += '형';
      modifiedContent = updatePatientInfo('혈액형', '혈액형', newBloodType);
    }
  }
  
  // 10. 주 증상 수정 (기존 로직 개선)
  if (userInput.includes('증상') || userInput.includes('주 증상')) {
    const symptomMatch = userInput.match(/(?:주\s)?증상(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                        userInput.match(/(?:주\s)?증상[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (symptomMatch && symptomMatch[1].trim()) {
      const newSymptom = symptomMatch[1].trim();
      modifiedContent = findSectionAndModify('주 증상', newSymptom, true);
    }
  }
  
  // 11. 진단 수정 (새로운 필드)
  if (userInput.includes('진단')) {
    const diagnosisMatch = userInput.match(/진단(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                          userInput.match(/진단[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (diagnosisMatch && diagnosisMatch[1].trim()) {
      const newDiagnosis = diagnosisMatch[1].trim();
      modifiedContent = findSectionAndModify('진단', newDiagnosis, true);
    }
  }
  
  // 12. 시나리오 이름/제목 변경
  if (userInput.includes('제목') || userInput.includes('이름') || userInput.includes('타이틀')) {
    const titleMatch = userInput.match(/(?:제목|이름|타이틀)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                      userInput.match(/(?:제목|이름|타이틀)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (titleMatch && titleMatch[1].trim()) {
      const newTitle = titleMatch[1].trim();
      
      // 첫 번째 줄이 제목인지 확인
      const firstLineEnd = modifiedContent.indexOf('\n');
      if (firstLineEnd !== -1) {
        const firstLine = modifiedContent.substring(0, firstLineEnd).trim();
        if (firstLine.startsWith('# ')) {
          // 첫 번째 줄이 제목인 경우 교체
          modifiedContent = `# ${newTitle}` + modifiedContent.substring(firstLineEnd);
        } else {
          // 제목이 없는 경우 시작 부분에 추가
          modifiedContent = `# ${newTitle}\n\n` + modifiedContent;
        }
      }
    }
  }
  
  // 13. 간호 계획 수정
  if (userInput.includes('간호 계획') || userInput.includes('간호계획')) {
    const planMatch = userInput.match(/(?:간호 계획|간호계획)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                     userInput.match(/(?:간호 계획|간호계획)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (planMatch && planMatch[1].trim()) {
      const newPlan = planMatch[1].trim();
      modifiedContent = findSectionAndModify('간호 계획', newPlan, true);
    }
  }
  
  // 14. 입원일/내원일 수정
  if (userInput.includes('입원일') || userInput.includes('내원일') || userInput.includes('방문일')) {
    const datePattern = /(\d{4})년?\s*(\d{1,2})월?\s*(\d{1,2})일?/;
    const dateMatch = userInput.match(datePattern);
    
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const day = dateMatch[3].padStart(2, '0');
      const newDate = `${year}-${month}-${day}`;
      
      if (userInput.includes('입원일')) {
        modifiedContent = updatePatientInfo('입원일', '입원일', newDate);
      } else {
        modifiedContent = updatePatientInfo('내원일', '내원일', newDate);
      }
    }
  }
  
  return modifiedContent;
}

// 환자와의 대화 내용 수정 함수
function handleConversationModification(conversation, userInput, personalInfo) {
  if (!conversation) return '';
  
  let modifiedConversation = conversation;
  
  // 대화 내 특정 문구 교체 유틸리티 함수
  function replacePhraseInConversation(oldPhrase, newPhrase) {
    // 정규식으로 검색 시 특수문자 이스케이프
    const escapedOldPhrase = oldPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOldPhrase, 'g');
    return modifiedConversation.replace(regex, newPhrase);
  }
  
  // 대화 내에서 특정 패턴 내용만 교체하는 함수
  function replacePatternInConversation(pattern, replacement) {
    const regex = new RegExp(pattern, 'g');
    return modifiedConversation.replace(regex, replacement);
  }
  
  // 특정 섹션의 대화 찾아 수정하는 함수
  function findDialogueAndModify(sectionName, responsePattern, newContent) {
    const sectionIndex = modifiedConversation.indexOf(`## ${sectionName}`);
    if (sectionIndex !== -1) {
      // 해당 섹션의 다음 섹션까지의 내용
      const nextSectionIndex = modifiedConversation.indexOf('##', sectionIndex + 1);
      
      if (nextSectionIndex !== -1) {
        const sectionContent = modifiedConversation.substring(sectionIndex, nextSectionIndex);
        
        // 패턴과 일치하는 부분 찾기 (환자 응답 등)
        const responseRegex = new RegExp(responsePattern, 'i');
        const modifiedSection = sectionContent.replace(responseRegex, newContent);
        
        modifiedConversation = modifiedConversation.substring(0, sectionIndex) + 
          modifiedSection + 
          modifiedConversation.substring(nextSectionIndex);
      } else {
        // 마지막 섹션인 경우
        const sectionContent = modifiedConversation.substring(sectionIndex);
        
        // 패턴과 일치하는 부분 찾기 (환자 응답 등)
        const responseRegex = new RegExp(responsePattern, 'i');
        const modifiedSection = sectionContent.replace(responseRegex, newContent);
        
        modifiedConversation = modifiedConversation.substring(0, sectionIndex) + modifiedSection;
      }
    }
    
    return modifiedConversation;
  }
  
  // 1. 나이 수정
  if (personalInfo && personalInfo.age && userInput.includes('나이')) {
    // 환자 소개 대화에서 나이 수정
    const ageRegex = /(\d+)[세살]/g;
    modifiedConversation = modifiedConversation.replace(ageRegex, personalInfo.age);
    
    // "XX세" 형태의 나이 언급 수정
    modifiedConversation = modifiedConversation.replace(/(\d+)세/g, personalInfo.age);
    
    // "XX살" 형태의 나이 언급 수정
    modifiedConversation = modifiedConversation.replace(/(\d+)살/g, personalInfo.age);
    
    // "XX 세" 형태의 나이 언급 수정 (공백 있는 경우)
    modifiedConversation = modifiedConversation.replace(/(\d+) 세/g, personalInfo.age);
  }
  
  // 2. 성별 수정 (환자 호칭 변경 - 할아버지/할머니, 아저씨/아주머니 등)
  if (personalInfo && personalInfo.gender && userInput.includes('성별')) {
    if (personalInfo.gender === '남성') {
      // 여성 호칭을 남성 호칭으로 변경
      modifiedConversation = modifiedConversation
        .replace(/할머니/g, '할아버지')
        .replace(/아주머니/g, '아저씨')
        .replace(/여자/g, '남자')
        .replace(/여성/g, '남성')
        .replace(/그녀/g, '그')
        .replace(/여환/g, '남환')
        .replace(/miss/gi, 'mr')
        .replace(/mrs/gi, 'mr')
        .replace(/ms/gi, 'mr');
    } else if (personalInfo.gender === '여성') {
      // 남성 호칭을 여성 호칭으로 변경
      modifiedConversation = modifiedConversation
        .replace(/할아버지/g, '할머니')
        .replace(/아저씨/g, '아주머니')
        .replace(/남자/g, '여자')
        .replace(/남성/g, '여성')
        .replace(/그(?!\w)/g, '그녀') // '그'를 '그녀'로 변경 (단, 다른 단어의 일부인 경우는 제외)
        .replace(/남환/g, '여환')
        .replace(/mr/gi, 'ms');
    }
  }
  
  // 3. 직업 수정
  if (personalInfo && personalInfo.occupation && userInput.includes('직업')) {
    // "직업은 XXX" 패턴 찾아 변경
    const occupationRegex = /직업(?:은|는)?\s*[가-힣a-zA-Z\s]+/g;
    modifiedConversation = modifiedConversation.replace(occupationRegex, `직업은 ${personalInfo.occupation}`);
    
    // "XXX(으로/로) 일하고" 패턴 찾아 변경
    const workingAsRegex = /[가-힣a-zA-Z\s]+(?:으로|로) 일하고/g;
    modifiedConversation = modifiedConversation.replace(workingAsRegex, `${personalInfo.occupation}(으)로 일하고`);
  }
  
  // 4. 증상 수정
  if (userInput.includes('증상')) {
    const symptomMatch = userInput.match(/(?:주\s)?증상(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                       userInput.match(/(?:주\s)?증상[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (symptomMatch && symptomMatch[1].trim()) {
      const newSymptom = symptomMatch[1].trim();
      
      // 초기 평가 대화에서 증상 설명 부분 찾기
      modifiedConversation = findDialogueAndModify(
        '초기 평가', 
        '\\*\\*환자\\*\\*:\\s*(.*?)(?=\\*\\*간호사\\*\\*|$)', 
        `**환자**: 안녕하세요, 간호사님. ${newSymptom}`
      );
      
      // 주 증상 언급 부분 찾아 변경
      const symptomPatterns = [
        /증상(?:으로|로|은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /불편함(?:으로|로|은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /통증(?:으로|로|은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g
      ];
      
      symptomPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `증상으로는 ${newSymptom}`);
      });
    }
  }
  
  // 5. 투약/약물 정보 수정
  if (userInput.includes('투약') || userInput.includes('약물') || userInput.includes('복용')) {
    const medicationMatch = userInput.match(/(?:투약|약물|복용)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                          userInput.match(/(?:투약|약물|복용)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (medicationMatch && medicationMatch[1].trim()) {
      const newMedication = medicationMatch[1].trim();
      
      // 투약 관련 대화 수정
      const medicationPatterns = [
        /(?:약|약물|처방약)(?:을|를|은|는)?\s*[가-힣a-zA-Z0-9,\s]+(?:복용|먹고)/g,
        /(?:약|약물|처방약)(?:으로|로)?\s*[가-힣a-zA-Z0-9,\s]+(?:처방|투약)/g
      ];
      
      medicationPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `약물로 ${newMedication}을(를) 복용`);
      });
      
      // 약물 관리 섹션 수정
      modifiedConversation = findDialogueAndModify(
        '약물 관리', 
        '\\*\\*환자\\*\\*:\\s*(.*?)(?=\\*\\*간호사\\*\\*|$)', 
        `**환자**: 현재 ${newMedication}을(를) 복용하고 있습니다.`
      );
    }
  }
  
  // 6. 알레르기 수정
  if (userInput.includes('알레르기')) {
    const allergyMatch = userInput.match(/알레르기(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                       userInput.match(/알레르기[가]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (allergyMatch && allergyMatch[1].trim()) {
      const newAllergy = allergyMatch[1].trim();
      
      // 알레르기 관련 대화 수정
      const allergyPatterns = [
        /알레르기(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /알레르기 반응(?:이|은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g
      ];
      
      allergyPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `알레르기는 ${newAllergy}`);
      });
    }
  }
  
  // 7. 과거력 수정
  if (userInput.includes('과거력') || userInput.includes('병력')) {
    const historyMatch = userInput.match(/(?:과거력|병력)(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                        userInput.match(/(?:과거력|병력)[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (historyMatch && historyMatch[1].trim()) {
      const newHistory = historyMatch[1].trim();
      
      // 과거력 관련 대화 수정
      const historyPatterns = [
        /과거력(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /과거\s*병력(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /이전에\s*[가-힣a-zA-Z0-9,\s]+\s*질환/g
      ];
      
      historyPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `과거력은 ${newHistory}`);
      });
      
      // 과거력 섹션 수정
      modifiedConversation = findDialogueAndModify(
        '과거력 평가', 
        '\\*\\*환자\\*\\*:\\s*(.*?)(?=\\*\\*간호사\\*\\*|$)', 
        `**환자**: 저는 ${newHistory} 병력이 있습니다.`
      );
    }
  }
  
  // 8. 가족력 수정
  if (userInput.includes('가족력')) {
    const familyMatch = userInput.match(/가족력(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                      userInput.match(/가족력[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (familyMatch && familyMatch[1].trim()) {
      const newFamily = familyMatch[1].trim();
      
      // 가족력 관련 대화 수정
      const familyPatterns = [
        /가족력(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /가족\s*병력(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g
      ];
      
      familyPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `가족력은 ${newFamily}`);
      });
      
      // 가족력 섹션 수정
      modifiedConversation = findDialogueAndModify(
        '가족력', 
        '\\*\\*환자\\*\\*:\\s*(.*?)(?=\\*\\*간호사\\*\\*|$)', 
        `**환자**: 가족 중에는 ${newFamily}이(가) 있습니다.`
      );
    }
  }
  
  // 9. 진단명 수정
  if (userInput.includes('진단')) {
    const diagnosisMatch = userInput.match(/진단(?:을|를|은|는)?\s*([가-힣a-zA-Z0-9,\s]+)(?:으로|로|으로\s변경|로\s변경)?/) ||
                         userInput.match(/진단[이]?\s*([가-힣a-zA-Z0-9,\s]+)/);
    if (diagnosisMatch && diagnosisMatch[1].trim()) {
      const newDiagnosis = diagnosisMatch[1].trim();
      
      // 진단 관련 대화 수정
      const diagnosisPatterns = [
        /진단(?:은|는)?\s*[가-힣a-zA-Z0-9,\s]+/g,
        /(?:으로|로)\s*진단(?:되었|받았)/g
      ];
      
      // 진단명 변경
      diagnosisPatterns.forEach(pattern => {
        modifiedConversation = modifiedConversation.replace(pattern, `진단은 ${newDiagnosis}`);
      });
      
      // 진단 관련 상황 맥락에 따른 수정
      modifiedConversation = modifiedConversation.replace(
        /저는\s*[가-힣a-zA-Z0-9,\s]+\s*(?:진단을|진단)?\s*받았습니다/g, 
        `저는 ${newDiagnosis} 진단을 받았습니다`
      );
    }
  }
  
  return modifiedConversation;
}

// 시나리오 내용에서 환자 정보 추출 함수
function extractPatientInfoFromContent(content) {
  const patientInfo = {};
  const additionalInfo = {};
  
  // 나이 추출
  const ageMatch = content.match(/나이:\s*(\d+)세/);
  if (ageMatch && ageMatch[1]) {
    patientInfo.age = ageMatch[1] + '세';
  }
  
  // 성별 추출
  const genderMatch = content.match(/성별:\s*(남성|여성)/);
  if (genderMatch && genderMatch[1]) {
    patientInfo.gender = genderMatch[1];
  }
  
  // 직업 추출
  const occupationMatch = content.match(/직업:\s*([^\n]+)/);
  if (occupationMatch && occupationMatch[1]) {
    patientInfo.occupation = occupationMatch[1].trim();
  }
  
  // 과거력 추출
  const medicalHistoryMatch = content.match(/과거력:\s*([^\n]+)/);
  if (medicalHistoryMatch && medicalHistoryMatch[1]) {
    additionalInfo.past_medical_history = medicalHistoryMatch[1].trim();
  }
  
  // 가족력 추출
  const familyHistoryMatch = content.match(/가족력:\s*([^\n]+)/);
  if (familyHistoryMatch && familyHistoryMatch[1]) {
    additionalInfo.family_history = familyHistoryMatch[1].trim();
  }
  
  // 알레르기 추출
  const allergiesMatch = content.match(/알레르기:\s*([^\n]+)/);
  if (allergiesMatch && allergiesMatch[1]) {
    additionalInfo.allergies = allergiesMatch[1].trim();
  }
  
  // 주 증상 추출 (주 증상 섹션 아래 첫 번째 줄)
  const symptomsSection = content.match(/## 주 증상\s*\n-(.*?)(?=\n##|$)/s);
  if (symptomsSection && symptomsSection[1]) {
    const symptomsLines = symptomsSection[1].split('\n').filter(line => line.trim().startsWith('-'));
    if (symptomsLines.length > 1) {
      // 두 번째 줄 (질병 이름 다음)이 증상일 가능성이 높음
      const symptomLine = symptomsLines[1].trim().substring(1).trim(); // '-' 제거
      additionalInfo.major_symptoms = symptomLine;
    }
  }
  
  return { patientInfo, additionalInfo };
}

// axios 인터셉터 설정
axios.interceptors.request.use(
  config => {
    // CSRF 토큰 추가 (Django에서 필요한 경우)
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken[1];
      console.log('CSRF 토큰 설정:', csrfToken[1]);
    }
    
    // 특정 API 엔드포인트에 대해 추가 헤더 설정
    if (config.url.includes('/modifications/modify/')) {
      console.log('시나리오 수정 API 호출 감지: 추가 헤더 설정')
      // 수정 API에 대해 특별한 헤더 추가
      config.headers['X-Special-Auth'] = 'true'
    }
    
    // 세션 쿠키 전송 설정 (중요!)
    config.withCredentials = true;
    
    // 디버깅용 로그
    console.log('API 요청 URL:', config.url)
    console.log('API 요청 헤더:', config.headers)
    console.log('API 요청 데이터:', config.data)
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 설정
axios.interceptors.response.use(
  response => {
    // 디버깅용 로그
    console.log('API 응답 상태:', response.status)
    console.log('API 응답 데이터:', response.data)
    return response
  },
  error => {
    // 디버깅용 로그
    console.error('API 오류 발생:', error.response ? error.response.status : error.message)
    console.error('API 오류 상세:', error.response ? error.response.data : error)
    return Promise.reject(error)
  }
)

const store = createStore({
  state: {
    user: null,
    scenarios: [],
    currentScenario: null,
    loading: false,
    error: null
  },
  getters: {
    isLoggedIn: state => !!state.user,
    currentUser: state => state.user,
    isAdmin: state => state.user && state.user.is_admin,
    scenarios: state => state.scenarios,
    currentScenario: state => state.currentScenario,
    isLoading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_SCENARIOS(state, scenarios) {
      state.scenarios = scenarios
    },
    SET_CURRENT_SCENARIO(state, scenario) {
      state.currentScenario = scenario
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  actions: {
    // 인증 상태 확인
    checkAuth({ commit }) {
      // 로컬 스토리지에서 관리자 로그인 상태 확인
      const adminUser = localStorage.getItem('adminUser')
      if (adminUser) {
        commit('SET_USER', JSON.parse(adminUser))
        return
      }
      
      // 로컬 스토리지에서 임시 사용자 로그인 상태 확인
      const tempUser = localStorage.getItem('tempUser')
      if (tempUser) {
        commit('SET_USER', JSON.parse(tempUser))
        return
      }
      
      // Firebase 인증 코드 제거
    },
    
    // 로그인
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        // 관리자 계정 특별 처리 (admin@example.com / password123!)
        if (email === 'admin@example.com' && password === 'password123!') {
          const adminUser = {
            id: 'admin-user-id',
            username: 'Admin',
            email: 'admin@example.com',
            is_admin: true
          }
          commit('SET_USER', adminUser)
          // 관리자 계정 정보를 로컬 스토리지에 저장
          localStorage.setItem('adminUser', JSON.stringify(adminUser))
          commit('SET_LOADING', false)
          return adminUser
        }
        
        // 일반 사용자 처리 - 백엔드 API 호출
        try {
          // 백엔드 로그인 API 호출
          const response = await axios.post('/api/auth/login/', { email, password });
          
          if (response.data && response.data.user) {
            const user = response.data.user;
            commit('SET_USER', user);
            localStorage.setItem('tempUser', JSON.stringify(user));
            commit('SET_LOADING', false);
            return user;
          } else {
            throw new Error('로그인 응답에 사용자 정보가 없습니다.');
          }
        } catch (apiError) {
          console.error('백엔드 로그인 API 호출 실패:', apiError);
          
          // 백엔드 API 실패 시 임시 처리 (개발 중인 경우)
          if (email && email.includes('@') && password && password.length >= 6) {
            const tempUser = {
              id: 'user-' + Date.now(),
              username: email.split('@')[0],
              email: email,
              is_admin: false,
              created_at: new Date().toISOString()
            }
            
            commit('SET_USER', tempUser)
            localStorage.setItem('tempUser', JSON.stringify(tempUser))
            commit('SET_LOADING', false)
            return tempUser
          } else {
            throw new Error('유효한 이메일과 6자 이상의 비밀번호를 입력해주세요.')
          }
        }
        
        // Firebase 인증 코드 제거
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 회원가입
    async register({ commit }, { username, email, password }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        // 백엔드 회원가입 API 호출
        try {
          const response = await axios.post('/api/auth/register/', {
            username,
            email,
            password
          });
          
          if (response.data && response.data.user) {
            const user = response.data.user;
            commit('SET_USER', user);
            localStorage.setItem('tempUser', JSON.stringify(user));
            commit('SET_LOADING', false);
            return user;
          } else {
            throw new Error('회원가입 응답에 사용자 정보가 없습니다.');
          }
        } catch (apiError) {
          console.error('백엔드 회원가입 API 호출 실패:', apiError);
          
          // 백엔드 API 실패 시 임시 처리 (개발 중인 경우)
          const tempUser = {
            id: 'user-' + Date.now(),
            username,
            email,
            is_admin: false,
            created_at: new Date().toISOString()
          }
          
          commit('SET_USER', tempUser)
          localStorage.setItem('tempUser', JSON.stringify(tempUser))
          commit('SET_LOADING', false)
          return tempUser
        }
        
        // Firebase 회원가입 코드 제거
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 로그아웃
    async logout({ commit }) {
      try {
        // 로컬 스토리지에서 사용자 정보 제거
        localStorage.removeItem('adminUser')
        localStorage.removeItem('tempUser')
        
        // 백엔드 로그아웃 API 호출 (필요한 경우)
        try {
          await axios.post('/api/auth/logout/');
        } catch (apiError) {
          console.error('백엔드 로그아웃 API 호출 실패:', apiError);
          // 실패해도 진행
        }
        
        commit('SET_USER', null)
        
        // Firebase 로그아웃 코드 제거
        return true
      } catch (error) {
        console.error('로그아웃 중 오류:', error)
        return false
      }
    },
    
    // 시나리오 목록 조회
    async fetchScenarios({ commit }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        console.log('시나리오 목록 조회 시작...');
        
        // 시나리오 목록 조회
        const response = await axios.get('/api/scenarios/', {
          withCredentials: true
        })
        
        console.log('백엔드에서 조회된 시나리오:', response.data);
        
        // 로컬 스토리지에서 시나리오 불러오기
        let localScenarios = [];
        try {
          const localData = localStorage.getItem('tempScenarios');
          if (localData) {
            localScenarios = JSON.parse(localData);
            console.log('로컬 스토리지에서 조회된 시나리오:', localScenarios);
          }
        } catch (localError) {
          console.error('로컬 스토리지 조회 오류:', localError);
        }
        
        // 백엔드 시나리오와 로컬 시나리오 합치기
        // (ID 중복 검사를 위해 해시맵 사용)
        const scenarioMap = {};
        
        // 백엔드 시나리오 추가
        response.data.forEach(scenario => {
          scenarioMap[scenario.id] = scenario;
        });
        
        // 로컬 시나리오 추가
        localScenarios.forEach(scenario => {
          // 이미 같은 ID의 백엔드 시나리오가 있다면 스킵
          if (!scenarioMap[scenario.id]) {
            scenarioMap[scenario.id] = {
              ...scenario,
              is_local: true // 로컬 시나리오 표시
            };
          }
        });
        
        // 맵에서 시나리오 배열로 변환
        const mergedScenarios = Object.values(scenarioMap);
        console.log('병합된 시나리오 목록:', mergedScenarios);
        
        // 최신 항목이 먼저 오도록 정렬
        mergedScenarios.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        commit('SET_SCENARIOS', mergedScenarios)
        commit('SET_LOADING', false)
        return mergedScenarios
      } catch (error) {
        console.error('시나리오 목록 조회 실패:', error)
        
        // API 실패 시 로컬 스토리지 데이터만 사용
        let localScenarios = [];
        try {
          const localData = localStorage.getItem('tempScenarios');
          if (localData) {
            localScenarios = JSON.parse(localData);
            localScenarios = localScenarios.map(scenario => ({
              ...scenario,
              is_local: true
            }));
            
            // 최신 항목이 먼저 오도록 정렬
            localScenarios.sort((a, b) => {
              return new Date(b.created_at) - new Date(a.created_at);
            });
            
            console.log('백엔드 실패, 로컬 스토리지 시나리오만 사용:', localScenarios);
            commit('SET_SCENARIOS', localScenarios);
            commit('SET_LOADING', false);
            return localScenarios;
          }
        } catch (localError) {
          console.error('로컬 스토리지 조회 오류:', localError);
        }
        
        // 둘 다 실패한 경우
        commit('SET_ERROR', '시나리오 목록을 불러오는데 실패했습니다.')
        commit('SET_LOADING', false)
        return []
      }
    },
    
    // 특정 시나리오 가져오기
    async fetchScenario({ commit, dispatch, state }, id) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        console.log('시나리오 ID 조회 시작:', id);
        
        // ID가 타임스탬프인 경우 (로컬 임시 데이터)
        if (id.toString().length >= 13) {
          console.log('타임스탬프 ID 감지 - 로컬 데이터 검색...');
          // 현재 시나리오가 이미 있고 ID가 일치하는 경우 
          if (state.currentScenario && state.currentScenario.id.toString() === id.toString()) {
            console.log('현재 시나리오에서 찾음:', state.currentScenario);
            commit('SET_LOADING', false);
            return state.currentScenario;
          }
          
          // 시나리오 목록에서 검색
          const foundScenario = state.scenarios.find(s => s.id.toString() === id.toString());
          if (foundScenario) {
            console.log('시나리오 목록에서 찾음:', foundScenario);
            commit('SET_CURRENT_SCENARIO', foundScenario);
            commit('SET_LOADING', false);
            return foundScenario;
          }
          
          // 로컬스토리지에서 시도
          try {
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              const parsedScenarios = JSON.parse(localScenarios);
              const foundLocalScenario = parsedScenarios.find(s => s.id.toString() === id.toString());
              if (foundLocalScenario) {
                console.log('로컬스토리지에서 찾음:', foundLocalScenario);
                commit('SET_CURRENT_SCENARIO', foundLocalScenario);
                commit('SET_LOADING', false);
                return foundLocalScenario;
              }
            }
          } catch (localError) {
            console.error('로컬스토리지 조회 중 오류:', localError);
          }
          
          throw new Error('유효하지 않은 시나리오 ID입니다.');
        }
        
        // 백엔드 API에서 시나리오 가져오기
        console.log('백엔드 API에서 시나리오 조회:', id);
        const response = await axios.get(`/api/scenarios/${id}/`, {
          withCredentials: true
        });
        
        console.log('백엔드 API 응답:', response.data);
        const scenario = response.data;
        
        // 시나리오 저장
        commit('SET_CURRENT_SCENARIO', scenario);
        commit('SET_LOADING', false);
        
        // 환자와의 대화가 없는 경우 기본 대화 생성
        if (!scenario.patient_conversation || scenario.patient_conversation.trim() === '') {
          await dispatch('setDefaultPatientConversation', scenario);
        }
        
        return scenario;
      } catch (error) {
        console.error('시나리오 가져오기 실패:', error)
        commit('SET_ERROR', '시나리오를 가져오는 중 오류가 발생했습니다.')
        commit('SET_LOADING', false)
        
        // 임시 빈 시나리오 반환 (UI가 완전히 깨지는 것 방지)
        return {
          id: id,
          title: '시나리오를 찾을 수 없음',
          main_disease: '',
          personal_info: {},
          additional_info: {},
          content: '시나리오를 찾을 수 없습니다. 다시 시도해주세요.',
          patient_conversation: '',
          created_at: new Date().toISOString(),
          created_by: null
        }
      }
    },
    
    // 시나리오 생성
    async createScenario({ commit, getters, state }, scenarioData) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        // 사용자 정보 추가
        const currentUser = getters.currentUser
        if (!currentUser) {
          throw new Error('시나리오를 생성하려면 로그인이 필요합니다.')
        }
        
        console.log('GPT API를 통한 시나리오 생성 시작...');
        console.log('시나리오 데이터:', scenarioData);
        
        try {
          // 백엔드 API를 통해 GPT로 시나리오 생성 요청
          const gptResponse = await axios.post('/api/scenarios/generate/', {
            title: scenarioData.title,
            main_disease: scenarioData.main_disease,
            personal_info: scenarioData.personal_info || {},
            additional_info: scenarioData.additional_info || {},
            include_conversation: true // 환자와의 대화 포함 요청
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('GPT 응답 데이터:', gptResponse.data);
          
          if (!gptResponse.data) {
            throw new Error('GPT API 응답이 없습니다.');
          }
          
          const savedScenario = gptResponse.data;
          
          // 시나리오 데이터 업데이트
          commit('SET_CURRENT_SCENARIO', savedScenario);
          
          // scenarios 목록 업데이트 (새 시나리오 추가)
          const updatedScenarios = [...state.scenarios, savedScenario];
          commit('SET_SCENARIOS', updatedScenarios);
          
          commit('SET_LOADING', false);
          return savedScenario;
        } catch (apiError) {
          console.error('백엔드 DB 저장 실패, 로컬 저장으로 전환:', apiError);
          
          // GPT API 호출 실패 시 기본 템플릿으로 시나리오 생성
          console.log('GPT API 호출 실패, 기본 템플릿으로 대체...');
          
          // 임시 ID 생성
          const tempId = Date.now().toString();
          console.log('임시 ID 생성:', tempId);
          
          // 기본 템플릿 생성
          const defaultContent = `
# ${scenarioData.title} 시나리오

## 환자 정보
- 이름: 환자 (가명)
- 나이: ${
  // 이미 '세'가 포함된 경우 그대로 사용, 아니면 '세' 추가
  (scenarioData.personal_info?.age && scenarioData.personal_info.age.toString().endsWith('세')) 
  ? scenarioData.personal_info.age 
  : (scenarioData.personal_info?.age || '40') + '세'
}
- 성별: ${scenarioData.personal_info?.gender || '남성'}
- 직업: ${scenarioData.personal_info?.occupation || '회사원'}
- 과거력: ${scenarioData.additional_info?.past_medical_history || '없음'}
- 가족력: ${scenarioData.additional_info?.family_history || '없음'}
- 알레르기: ${scenarioData.additional_info?.allergies || '없음'}

## 주 증상
- ${scenarioData.main_disease}
- ${scenarioData.additional_info?.major_symptoms || '피로, 발열, 통증'}

## 현재 상태
- 의식: 명료
- 활력징후: BP 130/80 mmHg, HR 85 bpm, RR 18/min, SpO2 97%, BT 37.0°C

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
`;

          const defaultConversation = `
# 환자와의 대화

## 초기 평가
**간호사**: 안녕하세요, 저는 오늘 담당 간호사입니다. 어떻게 지내세요? 어디가 불편하신가요?

**환자**: 안녕하세요, 간호사님. ${scenarioData.additional_info?.major_symptoms || '몸이 전체적으로 아프고 피곤합니다.'} 

**간호사**: 언제부터 이런 증상이 있었나요?

**환자**: 약 일주일 전부터 시작됐어요. 점점 심해지는 것 같아요.

## 검사 및 치료 중
**간호사**: 검사 결과가 나왔습니다. ${scenarioData.main_disease}로 확인되었습니다. 의사 선생님께서 곧 자세한 설명과 치료 계획을 알려주실 거예요.

**환자**: 그렇군요. 치료는 어떻게 진행되나요?

**간호사**: 우선 약물 치료를 시작하고 상태를 모니터링할 예정입니다. 규칙적인 복약 관리와 생활습관 개선이 중요합니다.

## 회복기
**간호사**: 치료 후에 상태가 많이 좋아지셨네요. 앞으로의 관리 방법에 대해 알려드릴게요.

**환자**: 네, 많이 나아진 것 같아요. 앞으로 어떻게 관리해야 할까요?

**간호사**: 규칙적인 약물 복용과 정기적인 검진이 중요합니다. 또한 건강한 식습관과 적절한 운동도 도움이 됩니다.
`;

          // 임시 데이터 생성
          const tempScenario = {
            id: tempId,
            title: scenarioData.title,
            main_disease: scenarioData.main_disease,
            personal_info: scenarioData.personal_info || {},
            additional_info: scenarioData.additional_info || {},
            content: defaultContent,
            patient_conversation: defaultConversation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: getters.currentUser,
            is_local: true // 로컬 저장 시나리오임을 표시
          };
          
          // 로컬 스토리지에 저장
          try {
            // 기존 로컬 시나리오 불러오기
            let tempScenarios = [];
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              tempScenarios = JSON.parse(localScenarios);
            }
            
            // 새 시나리오 추가
            tempScenarios.push(tempScenario);
            
            // 로컬 스토리지에 저장
            localStorage.setItem('tempScenarios', JSON.stringify(tempScenarios));
            console.log('로컬 스토리지에 시나리오 저장 완료');
            
            // 상태 업데이트
            const updatedScenarios = [...state.scenarios, tempScenario];
            commit('SET_SCENARIOS', updatedScenarios);
            commit('SET_CURRENT_SCENARIO', tempScenario);
          } catch (storageError) {
            console.error('로컬 스토리지 저장 실패:', storageError);
          }
          
          commit('SET_LOADING', false);
          return tempScenario;
        }
      } catch (error) {
        console.error('시나리오 생성 실패:', error);
        commit('SET_ERROR', `시나리오 생성 중 오류가 발생했습니다: ${error.message}`)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 시나리오 수정
    async modifyScenario({ commit, getters, state }, { scenarioId, userInput }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        // 사용자 정보 확인
        const currentUser = getters.currentUser
        if (!currentUser) {
          throw new Error('시나리오를 수정하려면 로그인이 필요합니다.')
        }
        
        // 로컬 ID인지 확인 (타임스탬프 형식)
        const isLocalId = scenarioId.toString().length >= 13;
        console.log(`시나리오 ID 확인: ${scenarioId}, 로컬 ID 여부: ${isLocalId}`);
        
        if (isLocalId) {
          console.log('로컬 ID 감지 - 로컬 시나리오 수정 시도...');
          // 로컬 스토리지에서 시나리오 가져오기
          try {
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              const tempScenarios = JSON.parse(localScenarios);
              const scenarioIndex = tempScenarios.findIndex(s => s.id.toString() === scenarioId.toString());
              
              if (scenarioIndex !== -1) {
                const existingScenario = tempScenarios[scenarioIndex];
                console.log('수정할 시나리오 찾음:', existingScenario);
                
                try {
                  console.log('GPT로 로컬 수정 시도...');
                  
                  // handleLocalModification 함수를 직접 호출하여 시나리오 내용 수정
                  const updatedContent = handleLocalModification(existingScenario.content, userInput);
                  
                  // 시나리오 내용에서 환자 정보 추출
                  const { patientInfo, additionalInfo } = extractPatientInfoFromContent(updatedContent);
                  
                  // 환자와의 대화 내용도 같은 수정 적용 (개선된 대화 수정 함수 사용)
                  const updatedConversation = handleConversationModification(
                    existingScenario.patient_conversation, 
                    userInput,
                    patientInfo
                  );
                  
                  // 수정된 시나리오 업데이트
                  const modifiedScenario = {
                    ...existingScenario,
                    content: updatedContent,
                    patient_conversation: updatedConversation,
                    updated_at: new Date().toISOString(),
                    personal_info: {
                      ...existingScenario.personal_info,
                      ...patientInfo
                    },
                    additional_info: {
                      ...existingScenario.additional_info,
                      ...additionalInfo
                    }
                  };
                  
                  // 로컬 스토리지 업데이트
                  tempScenarios[scenarioIndex] = modifiedScenario;
                  localStorage.setItem('tempScenarios', JSON.stringify(tempScenarios));
                  console.log('로컬 스토리지 시나리오 수정 완료');
                  
                  // 상태 업데이트
                  commit('SET_CURRENT_SCENARIO', modifiedScenario);
                  commit('SET_SCENARIOS', tempScenarios);
                  
                  commit('SET_LOADING', false);
                  return modifiedScenario;
                } catch (gptError) {
                  console.error('로컬 수정 실패:', gptError);
                  throw new Error(`시나리오 수정 실패: ${gptError.message}`);
                }
              } else {
                throw new Error(`ID가 ${scenarioId}인 로컬 시나리오를 찾을 수 없습니다.`);
              }
            } else {
              throw new Error('로컬 저장소에 시나리오가 없습니다.');
            }
          } catch (localError) {
            console.error('로컬 시나리오 로드 실패:', localError);
            throw new Error(`로컬 시나리오 로드 실패: ${localError.message}`);
          }
        }
        
        // 백엔드 API를 통해 시나리오 수정
        console.log('백엔드 API를 통한 시나리오 수정 시도...');
        try {
          // 시나리오 내용에서 환자 정보 추출
          const { patientInfo, additionalInfo } = extractPatientInfoFromContent(updatedContent);
          
          // 백엔드 API에 수정된 내용 전송
          const response = await axios.patch(`/api/scenarios/${scenarioId}/`, {
            content: updatedContent,
            personal_info: patientInfo,
            additional_info: additionalInfo
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('백엔드 시나리오 내용 수정 성공:', response.data);
          
          // 수정된 시나리오 데이터
          const modifiedScenario = response.data;
          
          // 현재 시나리오 업데이트
          commit('SET_CURRENT_SCENARIO', modifiedScenario);
          commit('SET_LOADING', false);
          return modifiedScenario;
        } catch (apiError) {
          console.error('백엔드 시나리오 내용 수정 API 호출 실패:', apiError);
          
          // 백엔드 API 실패 시 오류 전달
          if (apiError.response) {
            throw new Error(`서버 오류 (${apiError.response.status}): ${apiError.response.data.error || '알 수 없는 오류'}`);
          } else {
            throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
          }
        }
      } catch (error) {
        console.error('시나리오 수정 실패:', error)
        commit('SET_ERROR', `시나리오를 수정하는 중 오류가 발생했습니다: ${error.message}`)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 기본 환자 대화 설정
    async setDefaultPatientConversation({ commit }, scenario) {
      console.log('기본 환자 대화 설정 중...')
      
      const defaultConversation = `
# 환자와의 대화

## 초기 평가
**간호사**: 안녕하세요, 저는 오늘 담당 간호사입니다. 어떻게 지내세요? 어디가 불편하신가요?

**환자**: 안녕하세요, 간호사님. 사실 며칠 전부터 계속 가슴이 답답하고 숨이 잘 안 쉬어져요. 특히 계단을 오르거나 조금만 움직여도 숨이 차고 어지러워요.

**간호사**: 언제부터 이런 증상이 있었나요? 그리고 증상이 점점 심해지고 있나요?

**환자**: 약 일주일 전부터 시작됐어요. 처음에는 가벼운 피로감 정도였는데, 3일 전부터는 확실히 숨이 차고 가슴이 답답한 느낌이 심해졌어요. 어제는 밤에 누워있는데 갑자기 숨이 막히는 느낌이 들어서 깼어요.

**간호사**: 다른 증상은 없으신가요? 예를 들어 가슴 통증, 발열, 기침, 발목 부종 같은 것들이요.

**환자**: 가슴 통증은 약간 있어요. 쥐어짜는 듯한 통증이 아니라 둔하게 아픈 느낌이에요. 그리고 발목이 좀 부어있는 것 같아요. 신발이 잘 안 들어가더라고요.

## 검사 및 치료 중
**간호사**: 검사 결과가 나왔습니다. 심전도와 혈액 검사, 흉부 X-ray를 종합해 봤을 때, 심부전 초기 증상으로 보입니다. 의사 선생님께서 곧 자세한 설명과 치료 계획을 알려주실 거예요.

**환자**: 심부전이요? 그게 심장이 멈추는 건가요? 너무 무서워요. 제가 많이 위험한가요?

**간호사**: 심부전이라는 말이 무섭게 들릴 수 있지만, 심장이 완전히 멈추는 것은 아니에요. 심장이 몸에 필요한 만큼 충분히 혈액을 펌프질하지 못하는 상태를 말합니다. 초기에 발견했고, 적절한 치료와 생활습관 개선으로 잘 관리할 수 있어요. 지금은 약물 치료를 시작하고 증상을 완화시키는 것이 중요합니다.

**환자**: 그렇군요. 조금 안심이 되네요. 치료는 어떻게 진행되나요? 입원해야 하나요?

**간호사**: 네, 며칠간 입원하시면서 약물 치료를 시작하고 상태를 모니터링할 예정입니다. 이뇨제를 투여해서 체내 과잉 수분을 배출하고, 심장 기능을 개선하는 약물도 함께 사용할 거예요. 또한 저염식이를 시작하고, 수분 섭취량도 조절할 필요가 있습니다.

**환자**: 알겠습니다. 제가 평소에 짠 음식을 좋아했는데, 이제 조심해야겠네요. 그런데 이 병이 완전히 나을 수 있는 건가요?

**간호사**: 심부전은 완전히 치료되기보다는 잘 관리하는 것이 중요한 만성 질환입니다. 하지만 약물 치료와 생활습관 개선으로 증상을 크게 완화하고 정상적인 일상생활을 유지할 수 있어요. 규칙적인 운동, 저염식이, 금연, 적절한 체중 유지가 중요합니다. 물론 처음에는 천천히 시작하고, 상태가 좋아지면 점차 활동량을 늘려갈 수 있어요.

## 회복기
**간호사**: 3일간의 치료 후에 상태가 많이 좋아지셨네요. 호흡곤란도 줄었고, 발목 부종도 감소했습니다. 약물 반응이 좋은 편이에요.

**환자**: 네, 확실히 숨쉬기가 한결 편해졌어요. 처음에는 화장실 가는 것도 힘들었는데, 이제는 병실 주변을 걸어다닐 수 있을 정도가 됐어요. 그런데 퇴원 후에는 어떻게 관리해야 하나요?

**간호사**: 퇴원 후에도 약물 복용을 꾸준히 하셔야 합니다. 처방된 약을 정확한 시간에 복용하는 것이 중요해요. 또한 매일 체중을 측정하셔서 갑자기 체중이 증가하면(2-3일 내에 1.5kg 이상) 바로 연락주세요. 이는 체내에 수분이 다시 축적되고 있다는 신호일 수 있습니다.

**환자**: 알겠습니다. 식이요법은 어떻게 해야 할까요? 소금을 완전히 끊어야 하나요?

**간호사**: 완전히 끊을 필요는 없지만, 하루 소금 섭취량을 2g 이하로 제한하는 것이 좋습니다. 가공식품, 패스트푸드, 절임식품은 피하시고, 신선한 재료로 조리한 음식을 드세요. 또한 수분 섭취도 하루 1.5-2리터로 제한하는 것이 좋습니다. 퇴원 전에 영양사 선생님과 상담 일정을 잡아드릴게요.

**환자**: 운동은 어느 정도 해도 괜찮을까요? 전에는 가끔 등산도 했었는데요.

**간호사**: 처음에는 가벼운 산책부터 시작하세요. 하루 10-15분 정도로 시작해서 점차 늘려가는 것이 좋습니다. 숨이 차거나 피로감이 심하면 즉시 중단하고 휴식을 취하세요. 등산 같은 격렬한 운동은 의사 선생님과 상담 후에 결정하는 것이 좋습니다. 2주 후에 외래 진료가 예약되어 있으니, 그때 운동 강도에 대해 상담하실 수 있어요.

**환자**: 정말 감사합니다. 처음에는 너무 무서웠는데, 이제 어떻게 관리해야 할지 알게 되어 안심이 됩니다. 앞으로 건강관리에 더 신경 쓰도록 할게요.

**간호사**: 네, 좋은 마음가짐이세요. 저희가 계속 도와드릴게요. 퇴원 후에도 궁금한 점이 있으시면 언제든지 연락주세요. 심부전 환자 자조 모임도 있으니 참여해보시는 것도 좋을 것 같아요. 다른 환자분들의 경험과 조언이 많은 도움이 될 수 있습니다.
      `
      
      // 시나리오 객체에 환자 대화 추가
      scenario.patient_conversation = defaultConversation
      
      // 현재 시나리오 상태 업데이트
      commit('SET_CURRENT_SCENARIO', { ...scenario })
      
      // 백엔드 API를 통해 시나리오 업데이트
      try {
        await axios.patch(`/api/scenarios/${scenario.id}/`, {
          patient_conversation: defaultConversation
        });
        console.log('환자 대화 업데이트 성공')
      } catch (error) {
        console.warn('환자 대화 업데이트 실패:', error)
      }
      
      return scenario
    },
    
    // 시나리오 삭제
    async deleteScenario({ commit, state }, scenarioId) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        console.log('시나리오 삭제 시작:', scenarioId);
        
        // 로컬 ID인지 확인 (타임스탬프 형식)
        const isLocalId = scenarioId.toString().length >= 13;
        console.log(`시나리오 ID 확인: ${scenarioId}, 로컬 ID 여부: ${isLocalId}`);
        
        if (isLocalId) {
          console.log('로컬 시나리오 삭제 시도...');
          try {
            // 로컬 스토리지에서 시나리오 가져오기
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              // 시나리오 목록에서 해당 ID를 제외한 목록 생성
              const tempScenarios = JSON.parse(localScenarios);
              const filteredScenarios = tempScenarios.filter(s => s.id.toString() !== scenarioId.toString());
              
              // 로컬 스토리지 업데이트
              localStorage.setItem('tempScenarios', JSON.stringify(filteredScenarios));
              console.log('로컬 시나리오 삭제 완료');
              
              // 상태 업데이트
              const updatedScenarios = state.scenarios.filter(s => s.id.toString() !== scenarioId.toString());
              commit('SET_SCENARIOS', updatedScenarios);
              
              if (state.currentScenario && state.currentScenario.id.toString() === scenarioId.toString()) {
                commit('SET_CURRENT_SCENARIO', null);
              }
              
              commit('SET_LOADING', false);
              return true;
            }
          } catch (localError) {
            console.error('로컬 시나리오 삭제 실패:', localError);
            throw new Error(`로컬 시나리오 삭제 실패: ${localError.message}`);
          }
        }
        
        // 백엔드 API를 통해 시나리오 삭제
        console.log('백엔드 API를 통한 시나리오 삭제 시도...');
        await axios.delete(`/api/scenarios/${scenarioId}/`, {
          withCredentials: true
        });
        
        console.log('백엔드 시나리오 삭제 성공');
        
        // 상태 업데이트
        const updatedScenarios = state.scenarios.filter(s => s.id.toString() !== scenarioId.toString());
        commit('SET_SCENARIOS', updatedScenarios);
        
        if (state.currentScenario && state.currentScenario.id.toString() === scenarioId.toString()) {
          commit('SET_CURRENT_SCENARIO', null);
        }
        
        commit('SET_LOADING', false);
        return true;
      } catch (error) {
        console.error('시나리오 삭제 실패:', error);
        commit('SET_ERROR', `시나리오를 삭제하는 중 오류가 발생했습니다: ${error.message}`);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 시나리오 내용 직접 편집
    async updateScenarioContent({ commit, getters, state }, { scenarioId, content }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        console.log('시나리오 내용 직접 편집 시작:', scenarioId);
        
        // 사용자 정보 확인
        const currentUser = getters.currentUser
        if (!currentUser) {
          throw new Error('시나리오를 수정하려면 로그인이 필요합니다.')
        }
        
        // 로컬 ID인지 확인 (타임스탬프 형식)
        const isLocalId = scenarioId.toString().length >= 13;
        console.log(`시나리오 ID 확인: ${scenarioId}, 로컬 ID 여부: ${isLocalId}`);
        
        if (isLocalId) {
          console.log('로컬 ID 감지 - 로컬 시나리오 수정 시도...');
          // 로컬 스토리지에서 시나리오 가져오기
          try {
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              const tempScenarios = JSON.parse(localScenarios);
              const scenarioIndex = tempScenarios.findIndex(s => s.id.toString() === scenarioId.toString());
              
              if (scenarioIndex !== -1) {
                const existingScenario = tempScenarios[scenarioIndex];
                console.log('수정할 시나리오 찾음:', existingScenario);
                
                try {
                  // 시나리오 내용에서 환자 정보 추출
                  const { patientInfo, additionalInfo } = extractPatientInfoFromContent(content);
                  
                  // 수정된 시나리오 업데이트
                  const modifiedScenario = {
                    ...existingScenario,
                    content: content,
                    updated_at: new Date().toISOString(),
                    personal_info: {
                      ...existingScenario.personal_info,
                      ...patientInfo
                    },
                    additional_info: {
                      ...existingScenario.additional_info,
                      ...additionalInfo
                    }
                  };
                  
                  // 로컬 스토리지 업데이트
                  tempScenarios[scenarioIndex] = modifiedScenario;
                  localStorage.setItem('tempScenarios', JSON.stringify(tempScenarios));
                  console.log('로컬 스토리지 시나리오 내용 수정 완료');
                  
                  // 상태 업데이트
                  commit('SET_CURRENT_SCENARIO', modifiedScenario);
                  commit('SET_SCENARIOS', tempScenarios);
                  
                  commit('SET_LOADING', false);
                  return modifiedScenario;
                } catch (error) {
                  console.error('로컬 시나리오 내용 수정 실패:', error);
                  throw new Error(`시나리오 내용 수정 실패: ${error.message}`);
                }
              } else {
                throw new Error(`ID가 ${scenarioId}인 로컬 시나리오를 찾을 수 없습니다.`);
              }
            } else {
              throw new Error('로컬 저장소에 시나리오가 없습니다.');
            }
          } catch (localError) {
            console.error('로컬 시나리오 로드 실패:', localError);
            throw new Error(`로컬 시나리오 로드 실패: ${localError.message}`);
          }
        }
        
        // 백엔드 API를 통해 시나리오 수정
        console.log('백엔드 API를 통한 시나리오 내용 수정 시도...');
        try {
          // 시나리오 내용에서 환자 정보 추출
          const { patientInfo, additionalInfo } = extractPatientInfoFromContent(content);
          
          // 백엔드 API에 수정된 내용 전송
          const response = await axios.patch(`/api/scenarios/${scenarioId}/`, {
            content: content,
            personal_info: patientInfo,
            additional_info: additionalInfo
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('백엔드 시나리오 내용 수정 성공:', response.data);
          
          // 수정된 시나리오 데이터
          const modifiedScenario = response.data;
          
          // 현재 시나리오 업데이트
          commit('SET_CURRENT_SCENARIO', modifiedScenario);
          commit('SET_LOADING', false);
          return modifiedScenario;
        } catch (apiError) {
          console.error('백엔드 시나리오 내용 수정 API 호출 실패:', apiError);
          
          // 백엔드 API 실패 시 오류 전달
          if (apiError.response) {
            throw new Error(`서버 오류 (${apiError.response.status}): ${apiError.response.data.error || '알 수 없는 오류'}`);
          } else {
            throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
          }
        }
      } catch (error) {
        console.error('시나리오 내용 직접 편집 실패:', error);
        commit('SET_ERROR', `시나리오 내용을 수정하는 중 오류가 발생했습니다: ${error.message}`);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 환자와의 대화 직접 편집
    async updateScenarioConversation({ commit, getters, state }, { scenarioId, conversation }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        console.log('환자와의 대화 직접 편집 시작:', scenarioId);
        
        // 사용자 정보 확인
        const currentUser = getters.currentUser
        if (!currentUser) {
          throw new Error('시나리오를 수정하려면 로그인이 필요합니다.')
        }
        
        // 로컬 ID인지 확인 (타임스탬프 형식)
        const isLocalId = scenarioId.toString().length >= 13;
        console.log(`시나리오 ID 확인: ${scenarioId}, 로컬 ID 여부: ${isLocalId}`);
        
        if (isLocalId) {
          console.log('로컬 ID 감지 - 로컬 시나리오 대화 수정 시도...');
          // 로컬 스토리지에서 시나리오 가져오기
          try {
            const localScenarios = localStorage.getItem('tempScenarios');
            if (localScenarios) {
              const tempScenarios = JSON.parse(localScenarios);
              const scenarioIndex = tempScenarios.findIndex(s => s.id.toString() === scenarioId.toString());
              
              if (scenarioIndex !== -1) {
                const existingScenario = tempScenarios[scenarioIndex];
                console.log('수정할 시나리오 찾음:', existingScenario);
                
                try {
                  // 수정된 시나리오 업데이트
                  const modifiedScenario = {
                    ...existingScenario,
                    patient_conversation: conversation,
                    updated_at: new Date().toISOString()
                  };
                  
                  // 로컬 스토리지 업데이트
                  tempScenarios[scenarioIndex] = modifiedScenario;
                  localStorage.setItem('tempScenarios', JSON.stringify(tempScenarios));
                  console.log('로컬 스토리지 환자 대화 수정 완료');
                  
                  // 상태 업데이트
                  commit('SET_CURRENT_SCENARIO', modifiedScenario);
                  commit('SET_SCENARIOS', tempScenarios);
                  
                  commit('SET_LOADING', false);
                  return modifiedScenario;
                } catch (error) {
                  console.error('로컬 환자 대화 수정 실패:', error);
                  throw new Error(`환자 대화 수정 실패: ${error.message}`);
                }
              } else {
                throw new Error(`ID가 ${scenarioId}인 로컬 시나리오를 찾을 수 없습니다.`);
              }
            } else {
              throw new Error('로컬 저장소에 시나리오가 없습니다.');
            }
          } catch (localError) {
            console.error('로컬 시나리오 로드 실패:', localError);
            throw new Error(`로컬 시나리오 로드 실패: ${localError.message}`);
          }
        }
        
        // 백엔드 API를 통해 환자 대화 수정
        console.log('백엔드 API를 통한 환자 대화 수정 시도...');
        try {
          // 백엔드 API에 수정된 내용 전송
          const response = await axios.patch(`/api/scenarios/${scenarioId}/`, {
            patient_conversation: conversation
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('백엔드 환자 대화 수정 성공:', response.data);
          
          // 수정된 시나리오 데이터
          const modifiedScenario = response.data;
          
          // 현재 시나리오 업데이트
          commit('SET_CURRENT_SCENARIO', modifiedScenario);
          commit('SET_LOADING', false);
          return modifiedScenario;
        } catch (apiError) {
          console.error('백엔드 환자 대화 수정 API 호출 실패:', apiError);
          
          // 백엔드 API 실패 시 오류 전달
          if (apiError.response) {
            throw new Error(`서버 오류 (${apiError.response.status}): ${apiError.response.data.error || '알 수 없는 오류'}`);
          } else {
            throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
          }
        }
      } catch (error) {
        console.error('환자 대화 직접 편집 실패:', error);
        commit('SET_ERROR', `환자 대화를 수정하는 중 오류가 발생했습니다: ${error.message}`);
        commit('SET_LOADING', false);
        throw error;
      }
    }
  }
})

export default store

