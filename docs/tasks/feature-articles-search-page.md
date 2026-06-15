# 작업: Article 목록 검색 및 카테고리 페이지 MVP

## 목표

NewsLab 프론트엔드의 공용 header 검색창과 category navigation이 실제 기사 목록 탐색 화면으로 이어지도록 `/articles` 페이지를 구현한다.

42차까지는 `/topics` 주요 이슈 아카이브와 `/topics/{id}` 상세 페이지를 구현했다. 하지만 header의 검색창과 `전체`, `정치`, `경제`, `기술`, `세계`, `사회`, `AI` category navigation은 사용자가 보기에는 전체 뉴스 기사 탐색 기능처럼 보이지만, 실제로는 전용 article search/list 페이지가 없어서 UX가 끊겼다.

이번 작업의 목표는 다음과 같다.

- `/articles` 목록 route 추가
- `query` 기반 기사 검색
- `category` 기반 기사 필터
- header 검색 submit 시 `/articles?query=...`로 이동
- header category 클릭 시 `/articles?category=...`로 이동
- 기존 `/articles` backend API를 읽기 전용으로 사용
- loading / error / empty / success 상태 처리
- 42차에서 드러난 GitHub Actions build env 누락 보완

대상 API 후보:

```text
GET https://api.dev-scj.site/articles?page=1&page_size=10
GET https://api.dev-scj.site/articles?page=1&page_size=10&keyword=Anthropic
GET https://api.dev-scj.site/articles?page=1&page_size=10&category=tech
```

실제 query parameter 이름은 현재 backend API와 기존 frontend API client를 확인한 뒤 사용한다.  
백엔드 API 스펙은 이번 차수에서 변경하지 않는다.

## 프론트엔드 작업 범위

- `/articles` route 추가
  - Next.js App Router 기준 후보: `app/articles/page.tsx`
- 기존 Articles API client 확인 및 필요한 최소 확장
- Article 목록 컴포넌트 추가 또는 기존 최신 기사 목록 컴포넌트 재사용
- `query` search param 처리
- `category` search param 처리
- header 검색 form submit 동작을 `/articles?query=<검색어>`로 연결
- header category navigation을 `/articles?category=<category>`로 연결
- `/articles` 페이지에서 현재 검색어/category 상태 표시
- 결과 개수 표시
- loading / error / empty / success 상태 처리
- 기존 홈의 최신 기사 영역은 깨지지 않도록 유지
- 기존 `/topics`, `/topics/{id}` route는 변경하지 않음
- 기존 디자인 톤, spacing, typography, list/card 스타일 재사용
- GitHub Actions CI build 환경에 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 설정 추가

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Backend `/articles` API 스펙을 변경하지 않는다.
- DB index, migration, Supabase SQL을 추가하지 않는다.
- image 수집 또는 대표 이미지 표시는 구현하지 않는다.
- article 상세 페이지는 구현하지 않는다.
- 원문 HTML/raw text 전문을 프론트에 표시하지 않는다.
- topic 검색/날짜 필터 기능을 수정하지 않는다.
- provider/model/confidence/similarity score 노출 정책 정리는 이번 차수에서 하지 않는다.
- 새로운 UI library를 추가하지 않는다.
- 전역 CSS reset, root layout, theme, font 설정을 대규모로 변경하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.

## 예상 변경 파일

실제 프론트 구조를 먼저 확인한 뒤 결정한다.

예상 후보:

```text
app/articles/page.tsx
app/articles/loading.tsx
app/articles/error.tsx
components/articles/ArticleList.tsx
components/articles/ArticleCard.tsx
components/articles/ArticleSearchSummary.tsx
components/layout/SiteHeader.tsx
lib/api/articles.ts
.github/workflows/ci.yml
docs/tasks/<safe-branch>.md
docs/verification/<safe-branch>.md
docs/pr/<safe-branch>.md
docs/devlog/<safe-branch>.md
docs/ARCHITECTURE.md
docs/RUNBOOK.md
```

기존 홈에서 사용 중인 최신 기사 목록 컴포넌트가 있다면 우선 재사용한다.  
컴포넌트가 없고 `app/page.tsx` 안에 직접 구현되어 있다면, 재사용 가능한 article list/card 컴포넌트로 분리하는 것을 검토한다.

## 컴포넌트 / Route / API client 영향

### API client

기존 article fetch 함수 또는 API client를 먼저 확인한다.

현재 backend article 목록 API가 지원하는 query parameter를 실제 코드와 API 응답으로 확인한다.

예상 타입 후보:

```ts
type Article = {
  id: number;
  title: string;
  url: string;
  source: string;
  category: string | null;
  published_at: string | null;
  summary?: string | null;
  rss_summary?: string | null;
};

type ArticlesResponse = {
  items: Article[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};
```

정확한 필드명은 현재 API 응답과 기존 코드 기준으로 맞춘다.

API client 요구사항:

- `page`, `pageSize`를 인자로 받을 수 있어야 한다.
- `query` 또는 backend가 지원하는 keyword parameter를 받을 수 있어야 한다.
- `category` 또는 backend가 지원하는 category parameter를 받을 수 있어야 한다.
- HTTP 실패 시 error 상태로 전달한다.
- response shape가 예상과 다르면 error 상태로 처리한다.
- API base URL은 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 재사용한다.
- production API URL을 여러 곳에 하드코딩하지 않는다.

### Route / Page

Article 목록 page를 추가한다.

```text
/articles
/articles?query=Anthropic
/articles?category=tech
/articles?query=iran&category=world
```

페이지 역할:

- search params 읽기
- articles fetch
- 검색/category 상태 표시
- article 목록 렌더링
- empty/error/loading 상태 처리

### Header 검색 연결

`SiteHeader`의 검색 form을 실제 article search로 연결한다.

요구사항:

- 검색어 입력 후 submit 시 `/articles?query=<검색어>`로 이동한다.
- 검색어 앞뒤 공백을 제거한다.
- 빈 검색어 submit 시 `/articles` 또는 현재 정책에 맞는 기본 목록으로 이동한다.
- 기존 header 디자인을 크게 바꾸지 않는다.
- 검색창이 topic archive 내부 필터와 혼동되지 않도록, header 검색은 article 탐색용으로 동작한다.

### Header category navigation 연결

공용 header의 category navigation을 article category 페이지로 연결한다.

예상 매핑:

```text
전체 → /articles
정치 → /articles?category=politics
경제 → /articles?category=economy
기술 → /articles?category=tech
세계 → /articles?category=world
사회 → /articles?category=society
AI → /articles?category=ai
```

실제 backend category 값은 기존 `/articles` API와 DB 저장값을 확인한 뒤 맞춘다.  
만약 backend category 값이 한글이라면 한글 값을 사용하고, 영어 slug가 필요하면 frontend에서 mapping한다.

### Article 목록 UI

Article card/list에서 표시할 항목:

- category
- title
- source
- published_at
- summary 또는 rss_summary
- original url 이동 표시

원문 article URL은 외부 링크로 처리한다.

- `target="_blank"`
- `rel="noopener noreferrer"`

단, 기존 홈의 최신 기사 목록이 이미 기사 원문 링크 UX를 갖고 있다면 그 패턴을 따른다.

## 상태 처리

다음 상태를 반드시 처리한다.

### Loading

```text
기사를 불러오는 중입니다.
```

Next.js App Router 구조상 자연스럽다면 다음 파일을 검토한다.

```text
app/articles/loading.tsx
```

### Error

API 요청 실패 또는 response validation 실패 시 error state를 표시한다.

```text
기사 목록을 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

### Empty

검색/category 조건에 맞는 article이 없으면 empty state를 표시한다.

```text
조건에 맞는 기사가 없습니다.
검색어 또는 카테고리를 조정해보세요.
```

전체 목록 자체가 비어 있으면 다른 문구를 사용할 수 있다.

```text
아직 수집된 기사가 없습니다.
```

### Success

정상 응답이면 article 목록과 결과 개수를 표시한다.

예:

```text
전체 1355건 중 10건 표시
검색어: Anthropic
카테고리: 기술
```

## 스타일 / 반응형 / 접근성

스타일은 기존 프로젝트의 방식과 시각적 톤을 따른다.

- 기존 Tailwind/CSS module/plain CSS 등 실제 사용 중인 방식을 따른다.
- 새로운 UI library를 추가하지 않는다.
- 홈의 최신 기사 목록 디자인을 우선 재사용한다.
- 기존 색상, border, spacing, typography 패턴을 유지한다.
- `/articles` 페이지는 `/topics` archive, 홈, topic detail과 시각적으로 크게 어긋나지 않게 한다.
- 모바일에서 검색 상태, category 상태, article 목록이 세로로 자연스럽게 쌓이도록 한다.
- article title과 summary가 길어도 레이아웃을 깨지 않도록 한다.
- 검색 form에는 label 또는 접근 가능한 placeholder/aria-label을 제공한다.
- category navigation은 현재 route/search params에 맞는 active 상태를 표시하되 잘못된 `aria-current`를 표시하지 않는다.
- article 원문 링크는 접근 가능한 link text 또는 aria-label을 제공한다.
- keyboard로 검색 input, category navigation, article link를 이동할 수 있어야 한다.

## CI 수정

42차에서 `/topics` route가 추가되면서 GitHub Actions `npm run build`가 실패했다.

실패 원인:

```text
Error occurred prerendering page "/topics"
Error: Topics API base URL is not configured.
```

원인 분석:

- CI build 환경에 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`이 설정되어 있지 않다.
- 로컬에는 `.env.local` 등으로 값이 존재해 build가 통과했지만, GitHub Actions에는 `.env*`를 커밋하지 않기 때문에 값이 없다.
- `/topics` 고정 route가 build 중 Topics API client를 실행하면서 env 누락이 드러났다.

이번 작업에서 `.github/workflows/ci.yml`에 frontend build용 public API base URL을 설정한다.

