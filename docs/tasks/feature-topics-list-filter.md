# 작업: Topic 목록 검색 및 날짜 필터 MVP

## 목표

NewsLab 프론트엔드에 전체 Topic 목록을 탐색할 수 있는 `/topics` 페이지를 추가한다.

40차에서 홈 화면에 `/topics` 목록 일부를 연결했고, 41차에서 `/topics/{id}` 상세 페이지를 구현했다. 이번 42차에서는 사용자가 생성된 topic을 날짜와 검색어 기준으로 찾아볼 수 있도록 목록 탐색 페이지를 만든다.

대상 API:

```text
GET https://api.dev-scj.site/topics?page=1&page_size=50
```

이번 작업의 목표는 backend API를 변경하지 않고, 현재 제공되는 `/topics` 목록 응답을 사용해 프론트엔드에서 다음 기능을 제공하는 것이다.

- 전체 topic 목록 페이지
- 검색어 기반 client-side filtering
- topic_date 기반 날짜 필터
- topic card 클릭 시 `/topics/{id}` 상세 페이지 이동
- loading / error / empty / success 상태 처리
- 기존 홈/상세 디자인 톤 유지

현재 확인된 topic 목록 응답:

```text
page=1
page_size=50
total=12
has_next=false
```

이번 차수에서는 backend 검색 API, DB index, 서버 페이지네이션 고도화, 이미지 표시, provider/model 숨김, summary clamp는 구현하지 않는다.

## 프론트엔드 작업 범위

- `/topics` 목록 route 추가
  - Next.js App Router 기준이면 `app/topics/page.tsx` 후보
  - 실제 프로젝트 구조를 확인한 뒤 기존 route 패턴을 따른다.
- 기존 `getTopics(page, pageSize)` API client 재사용 또는 최소 확장
- 전체 topic 목록을 표시하는 explorer 컴포넌트 추가
- 검색어 입력 UI 추가
- 날짜 필터 UI 추가
- client-side filtering 구현
  - title
  - summary
  - keywords
  - topic_date
- 필터 결과 개수 표시
- 검색/필터 결과 empty state 처리
- Topic card를 재사용해 `/topics/{id}` 상세 페이지로 이동
- 홈 화면의 기존 topic section은 대규모로 변경하지 않는다.
- 상세 페이지(`/topics/{id}`)는 기존 동작을 유지한다.
- 기존 `SiteHeader`를 재사용해 목록/홈/상세의 navigation 일관성을 유지한다.
- 기존 색상, spacing, typography, card/list 스타일을 우선 재사용한다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- `/topics` backend API query parameter를 새로 추가하지 않는다.
- DB index 또는 migration을 추가하지 않는다.
- 서버 검색, 서버 날짜 필터, 서버 pagination 고도화는 구현하지 않는다.
- 이미지 수집 또는 대표 이미지 표시는 구현하지 않는다.
- provider/model/confidence/similarity score 노출 정책 정리는 이번 차수에서 하지 않는다.
- topic summary line-clamp 또는 카드 UI 대규모 재설계는 이번 차수에서 하지 않는다.
- topic 생성, 수정, 삭제, 재실행, status 변경 같은 관리자 기능은 구현하지 않는다.
- article 원문 전체를 프론트에 표시하지 않는다.
- 새로운 UI library를 추가하지 않는다.
- 전역 CSS reset, root layout, theme, font 설정을 대규모로 변경하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.

## 예상 변경 파일

실제 프론트 구조를 먼저 확인한 뒤 결정한다.

예상 후보:

```text
app/topics/page.tsx
app/topics/loading.tsx
app/topics/error.tsx
components/topics/TopicExplorer.tsx
components/topics/TopicFilters.tsx
components/topics/TopicList.tsx
components/topics/TopicCard.tsx
lib/api/topics.ts
docs/tasks/<safe-branch>.md
docs/verification/<safe-branch>.md
docs/pr/<safe-branch>.md
docs/devlog/<safe-branch>.md
docs/ARCHITECTURE.md
docs/RUNBOOK.md
```

가능한 구조:

```text
app/topics/page.tsx
- Server Component
- getTopics(1, 50) 호출
- TopicExplorer에 initialTopics 전달

components/topics/TopicExplorer.tsx
- Client Component
- search/date filter state 관리
- client-side filtering
- filtered topics 렌더링

components/topics/TopicFilters.tsx
- 검색 input
- 날짜 select 또는 filter button
- 결과 개수 표시
```

기존 `TopicCard`는 가능하면 재사용한다. 단, 목록 페이지에서 필요한 최소 prop만 추가할 수 있다.

## 컴포넌트 / Route / API client 영향

### API client

기존 `lib/api/topics.ts`의 `getTopics(page, pageSize)`를 우선 재사용한다.

이번 차수에서는 backend API를 변경하지 않는다.

기본 호출:

```ts
getTopics(1, 50);
```

응답 타입은 40차에서 정의한 `Topic` / `TopicsResponse`를 재사용한다.

필요하면 다음 정도의 최소 보조 함수를 추가할 수 있다.

