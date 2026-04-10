# ResearchOn 프로젝트 진행상황

## 2026-04-09 작업 내용 (야간 세션 - Claude Code)

### 대화 요약

새 PC에서 git pull 후 PROGRESS.md의 "다음 할 일" 목록을 순서대로 진행.
`.env.local` 없는 상태에서 시작 → 환경변수 세팅 → 대문 섹션 토글 → Discord 알림 → 결과물 샘플 페이지까지 완료.

### 완료된 작업

**1. 관리자 대문 섹션 on/off 토글**
- Supabase `site_settings` 테이블 생성 (category + key 기반 key-value 저장)
- `/api/site-settings` API (GET/PUT) 구현
- 관리자 패널에 "사이트 설정" 탭 추가 — 4개 섹션 토글 (제공 서비스, 왜 ResearchOn, 이용 절차, 문의/CTA)
- 랜딩 페이지에서 설정 fetch → 섹션 조건부 렌더링

**2. Discord 웹훅 알림**
- `src/lib/discord.ts` — notifyNewRequest, notifyContactInquiry 함수
- 10개 의뢰 API + contact API에 Discord 알림 연동
- 의뢰 접수 시 서비스명, 이메일, 내용 요약을 embed 형태로 Discord 채널에 전송
- Vercel 환경변수 `DISCORD_WEBHOOK_URL` 설정 완료
- Discord 서버 생성, 웹훅 연동, 테스트 메시지 전송 확인

**3. 결과물 샘플 페이지**
- `/samples` 페이지 구조 생성 (서비스별 6개 탭)
- 이미지 파일: 페이지 내 바로 표시 + 클릭 확대 (라이트박스)
- PDF 파일: 다운로드 버튼
- 랜딩 네비게이션에 "결과물 샘플" 링크 추가
- 현재 "샘플 준비 중" 상태 — 파일을 `public/samples/`에 넣고 코드에 경로 추가하면 됨

**4. 환경 세팅**
- 새 PC `.env.local` 생성 (Supabase URL, anon key, service_role key, Discord webhook URL)
- `archiver` 패키지 설치 (기존 누락)

### 주요 생성/변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/site-settings/route.ts` | **신규** — 랜딩 섹션 설정 GET/PUT API |
| `src/lib/discord.ts` | **신규** — Discord 웹훅 알림 함수 |
| `src/app/samples/page.tsx` | **신규** — 결과물 샘플 페이지 |
| `public/samples/` | **신규** — 샘플 파일 폴더 (빈 상태) |
| `src/app/admin/page.tsx` | "사이트 설정" 탭 추가 (섹션 on/off 토글) |
| `src/app/page.tsx` | 섹션 조건부 렌더링 + "결과물 샘플" 네비 링크 |
| `src/app/api/research-design/route.ts` | Discord 알림 추가 |
| `src/app/api/stats-design/route.ts` | Discord 알림 추가 |
| `src/app/api/survey/route.ts` | Discord 알림 추가 |
| `src/app/api/judgment-collection/route.ts` | Discord 알림 추가 |
| `src/app/api/judgment-coding/route.ts` | Discord 알림 추가 |
| `src/app/api/news-collection/route.ts` | Discord 알림 추가 |
| `src/app/api/data-transform/route.ts` | Discord 알림 추가 |
| `src/app/api/quant-analysis/route.ts` | Discord 알림 추가 |
| `src/app/api/text-analysis-request/route.ts` | Discord 알림 추가 |
| `src/app/api/qual-analysis/route.ts` | Discord 알림 추가 |
| `src/app/api/contact/route.ts` | Discord 알림 추가 |

### Supabase 변경사항
- `site_settings` 테이블 생성 (id, category, key, value, updated_at / UNIQUE: category+key)
- 초기 데이터 4행 삽입 (landing_sections: services, value_proposition, how_it_works, contact)

### 다음 할 일
- **결과물 샘플 파일 준비** — 서비스별 PDF/이미지 파일을 `public/samples/`에 추가 후 `samples/page.tsx`의 `serviceSamples` 배열에 등록
- **커스텀 도메인 설정** — Vercel에서 도메인 연결

---

## 2026-04-09 작업 내용 (오후 세션 - Claude Code)

### 대화 요약

사용자(관리자)가 실제로 의뢰를 넣어보면서 발견한 문제점들을 하나씩 수정함.
주로 "의뢰가 실제로 저장되는가", "관리자가 확인할 수 있는가", "파일에 접근 가능한가", "비로그인 보안"에 집중.

### 완료된 작업

