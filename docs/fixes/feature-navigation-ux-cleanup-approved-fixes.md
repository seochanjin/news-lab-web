# 승인된 수정: NewsLab 탐색 구조 및 레이아웃 정리

## 사람 승인 대기 중인 수정 후보

없음.

## 승인된 수정

### Fix 1: Header 검색창 정렬 보정

#### 배경

44차 구현 후 header 검색창이 우측으로 쏠려 보이는 문제가 확인되었다.

현재 header는 로고, 검색창, 검색 버튼, navigation이 공통 탐색 구조로 동작하지만, 시각적으로 검색창이 본문 container 기준과 어긋나 보인다. 이로 인해 홈, `/topics`, `/articles`, `/topics/{id}` 간 레이아웃 통일 목적이 완전히 달성되지 않는다.

#### 승인된 변경

- Header 내부 로고, 검색창, 검색 버튼을 공통 container 기준으로 정렬한다.
- 검색창이 우측으로 과도하게 밀리지 않도록 한다.
- 홈, `/topics`, `/topics/{id}`, `/articles`에서 header 폭과 본문 폭의 기준이 어긋나지 않도록 한다.
- 작은 화면에서 검색창과 버튼이 깨지지 않도록 한다.
- 기존 `SiteHeader` 재사용 구조는 유지한다.
- Header navigation의 “주요 이슈 / 원문 모음” 구조는 유지한다.

#### 완료 기준

- Header 검색창이 화면 우측으로 쏠려 보이지 않는다.
- Header와 본문 container의 좌우 기준이 자연스럽게 맞는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.

---

### Fix 2: Header 검색을 통합 검색 흐름으로 변경

#### 배경

44차 구현 후 header 검색창이 원문 기사 검색(`/articles?query=...`)에만 연결되어 있는 문제가 확인되었다.

현재 동작:

```text
Header 검색 → /articles?query=검색어
```

이 구조는 NewsLab의 핵심 콘텐츠인 “자동 생성된 주요 이슈”를 건너뛰고 원문 기사만 검색한다.

하지만 사용자가 header 검색창에 검색어를 입력했을 때 기대하는 흐름은 다음에 가깝다.

```text
검색어 입력
→ 주요 이슈 검색 결과 우선 표시
→ 원문 기사 검색 결과 보조 표시
```

NewsLab의 중심 가치는 원문 기사 나열이 아니라, 여러 기사를 묶어 만든 주요 이슈와 요약이므로 header 검색도 이 우선순위를 따라야 한다.

#### 승인된 변경

Header 검색 submit 동작을 통합 검색 route로 변경한다.

권장 route:

```text
/search?query=<검색어>
```

통합 검색 page는 다음 순서로 결과를 표시한다.

```text
1. 주요 이슈 검색 결과
2. 원문 기사 검색 결과
```

구현 요구사항:

- `/search` route를 추가한다.
- Header 검색 submit은 `/search?query=...`로 이동한다.
- 검색어는 trim 처리한다.
- 빈 검색어 submit 시 `/search` 또는 기본 검색 안내 상태로 이동한다.
- `/search` page에서 기존 Topics API와 Articles API를 읽기 전용으로 사용한다.
- Topic 검색은 기존 `/topics` archive filtering 기준과 유사하게 `title_ko`, `summary_ko`, `keywords`, `topic_date`를 대상으로 한다.
- Article 검색은 기존 Articles API의 `keyword` parameter를 사용한다.
- 검색 결과 화면에서는 주요 이슈 결과를 먼저 보여준다.
- 원문 기사 결과는 보조 섹션으로 아래에 표시한다.
- 검색 결과가 없을 때 empty state를 제공한다.
- 기존 `/topics` archive 내부 필터는 유지한다.
- 기존 `/articles` page는 원문 모음/카테고리 탐색 page로 유지한다.
- Backend API, DB, Supabase SQL, K3s, Docker, production infrastructure는 변경하지 않는다.

#### 추천 화면 구조

```text
검색 결과: <검색어>

[주요 이슈]
- topic card 목록
- 없으면 “조건에 맞는 주요 이슈가 없습니다.”

[원문 모음]
- article list
- 없으면 “조건에 맞는 원문 기사가 없습니다.”
```

#### 완료 기준

- Header 검색이 `/search?query=...`로 이동한다.
- 검색 결과에서 주요 이슈가 원문 기사보다 먼저 표시된다.
- 주요 이슈와 원문 기사 결과가 모두 없을 때 적절한 empty state가 표시된다.
- 기존 `/topics`, `/articles`, `/topics/{id}` 기능이 깨지지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.