```ts
getTopicsForExplorer();
```

단, API URL을 여러 곳에 하드코딩하지 않는다.

### Route / Page

Topic 목록 페이지를 추가한다.

Next.js App Router 기준 후보:

```text
app/topics/page.tsx
```

진입 URL:

```text
/topics
```

페이지 역할:

- 전체 topic 목록 fetch
- 목록 제목과 설명 표시
- `TopicExplorer` 렌더링
- 기존 `SiteHeader` 재사용

홈 화면의 “오늘의 주요 이슈” 섹션에서 전체 목록으로 이동할 수 있는 링크가 없다면 추가를 검토한다.

예시:

```text
전체 주요 이슈 보기 → /topics
```

### TopicExplorer

`TopicExplorer`는 client-side filtering을 담당한다.

필터 기준:

```text
검색어:
- title_ko
- summary_ko
- keywords

날짜:
- topic_date
```

검색 방식:

- 대소문자 구분 없이 처리한다.
- 한국어/영어 모두 단순 includes 기반으로 처리한다.
- 검색어 앞뒤 공백은 제거한다.
- 빈 검색어는 전체로 처리한다.

날짜 필터 방식:

- API 응답에 존재하는 `topic_date` 값을 기준으로 unique date list를 만든다.
- 기본값은 `전체`다.
- 최신 날짜가 위에 오도록 정렬한다.
- 특정 날짜를 선택하면 해당 `topic_date`와 일치하는 topic만 표시한다.

권장 UI:

```text
검색 input
날짜 select 또는 button group
결과 개수
초기화 버튼
```

초기화 버튼은 필수는 아니지만, 구현이 간단하면 추가한다.

### TopicCard

기존 `TopicCard`를 재사용한다.

요구사항:

- 목록 페이지에서도 topic card 클릭 시 `/topics/{id}`로 이동한다.
- 기존 홈 topic card 디자인을 크게 변경하지 않는다.
- provider/model 표시 정책은 이번 차수에서 바꾸지 않는다.
- summary clamp는 이번 차수에서 적용하지 않는다.

## 상태 처리

다음 상태를 반드시 처리한다.

### Loading

Topic 목록 page 또는 route에서 데이터를 불러오는 중인 상태를 표시한다.

예시 문구:

```text
주요 이슈 목록을 불러오는 중입니다.
```

Next.js App Router 구조상 자연스럽다면 다음 파일을 검토한다.

```text
app/topics/loading.tsx
```

### Error

API 요청 실패 또는 response validation 실패 시 화면이 깨지지 않도록 error state를 표시한다.

예시 문구:

