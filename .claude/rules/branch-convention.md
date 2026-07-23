# 브랜치 컨벤션

## 브랜치 전략

```
main              ← 배포 스냅샷
dev               ← 기본 브랜치. 모든 작업 브랜치는 여기로 PR
 ├── feat/#191-interview-add
 ├── fix/#150-baseURL
 └── ...
```

- **작업 브랜치**: `dev` 기준으로 생성, 완료 후 `dev` 로 PR
- **dev**: 기본 브랜치. 직접 커밋 금지
- **main**: 배포 스냅샷. 작업 브랜치를 직접 머지하지 않는다

## 브랜치 네이밍

```
{타입}/#{이슈번호}-{브랜치명}
```

### 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 코드 개선 |
| `chore` | 빌드·설정·의존성 변경 |
| `docs` | 문서 작성·수정 |
| `test` | 테스트 코드 작성·수정 |

### 예시 (실제 이력 기반)

```
feat/#191-interview-add
feat/#160-admin-accounts
fix/#150-baseURL
fix/#131-login-failed
refactor/#158-role-view
chore/#141-favicon-tab
docs/#113-Readme-fix
```

- 브랜치명은 영문 소문자 + 하이픈. 작업 내용을 간결하게 표현한다.

## 브랜치 생성 명령

```bash
# dev 기준으로 브랜치 생성
git switch dev
git pull origin dev
git switch -c feat/#191-interview-add
```

## PR 방향

```
작업 브랜치 → dev    (기능 완료 후)
```