허용 변경:

```yaml
env:
  NEXT_PUBLIC_NEWSLAB_API_BASE_URL: https://api.dev-scj.site
```

또는 repository variables를 사용하는 구조가 이미 있다면 다음 방식도 가능하다.

```yaml
env:
  NEXT_PUBLIC_NEWSLAB_API_BASE_URL: ${{ vars.NEXT_PUBLIC_NEWSLAB_API_BASE_URL }}
```

단, 이번 작업에서 GitHub repository variable 설정 자체는 수행하지 않는다.  
workflow 파일에 직접 public API base URL을 넣는 방식이 가장 단순하다.

주의사항:

- 이 값은 public frontend API base URL이며 secret 값이 아니다.
- secret, token, credential, API key는 추가하지 않는다.
- production deploy 설정은 변경하지 않는다.

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

Article 목록 API response 확인:

```bash
curl -sS "https://api.dev-scj.site/articles?page=1&page_size=10"
```

검색 API 동작 확인 후보:

```bash
curl -sS "https://api.dev-scj.site/articles?page=1&page_size=10&keyword=Anthropic"
```

카테고리 API 동작 확인 후보:

```bash
curl -sS "https://api.dev-scj.site/articles?page=1&page_size=10&category=tech"
```

실제 backend query parameter 이름이 다르면 현재 API에 맞게 수정한다.

로컬 route HTML marker 확인 후보:

```bash
npm run dev
curl -sS "http://localhost:3000/articles"
curl -sS "http://localhost:3000/articles?query=Anthropic"
curl -sS "http://localhost:3000/articles?category=tech"
```

확인할 marker 예시:

```text
기사 목록
조건에 맞는 기사
Anthropic
기술
BBC World
The Guardian World
```

CI workflow env 확인:

```bash
rg -n "NEXT_PUBLIC_NEWSLAB_API_BASE_URL|npm run build" .github/workflows
```

실행한 명령과 결과는 반드시 다음 파일에 기록한다.

```text
docs/verification/<safe-branch>.md
```

테스트 명령이 없거나 실행하지 않은 경우, 실행하지 않았다고 명확히 기록한다.

## 수동 브라우저 검증

로컬 개발 서버를 실행한다.

```bash
npm run dev
```

브라우저에서 확인한다.

검증 항목:

- `/articles` 페이지가 정상 로드된다.
- header 검색창에 검색어를 입력하고 submit하면 `/articles?query=...`로 이동한다.
- 검색 결과 article 목록이 표시된다.
- category navigation 클릭 시 `/articles?category=...`로 이동한다.
- category 결과 article 목록이 표시된다.
- 검색어와 category를 함께 적용할 수 있다면 동작을 확인한다.
- 검색/category 결과가 없을 때 empty state가 표시된다.
- article 원문 링크가 새 탭으로 열린다.
- 홈 `/`, `/topics`, `/topics/{id}`가 기존처럼 동작한다.
- 모바일 폭에서 header, article 목록, 상태 문구가 깨지지 않는다.
- keyboard로 검색창, category navigation, article link를 이동할 수 있다.
- 브라우저 console에 secret, token, credential 값이 노출되지 않는다.

실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

## 완료 조건

- `/articles` route가 추가되어 있다.
- `/articles` 페이지에서 article 목록을 볼 수 있다.
- header 검색 submit이 `/articles?query=...`로 연결된다.
- header category navigation이 `/articles?category=...`로 연결된다.
- article search/category 결과가 화면에 표시된다.
- loading / error / empty / success 상태가 처리되어 있다.
- 기존 홈, `/topics`, `/topics/{id}` route가 깨지지 않는다.
- GitHub Actions build 환경에 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`이 설정되어 있다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.
- backend, DB, K3s, Docker, Supabase SQL, secret, `.env` 관련 파일을 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/<safe-branch>.md`에 기록되어 있다.
- PR draft와 devlog draft가 실제 변경 사항과 검증 결과를 기준으로 작성되어 있다.
- production 배포 완료라고 주장하지 않는다.
- production verification은 사람이 제공한 로그가 있을 때만 완료로 기록한다.

## 참고 사항

42차에서 `/topics` 주요 이슈 아카이브를 구현했다.  
이번 43차는 header 검색/category navigation이 기대하는 article 탐색 화면을 연결하는 작업이다.

현재 관찰된 문제:

```text
GET /?query=Anthropic 200
```

검색 submit 시 root page query가 갱신되지만, 전용 article search/list page가 없어 사용자 기대와 맞지 않는다.

또한 GitHub Actions build에서 다음 오류가 확인되었다.

```text
Error: Topics API base URL is not configured.
```

이는 CI build env 누락 문제이며, 이번 43차에서 함께 보완한다.

이번 차수 이후 흐름:

```text
43차: Article 목록/검색/category 페이지 MVP
44차: 홈·Topics·Articles 탐색 UX 정리
45차 이후: 백엔드 topic pipeline 구조 고도화
```
