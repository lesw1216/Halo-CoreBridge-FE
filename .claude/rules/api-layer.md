# API 레이어 규칙

API 호출 함수와 타입의 위치·형태를 통일한다. 이 문서는 리팩토링 목표 컨벤션이다.

---

## 디렉토리 계약

```
src/api/{domain}/index.ts     ← API 호출 함수만 (axios 사용)
src/types/{domain}/*.ts       ← 해당 도메인의 Request/Response 타입
src/types/common/             ← 전역 공통 타입 (ApiResponse 등)
```

- **api 파일 안에 `interface` / `type` 정의 금지.** 타입은 반드시 `src/types/{domain}/` 에 두고 import 한다.

```ts
// 잘못된 예 — src/api/resume/index.ts 안에 타입 정의
export interface CoverLetterTitleResponse {
  id: number
  title: string
}

// 올바른 예 — src/types/resume/ResumeTypes.ts 에 정의 후 import
import type { CoverLetterTitleResponse } from '@/types/resume/ResumeTypes'
```

---

## 타입 네이밍

| 접미사 | 용도 | 예시 |
|--------|------|------|
| `*Request` | 요청 바디·폼 데이터 | `ResumeCreateRequest`, `JobPostingUpdateRequest` |
| `*Response` | 응답 페이로드 | `ResumeResponse`, `UserLoginResponse` |

- 백엔드 DTO 이름과 일치시킨다. FE에서 임의로 다른 이름을 만들지 않는다.
- 화면 전용 가공 타입이 필요하면 `*ViewModel` 등 별도 접미사로 구분하고 `types/` 에 둔다.

---

## 공통 응답 래퍼

백엔드 공통 응답은 전역 타입 `ApiResponse<T>` 하나만 사용한다 (`src/types/common/apiResponse.d.ts`).

```ts
interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  results: T
}
```

- **도메인 타입 파일에 같은 구조를 중복 정의하지 않는다.**
  (`types/resume/ResumeTypes.ts` 의 `BaseResponse<T>` 가 중복 정의 사례 — 발견 시 `ApiResponse<T>` 로 통합한다.)

---

## 함수 형태 표준

`async` + 제네릭 + `return response.data` 패턴 한 가지로 통일한다.

```ts
// 올바른 예
export const getResume = async (
  jobPostingId: number,
  resumeId: number,
): Promise<ResumeResponse> => {
  const response = await api.get<ResumeResponse>(
    `/api/jobposts/${jobPostingId}/applies/${resumeId}`,
  )
  return response.data
}
```

```ts
// 잘못된 예 — .then/.catch 로 기본값 객체를 만들어 반환
export const getApplicantsList = async (id: number): Promise<ApiResponse> => {
  let data: ApiResponse = { success: false, code: 0, message: '', results: undefined }

  await api
    .get(`/api/jobposts/${id}/applies`)
    .then((res) => { data = res.data })
    .catch((error) => { data = error.response.data })

  return data
}
```

잘못된 이유:

- 에러가 삼켜져 호출부가 성공/실패를 구분할 수 없다
- `let` 재할당 + 빈 기본값 객체는 타입 안전성을 깨뜨린다
- 도메인마다 반환 형태가 달라져 호출부 처리가 제각각이 된다

---

## 에러 처리 위치

- api 함수는 **에러를 잡지 않는다.** throw 된 에러는 그대로 전파한다.
- 401·5xx 같은 공통 처리는 `plugins/axiosInterceptor.ts` 의 response interceptor 에서 한다.
- 화면별 피드백(알림, 폼 에러 표시)은 호출부(컴포넌트·composable)의 `try-catch` 에서 한다.
- 상세 규칙은 `@rules/error-handling.md` 참조.

---

## 기타

- 모든 요청은 `plugins/axiosInterceptor.ts` 의 `api` 인스턴스를 사용한다. `axios` 직접 import 금지.
- multipart 업로드는 `FormData` + `Content-Type: multipart/form-data` 헤더를 명시한다 (`createResume` 참조).
- 파일 다운로드·미리보기는 `responseType: 'blob'` 을 사용한다 (`downloadPdf` 참조).
