# 작업: 홈 원문 기사 미리보기 제거 및 로딩 경량화

## 목표

홈(`/`) 화면에서 원문 기사 미리보기 영역을 제거하고, 첫 화면 렌더링에 필요한 데이터 조회를 주요 이슈 중심으로 줄인다.

44차에서 NewsLab의 탐색 구조를 다음처럼 정리했다.

```text
/          → 오늘의 주요 이슈 중심
/topics    → 전체 주요 이슈 아카이브
/search    → 주요 이슈 + 원문 통합 검색
/articles  → 원문 모음 전용 페이지
```

하지만 홈 하단에는 여전히 “원문 기사 이어보기 / 최신 원문 기사” 미리보기 영역이 남아 있다. 이 영역은 NewsLab의 핵심인 주요 이슈보다 원문 기사 목록을 다시 강조하고, 홈 Server Component에서 article preview까지 조회하게 만들어 첫 화면 렌더링 대기 시간을 늘릴 수 있다.

이번 작업의 목표는 홈의 역할을 더 명확히 하는 것이다.

```text
홈 = 오늘의 주요 이슈를 빠르게 확인하는 화면
원문 기사 = /articles 또는 /search에서 확인하는 보조 탐색 자료
```

따라서 홈에서는 원문 기사 목록 미리보기를 제거하고, 필요한 경우 `/articles`로 이동하는 간단한 링크만 남긴다.

## 프론트엔드 작업 범위

### 1. 홈 원문 기사 미리보기 section 제거

홈(`/`)에서 다음 영역을 제거한다.

```text
SUPPORTING SOURCES
원문 기사 이어보기
최신 원문 기사
3건 미리보기
원문 기사 list/card preview
```

요구사항:

- 홈에 원문 기사 목록 preview가 표시되지 않아야 한다.
- 홈의 핵심 콘텐츠는 “오늘의 주요 이슈”로 유지한다.
- 원문 모음으로 이동하는 경로는 필요하면 CTA/link 형태로만 남긴다.
- 원문 기사 자체를 삭제하는 것이 아니라, 홈에서만 preview를 제거한다.
- `/articles` page의 원문 모음 기능은 유지한다.
- `/search` page의 원문 모음 결과도 유지한다.

### 2. 홈 Server Component fetch 경량화

홈에서 원문 기사 preview를 표시하지 않는다면, 홈 렌더링 시 article preview를 가져올 필요도 없다.

요구사항:

- `app/page.tsx` 또는 홈 관련 Server Component에서 article preview 조회를 제거한다.
- 홈에서 `getArticles`, `ArticleList`, article preview용 API call이 필요 없으면 제거한다.
- 홈에서 필요한 데이터는 주요 이슈 목록 중심으로 최소화한다.
- `/articles`, `/search`에서 사용하는 Articles API client는 제거하지 않는다.
- 기존 API client contract는 변경하지 않는다.

### 3. 홈 정보 위계 정리

홈이 주요 이슈 중심으로 보이도록 하단 여백과 CTA를 정리한다.

요구사항:

- 원문 기사 preview 제거 후 화면 하단이 어색하지 않게 section 간격을 조정한다.
- “전체 주요 이슈 보기” 링크는 유지한다.
- 필요하면 “원문 모음 보기” 링크를 작게 제공한다.
- 홈에서 원문 기사가 주요 이슈보다 더 강조되어 보이면 안 된다.
- mock/demo 영역을 다시 추가하지 않는다.

### 4. Dev ChunkLoadError 기록

로컬 개발 중 Turbopack dev server에서 다음 오류가 반복 관찰되었다.

```text
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
```

이번 작업에서는 Turbopack 설정을 변경하지 않는다.

요구사항:

- `npm run build`가 통과하면 production blocker로 보지 않는다.
- `npm run dev`에서 여전히 ChunkLoadError가 재현되면 verification 문서에 known issue로 기록한다.
- 필요하면 후속 작업에서 `next dev --webpack` 우회 여부를 검토한다.
- Next.js 설정, bundler 설정, dependency 변경은 이번 차수에서 하지 않는다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- `/topics`, `/topics/{id}`, `/search`, `/articles`의 route 역할을 변경하지 않는다.
- Header navigation과 Header 검색 구조를 변경하지 않는다.
- 통합 검색(`/search`)의 topic/article 병합 로직을 변경하지 않는다.
- Articles API client를 삭제하지 않는다.
- Topic API client를 변경하지 않는다.
- API endpoint, query parameter, response schema를 변경하지 않는다.
- Redis, backend cache, server search endpoint를 구현하지 않는다.
- 날짜 필터, pagination, infinite scroll을 구현하지 않는다.
- 실제 광고, 실시간 이슈, 추천 side rail을 구현하지 않는다.
- 새 dependency를 추가하지 않는다.
- README를 불필요하게 수정하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.

## 예상 변경 파일

실제 구조 확인 후 최소 변경한다.

예상 후보:

