# 검증 기록: 홈 원문 기사 미리보기 제거 및 로딩 경량화

## 검증 범위

- 홈 원문 기사 preview section 및 Articles API 조회 제거
- 홈 주요 이슈 목록과 `/topics` 이동 경로 유지
- `/articles`, `/search`의 기존 Articles API 및 article list 사용 유지
- 프론트엔드 lint, typecheck, production build, shell script syntax, diff 및 credential scan

## 실행한 Command

```bash
sed -n '1,280p' node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md
sed -n '1,280p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
sed -n '1,300p' node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
git diff -- app/page.tsx docs/ARCHITECTURE.md
git diff --check
rg -n '원문 기사 이어보기|최신 원문 기사|SUPPORTING SOURCES|SOURCE ARTICLES|3건 미리보기|getArticles|ArticleList' app/page.tsx
rg -n 'getArticles|ArticleList' app/articles/page.tsx app/search/page.tsx
rg -n '전체 주요 이슈 보기|href="/topics"' components/topics/TopicList.tsx
rg -n 'href="/articles"|/search' components/layout app/search/page.tsx app/articles/page.tsx
git status --short --branch
git diff --name-only
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
npm run lint
npm run typecheck
npm run build
npm run dev
```

## 결과

- Next.js 코드 변경 전 App Router의 linking/navigation, Server/Client Component, data fetching 로컬 가이드를 확인했다.
- 홈 article preview 제거 marker 검색: `app/page.tsx`에서 일치 항목 없이 종료되어 원문 기사 section, `getArticles`, `ArticleList` 참조가 제거된 것을 확인했다.
- `/articles`, `/search` marker 검색: 두 route에서 `getArticles`와 `ArticleList` 사용이 유지됨을 확인했다.
- 주요 이슈 archive 이동 marker 검색: `TopicList`의 `/topics` 및 `전체 주요 이슈 보기` link가 유지됨을 확인했다.
- Header 및 원문 탐색 marker 검색: Header 통합 검색 `/search`와 `/articles` 탐색 경로가 유지됨을 확인했다.
- `git diff --check`: 통과, whitespace 오류 없음.
- 변경 파일 확인: 애플리케이션 변경은 `app/page.tsx`, 구조 설명 변경은 `docs/ARCHITECTURE.md`로 제한됨. Branch workflow 문서는 untracked 상태로 존재함.
- Credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.
- 두 shell script의 `bash -n`: 통과, syntax 오류 없음.
- `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- `npm run build`: 통과, Next.js 16.2.7 production build 및 `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` route 생성 성공.
- `npm run dev`: Turbopack dev server가 190ms에 `Ready` 상태로 시작됨. 시작 로그에서 ChunkLoadError는 확인되지 않았으며 확인 후 종료함.

## 수동 브라우저 검증

- 수행하지 않음.

## 대기 중인 검증

- desktop/mobile 홈에서 원문 기사 preview section이 보이지 않고 주요 이슈 중심으로 자연스럽게 보이는지 확인
- 홈 하단 여백과 footer 표시 확인
- `/topics`의 archive 및 Topic 상세 이동 확인
- `/search?query=중동`의 주요 이슈·원문 결과 흐름 확인
- `/articles`의 원문 목록 및 filter 동작 확인
- 브라우저 console 신규 오류 및 Turbopack ChunkLoadError 재현 여부 확인
- `.next` 삭제 후 dev server 재실행을 통한 ChunkLoadError 재현 여부 확인
- deployment, production verification, PR merge

## 근거 메모

- 홈 Server Component는 Topics API 기반 `TopicList`만 렌더링하며 Articles API 조회와 article 전용 loading/error/empty state를 제거했다.
- `/articles`, `/search`, Articles API client, Topics API client, Header, `PageShell`은 변경하지 않았다.
- `/topics`, `/topics/[id]`, `/search`, `/articles` route 역할과 API contract를 변경하지 않았다.
- backend, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`, dependency를 변경하지 않았다.
- `.env.local`은 build 및 dev 환경으로 감지되었지만 읽거나 수정하거나 tracked file에 값을 기록하지 않았다.
- 실제 브라우저, deployment, production verification, PR merge는 수행하지 않았다.
