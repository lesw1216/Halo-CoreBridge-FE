# 에러 처리 규칙

에러 처리 책임을 세 곳으로 나눈다. 이 문서는 리팩토링 목표 컨벤션이다.

| 위치 | 책임 |
|------|------|
| `plugins/axiosInterceptor.ts` | 전역 공통 처리 (401, 5xx) |
| api 함수 (`src/api/`) | 처리하지 않음 — 에러를 그대로 전파 |
| 컴포넌트·composable | 화면별 사용자 피드백 |

---

## 1. api 함수 — 에러를 삼키지 않는다

api 함수 내부에서 `try-catch` 로 에러를 잡아 기본값을 반환하는 패턴 금지.
호출부가 실패를 알 수 없게 된다.

```ts
// 잘못된 예 — 에러를 삼키고 빈 객체 반환
export const searchApplicants = async (...): Promise<ApiResponse> => {
  try {
    const response = await api.post(url, params)
    return response.data
  } catch (error: any) {
    console.error('Search error:', error)
    return { success: false, code: 0, message: '', results: undefined }
  }
}

// 올바른 예 — 그대로 전파
export const searchApplicants = async (
  jobPostingId: number,
  params: ApplicantSearchRequest,
): Promise<ApiResponse<ApplicantSearchResponse>> => {
  const response = await api.post<ApiResponse<ApplicantSearchResponse>>(
    `/api/jobposts/${jobPostingId}/applies/search`,
    params,
  )
  return response.data
}
```

---

## 2. 인터셉터 — 전역 공통 처리

횡단 관심사는 `axiosInterceptor.ts` 의 response interceptor 한 곳에 모은다.
(현재 인터셉터는 주석 뼈대만 있는 상태 — 아래 방향으로 채우는 것이 리팩토링 목표)

- `401` → 세션 만료 처리 후 로그인 페이지로 이동 (`useUserStore.logout()`)
- `5xx` → 공통 오류 안내
- 그 외 상태 코드는 화면 로직이 판단하도록 그대로 reject

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // 세션 만료 — 로그인으로 이동 (스토어 순환 참조 주의: 함수 내부에서 import)
    }

    return Promise.reject(error)
  },
)
```

---

## 3. 호출부 — 화면별 피드백

컴포넌트·composable에서 `try-catch` 로 감싸고 사용자에게 피드백한다.

```ts
const submitResume = async () => {
  isSubmitting.value = true

  try {
    await createResume(jobPostingId, form.value, file.value)
    router.push(`/jobs/${jobPostingId}`)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
```

### 백엔드 에러 메시지 활용

백엔드는 `ApiResponse` 형태(`{ success, code, message }`)로 에러를 내려준다.
`message` 를 우선 사용하고, 없으면 공통 문구로 대체한다.

```ts
import { isAxiosError } from 'axios'

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiResponse>(error)) {
    return error.response?.data?.message ?? '요청 처리 중 오류가 발생했습니다.'
  }
  return '요청 처리 중 오류가 발생했습니다.'
}
```

---

## 금지 사항

- `catch (error: any)` — `unknown` 으로 받고 `isAxiosError` 로 좁힌다
- 에러를 잡고 아무것도 하지 않는 빈 `catch`
- `alert()` 남발 — 폼 인라인 메시지나 공통 알림 컴포넌트를 우선 사용. 임시로 쓴 `alert` 는 리팩토링 시 교체한다
- 에러 상황에서 `console.log` — 기록이 필요하면 `console.error` 사용
