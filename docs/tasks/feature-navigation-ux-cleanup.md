# 작업: NewsLab 탐색 구조 및 레이아웃 정리

## 목표

NewsLab 프론트엔드의 홈, 주요 이슈, 주요 이슈 상세, 원문 기사 탐색 화면이 하나의 서비스처럼 자연스럽게 이어지도록 탐색 구조와 레이아웃을 정리한다.

40차에서 홈에 Topics API를 연결했고, 41차에서 Topic 상세 페이지를 구현했으며, 42차에서 주요 이슈 아카이브(`/topics`)와 검색/날짜 필터를 추가했다. 43차에서는 원문 기사 탐색 페이지(`/articles`)와 header 검색/category navigation을 연결했다.

이번 44차의 목표는 새 기능을 크게 추가하는 것이 아니라, 실제 사용하면서 불편했던 다음 문제를 정리하는 것이다.

- Header navigation의 역할이 불명확함
- `정치`, `경제`, `사회` 등 데이터가 없는 category가 header에 노출됨
- Header 검색과 `/topics` 내부 필터의 역할이 혼동됨
- 홈, `/topics`, `/topics/{id}`, `/articles`의 container 너비와 카드 밀도가 다르게 보임
- 작은 화면에서 `뉴스를 한눈에` tagline이 세로로 깨짐
- 홈에 남아 있는 mock keyword / group preview 영역이 실제 서비스 신뢰도를 떨어뜨림
- 원문 기사 목록이 NewsLab의 핵심인 topic summary보다 과도하게 강조될 수 있음
- 추후 광고, 실시간 이슈, 보조 패널을 붙일 수 있는 좌우 side rail 구조가 없음

이번 작업의 중심 방향은 다음과 같다.

```text
NewsLab의 핵심 콘텐츠 = 자동 생성된 주요 이슈와 요약
원문 기사 = 검색/카테고리 탐색 및 topic의 근거 자료
```

따라서 화면 구조도 “주요 이슈 중심”으로 정리하고, 원문 기사는 보조 탐색 흐름으로 분리한다.

## 프론트엔드 작업 범위

### 1. Header navigation 단순화

공용 header navigation을 기존 category 중심 구조에서 서비스 구조 중심으로 정리한다.

현재 구조:

```text
전체 / 정치 / 경제 / 기술 / 세계 / 사회 / AI
```

변경 후보:

```text
주요 이슈 / 원문 모음
```

또는 실제 구현 상황에 맞게 다음과 같이 최소 구성한다.

```text
주요 이슈 → /topics
원문 모음 → /articles
```

요구사항:

- Header에서 `정치`, `경제`, `기술`, `세계`, `사회`, `AI` category navigation을 제거하거나 `/articles` 내부 필터 영역으로 내린다.
- 데이터가 거의 없는 category를 top-level navigation에 노출하지 않는다.
- Header의 `전체`가 홈인지 전체 기사인지 헷갈리지 않도록 제거하거나 명확한 label로 변경한다.
- Header 검색창은 원문 기사 검색의 진입점으로 유지한다.
- `/topics` 내부 검색은 topic archive 내부 필터로 유지하되, header 검색과 역할이 겹치지 않도록 문구와 배치를 정리한다.
- Header logo는 홈(`/`)으로 이동하게 유지한다.

### 2. Header tagline 깨짐 수정

작은 화면 또는 좁은 viewport에서 `뉴스를 한눈에` 문구가 세로로 깨지는 문제를 수정한다.

요구사항:

- `뉴스를 한눈에` tagline은 제거하거나, 충분한 너비 이상에서만 표시한다.
- 작은 화면에서 tagline이 세로로 줄바꿈되지 않아야 한다.
- Header logo, 검색창, navigation이 깨지지 않아야 한다.
- Header의 높이와 간격이 과도하게 커지지 않아야 한다.

권장 방향:

```text
NewsLab logo만 기본 노출
tagline은 제거 또는 md 이상에서만 표시
```

### 3. 공통 layout/container 정리

홈, `/topics`, `/topics/{id}`, `/articles`의 좌우 너비와 본문 배치를 통일한다.

요구사항:

- 공통 container max-width를 정한다.
- 페이지별로 본문 폭이 크게 다르게 보이지 않게 한다.
- Hero, section header, card grid, article list의 좌우 정렬 기준을 맞춘다.
- 기존 화면의 주요 스타일 톤은 유지한다.
- 필요하면 공통 layout component를 추가한다.

후보 컴포넌트:

```text
components/layout/PageShell.tsx
components/layout/PageContainer.tsx
components/layout/ContentShell.tsx
components/layout/SideRailLayout.tsx
```

