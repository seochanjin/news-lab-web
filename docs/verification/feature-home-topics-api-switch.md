# 검증 기록: 홈 Topics API 전환 및 로딩 확인

## 검증 범위

- 홈(`/`) Topics data source를 `/topics/home`으로 전환한 frontend code 변경
- `/topics` archive, `/articles` route HTML marker 확인
- `/topics/home` 운영 API response shape 확인
- frontend lint, typecheck, build, diff whitespace, script syntax 확인
- secret/credential pattern scan

## 실행한 Command

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`
- `curl -sS https://api.dev-scj.site/topics/home | jq 'keys'`
- `curl -sS https://api.dev-scj.site/topics/home | jq '.items[0] | keys'`
- `curl -sS https://api.dev-scj.site/topics/home | jq '.items | length'`
- `curl -sS https://api.dev-scj.site/topics/home | jq '.items[0] | has("provider"), has("model"), has("confidence"), has("status"), has("articles")'`
- `git diff --check`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run dev`
- `curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"`
- `curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"`
- `curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"`
- `git status --short --branch`
- `git diff --stat`

## 결과

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과. Next.js 16.2.7 Turbopack build 성공, route summary에서 `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` 확인.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과. 동일하게 route build 성공.
- `/topics/home` API top-level keys: `generated_at`, `items`, `topic_date`.
- `/topics/home` first item keys: `article_count`, `id`, `keywords`, `source_count`, `summary_ko`, `title_ko`, `topic_date`.
- `/topics/home` items length: `10`.
- `/topics/home` first item internal fields: `provider`, `model`, `confidence`, `status`, `articles` 모두 `false`.
- `git diff --check`: 통과.
- `git grep ...`: 완료. 문서, ignore rule, 환경 변수명 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- `bash -n scripts/new_agent_task.sh`: 통과.
- `bash -n scripts/agent_next_step.sh`: 통과.
- `npm run dev`: `http://localhost:3000`에서 기동. 종료 전 access log: `GET / 200`, `GET /articles 200`, `GET /topics 200`.
- Local HTML marker curl: `/`, `/topics`, `/articles` 모두 exit code 0. 초기 sandbox-localhost curl은 escalated dev server에 접근하지 못해 `curl: (7) Failed to connect to localhost port 3000`으로 실패했고, 동일 권한 경계에서 재실행해 통과했다.
- `git status --short --branch`: `feature/home-topics-api-switch` branch 확인. 코드/doc 변경과 branch workflow 문서 untracked 상태 확인.
- `git diff --stat`: `components/topics/TopicCard.tsx`, `components/topics/TopicList.tsx`, `docs/ARCHITECTURE.md`, `lib/api/topics.ts` 변경 확인.

## 수동 브라우저 검증

- 미수행. 브라우저 UI, responsive viewport, browser console, keyboard navigation은 직접 완료로 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 `/`, `/topics`, `/topics/{id}`, `/search?query=...`, `/articles` 상호작용 확인.
- mobile/tablet/desktop viewport layout 확인.
- browser console runtime error/hydration mismatch 확인.
- production deploy, production domain, rollout 검증은 이번 task 범위 밖이며 미수행.

## 근거 메모

- Next.js 코드 변경 전 `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`, `05-server-and-client-components.md`, `10-error-handling.md`, `03-layouts-and-pages.md`를 확인했다.
- backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`는 수정하지 않았다.
- `npm run build` 출력은 로컬 `.env.local` 감지를 표시했지만 해당 파일은 수정하지 않았고 실제 값을 tracked file에 기록하지 않았다.

## 수동 브라우저 검증

- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run dev`로 local dev server 실행.

- 브라우저에서 `http://localhost:3000` 접속.

- `/` 홈에서 주요 이슈 카드가 정상 표시되는 것을 확인.

- 홈 topic card 클릭 시 `/topics/{id}` 상세 페이지로 이동하는 것을 확인.

- `/topics` archive 페이지가 기존대로 표시되는 것을 확인.

- `/topics/13` detail 페이지에서 topic 상세 및 연결 기사 목록이 표시되는 것을 확인.

- `/search?query=중동`에서 통합 검색 결과가 표시되는 것을 확인.

- `/articles`에서 원문 기사 목록이 표시되는 것을 확인.

- DevTools Console에서 API 전환으로 인한 runtime error 또는 hydration mismatch는 확인되지 않음.

주의:

- Turbopack ChunkLoadError가 발생한 경우, 이번 API 전환과 별도 dev server known issue로 기록한다.