```text
app/page.tsx
components/articles/ArticleList.tsx
components/articles/ArticleCard.tsx
components/layout/PageShell.tsx
docs/tasks/feature-home-article-preview-cleanup.md
docs/verification/feature-home-article-preview-cleanup.md
docs/reviews/feature-home-article-preview-cleanup-antigravity.md
docs/reviews/feature-home-article-preview-cleanup-coderabbit.md
docs/fixes/feature-home-article-preview-cleanup-approved-fixes.md
docs/pr/feature-home-article-preview-cleanup.md
docs/devlog/feature-home-article-preview-cleanup.md
```

주의:

- `components/articles/*`는 홈에서 import만 제거될 수도 있다.
- `/articles`와 `/search`에서 여전히 article components를 사용한다면 해당 컴포넌트는 삭제하지 않는다.
- `docs/ARCHITECTURE.md`는 이번 변경이 구조 설명에 영향을 줄 정도일 때만 수정한다.
- README는 설치/실행/dependency/API contract 변경이 없으면 수정하지 않는다.

## 컴포넌트 / Route / API client 영향

### Home route

대상:

```text
app/page.tsx
```

요구사항:

- 홈에서 원문 기사 preview section을 제거한다.
- 홈에서 article preview API call을 제거한다.
- 홈은 주요 이슈 section 중심으로 유지한다.
- 전체 주요 이슈 보기(`/topics`) link를 유지한다.
- 필요하면 원문 모음(`/articles`) link를 CTA 수준으로만 남긴다.
- 홈의 loading/error/empty 처리는 주요 이슈 기준으로 자연스럽게 유지한다.

### Article components

대상 후보:

```text
components/articles/ArticleList.tsx
components/articles/ArticleCard.tsx
```

요구사항:

- 홈에서 사용하지 않게 되더라도 `/articles`와 `/search`에서 사용 중이면 유지한다.
- 홈 전용 article preview prop이나 wrapper가 있다면 제거할 수 있다.
- article component의 public behavior는 변경하지 않는다.

### API client

대상 후보:

```text
lib/api/articles.ts
lib/api/topics.ts
```

요구사항:

- 홈에서 article preview fetch를 제거하더라도 Articles API client는 유지한다.
- `/articles`와 `/search`에서 쓰는 `getArticles` 동작은 변경하지 않는다.
- Topic API client 동작은 변경하지 않는다.
- API response validation을 약화하지 않는다.

### PageShell / Layout

대상 후보:

```text
components/layout/PageShell.tsx
```

요구사항:

- 원문 기사 preview 제거 후 홈 하단 여백이 어색하면 layout spacing만 최소 조정한다.
- 공통 960px 중심 container 기준은 유지한다.
- side rail slot 구조는 유지한다.
- Header 구조는 변경하지 않는다.

## 상태 처리

### Home

홈에서 표시해야 할 상태는 주요 이슈 기준으로 유지한다.

대상 상태:

```text
loading
error
empty
success
```

요구사항:

- 원문 기사 preview 제거로 인해 article loading/error state가 홈에 남지 않아야 한다.
- 주요 이슈 로딩/에러/빈 상태는 기존처럼 자연스럽게 표시한다.
- 홈에서 Articles API 실패가 홈 전체 실패로 이어지면 안 된다.
- 홈에서 더 이상 Articles API를 호출하지 않는다면 article error 상태도 존재하지 않아야 한다.

### Articles/Search

요구사항:

- `/articles`의 loading/error/empty/success 상태는 변경하지 않는다.
- `/search`의 topic/article result, empty, partial failure 처리는 변경하지 않는다.
- `/topics`, `/topics/{id}` 상태 처리는 변경하지 않는다.

## 스타일 / 반응형 / 접근성

### 스타일

- 기존 NewsLab visual tone을 유지한다.
- 홈 하단 원문 기사 preview 제거 후 section 간격을 정리한다.
- 주요 이슈 section이 화면에서 가장 중요한 영역으로 보이게 한다.
- `/articles`로 이동하는 link를 남길 경우 과하게 강조하지 않는다.
- mock/demo 영역을 다시 추가하지 않는다.

### 반응형

- desktop/mobile에서 홈 하단이 비어 보이지 않도록 spacing을 확인한다.
- card grid가 기존처럼 자연스럽게 유지되어야 한다.
- Header, PageShell, navigation은 변경하지 않는다.
- side rail slot은 기존 responsive 동작을 유지한다.

### 접근성

- 제거된 article preview로 인해 의미 없는 빈 section heading이 남지 않아야 한다.
- `/articles` link를 남길 경우 접근 가능한 link text를 제공한다.
- 기존 Topic card link/focus style을 유지한다.
- Header navigation의 `aria-current` 동작은 변경하지 않는다.
- 외부 원문 기사 link 접근성은 `/articles`와 `/search`에서 기존대로 유지한다.

## 검증 Command

실제 package manager와 package.json scripts를 먼저 확인한다.

필수 후보:

```bash
npm run lint
npm run typecheck
npm run build
```

필수 검증:

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

변경 범위 확인:

```bash
git diff --name-only
git status --short --branch
```

홈에서 article preview 제거 확인 후보:

```bash
rg -n "원문 기사 이어보기|최신 원문 기사|SUPPORTING SOURCES|SOURCE ARTICLES|3건 미리보기|getArticles|ArticleList" app/page.tsx components
```

주의:

- `getArticles`, `ArticleList`는 `/articles`, `/search`에서 계속 사용될 수 있다.
- 위 명령에서 `/articles` 또는 `/search` 관련 파일에 남는 것은 정상일 수 있다.
- 핵심은 `app/page.tsx` 또는 홈 전용 컴포넌트에서 제거되었는지 확인하는 것이다.

Route 관련 marker 확인 후보:

```bash
rg -n "/articles|/topics|/search|전체 주요 이슈|원문 모음" app components
```

Credential scan:

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

Dev server 확인 후보:

```bash
npm run dev
```

필요 시 Turbopack known issue 확인:

```bash
rm -rf .next
npm run dev
```

단, `rm -rf .next`는 필요할 때만 수행하고 실제 수행 여부를 verification 문서에 기록한다.

검증 결과는 반드시 다음 파일에 기록한다.

```text
docs/verification/feature-home-article-preview-cleanup.md
```

실행하지 않은 명령은 실행하지 않았다고 명확히 적는다.

## 수동 브라우저 검증

로컬 개발 서버를 실행한다.

```bash
npm run dev
```

브라우저에서 확인한다.

대상 route:

```text
/
 /topics
 /search?query=중동
 /articles
```

확인 항목:

### Home

- 홈 화면이 “오늘의 주요 이슈” 중심으로 보인다.
- “원문 기사 이어보기” section이 표시되지 않는다.
- “최신 원문 기사 3건 미리보기”가 표시되지 않는다.
- 홈에서 원문 기사 list preview가 없다.
- 필요 시 `/articles`로 이동하는 link만 작게 남아 있다.
- 홈 하단 여백이 어색하지 않다.
- 첫 화면 로딩 체감이 이전보다 무거워 보이지 않는다.

### Topics

- `/topics`는 전체 주요 이슈 아카이브로 유지된다.
- topic card → detail 이동 구조가 유지된다.

### Search

- `/search?query=중동`에서 주요 이슈가 먼저 표시된다.
- 검색된 주요 이슈의 연결 원문 기사 또는 직접 검색 결과가 원문 모음에 표시된다.
- 44차 통합 검색 구조가 깨지지 않는다.

### Articles

- `/articles`에서 원문 모음이 기존처럼 표시된다.
- 원문 기사 list component가 `/articles`에서는 정상 동작한다.

### Console / Dev server

- 브라우저 console에 새로 추가된 오류가 없는지 확인한다.
- Turbopack ChunkLoadError가 여전히 발생하면 known issue로 기록한다.
- 실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

## 완료 조건

- 홈(`/`)에 “원문 기사 이어보기” section이 더 이상 표시되지 않는다.
- 홈에 최신 원문 기사 3건 preview가 표시되지 않는다.
- 홈에서 article preview fetch가 제거되어 있다.
- 홈은 주요 이슈 중심 화면으로 보인다.
- `/articles`에서 원문 모음 기능은 유지된다.
- `/search`에서 원문 결과 섹션은 유지된다.
- `/topics`와 `/topics/{id}` 기능이 깨지지 않는다.
- Header navigation과 통합 검색 구조가 깨지지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.
- shell script syntax 검증과 `git diff --check`가 통과한다.
- backend, DB, Supabase SQL, K3s, Docker, production infra, secret, `.env*`를 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/feature-home-article-preview-cleanup.md`에 기록되어 있다.
- Turbopack ChunkLoadError 재현 여부는 확인한 범위만 기록한다.
- production deploy, production verification, PR merge 완료를 실제 수행 전에는 주장하지 않는다.

## 참고 사항

44차에서 NewsLab의 프론트 탐색 구조는 다음처럼 정리되었다.

```text
/          → 오늘의 주요 이슈 중심
/topics    → 전체 주요 이슈 아카이브
/search    → 주요 이슈 + 원문 통합 검색
/articles  → 원문 모음 전용 페이지
```

이번 작업은 이 구조를 유지하면서 홈의 역할을 더 명확히 하는 소형 정리 작업이다.

원문 기사를 숨기는 것이 아니라, 홈에서 미리보기를 제거하고 `/articles`와 `/search`로 역할을 분리한다.

백엔드 성능 개선이나 Redis 캐싱은 이번 작업에서 하지 않는다.  
로딩 문제가 계속되면 후속 백엔드 작업에서 다음 항목을 검토한다.

```text
- backend /search endpoint
- recent topics/articles response cache
- Redis cache
- topic detail response cache
- API response time measurement
```

후속 후보:

```text
- 홈/검색 실제 브라우저 성능 측정
- Turbopack dev ChunkLoadError 우회 검토
- Backend 통합 검색 endpoint 설계
- Redis response cache MVP
- Topic 품질 개선
```
