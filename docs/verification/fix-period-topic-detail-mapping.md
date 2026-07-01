# 검증 기록: 기간별 Topic 상세 페이지 API 매핑 정합성 수정

## 검증 범위
- Three-day/Weekly Topic 상세 API 응답 field mapping
- 기간 표시 field 선택
- 핵심 포인트와 관련 기사 배열 연결
- 관련 기사 개수 표시 기준
- null/invalid `published_at` 표시 문구
- frontend local lint/typecheck/build
- 변경 범위와 금지 영역 diff 확인

## 실행한 Command
- `sed -n '1,240p' AGENTS.md`
- `sed -n '1,260p' docs/ARCHITECTURE.md`
- `sed -n '1,260p' docs/RUNBOOK.md`
- `sed -n '1,260p' docs/prompts/codex-implement.md`
- `sed -n '1,520p' docs/tasks/fix-period-topic-detail-mapping.md`
- `find node_modules/next/dist/docs -maxdepth 3 -type f`
- `sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- `sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- `cat package.json`
- `rg -n "three-day-topics|weekly-topics|related_articles|articles|window_start|week_start|key_points" app components lib`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
- `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock Dockerfile k8s .github`
- `git status --short`
- `git diff --stat`
- `git diff --name-only`
- `git diff -- app/page.tsx components`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `git diff -U0 | rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`

## 결과
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과. Next.js 16.2.7 build가 성공했고 `/three-day-topics/[id]`, `/weekly-topics/[id]` route가 dynamic server-rendered route로 포함됨.
- `git diff --check`: 통과.
- `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock Dockerfile k8s .github`: 출력 없음. dependency, Dockerfile, K8s, GitHub workflow 변경 없음.
- `git diff --name-only`: 변경 tracked file은 `components/topics/PeriodTopicDetail.tsx`, `components/topics/TopicArticleList.tsx`, `lib/api/topics.ts`.
- `git diff --stat`: 3 files changed, 134 insertions(+), 19 deletions(-).
- `git diff -- app/page.tsx components`: 홈 `app/page.tsx` 변경 없음. component diff는 period detail count와 article list null 발행일/role 문구 변경만 확인.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 기존 문서, ignore rule, workflow secret 이름 reference, Kubernetes TLS Secret 이름, `package-lock.json`의 `js-tokens` package name 등 다수의 기존 reference가 탐지됨.
- `git diff -U0 | rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: match 없음. 이번 diff에 새 secret/env/private key 패턴 추가 없음.

## 수동 브라우저 검증
- 미수행.

## 대기 중인 검증
- 로컬 또는 운영 backend 연결 상태에서 `/three-day-topics/38` 브라우저 확인.
- 로컬 또는 운영 backend 연결 상태에서 `/weekly-topics/8` 브라우저 확인.
- Desktop 약 1440px, tablet 약 768px, mobile 약 375px에서 관련 기사 목록과 metadata 겹침/가로 overflow 확인.
- 기사 원문 링크 새 탭 동작 확인.
- API 응답 실데이터 기준 Three-day 관련 기사 4개, Weekly 관련 기사 11개 표시 확인.

## 근거 메모
- Next.js 코드 변경 전 `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `06-fetching-data.md`, `10-error-handling.md`를 확인했다.
- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, `.env`, `.env.*`는 수정하지 않았다.
- `git push`, `git merge`, production deploy command는 실행하지 않았다.
- `npm run build` 출력에서 `.env.local` 감지가 표시됐지만 해당 파일은 읽거나 수정하지 않았고 실제 값을 tracked file에 기록하지 않았다.
