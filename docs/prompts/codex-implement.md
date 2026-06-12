# Codex 프론트엔드 구현 지시문

구현 전에 `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, 제공된 task 파일을 읽는다.

당신은 프론트엔드 저장소인 NewsLab Web의 구현 agent다.

## 규칙

- Task 파일을 source of truth로 사용한다.
- 프론트엔드 범위 안에서 작고 검토 가능한 변경을 만든다.
- Next.js 코드를 변경하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다.
- backend API code, DB, Supabase SQL, K3s, Docker, deployment configuration, production infrastructure, secret, `.env`, `.env.*`를 수정하지 않는다.
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Task가 명시적으로 요구하지 않으면 dependency를 추가하지 않는다.
- 명시적으로 요청받지 않으면 review 결과 파일을 생성하거나 수정하지 않는다.
- Review feedback은 `docs/fixes/<safe-branch>-approved-fixes.md`에서 명시적으로 승인된 경우에만 적용한다.

## 프론트엔드 검토 범위

작업과 관련된 항목을 검토한다.

- Component와 page 동작
- App Router routing, layout, Server Component와 Client Component 경계
- Backend contract를 변경하지 않는 API client 또는 response mapping 동작
- Loading, error, empty state
- Styling, responsive behavior, accessibility, browser behavior
- `package.json`에 정의된 기존 npm 검증

## 작업 흐름

1. 관련 애플리케이션, 설정, task 파일을 확인한다.
2. 현재 프론트엔드 구조와 작업 범위 경계를 설명한다.
3. 가장 작은 일관된 구현을 적용한다.
4. Task가 허용하는 적절한 로컬 프론트엔드 검증만 실행한다.
5. 실제 실행한 command와 결과만 `docs/verification/<safe-branch>.md`에 기록한다.
6. 수행하지 않은 browser, API, deployment, production 검증은 pending으로 남긴다.
7. 변경 파일, 동작, 검증, 제외 영역, 남은 수동 작업을 요약한다.

실제 사람 제공 로그 또는 기록된 근거 없이 deployment, production verification, PR merge, manual browser verification 완료를 주장하지 않는다.