**판결문 코딩 의뢰 실제 저장 구현**
- 프로젝트 페이지 "의뢰하기" 버튼이 TODO stub이었음 → 실제 `/api/judgment-coding` API 연동
- `judgment-coding` 서비스 타입 DB 함수 추가 (CRUD + 채팅)
- API 라우트 생성: `/api/judgment-coding/`, `/api/judgment-coding/[id]/`, `/api/judgment-coding/[id]/messages/`
- 관리자 페이지에 `judgment-coding` 서비스 타입 추가

**파일 다운로드 기능**
- `/api/projects/[id]/files/download` — Supabase signed URL로 개별 파일 다운로드
- `/api/projects/[id]/files/download-all` — 전체 파일 ZIP 압축 다운로드 (`archiver` 라이브러리)
- 프로젝트 페이지: 각 파일에 "다운로드" 버튼 + "전체 다운로드 (ZIP)" 버튼
- 관리자 의뢰 상세 모달: 첨부 파일 목록 표시 + 개별/전체 다운로드

**관리자 의뢰 Excel 내보내기**
- 의뢰 관리 탭: 필터된 전체 목록 Excel 다운로드 (`xlsx` 라이브러리)
- 의뢰 상세 모달: 개별 의뢰 정보 Excel 다운로드
- 필드명 한국어 매핑 포함

**보안: 로그인 체크 추가**
- 프로젝트 상세 페이지(`/project/[id]`): 비로그인 시 `/login`으로 리다이렉트
- 대시보드: 비로그인 시 의뢰 데이터 fetch 안 함 (통계 0 표시)

**사용자별 의뢰 필터링**
- 모든 의뢰 API에 `?email=` 쿼리 파라미터 지원 추가
- 대시보드에서 로그인 사용자 email로 필터 → 본인 의뢰만 표시
- 관리자(`/admin`)는 email 없이 전체 조회

**상태 4단계 체계 도입**
- 기존: pending → in_progress → completed (3단계)
- 변경: pending(접수 대기중) → received(접수 완료) → in_progress(작업 진행중) → completed(작업 완료)
- DB 타입, 관리자 페이지, 결과 페이지 7개 모두 반영

**판결문 수집 의뢰 페이지 개편**
- "사건번호로 검색" 탭 제거 (실사용 안 함)
- 키워드/조건 검색을 기본 단일 화면으로 통합
- 참고 파일 첨부 기능 추가 (사건번호 목록 파일 등)

**설문조사 의뢰 정리**
- "파일에서 설문 불러오기" 파싱 기능 제거 (에러 발생, 현재 접수만 하는 단계)

**대문 카피 수정**
- "연구의 시작부터 완성까지, 한 곳에서"
- "연구설계, 자료 생성, 데이터 변환, 통계분석, 문서 작성까지 하나의 플랫폼에서 쉽고 정확하게 진행하세요"

**CLAUDE.md 규칙 추가**
- 코드 변경 후 반드시 git add → commit → push origin main 자동 수행

### 주요 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/db.ts` | judgment-coding CRUD, email 필터링, 상태 4단계 타입 |
| `src/app/api/judgment-coding/` | 새 API 라우트 (의뢰/메시지) |
| `src/app/api/projects/[id]/files/download/` | 개별 파일 다운로드 API |
| `src/app/api/projects/[id]/files/download-all/` | ZIP 일괄 다운로드 API |
| `src/app/api/*/route.ts` (10개) | email 쿼리 파라미터 지원 |
| `src/app/admin/page.tsx` | 파일 목록/다운로드, Excel 내보내기, 상태 4단계 |
| `src/app/project/[id]/page.tsx` | 실제 의뢰 API 연동, 파일 다운로드, 로그인 체크 |
| `src/app/dashboard/page.tsx` | 비로그인 보호, email 필터링 |
| `src/app/judgment-collection/page.tsx` | 사건번호 탭 제거, 파일 첨부 추가 |
| `src/app/survey-request/page.tsx` | 파일 파싱 기능 제거 |
| `src/app/page.tsx` | 대문 카피 수정 |
| `src/app/*-results/page.tsx` (7개) | 상태 4단계 반영 |
| `CLAUDE.md` | push 규칙 추가 |
| `package.json` | archiver 라이브러리 추가 |

### 다음 할 일
- **관리자 페이지에서 대문 섹션 on/off 토글** — "왜 ResearchOn인가요?", "이용 절차" 등 섹션을 관리자가 껐다 켰다 가능하게 (DB 저장)
- 결과 예시/샘플 페이지 (서비스별 결과물 미리보기)
- Discord 웹훅 알림 (의뢰 접수 시 모바일 알림)
- 커스텀 도메인 설정

---

## 2026-04-09 작업 내용 (오전 세션)

### 완료된 작업

**로그인/UI 개선**
- 로그아웃 시 로그인 버튼 사라지는 버그 수정
- 로그인/사용자 정보를 대시보드 "환영합니다" 우측으로 이동
- 로그인 버튼 가시성 개선 (골드 배경 + 흰색 텍스트)

