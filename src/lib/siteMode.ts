/**
 * PRIMER 전용 설정.
 */

export const siteConfig = {
  name: 'PRIMER',
  subtitle: '연구지원 플랫폼',
  heroTitle: '논문 작성, 통계 분석\n혼자 시작하기 어렵다면',
  heroDesc: '연구설계부터 자료수집방법, 통계방법, 논문작성 시 주의사항까지\nPRIMER가 함께합니다',
  ctaText: '지원 요청하기',
  requestLabel: '지원 요청',
  requestVerb: '요청',
  resultLabel: '최종의견 제시',
  partnerName: 'ResearchOn',
  partnerUrl: 'https://researchon.vercel.app',
} as const;

export const services = [
  { key: 'research-design', title: '연구 설계 상담', description: '연구 주제 설계부터 방법론 안내까지', href: '/data-generation', image: '/images/landing-연구설계.png' },
  { key: 'stats-design', title: '통계분석 설계', description: '분석 방법 선정 및 설계 지원', href: '/stats-design', image: '/images/landing-계량통계.png' },
  { key: 'survey', title: '설문구성 / 조사설계', description: '설문 구성 및 조사 설계 안내', href: '/survey-request', image: '/images/landing-설문조사.png' },
];

export const advancedServices = [
  { key: 'survey-exec', title: '설문조사 수행', description: '설문 배포, 데이터 수집 대행' },
  { key: 'judgment', title: '판결문 코딩', description: '판결문 수집부터 변수 코딩까지' },
  { key: 'news', title: '뉴스/언론 보도', description: '키워드 기반 뉴스 수집 및 분석' },
  { key: 'quant', title: '고급 통계분석', description: 'SEM, 다수준, 패널분석 등' },
  { key: 'text', title: '텍스트 분석', description: '토픽모델링, 감성분석, 워드클라우드' },
  { key: 'qual', title: '질적분석', description: '인터뷰, 주제분석, 근거이론 등' },
  { key: 'data-transform', title: '데이터 전처리', description: '리코딩, 결측치 처리, 병합 등' },
];