### 4. Side rail 구조 준비

추후 광고, 실시간 기사, 추천 topic, 보조 정보 등을 붙일 수 있도록 좌우 side rail 구조를 준비한다.

요구사항:

- 현재는 실제 광고나 실시간 기능을 구현하지 않는다.
- 본문 양옆에 향후 확장 가능한 slot 구조만 준비한다.
- 작은 화면에서는 side rail이 숨겨지거나 본문 아래로 내려가야 한다.
- 비어 있는 side rail이 화면을 어색하게 만들면 보이지 않게 처리한다.
- 기존 본문 읽기 흐름을 방해하지 않는다.

예상 구조:

```text
Header

MainShell
  LeftRail   현재는 비어 있음
  Content    실제 본문
  RightRail  현재는 비어 있음
```

또는 실제 프로젝트 구조상 과하면, 공통 container만 먼저 정리하고 side rail은 명시적 TODO/후속 후보로 남긴다.

### 5. 홈 정보 위계 정리

홈 화면을 “자동 생성된 주요 이슈 중심”으로 정리한다.

요구사항:

- 홈의 핵심은 “오늘의 주요 이슈”가 되도록 한다.
- 홈에서 원문 기사 목록은 보조 영역으로 낮추거나, `/articles`로 이동하는 링크 중심으로 축소한다.
- 홈에서 `/topics` 전체 아카이브로 이동하는 링크를 유지한다.
- 홈에서 `/articles` 원문 모음으로 이동하는 링크를 제공할 수 있다.
- 기존 hero 문구가 실제 서비스 방향과 맞는지 검토하고 필요하면 간결하게 조정한다.

### 6. Mock 영역 제거

현재 홈에 남아 있는 mock/demo 영역을 제거한다.

제거 대상 후보:

```text
MOCK KEYWORDS / 많이 보이는 키워드
GROUP PREVIEW / 관련 기사 묶음
설명용 mock preview 영역
화면 방향 검증용 예시 데이터 영역
```

요구사항:

- 실제 데이터가 아닌 mock 영역은 제거한다.
- 삭제 후 홈 화면 흐름이 끊기지 않도록 section 간 간격을 정리한다.
- 실제 데이터 기반 keyword/group 기능은 이번 차수에서 구현하지 않는다.
- 필요하면 후속 후보로 문서에만 남긴다.

### 7. 원문 기사 목록의 역할 조정

원문 기사 목록이 NewsLab의 핵심 콘텐츠처럼 과도하게 보이지 않도록 조정한다.

요구사항:

- 홈에서는 원문 기사 목록을 보조 영역으로 낮춘다.
- `/articles`는 원문 기사 검색/카테고리 탐색 전용 페이지로 유지한다.
- 원문 기사는 topic summary의 근거 또는 보조 탐색 자료라는 역할이 드러나야 한다.
- 홈에서 최신 기사 전체를 길게 노출하기보다 일부만 보여주거나 `/articles`로 유도하는 방식을 검토한다.

### 8. 개발용 metadata 노출 정리

사용자-facing 화면에서 개발용 metadata가 과도하게 보이지 않도록 정리한다.

숨김 또는 축소 후보:

```text
provider
model
confidence
similarity_score
draft badge
```

요구사항:

- 목록 화면에서는 provider/model/confidence/similarity_score를 숨기거나 아주 약하게 처리한다.
- 상세 화면에서도 사용자에게 불필요하면 숨긴다.
- `draft` badge는 사용자에게 의미가 불명확하므로 숨기거나 사용자 친화적 표현으로 바꾼다.
- admin/debug 기능은 이번 차수에서 구현하지 않는다.

### 9. Summary clamp와 카드 밀도 정리

목록 화면과 상세 화면의 역할을 구분한다.

요구사항:

- 홈 topic card summary는 너무 길지 않게 표시한다.
- `/topics` archive card summary는 scan 가능한 길이로 제한한다.
- `/topics/{id}` 상세 화면에서는 summary와 key points를 충분히 보여준다.
- `/articles` article summary는 지나치게 길면 줄 수를 제한한다.
- 목록에서는 스캔이 쉽고, 상세에서는 읽기 좋게 만든다.
- CSS line-clamp를 사용할 경우 현재 Tailwind 설정에서 가능한 방식으로 구현한다.
- line-clamp plugin 추가가 필요하면 추가하지 말고 plain CSS 또는 Tailwind 기본 utility로 해결한다.

### 10. Filter chip 제거 버튼 개선

검색어, 날짜, category 등 적용 중인 조건이 chip으로 표시되는 경우 제거 버튼을 제공한다.