**AI 용어 전면 제거**
- "AI 기반", "AI 코딩", "AI 분석" → "전문가 기반" 서비스로 문구 통일
- 랜딩, 대시보드, 판결문, FAQ, 크레딧, 기초통계 등 8개 파일 수정

**랜딩페이지 강점 섹션 추가**
- "왜 ResearchOn인가요?" 섹션 (서비스/이용절차 사이)
- 합리적인 가격 / 검증된 품질 / 수정보완 보장 / 1:1 맞춤 소통 / 데이터 보안 / 빠른 처리

**연구 설계 폼 개선**
- 연구 유형 체크박스 추가 (학술논문 국내/국외, 학위논문 석사/박사, 연구보고서, 기타)

**파일 업로드 시스템 전면 개편**
- 모든 파싱/분류 로직 제거 (IPV 분류, PDF 텍스트 추출 등)
- Supabase Storage로 파일 저장 (Vercel 서버리스 호환)
- 원래 파일명은 file_uploads 테이블에 기록
- 모든 파일 형식 업로드 가능 (PDF, HWP, Excel, ZIP 등 제한 없음)

**프로젝트 페이지 전면 간소화**
- 사건 테이블 (번호/법원/사건번호/상태/전문확인) 제거
- 불필요한 버튼 제거 (전문 일괄확인, AI 코딩, 통계, Excel 내보내기)
- 드래그앤드롭 업로드 + 파일 목록 + 의뢰하기를 하나의 화면으로 통합

**드래그앤드롭 파일 첨부 추가 (3개 페이지)**
- 데이터 전처리 의뢰 (Excel, CSV, SPSS, Stata, R 파일)
- 질적분석 의뢰 (녹취록, 문서, 텍스트 파일)
- 계량분석 의뢰 (Excel, CSV, SPSS, Stata, R 파일)

**대시보드 통계 카드 개선**
- 접수/진행/완료 숫자 클릭 시 해당 상태의 결과 페이지로 바로 이동

**Supabase 테이블 추가**
- file_uploads 테이블 생성 (project_id, original_name, storage_path, size, content_type)
- Supabase Storage: uploads 버킷 사용

**SSH 원격 접속 환경 구성**
- Windows OpenSSH Server 설치, sshuser 계정 생성
- Termius 모바일 앱으로 PC 접속 성공
- claude.ai/code 웹앱으로 모바일 작업 가능 확인

---

## 내일 할 일 (2026-04-10)

### 1. 관리자 알림 시스템 (우선)
- 의뢰 접수 → Supabase DB에 저장 (프로젝트 의뢰 API 실제 연동)
- /admin 페이지에서 새 의뢰 목록 확인 가능하게
- Discord 웹훅으로 의뢰 접수 시 모바일 알림

### 2. 의뢰 흐름 완성
- 프로젝트 "의뢰하기" 버튼 → DB 저장 + Discord 알림
- 관리자가 의뢰 확인 → 상태 변경 (접수→진행→완료)
- 각 의뢰 페이지 파일 첨부 → Supabase Storage 실제 연동 (현재 UI만 있음)

### 3. 기타 검토
- 기초통계 페이지 크레딧 결제 흐름 (나중에)
- 커스텀 도메인 설정

---

## 2026-04-08 작업 내용

### 완료된 작업
- 툴팁 개선 (10개 서비스 페이지)
- Supabase DB 연동 (파일기반 JSON → PostgreSQL 전환)
- 로그인/회원가입 시스템 구현 (Supabase Auth)
- 대시보드 통계 카드 세분화 (접수/진행/완료)
- 랜딩 페이지 문구/로고 수정

### Supabase 설정
- 프로젝트: researchon (ozpqlxpiblptcyqaipvd)
- DB 테이블 9개 (projects, cases, dyads, service_requests, chat_messages, credits, credit_transactions, contact_inquiries, file_uploads)
- Storage: uploads 버킷
- RLS 정책: Allow all (서버사이드 API 전용)

### 사이트 URL
- researchon.vercel.app

### Vercel 환경변수
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (설정 완료)

---

## 새 PC에서 시작하기

```bash
git clone https://github.com/jskwon89/ipv-coder.git
cd ipv-coder
npm install
```

`.env.local` 파일 생성 필요:
```
NEXT_PUBLIC_SUPABASE_URL=https://ozpqlxpiblptcyqaipvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(Supabase 대시보드 > Settings > API > anon key)
SUPABASE_SERVICE_ROLE_KEY=(Supabase 대시보드 > Settings > API > service_role key)
```

키 확인: https://supabase.com/dashboard/project/ozpqlxpiblptcyqaipvd/settings/api

```bash
npm run dev
```
