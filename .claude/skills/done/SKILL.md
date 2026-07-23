---
name: done
description: 현재 진행 중인 task를 마무리한다.
---

type-check → lint → 빌드 확인 → task 파일 완료 처리 → git commit 순서로 실행한다.

## 실행 순서

### 1. 타입 체크

```bash
npm run type-check
```

타입 오류 시 중단하고 오류를 보고한다. 커밋하지 않는다.

### 2. 린트

```bash
npm run lint
```

`--fix` 로 자동 수정된 파일이 있으면 변경 내용을 확인하고 스테이징 대상에 포함한다.
자동 수정되지 않는 오류가 남으면 중단하고 보고한다.

### 3. 빌드 확인

```bash
npm run build
```

빌드 실패 시 중단하고 오류를 보고한다. 커밋하지 않는다.

### 4. task 파일 완료 처리 및 TodoWrite 동기화

`docs/tasks/` 에서 현재 작업 중인 task 파일을 찾아 아래를 수행한다.

- 모든 항목을 `- [x]` 로 변경
- 완료일 추가 (`> 완료일: YYYY-MM-DD`)

task 파일 수정 후 TodoWrite도 동일하게 모든 항목을 `completed` 로 업데이트한다.

완료된 task 파일 예시:

```markdown
# 공고 등록 화면

> 생성일: 2026-07-23
> 완료일: 2026-07-23
> 브랜치: feat/#210-job-posting-form

## Tasks

- [x] JobPostingCreateRequest 타입 작성 (types/jobposting)
- [x] createJobPosting API 함수 작성 (api/jobposting)
- [x] JobForm 컴포넌트 작성
- [x] 라우트 등록 및 권한(meta.role) 설정
- [x] type-check · lint 통과 확인
- [x] 빌드 확인
```

### 5. git commit

전역 commit 스킬(`@~/.claude/skills/commit/SKILL.md`)에 위임한다.
task 파일 변경사항도 함께 스테이징 대상에 포함한다.

## 주의사항

- type-check·lint·빌드 중 하나라도 실패하면 즉시 중단한다. 사용자 확인 없이 다음 단계로 넘어가지 않는다.
- task 파일이 없으면 사용자에게 알리고 커밋만 진행할지 확인한다.
- 완료일 기록 없이 커밋하지 않는다.