요구사항:

- `/topics`의 검색어/날짜 필터 적용 chip에 개별 제거 버튼을 추가한다.
- `/articles`의 검색어/category 조건 표시에도 가능하면 개별 제거 또는 초기화 동작을 제공한다.
- 제거 버튼은 `aria-label`을 제공한다.
- 전체 초기화 link/button은 유지할 수 있다.
- URL search params를 사용하는 `/articles`는 제거 시 적절한 URL로 이동해야 한다.
- Client-side state를 사용하는 `/topics`는 상태만 초기화하면 된다.

### 11. Category empty 노출 정책 검토

현재 Articles API 기준 일부 category는 데이터가 거의 없다.

확인된 예시:

```text
ai: 1건
world: 667건
tech: 685건
politics: 0건
economy: 0건
society: 0건
```

요구사항:

- 데이터가 없는 category를 top-level header navigation에서 제거한다.
- `/articles` 내부 category 필터로 유지할지, 숨길지, 후속으로 넘길지 판단한다.
- 이번 차수에서는 backend category 수집/분류 로직을 수정하지 않는다.
- UI에서 0건 category를 클릭했을 때 사용자가 오류로 느끼지 않도록 문구를 정리한다.

### 12. Development ChunkLoadError 재현 여부 기록

로컬 개발 중 다음 오류가 반복 관찰되었다.

```text
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
```

요구사항:

- 이번 차수에서 production build가 통과하는지 확인한다.
- `.next` 삭제 후 dev server 재실행으로 재현 여부를 확인할 수 있으면 기록한다.
- production build에 영향이 없으면 blocker로 보지 않는다.
- Turbopack 비활성화, Next.js 설정 변경, dependency 변경은 이번 차수에서 기본적으로 하지 않는다.
- 필요하면 후속 조사 후보로 남긴다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Backend `/topics`, `/topics/{id}`, `/articles` API 스펙을 변경하지 않는다.
- DB index, migration, Supabase SQL을 추가하지 않는다.
- image 수집 또는 대표 이미지 표시는 구현하지 않는다.
- article detail page는 구현하지 않는다.
- topic pipeline, embedding, summary generation, CronJob은 수정하지 않는다.
- pagination 고도화 또는 무한 스크롤은 구현하지 않는다.
- 실제 광고, 실시간 기사, 추천 시스템은 구현하지 않는다.
- 새로운 UI library를 추가하지 않는다.
- 전역 CSS reset, root layout, theme, font 설정을 대규모로 변경하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.

## 예상 변경 파일

실제 프론트 구조를 먼저 확인한 뒤 결정한다.

예상 후보:

```text
app/page.tsx
app/topics/page.tsx
app/topics/[id]/page.tsx
app/articles/page.tsx
components/layout/SiteHeader.tsx
components/layout/HeaderArticleSearch.tsx
components/layout/PageShell.tsx
components/layout/PageContainer.tsx
components/layout/SideRailLayout.tsx
components/topics/TopicCard.tsx
components/topics/TopicExplorer.tsx
components/topics/TopicDetail.tsx
components/articles/ArticleList.tsx
components/articles/ArticleCard.tsx
docs/tasks/<safe-branch>.md
docs/verification/<safe-branch>.md
docs/pr/<safe-branch>.md
docs/devlog/<safe-branch>.md
docs/ARCHITECTURE.md
docs/RUNBOOK.md
```

변경 파일은 실제 구조를 확인한 뒤 최소화한다.

## 컴포넌트 / Route / API client 영향

### SiteHeader

`SiteHeader`의 역할을 재정의한다.

요구사항:

- 로고는 홈(`/`)으로 연결한다.
- Header 검색은 원문 기사 검색(`/articles?query=...`)으로 연결한다.
- Top-level navigation은 “주요 이슈 / 원문 모음” 중심으로 단순화한다.
- 기존 category navigation은 제거하거나 `/articles` 내부로 이동한다.
- 작은 화면에서 tagline이 깨지지 않아야 한다.
- 현재 route에 맞는 active state를 표시한다.
  - `/topics`, `/topics/{id}` → 주요 이슈 active
  - `/articles`, `/articles?query=...`, `/articles?category=...` → 원문 모음 active
  - `/` → active 없음 또는 홈 상태

### Topic pages

대상:

```text
/
/topics
/topics/{id}
```

요구사항:

- 주요 이슈 중심의 화면 흐름을 유지한다.
- `/topics` 내부 필터는 header 검색과 구분되는 보조 필터로 유지한다.
- topic card에서 개발용 metadata 노출을 줄인다.
- 목록과 상세의 summary 표시 길이를 구분한다.
- `/topics`의 필터 chip 제거 버튼을 개선한다.

