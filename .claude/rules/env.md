# 환경 변수 규칙

환경별로 달라지는 설정값은 코드에 하드코딩하지 않고 Vite 환경 변수로 관리한다.

---

## 파일 위치

프로젝트 루트에 둔다.

```
Halo-CoreBridge-FE/
├── .env              ← 실제 값 (git 제외, .gitignore 등록 확인)
├── .env.example      ← 키 목록만 작성한 템플릿 (git 포함)
└── vite.config.ts
```

---

## 작성 규칙

- 클라이언트 코드에서 참조할 변수는 반드시 `VITE_` prefix 를 붙인다. prefix 없는 변수는 번들에 노출되지 않는다.
- 참조는 `import.meta.env.VITE_*` 형식만 사용한다. `process.env` 금지.

```properties
# .env
VITE_API_BASE_URL=http://localhost:8080
```

```properties
# .env.example — 값 없이 키만
VITE_API_BASE_URL=
```

```ts
// 사용 예
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
})
```

---

## 타입 선언

새 환경 변수를 추가하면 `env.d.ts` 에 타입을 함께 선언한다.

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## dev 프록시와의 관계

개발 환경에서는 `vite.config.ts` 의 프록시가 `/api` → `http://localhost:8080` 으로 전달하므로, api 인스턴스의 `baseURL` 은 빈 값이어도 동작한다. 프로덕션은 nginx 가 같은 역할을 한다 (`nginx.conf`).

- 백엔드 주소가 환경마다 달라지는 경우에만 `VITE_API_BASE_URL` 을 도입한다
- 프록시 대상 변경은 `vite.config.ts` 수정으로 처리하고, 하드코딩 값 변경 시 팀에 공유한다

---

## 주의 — FE 환경 변수는 공개된다

`VITE_*` 값은 **빌드 결과물(번들)에 그대로 포함되어 누구나 볼 수 있다.**

- API secret, 토큰, 계정 정보 등 비밀값 저장 절대 금지
- 비밀값이 필요한 로직은 백엔드로 옮긴다
- `.env` 에 넣어도 안전해지지 않는다 — `.env` 분리는 환경별 설정 관리 목적일 뿐

---

## 규칙 요약

- 환경별로 달라지는 값만 `VITE_*` 로 관리, 비밀값은 저장 금지
- 새 변수 추가 시 `.env`, `.env.example`, `env.d.ts` 세 파일을 함께 수정한다
- `.env` 는 git 제외, `.env.example` 은 git 포함
