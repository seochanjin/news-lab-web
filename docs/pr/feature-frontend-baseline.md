## 작업 내용

- NewsLab Web 프론트엔드 MVP 개발을 시작하기 위한 Next.js baseline을 정리했다.
- 프론트엔드 전용 agent workflow, README, CI, 환경변수 예시, verification 문서를 추가했다.

## 주요 변경 사항

- `AGENTS.md`에 기존 Next.js generated warning block을 보존하고 프론트엔드 전용 규칙을 추가했다.
- `.github/workflows/ci.yml`에서 `npm ci`, lint, typecheck, build를 실행하도록 구성했다.
- `.env.example`에 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` placeholder를 추가했다.
- 홈 화면을 create-next-app 기본 화면에서 NewsLab Web placeholder로 변경했다.
- README를 NewsLab Web 로컬 개발 및 검증 기준으로 정리했다.

## 추가/변경된 API

- 없음.

## DB 변경 사항

- 없음.

## README 영향

- 로컬 설치, 환경변수, 검증 명령, 작업 범위 안내를 NewsLab Web 기준으로 업데이트했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" --glob '!node_modules/**' --glob '!.next/**' --glob '!package-lock.json'`

## 확인 결과

- lint, typecheck, build, whitespace check가 통과했다.
- credential pattern scan은 문서와 `.gitignore`의 `.env` 관련 안내만 탐지했으며 실제 secret 값은 확인되지 않았다.

## 비고

- Backend, DB, Supabase, K3s, Docker, production deployment는 변경하지 않았다.
- 로컬 작업 브랜치는 `feature/frontend-baseline`으로 적용 및 검증되었다.