---

### Fix 3: 통합 검색의 원문 결과에 검색된 Topic 연결 기사 포함

#### 배경

Header 통합 검색에서 한국어 검색어를 입력하면 주요 이슈는 검색되지만, 원문 기사는 영어 title/summary 기반 검색이어서 결과가 0건으로 나올 수 있다.

예:

`/search?query=중동`

- 주요 이슈: 2건
- 원문 모음: 0건

하지만 사용자는 검색된 주요 이슈와 연결된 원문 기사도 함께 확인하기를 기대한다.

#### 승인된 변경

- `/search` 결과에서 topic 검색 결과가 있을 경우, 상위 topic들의 detail API를 조회해 연결 article을 가져온다.
- 연결 article은 원문 모음 섹션에 우선 표시한다.
- topic detail 조회 대상은 상위 3개 topic으로 제한한다.
- 각 topic에서 가져오는 article은 최대 3개로 제한한다.
- article_id 또는 url 기준으로 중복을 제거한다.
- 기존 Articles API keyword 검색 결과도 유지하되, topic 연결 기사와 중복되면 제거한다.
- 원문 모음 섹션 문구를 “검색된 주요 이슈에 연결된 원문 기사와 직접 검색 결과를 함께 보여줍니다.”처럼 조정한다.
- Backend API, DB, K3s, Supabase SQL은 변경하지 않는다.

#### 완료 기준

- `/search?query=중동`에서 주요 이슈가 검색되면 연결된 원문 기사도 함께 표시된다.
- 원문 기사 직접 검색 결과가 0건이어도 topic 연결 기사가 있으면 원문 모음이 비어 보이지 않는다.
- 중복 원문 기사가 반복 표시되지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.

### Fix 4: Topic Archive 검색 입력값과 적용된 필터값 분리

#### 배경

`/topics` 아카이브 필터에서 검색어를 적용한 뒤 input 값을 수정하면, 적용 중인 검색어 chip도 동시에 변경되거나 사라지는 문제가 확인되었다.

예:

```text
1. 검색어 `미국` 입력
2. 필터 적용
3. `필터 적용 중: 검색어: 미국` 표시
4. 다음 검색어를 입력하려고 input에서 `미국`을 지움
5. 적용된 chip도 함께 지워지거나 `미`로 변경됨
```

이는 사용자가 “다음 검색어를 입력 중인 상태”와 “현재 목록에 실제 적용된 검색 조건”이 분리되어 있지 않기 때문이다.

현재 UI는 `필터 적용 중` chip과 `필터 초기화` 동작을 제공하므로, 실시간 검색보다는 적용형 필터에 가깝다. 따라서 검색 input의 편집 상태와 실제 적용된 필터 상태를 분리해야 한다.

#### 승인된 변경

`/topics`의 검색 필터 상태를 다음처럼 분리한다.

```text
draftSearchQuery
- 사용자가 input에서 현재 편집 중인 값

appliedSearchQuery
- 실제 topic 목록 필터링에 적용된 값
- 필터 chip에 표시되는 값
```

동작 요구사항:

- 검색 input의 `value`는 `draftSearchQuery`를 사용한다.
- topic filtering과 검색어 chip 표시는 `appliedSearchQuery`를 사용한다.
- input 값을 수정해도 `appliedSearchQuery`는 즉시 변경되지 않는다.
- Enter 또는 필터 적용 동작을 수행했을 때만 `appliedSearchQuery`가 갱신된다.
- 검색어 chip은 `appliedSearchQuery`를 기준으로 표시한다.
- 검색어 chip의 `x` 버튼을 누르면 `appliedSearchQuery`를 제거한다.
- chip 제거 시 `draftSearchQuery`도 함께 비울 수 있다.
- “필터 초기화”는 `draftSearchQuery`, `appliedSearchQuery`, 날짜 필터를 모두 초기화한다.
- 결과 개수는 `appliedSearchQuery`와 날짜 필터 기준으로 계산한다.
- 검색 input placeholder와 label은 기존 topic archive 문맥을 유지한다.
- 필요하면 명확성을 위해 `필터 적용` 버튼을 추가할 수 있다.

#### 완료 기준

