# 코딩 컨벤션

이 문서는 리팩토링 목표 컨벤션이다. 기존 코드가 이 규칙과 다르면, 해당 파일을 수정할 때 함께 정리한다.

---

## 파일·네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase `.vue` | `JobPostingRow.vue`, `ApplicantListCard.vue` |
| 뷰(라우트 페이지) | PascalCase + `View` 접미사 | `LoginView.vue`, `ApplicantDetailView.vue` |
| composable | `use*.ts` | `useNotificationSSE.ts` |
| Pinia 스토어 | `use*Store.ts` | `useUserStore.ts`, `useSidebarStore.ts` |
| API 모듈 | `src/api/{domain}/index.ts` | `src/api/jobposting/index.ts` |
| 타입 | `src/types/{domain}/` 아래 PascalCase | `src/types/resume/ResumeTypes.ts` |

- **신규 파일은 `.ts`만 사용한다.** `.js` 금지. 잔존 `.js` 파일(`store/useLoadingStore.js` 등)은 수정할 일이 생기면 `.ts` 로 전환한다.
- 디렉토리명 오타는 발견 시 이슈로 남긴다 (`api/teck-stack` → `tech-stack` 이 맞으나 import 경로 일괄 수정이 필요하므로 별도 작업으로 처리).

---

## 컴포넌트 작성

- `<script setup lang="ts">` 고정. Options API 금지.
- `defineProps` / `defineEmits` 는 타입 기반 선언을 사용한다.

```vue
<script setup lang="ts">
// 올바른 예 — 타입 기반 선언
const props = defineProps<{
  jobPostingId: number
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', resumeId: number): void
}>()
</script>
```

```ts
// 잘못된 예 — 런타임 객체 선언
defineProps({
  jobPostingId: { type: Number, required: true },
})
```

- 라우트 컴포넌트는 `views/`, 재사용 컴포넌트는 `components/` 에 둔다. `components/` 안의 컴포넌트가 특정 화면 전용이면 해당 도메인 하위 디렉토리에 둔다 (`components/recruiter-dashboard/interview/`).

---

## API 함수 네이밍

같은 동작은 같은 동사로 통일한다.

| 동작 | 권장 동사 | 예시 |
|------|-----------|------|
| 조회 (단건·목록) | `get*` | `getResume`, `getResumeList` |
| 생성 | `create*` | `createResume` |
| 수정 | `update*` | `updateResume` |
| 삭제 | `delete*` | `deleteResume` |
| 검색 | `search*` | `searchApplicants` |

- **`*V2` 같은 버전 접미사 금지.** 백엔드 경로가 바뀌면 기존 함수를 수정하고 호출부를 함께 갱신한다. 구버전 함수를 남겨두지 않는다.

```ts
// 잘못된 예 — 구버전과 신버전이 공존
export const updateResume = async (...) => { ... }
export const updateResumeV2 = async (...) => { ... }

// 올바른 예 — 함수는 하나, 경로 변경 시 호출부까지 함께 수정
export const updateResume = async (
  jobPostingId: number,
  resumeId: number,
  request: ResumeUpdateRequest,
): Promise<void> => {
  await api.patch(`/api/jobposts/${jobPostingId}/applies/${resumeId}`, request)
}
```

---

## Boolean 네이밍

`boolean` 을 반환하는 함수·변수는 `is*` / `has*` / `can*` 중 하나로 시작한다. `check*` 금지.

```ts
// 올바른 예
const isLogin = ref(false)
const isApplicant = () => userInfo.value.role === ROLES.APPLICANT
const hasAttachment = (resume: ResumeResponse) => resume.fileUrl !== null

// 잘못된 예
const checkLogin = () => ...   // → isLogin
const applied = ref(false)     // → isApplied
```

---

## 매직 문자열 금지

역할·상태 등 반복 사용되는 문자열은 `src/constants/` 의 상수를 사용한다.

```ts
// 잘못된 예 — 문자열 하드코딩
if (userInfo.value.role === '지원자' || userInfo.value.role === 'ROLE_APPLICANT') { ... }

// 올바른 예 — ROLES 상수 사용
import { ROLES } from '@/constants/roles'

if (userInfo.value.role === ROLES.APPLICANT) { ... }
```

---

## console 사용

- **`console.log` 금지.** 디버깅용 로그는 작업이 끝나면 제거한다.
- 예외 상황 기록이 필요한 곳만 `console.error` / `console.warn` 을 허용한다 (SSE 재연결 실패, localStorage 저장 실패 등).
- 주석 처리된 `console.log` 도 남기지 않는다.

---

## 주석·JSDoc

- 주석은 "왜"를 설명하는 것만 작성한다. 코드를 그대로 반복하는 주석 금지.
- export 되는 API 함수·composable에는 한국어 한 줄 JSDoc을 작성한다. 파라미터가 이름만으로 자명하면 `@param` 생략 가능.

```ts
/**
 * 공고에 제출된 이력서 목록을 조회한다.
 */
export const getResumeList = async (jobPostingId: number): Promise<ResumeResponse[]> => { ... }
```

---

## 문맥별 공백 구분

논리적으로 다른 작업 사이에는 빈 줄을 넣어 가독성을 높인다.

```ts
const submitResume = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const resumeId = await createResume(jobPostingId, form.value, file.value)
    router.push(`/jobs/${jobPostingId}/applies/${resumeId}`)
  } finally {
    isSubmitting.value = false
  }
}
```

---

## 함수 길이

함수(컴포넌트 메서드, composable 내부 함수 포함)가 한 화면을 넘어가면 의미 단위로 추출한다.
특히 `views/` 의 거대 컴포넌트는 로직을 composable로, 마크업을 하위 컴포넌트로 분리하는 방향으로 리팩토링한다.
