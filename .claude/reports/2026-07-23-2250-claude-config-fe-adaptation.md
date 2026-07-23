# .claude 설정 FE 적응 (picket → CoreBridge FE)

> 작성일: 2026-07-23 22:50
> 브랜치: dev

## 작업 요청 요약

picket BE에서 복사한 `.claude/` 구성(CLAUDE.md, rules, skills)을 CoreBridge FE 프로젝트에 맞게 재작성. 규칙 예시를 Java/Spring 기준에서 Vue 3 + TS 기준으로 교체하고, 리팩토링 목표 컨벤션으로 정의.

## 사전 계획

- 원본: picket BE `.claude/` (CLAUDE.md, rules 9개, skills 4개) — FE `.claude/`에는 `settings.local.json`만 존재
- 규칙 기준: 리팩토링 목표 상태 (사용자 확인)
- 테스트 규칙(testing.md, /test): 제외 — vitest 미도입 (사용자 확인)
- BE 전용 규칙(openapi, dto-layer, dto-create)은 `api-layer.md` 하나로 대체
- 브랜치 전략: staging 없음 → 작업 브랜치 → `dev` 직접 PR (원격 브랜치 이력으로 확인)

## 변경 파일 목록 (전부 신규 생성)

| 파일 | 요약 |
|------|------|
| `.claude/CLAUDE.md` | CoreBridge FE 개요, npm 명령어, src 구조, 아키텍처(axios/인증/SSE/Pinia) |
| `.claude/rules/coding-convention.md` | Vue/TS 네이밍, `<script setup>`, `*V2` 금지, console.log 금지, ROLES 상수 사용 |
| `.claude/rules/api-layer.md` | api/types 디렉토리 계약, `ApiResponse<T>` 단일화, 함수 형태 표준 (dto-layer + dto-create 대체) |
| `.claude/rules/error-handling.md` | 인터셉터/API 함수/호출부 3단 책임 분리, `isAxiosError` 패턴 |
| `.claude/rules/branch-convention.md` | staging 제거, `dev` 직접 PR, 실제 이력 기반 예시 |
| `.claude/rules/env.md` | Vite `VITE_*` 방식, `env.d.ts` 타입 선언, FE 번들 노출 경고 |
| `.claude/rules/task-driven-development.md` | 예시를 채용 도메인으로 교체, 검증 항목 FE화 |
| `.claude/skills/task/SKILL.md` | /test 단계 제거, /done만 참조 |
| `.claude/skills/done/SKILL.md` | gradlew → `npm run type-check` / `lint` / `build` |
| `.claude/skills/pr/SKILL.md` | base `staging` → `dev`, 체크리스트 FE화 |
| `.claude/skills/report-style.md` | picket에서 그대로 복사 (프로젝트 무관) |

## 실행 명령어

파일 생성 작업만 수행. 빌드·코드 변경 없음.

## 검증 결과

- 명령어가 `package.json` scripts와 일치 확인 (`dev`/`build`/`type-check`/`lint`/`format`)
- 규칙 예시가 실제 코드와 대조됨: `ROLES`(`constants/roles.ts`), `ApiResponse<T>`(`types/common/apiResponse.d.ts`), 잘못된 예(`getApplicantsList`, `*V2` 함수 — `api/resume/index.ts`), `BaseResponse<T>` 중복(`types/resume/ResumeTypes.ts:112`)
- grep으로 picket/gradlew/Java/Spring/staging 잔재 0건 확인

## 알려진 제약 / follow-up

- `Halo-CoreBridge-BE/.claude/`는 여전히 picket 내용 그대로 — 별도 적응 작업 필요
- 전역 `~/.claude/skills/open-api`는 BE 전용 (Spring Controller 기준) — 전역 공유 자원이라 미수정
- 테스트 규칙은 vitest 도입 시 `rules/testing.md` + `skills/test/` 추가 예정
- 코드 자체 리팩토링(V2 함수 제거, console.log 정리, `useLoadingStore.js` → `.ts`, `ResumeTypes.ts`의 `BaseResponse` 통합, `api/teck-stack` 디렉토리명)은 이 규칙을 기준으로 별도 진행
- 새로 만든 `.claude/CLAUDE.md`와 rules는 다음 세션부터 컨텍스트에 로드됨