- `미국`을 적용한 뒤 input에서 다음 검색어를 입력하려고 값을 지워도 chip의 `검색어: 미국`은 즉시 사라지지 않는다.
- Enter 또는 필터 적용 동작을 했을 때만 검색 결과와 chip이 새 검색어로 갱신된다.
- 검색어 chip의 `x` 버튼으로 적용된 검색어를 제거할 수 있다.
- 필터 초기화로 모든 조건이 초기화된다.
- 기존 날짜 필터 동작이 깨지지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.

### Fix 5: Topic Archive 내부 필터 제거

#### 배경

`/topics` 아카이브 페이지에는 검색어와 날짜로 주요 이슈를 좁히는 내부 필터가 존재한다.

하지만 44차 승인 수정에서 Header 검색을 통합 검색 흐름으로 변경하면서 검색 역할이 다음처럼 정리되었다.

```text
Header 검색
→ /search?query=...
→ 주요 이슈 검색 결과 우선 표시
→ 원문 기사 검색 결과 보조 표시
```

이 구조에서는 `/topics` 내부에 별도 검색 필터를 유지할 경우 다음 문제가 생긴다.

- Header 검색과 `/topics` 내부 검색의 역할이 중복된다.
- 사용자는 어느 검색창을 사용해야 하는지 혼동할 수 있다.
- `/topics`는 “주요 이슈 아카이브 목록”이어야 하는데 필터 UI가 과도하게 강조된다.
- 검색 input 값과 실제 적용된 filter chip 상태를 분리하려면 client-side 상태가 복잡해진다.
- 날짜 필터도 현재 데이터 규모에서는 필수 탐색 수단으로 보기 어렵다.

따라서 이번 MVP 단계에서는 `/topics` 내부 필터를 제거하고, 주요 이슈 검색은 Header 통합 검색(`/search`)으로 일원화한다.

#### 승인된 변경

- `/topics` 아카이브 페이지의 내부 필터 UI를 제거한다.
- 제거 대상:
  - 아카이브 필터 박스
  - 필터 열기/닫기 버튼
  - 주요 이슈 검색 input
  - 이슈 날짜 select
  - 필터 적용 chip
  - 필터 초기화 버튼
  - client-side filtering 상태 관리
- `/topics`는 전체 주요 이슈 아카이브 목록을 표시하는 페이지로 단순화한다.
- `/topics` 상단에는 전체 topic 수와 현재 표시 개수 정도만 간단히 표시한다.
- 주요 이슈 검색은 Header 검색을 통해 `/search?query=...`에서 수행한다.
- 날짜 필터는 이번 차수에서 제거하고, 필요하면 후속 작업에서 URL 기반 archive filter로 재검토한다.
- 기존 topic card → `/topics/{id}` 상세 이동은 유지한다.
- 기존 `/search`, `/articles`, `/topics/{id}` 기능은 깨지지 않아야 한다.
- Backend API, DB, Supabase SQL, K3s, Docker, production infrastructure는 변경하지 않는다.

#### 완료 기준