### Article pages

대상:

```text
/articles
/articles?query=...
/articles?category=...
```

요구사항:

- 원문 모음 또는 기사 탐색 페이지로 역할을 명확히 한다.
- article category 필터는 header top-level navigation이 아니라 `/articles` 내부 탐색 도구로 검토한다.
- 검색/category 조건 chip에 제거 동작을 제공한다.
- article summary 길이와 list density를 정리한다.

### API client

이번 차수에서 API client는 기본적으로 변경하지 않는다.

허용되는 변경:

- UI 표시를 위한 adapter/format helper 추가
- summary clamp를 위한 display helper
- category label mapping 정리

금지되는 변경:

- backend query parameter 변경
- API endpoint 변경
- DB/API 스펙 변경 가정
- production write 요청 추가

## 상태 처리

기존 상태 처리를 유지한다.

대상 상태:

- loading
- error
- empty
- success
- not-found

요구사항:

- 상태 UI도 공통 layout/container 규칙을 따른다.
- error/loading/not-found 화면에서도 header가 깨지지 않아야 한다.
- empty state는 사용자가 오류로 오해하지 않게 설명한다.
- 데이터가 없는 category는 정상 empty state로 처리한다.
- 실제 브라우저 검증을 하지 않았다면 완료로 주장하지 않는다.

## 스타일 / 반응형 / 접근성

### 스타일

- 기존 teal/slate 색상 톤은 유지한다.
- 기존 card/border/spacing 스타일을 기반으로 정리한다.
- 페이지마다 container width를 통일한다.
- list/card density를 조정한다.
- 홈, `/topics`, `/topics/{id}`, `/articles`가 같은 서비스처럼 보여야 한다.
- mock 영역 제거 후 빈 공간이 어색하지 않도록 section 간격을 조정한다.

### 반응형

- 작은 화면에서 header tagline이 세로로 깨지면 안 된다.
- 검색창과 navigation은 작은 화면에서 자연스럽게 줄바꿈되거나 stack되어야 한다.
- card grid는 모바일에서 1열, 넓은 화면에서 적절한 다열 구조를 유지한다.
- side rail은 작은 화면에서 숨김 또는 본문 아래로 이동한다.
- 본문 content width가 너무 넓어 읽기 어려워지지 않도록 한다.

### 접근성

- navigation link에 현재 페이지를 나타내는 `aria-current`를 적절히 사용한다.
- 잘못된 active state를 표시하지 않는다.
- 검색 input과 filter control에는 label 또는 접근 가능한 이름을 제공한다.
- chip 제거 버튼에는 `aria-label`을 제공한다.
- 외부 원문 link에는 기존 `target="_blank"`와 `rel="noopener noreferrer"`를 유지한다.
- keyboard focus style을 유지한다.
- 결과 개수나 필터 상태 변경이 있는 경우 기존 `aria-live` 패턴을 유지한다.

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

로컬 route HTML marker 확인 후보:

```bash
npm run dev
curl -sS -o /tmp/newslab-home.html -w '%{http_code}\n' 'http://127.0.0.1:3000/'
curl -sS -o /tmp/newslab-topics.html -w '%{http_code}\n' 'http://127.0.0.1:3000/topics'
curl -sS -o /tmp/newslab-topic-detail.html -w '%{http_code}\n' 'http://127.0.0.1:3000/topics/7'
curl -sS -o /tmp/newslab-articles.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles'
curl -sS -o /tmp/newslab-articles-search.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?query=Anthropic'
curl -sS -o /tmp/newslab-articles-category.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?category=tech'
```

확인할 marker 예시:

```text
주요 이슈
원문 모음
주요 이슈 아카이브
기사 탐색
오늘의 주요 이슈
조건에 맞는 기사가 없습니다.
```

제거 확인 marker 후보:

```bash
rg -n "MOCK KEYWORDS|GROUP PREVIEW|많이 보이는 키워드|관련 기사 묶음|provider|gpt-5-nano|confidence|similarity_score|draft" app components
```

단, 상세 내부 debug 용도로 일부 남기는 경우 의도와 위치를 문서에 기록한다.

Header 구조 확인 후보:

```bash
rg -n "주요 이슈|원문 모음|정치|경제|기술|세계|사회|AI|뉴스를 한눈에" components/layout app
```

Credential scan:

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

Development ChunkLoadError 확인 후보:

```bash
rm -rf .next
npm run dev
```

