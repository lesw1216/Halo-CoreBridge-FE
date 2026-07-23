# CoreBridge FE

## 프로젝트 개요

CoreBridge는 채용 관리 플랫폼의 프론트엔드입니다. 채용 공고 등록·지원·면접·평가까지 채용 전 과정을 관리합니다.

- **역할 4종**: 관리자 / 채용 담당자 / 면접관 / 지원자 (`src/constants/roles.ts`)
- **Stack**: Vue 3.5 (Composition API, `<script setup lang="ts">`), TypeScript, Vite 7, Pinia 3 (+ persistedstate), Tailwind CSS 4, axios, vue-router 4
- **부가 라이브러리**: vue3-apexcharts(차트), pdfjs-dist(이력서 PDF 뷰어), lucide-vue-next(아이콘), vuedraggable(채용 절차 DnD)
- **인프라**: Docker + nginx, Kubernetes, Jenkins CI/CD (`infra/`)

## 빌드 및 실행 명령

```bash
# 개발 서버 (5173, /api → localhost:8080 프록시)
npm run dev

# 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build

# 린트 (oxlint → eslint 순서로 실행, --fix 포함)
npm run lint

# 포맷팅 (prettier, src/ 대상)
npm run format
```

테스트 프레임워크는 아직 도입되지 않았다. 빌드 검증은 `type-check` + `build` + `lint` 로 대신한다.

## 디렉토리 구조

```
src/
├── api/              # 도메인별 API 호출 함수 ({domain}/index.ts)
│   ├── auth/ user/ admin/
│   ├── jobposting/ publicjobposting/ recruit-process/
│   ├── applicant/ resume/ interview/ evaluation/
│   ├── schedules/ management/ teck-stack/ image/
├── components/       # 재사용 컴포넌트
│   ├── common/       # LoadingSpinner, PaginationComp 등 범용
│   ├── layout/       # SideBar, DashboardHeader
│   ├── recruiter-dashboard/  # 대시보드·면접 모달 등
│   ├── applicant/ notification/ pdf/ techstack/
├── composables/      # use* 훅 (notification SSE, schedules 등)
├── constants/        # roles, SidebarNavs 등 상수
├── plugins/          # axiosInterceptor.ts (공용 axios 인스턴스)
├── router/           # 라우트 정의 + 전역 가드
├── store/            # Pinia 스토어 (use*Store.ts)
├── types/            # 도메인별 타입 ({domain}/*.ts, common/)
└── views/            # 라우트 단위 페이지
```

## 아키텍처 핵심 사항

### API 호출 구조
- 모든 HTTP 요청은 `src/plugins/axiosInterceptor.ts`의 `api` 인스턴스를 사용한다 (`withCredentials`, 쿠키 기반 인증)
- 개발 환경에서는 Vite 프록시가 `/api` → `http://localhost:8080` 으로 전달 (`vite.config.ts`)
- 백엔드 응답은 전역 타입 `ApiResponse<T>` 래퍼 구조: `{ success, code, message, results }` (`src/types/common/apiResponse.d.ts`)
- API 레이어 규칙은 `@rules/api-layer.md`, 에러 처리는 `@rules/error-handling.md` 참조

### 인증·권한
- 로그인 상태는 `useUserStore` (Pinia, sessionStorage persist)
- 라우터 전역 가드(`router.beforeEach`)가 `meta.requiresAuth` + `meta.role` 로 접근 제어
- `/jobs` 계열은 공개, `/admin` 계열은 채용 담당자·관리자 등 권한 필요
- 역할 비교는 반드시 `ROLES` 상수 사용 (`src/constants/roles.ts`)

### 실시간 알림 (SSE)
- `src/composables/notification/useNotificationSSE.ts` 가 `/api/notifications/subscribe` 를 구독
- EventSource 싱글톤 + heartbeat 감시 + 지수 백오프 재연결 구조
- 수신 알림은 localStorage(`halo_notifications`)에 최대 30건 캐시

### 상태 관리
- Pinia setup 스토어 문법 (`defineStore('name', () => { ... })`)
- 세션 유지가 필요한 스토어만 `persist: { storage: sessionStorage }` 옵션 사용

## 리팩토링 방향

이 프로젝트는 컨벤션 정비 중이다. 규칙 문서는 **현재 코드가 아니라 목표 상태**를 정의한다.
기존 코드를 수정할 때는 아래 규칙에 맞게 함께 정리한다.

- 코딩 컨벤션: `@rules/coding-convention.md`
- API 레이어: `@rules/api-layer.md`
- 에러 처리: `@rules/error-handling.md`
- 브랜치 전략: `@rules/branch-convention.md`
- 환경 변수: `@rules/env.md`
- Task 기반 개발: `@rules/task-driven-development.md`