```text
주요 이슈 목록을 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

Next.js route-level error boundary를 사용하는 경우 기존 상세 페이지 error 패턴을 참고한다.

### Empty: API 결과 없음

API 응답의 `items`가 빈 배열이면 전체 목록 empty state를 표시한다.

예시 문구:

```text
아직 생성된 주요 이슈가 없습니다.
```

### Empty: 필터 결과 없음

API에는 topic이 있지만 검색어/날짜 필터 결과가 없으면 별도 empty state를 표시한다.

예시 문구:

```text
조건에 맞는 주요 이슈가 없습니다.
검색어나 날짜 필터를 조정해보세요.
```

### Success

API 응답이 정상이고 필터 결과가 있으면 topic 목록을 표시한다.

## 스타일 / 반응형 / 접근성

스타일은 기존 프로젝트의 방식과 시각적 톤을 따른다.

- 기존 Tailwind/CSS module/plain CSS 등 실제 사용 중인 방식을 따른다.
- 새로운 UI library를 추가하지 않는다.
- 기존 홈/상세에서 사용 중인 색상, border, radius, shadow, spacing, typography 패턴을 우선 재사용한다.
- 목록 페이지는 기존 중앙 정렬 폭과 카드/섹션 스타일을 유지한다.
- 검색 input과 날짜 필터는 기존 header search 스타일 또는 현재 form 스타일과 어긋나지 않게 만든다.
- 모바일에서는 검색 input과 날짜 필터가 세로로 자연스럽게 쌓이도록 한다.
- 데스크톱에서는 검색과 날짜 필터를 한 줄 또는 균형 잡힌 레이아웃으로 배치한다.
- 긴 summary와 title이 레이아웃을 깨지 않도록 한다.
- `label` 또는 `aria-label`을 사용해 검색 input과 날짜 select/button의 의미를 제공한다.
- 필터 결과 개수는 screen reader가 읽을 수 있는 텍스트로 제공한다.
- topic card는 keyboard focus가 가능해야 한다.
- 날짜 값은 사용자가 읽기 쉬운 형식으로 표시한다.
- `SiteHeader`의 active navigation이 잘못 표시되지 않도록 한다.
  - `/topics` 목록 페이지에서 “주요 이슈 목록” 또는 별도 active 상태가 없다면 기존 category에 `aria-current`를 잘못 표시하지 않는다.

## 검증 Command

실제 package manager와 package.json scripts를 먼저 확인한다.

우선 실행 가능한 후보:

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

프론트 코드 변경 후 가능한 경우:

```bash
npm run lint
npm run typecheck
npm run build
```

Topic 목록 API response shape 확인:

```bash
curl -sS "https://api.dev-scj.site/topics?page=1&page_size=50"
```

단, production API 요청은 read-only response contract 확인으로만 제한한다.  
production deploy 또는 production verification 완료로 기록하지 않는다.

로컬 route HTML marker 확인 후보:

```bash
npm run dev
curl -sS "http://localhost:3000/topics"
```

확인할 marker 예시:

```text
주요 이슈 목록
검색
전체
2026-06-14
미-이란 평화협상
스위스 인구 1천만 명 상한 제안 부결
```

필터 UI 코드 존재 확인 후보:

```bash
rg -n "검색|날짜|조건에 맞는 주요 이슈가 없습니다|getTopics\(1, 50\)|TopicExplorer|TopicFilters" app components lib
```

실행한 명령과 결과는 반드시 다음 파일에 기록한다.

```text
docs/verification/<safe-branch>.md
```

테스트 명령이 없거나 실행하지 않은 경우, 실행하지 않았다고 명확히 기록한다.

## 수동 브라우저 검증

로컬 개발 서버를 실행한다.

예시:

```bash
npm run dev
```

브라우저에서 확인한다.

검증 항목:

- `/topics` 페이지가 정상 로드된다.
- topic 목록이 표시된다.
- 전체 topic 개수와 현재 표시 개수가 표시된다.
- 검색어 입력 시 title/summary/keywords 기준으로 목록이 줄어든다.
- 날짜 필터 선택 시 해당 날짜의 topic만 표시된다.
- 검색어와 날짜 필터를 함께 적용할 수 있다.
- 필터 결과가 없을 때 empty state가 표시된다.
- topic card 클릭 시 `/topics/{id}` 상세 페이지로 이동한다.
- 홈 화면과 상세 페이지가 기존처럼 정상 동작한다.
- 모바일 폭에서 검색/날짜 필터와 목록이 레이아웃을 유지한다.
- keyboard로 검색 input, 날짜 필터, topic card를 이동할 수 있다.
- 브라우저 console에 secret, token, credential 값이 노출되지 않는다.

실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

## 완료 조건

- `/topics` 목록 route가 추가되어 있다.
- `/topics` 페이지에서 topic 목록을 볼 수 있다.
- 검색어 기반 client-side filtering이 동작한다.
- `topic_date` 기반 날짜 필터가 동작한다.
- 검색어와 날짜 필터를 함께 적용할 수 있다.
- 필터 결과 개수와 empty state가 처리되어 있다.
- topic card에서 `/topics/{id}` 상세 페이지로 이동할 수 있다.
- loading / error / empty / success 상태가 처리되어 있다.
- 기존 홈 topic 목록과 상세 페이지가 깨지지 않는다.
- 기존 디자인 톤, 레이아웃, spacing, typography를 크게 변경하지 않았다.
- provider/model 숨김, summary clamp, 이미지 표시, backend 검색 API는 구현하지 않았다.
- backend, DB, K3s, Docker, Supabase SQL, secret, `.env` 관련 파일을 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/<safe-branch>.md`에 기록되어 있다.
- PR draft와 devlog draft가 실제 변경 사항과 검증 결과를 기준으로 작성되어 있다.
- production 배포 완료라고 주장하지 않는다.
- production verification은 사람이 제공한 로그가 있을 때만 완료로 기록한다.

## 참고 사항

현재 `/topics?page=1&page_size=50` 응답 기준:

```text
total: 12
has_next: false
dates:
- 2026-06-14
- 2026-06-13
- 2026-06-12
- 2026-06-11
```

이번 차수에서는 데이터 양이 많지 않으므로 client-side filtering으로 충분하다.

현재 확인된 topic 예시:

```text
id=12, 2026-06-14, 미-이란 평화협상과 레바논 베이루트 공격으로 고조되는 중동 긴장
id=11, 2026-06-14, 스위스 인구 1천만 명 상한 제안 부결
id=10, 2026-06-13, 시드니 코지 비치 상어 공격으로 여성 중태
id=9, 2026-06-13, 미국 보안 우려로 Anthropic의 고성능 AI 모델 접근 차단
id=8, 2026-06-12, 태국 바즈리카티야바 마히돌 공주, 47세로 사망
id=7, 2026-06-12, SpaceX IPO로 머스크 세계 최초 트릴리어네어 등극
```

42차는 프론트엔드 기본 탐색 기능을 마무리하는 작업이다.

43차에서는 다음 UI/UX 정리를 별도 작업으로 진행할 예정이다.

- provider/model 숨김
- confidence/similarity score 노출 정책 정리
- summary line-clamp
- 카드 밀도 조정
- draft badge 사용자용 표현 개선
- 홈/목록/상세 간 시각적 정리

44차 이후에는 다시 백엔드 구조 고도화로 넘어간다.

후속 백엔드 후보:

- embedding 저장 구조
- daily pipeline 분리
- 3일/7일 topic window
- topic continuation
- source trust_level 반영
- published_at null 기사 처리