- `/topics` 페이지에 아카이브 필터 박스가 더 이상 표시되지 않는다.
- `/topics` 페이지는 주요 이슈 아카이브 목록과 topic card 중심으로 단순하게 표시된다.
- Header 검색을 통해 `/search?query=...`로 이동하고 주요 이슈 검색 결과를 확인할 수 있다.
- `/topics` topic card를 클릭하면 기존 상세 페이지로 이동한다.
- 기존 `/articles` 원문 모음 페이지가 깨지지 않는다.
- `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다.

## 거절 또는 보류한 제안

### 보류: `/topics` archive 필터를 완전히 header 안으로 이동

`/topics` 내부 검색/날짜 필터를 header에 완전히 통합하는 방안도 검토할 수 있다.

이번 PR에서는 보류한다.

보류 사유:

- Header 검색은 전체 서비스 검색으로 동작하는 것이 자연스럽다.
- `/topics`의 날짜 필터는 topic archive 내부 탐색 기능이다.
- 날짜 필터까지 header에 넣으면 header가 과도하게 복잡해진다.
- 이번 수정에서는 header 검색을 통합 검색으로 바꾸고, `/topics` 내부 필터는 archive 전용으로 유지한다.

### 보류: 기사 category navigation 재도입

`정치`, `경제`, `기술`, `세계`, `사회`, `AI` category를 header에 다시 노출하는 방안은 보류한다.

보류 사유:

- 현재 데이터가 `world`, `tech`에 편중되어 있다.
- 일부 category는 결과가 0건이다.
- top-level navigation에 데이터 없는 category를 노출하면 사용자 혼란이 커진다.
- category 탐색은 `/articles` 내부 기능으로 유지한다.

### 보류: Topic Archive 검색 입력값과 적용된 필터값 분리

`/topics` 내부 필터를 유지하는 경우 필요한 개선이었으나, 44차에서 내부 필터 자체를 제거하기로 결정했으므로 적용하지 않는다.

## 적용한 변경

- Fix 1 적용:
  - `SiteHeader`의 logo/search/navigation을 `PageShell`과 같은 960px 중심 container 기준에 맞췄다.
  - 작은 화면에서는 기존처럼 logo와 검색창이 stack되고, 검색 버튼은 입력창 옆에 유지된다.
- Fix 2 적용:
  - Header 검색 submit을 `/search?query=...`로 변경하고 빈 검색어는 `/search` 안내 상태로 이동하게 했다.
  - `/search` Server Component route와 loading 상태를 추가했다.
  - 주요 이슈는 기존 `/topics` archive와 같은 필드 기준으로 최대 50개 topic을 프론트엔드 필터링한다.
  - 원문 기사는 기존 Articles API의 `keyword` parameter를 사용하는 `getArticles`를 재사용한다.
  - 주요 이슈 결과를 먼저, 원문 모음 결과를 아래에 표시하고 API별 failure/empty 상태를 제공한다.
- Fix 3 적용:
  - 검색된 주요 이슈 중 상위 3개의 detail API를 병렬 조회한다.
  - 각 Topic detail의 연결 기사 중 최대 3개를 기존 `ArticleList` 표시 형태로 변환한다.
  - Topic 연결 기사를 직접 Articles API 검색 결과보다 먼저 배치한다.
  - `article_id` 또는 URL이 이미 포함된 기사는 건너뛰어 중복을 제거한다.
  - 원문 모음 안내 문구에 Topic 연결 기사와 직접 검색 결과를 함께 표시함을 명시했다.
- Fix 4 미적용:
  - Fix 5 승인에 따라 이전에 적용했던 draft/applied 검색 상태 분리 구현을 제거했다.
  - `/topics` 내부 필터 자체를 제거했으므로 보류 항목으로 유지한다.
- Fix 5 적용:
  - `/topics`의 아카이브 필터 박스, 검색 input, 날짜 select, filter chip, 초기화 control을 제거했다.
  - `TopicExplorer`의 client-side filtering 상태와 `"use client"`, `useState`, `useMemo` 사용을 제거했다.
  - 전체 Topic 수와 현재 표시 개수를 제공하는 간단한 archive header와 Topic card 목록만 유지했다.
  - 주요 이슈 검색은 Header 통합 검색 `/search?query=...` 흐름으로 일원화했다.
- 보류 항목인 topic archive 필터의 Header 이동과 category navigation 재도입은 적용하지 않았다.

## 필요한 검증

수정 후 다음 명령을 실행한다.

```bash
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

로컬 route 확인 후보:

```bash
npm run dev
curl -sS -o /tmp/newslab-search.html -w '%{http_code}\n' 'http://127.0.0.1:3000/search?query=미국'
curl -sS -o /tmp/newslab-home.html -w '%{http_code}\n' 'http://127.0.0.1:3000/'
curl -sS -o /tmp/newslab-topics.html -w '%{http_code}\n' 'http://127.0.0.1:3000/topics'
curl -sS -o /tmp/newslab-articles.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles'
```

확인할 marker:

```text
검색 결과
주요 이슈
원문 모음
미국
조건에 맞는 주요 이슈가 없습니다.
조건에 맞는 원문 기사가 없습니다.
```

Header 확인:

```bash
rg -n 'action="/search"|router\.push\("/search|/search\?query|기사 제목이나 키워드|주요 이슈|원문 모음' app components
```

Credential scan:

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

수동 브라우저 검증 항목:

- Header 검색어 입력 후 `/search?query=...`로 이동한다.
- 검색 결과에서 주요 이슈가 먼저 표시된다.
- 원문 기사 결과가 그 아래 표시된다.
- Header 검색창이 우측으로 쏠려 보이지 않는다.
- `/topics`, `/articles`, `/topics/{id}` 기존 route가 깨지지 않는다.
- 모바일 폭에서 header가 깨지지 않는다.

실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

검증 실행 결과는 `docs/verification/feature-navigation-ux-cleanup.md`에 기록했다.