단, 이 명령은 필요 시 수행하고 결과를 기록한다.  
수행하지 않으면 pending으로 남긴다.

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

### Header

- 작은 화면에서 `뉴스를 한눈에` 문구가 세로로 깨지지 않는다.
- navigation이 “주요 이슈 / 원문 모음” 중심으로 표시된다.
- Header 검색은 article 검색으로 동작한다.
- 현재 페이지 active state가 올바르다.
- 로고 클릭 시 홈으로 이동한다.

### Home

- 홈은 주요 이슈 중심으로 보인다.
- mock keyword/group preview 영역이 제거되어 있다.
- 최신 기사 영역은 보조 역할로 보인다.
- 전체 주요 이슈 또는 원문 모음으로 이동하는 경로가 자연스럽다.
- container width가 다른 페이지와 어긋나지 않는다.

### Topics

- `/topics`는 주요 이슈 아카이브로 보인다.
- topic archive 필터가 header 검색과 혼동되지 않는다.
- 검색어/날짜 chip 제거 동작이 가능하다.
- topic card metadata가 과도하게 보이지 않는다.
- summary 길이가 과도하지 않다.

### Topic detail

- 상세 화면은 읽기 중심으로 충분한 정보를 보여준다.
- 목록보다 summary/key point가 읽기 좋다.
- 관련 article 목록이 유지된다.
- container width가 홈/topics/articles와 어긋나지 않는다.

### Articles

- `/articles`는 원문 모음 또는 기사 탐색으로 보인다.
- Header 검색 결과가 article 목록으로 표시된다.
- category 또는 조건 chip 제거 동작이 가능하다.
- category 데이터가 없는 경우 empty state가 자연스럽다.
- article summary가 너무 길게 늘어나지 않는다.

### Responsive / Accessibility

- desktop/mobile에서 header와 본문 layout이 깨지지 않는다.
- keyboard로 navigation, search, card/link, chip 제거 버튼에 접근할 수 있다.
- browser console에 secret, token, credential 값이 노출되지 않는다.
- 실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

## 완료 조건

- Header navigation이 “주요 이슈 / 원문 모음” 중심으로 단순화되어 있다.
- 작은 화면에서 tagline이 세로로 깨지지 않는다.
- 홈, `/topics`, `/topics/{id}`, `/articles`의 container width와 layout 톤이 통일되어 있다.
- mock keyword/group preview 영역이 제거되어 있다.
- 홈에서 주요 이슈가 핵심 콘텐츠로 보인다.
- 원문 기사 목록은 보조 탐색 역할로 정리되어 있다.
- `/topics`와 `/articles`의 필터/search 역할이 구분되어 있다.
- 적용 중인 검색어/날짜/category 조건을 제거할 수 있는 동작이 제공된다.
- provider/model/confidence/similarity_score/draft 등 개발용 metadata가 사용자 화면에서 과도하게 보이지 않는다.
- 목록 화면의 summary/article text가 과도하게 길어지지 않는다.
- 기존 홈, `/topics`, `/topics/{id}`, `/articles` 기능이 깨지지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.
- backend, DB, K3s, Docker, Supabase SQL, secret, `.env` 관련 파일을 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/<safe-branch>.md`에 기록되어 있다.
- PR draft와 devlog draft가 실제 변경 사항과 검증 결과를 기준으로 작성되어 있다.
- production 배포 완료라고 주장하지 않는다.
- production verification은 사람이 제공한 로그가 있을 때만 완료로 기록한다.

## 참고 사항

이 작업은 40~43차에서 구현한 프론트 기능을 “하나의 서비스 탐색 흐름”으로 정리하는 차수다.

현재까지 구현된 흐름:

```text
/                 홈
/topics           주요 이슈 아카이브
/topics/{id}      주요 이슈 상세
/articles         원문 기사 탐색
```

44차의 핵심 판단:

```text
NewsLab의 메인 가치는 원문 기사 나열이 아니라 자동 생성된 주요 이슈와 요약이다.
원문 기사는 검색, 카테고리, 근거 확인을 위한 보조 탐색 자료다.
```

따라서 44차에서는 원문 기사 목록을 없애기보다, 위치와 표현을 보조 역할에 맞게 조정한다.

후속 작업 후보:

- Article pagination 또는 더 보기 UI
- Header search form progressive enhancement
- 실제 category 데이터 분포에 맞춘 category 정책 재설계
- Topic/Article URL search params 동기화 고도화
- 실제 keyword trend / source trend 기능
- 대표 이미지 수집/표시
- 백엔드 topic pipeline 구조 고도화
- embedding 저장 구조
- 3일/7일 topic window
