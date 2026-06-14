# 작업: Topic 상세 페이지 MVP

## 목표

NewsLab 프론트엔드에서 홈 화면의 topic card를 클릭하면 해당 topic의 상세 페이지로 이동할 수 있도록 한다.

이번 작업의 목표는 기존 백엔드 Topics Detail API를 사용해, 하나의 topic에 대한 요약, 핵심 포인트, 키워드, 연결 article 목록을 화면에서 확인할 수 있는 MVP 상세 페이지를 구현하는 것이다.

대상 API:

```text
GET https://api.dev-scj.site/topics/{id}
```

예시:

```text
GET https://api.dev-scj.site/topics/7
```

상세 페이지에서 표시할 주요 데이터:

- `title_ko`
- `summary_ko`
- `key_points`
- `keywords`
- `topic_date`
- `source_count`
- `article_count`
- `status`
- 개발 확인용 `provider`, `model`, `confidence`
- 연결 article 목록
  - `title`
  - `source`
  - `published_at`
  - `role`
  - `similarity_score`
  - `url`

이번 차수에서는 topic 검색, 날짜 필터, 카테고리 필터, 이미지 표시, 관리자 기능은 구현하지 않는다.

## 프론트엔드 작업 범위

- Topic Detail API 응답 타입 정의
- Topic Detail API fetch 함수 또는 기존 Topics API client 확장
- Topic 상세 페이지 route 추가
  - Next.js App Router 기준이면 `app/topics/[id]/page.tsx` 후보
  - 실제 프로젝트 구조를 확인한 뒤 기존 라우팅 패턴을 따른다.
- 홈 topic card에서 상세 페이지로 이동하는 link 추가
- Topic 상세 화면 컴포넌트 추가 또는 분리
- 연결 article 목록 컴포넌트 추가 또는 분리
- loading / error / not-found / success 상태 처리
- 외부 원문 article URL은 새 탭으로 열리도록 처리
- 기존 홈 화면과 topic 목록 UI를 크게 변경하지 않는다.
- 기존 디자인 시스템, 색상, spacing, typography, card/list 스타일을 재사용한다.
- 상세 페이지는 기존 NewsLab 홈 화면의 톤과 어긋나지 않게 구현한다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- 백엔드 `/topics/{id}` API 스펙은 변경하지 않는다.
- topic 생성, 수정, 삭제, 재실행, status 변경 같은 관리자 기능은 구현하지 않는다.
- 이미지 수집 또는 대표 이미지 표시는 구현하지 않는다.
- topic 검색, 날짜 필터, 카테고리 필터는 구현하지 않는다.
- article 원문 내용을 프론트에 복사해서 표시하지 않는다.
- 외부 article URL 외의 raw text 전문 표시는 구현하지 않는다.
- 새로운 UI library를 추가하지 않는다.
- 전역 CSS reset, root layout, theme, font 설정을 대규모로 변경하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.

## 예상 변경 파일

실제 프론트 구조를 먼저 확인한 뒤 결정한다.

예상 후보:

```text
app/topics/[id]/page.tsx
components/topics/TopicDetail.tsx
components/topics/TopicArticleList.tsx
components/topics/TopicArticleCard.tsx
components/topics/TopicCard.tsx
lib/api/topics.ts
docs/tasks/<safe-branch>.md
docs/verification/<safe-branch>.md
docs/pr/<safe-branch>.md
docs/devlog/<safe-branch>.md
```

기존 `TopicCard`에 상세 링크를 추가할 수 있다.

단, 기존 목록 디자인과 카드 레이아웃을 과도하게 변경하지 않는다.

## 컴포넌트 / Route / API client 영향

### API client

기존 `lib/api/topics.ts`가 있다면 해당 파일을 확장한다.

Topic Detail API 응답 타입을 정의한다.

```ts
type TopicArticle = {
  article_id: number;
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  role: "representative" | "supporting" | string;
  similarity_score: number;
};

type TopicDetail = {
  id: number;
  topic_date: string;
  topic_candidate_id: string;
  title_ko: string;
  summary_ko: string;
  key_points: string[];
  keywords: string[];
  confidence: number;
  source_count: number;
  article_count: number;
  provider: string;
  model: string;
  status: string;
  summary_input_hash: string;
  created_at: string;
  updated_at: string;
  articles: TopicArticle[];
};
```

API client는 다음 조건을 만족해야 한다.

- `getTopic(id)` 또는 `getTopicDetail(id)` 형태로 topic id를 인자로 받는다.
- `id`는 number로 변환 가능한 route param만 허용한다.
- HTTP 404는 not-found 상태로 처리한다.
- HTTP 실패는 error 상태로 처리한다.
- 응답 schema가 예상과 다르면 error 상태로 처리한다.
- API base URL은 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 재사용한다.
- production API URL을 여러 곳에 하드코딩하지 않는다.

### Route / Page

상세 페이지 route를 추가한다.

Next.js App Router 기준 후보:

```text
app/topics/[id]/page.tsx
```

상세 페이지 진입 URL 예시:

```text
/topics/7
```

홈 topic card에는 상세 페이지로 이동하는 링크를 추가한다.

예시:

```text
오늘의 주요 이슈 card 클릭
→ /topics/{id}
```

단, 외부 article 원문 링크와 topic detail 내부 링크는 구분되어야 한다.

### Topic 상세 컴포넌트

상세 화면은 다음 영역으로 구성한다.

```text
TopicDetail
- 상단: topic 날짜, status, provider/model 개발용 표시
- 제목
- 요약
- 핵심 포인트 목록
- 키워드 목록
- source_count / article_count
- 관련 기사 목록
```

### 연결 article 목록

관련 article 목록은 다음 정보를 표시한다.

```text
- article title
- source
- published_at
- role
- similarity_score
- original url
```

`role`은 사용자에게 너무 개발적으로 보이면 다음과 같이 표시할 수 있다.

```text
representative → 대표 기사
supporting → 관련 기사
```

`similarity_score`는 개발 확인용으로 작게 표시하거나 숨긴다.  
노출하더라도 주요 정보보다 강조하지 않는다.

외부 article 링크는 다음 조건을 만족한다.

- `target="_blank"`
- `rel="noopener noreferrer"`
- 접근 가능한 link text 사용

## 상태 처리

다음 상태를 반드시 처리한다.

### Loading

상세 페이지 데이터 요청 중 사용자에게 loading 상태를 보여준다.

예시 문구:

```text
주요 이슈 상세를 불러오는 중입니다.
```

Next.js Server Component 구조상 route-level loading 파일을 사용하는 것이 자연스럽다면 다음 파일을 검토한다.

```text
app/topics/[id]/loading.tsx
```

### Error

API 요청 실패 또는 응답 검증 실패 시 화면이 깨지지 않도록 error state를 표시한다.

예시 문구:

```text
주요 이슈 상세를 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

Next.js route-level error boundary를 사용하는 것이 자연스럽다면 다음 파일을 검토한다.

```text
app/topics/[id]/error.tsx
```

단, error boundary가 Client Component를 요구하는 경우 기존 프로젝트 패턴을 따른다.

### Not Found

존재하지 않는 topic id이거나 API가 404를 반환하면 not-found 상태를 처리한다.

예시 문구:

```text
해당 주요 이슈를 찾을 수 없습니다.
```

Next.js App Router라면 `notFound()` 또는 `not-found.tsx` 사용을 검토한다.

### Success

Topic detail 응답이 정상일 경우 상세 내용을 렌더링한다.

## 스타일 / 반응형 / 접근성

스타일은 기존 프로젝트의 방식과 시각적 톤을 따른다.

- 기존 Tailwind/CSS module/plain CSS 등 실제 사용 중인 방식을 따른다.
- 새로운 UI library를 추가하지 않는다.
- 기존 홈 화면에서 사용 중인 색상, border, radius, shadow, spacing, typography 패턴을 우선 재사용한다.
- 새로운 디자인 시스템을 만들지 않는다.
- 전역 스타일, root layout, theme, font 설정을 변경하지 않는다.
- 상세 페이지는 기존 중앙 정렬 폭과 카드/섹션 스타일을 유지한다.
- 모바일에서도 요약, 핵심 포인트, 기사 목록이 세로로 자연스럽게 쌓이도록 한다.
- 긴 summary와 article title이 레이아웃을 깨지 않도록 한다.
- `key_points`는 목록으로 표시한다.
- `keywords`는 기존 chip 스타일이 있으면 재사용한다.
- 외부 링크는 시각적으로 클릭 가능해야 하며 접근 가능한 label을 제공한다.
- 날짜는 사람이 읽을 수 있는 형식으로 표시하되 원본 `dateTime` 속성을 가능한 유지한다.
- article 목록은 `<section>`, `<article>`, `<ul>`, `<li>`, `<time>` 등 semantic markup을 적절히 사용한다.

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

Topic Detail API response shape 확인:

```bash
curl -sS "https://api.dev-scj.site/topics/7"
```

단, production API 요청은 read-only response contract 확인으로만 제한한다.  
production deploy 또는 production verification 완료로 기록하지 않는다.

상세 route HTML marker 확인 후보:

```bash
npm run dev
curl -sS "http://localhost:3000/topics/7"
```

확인할 marker 예시:

```text
SpaceX IPO
관련 기사
대표 기사
DW English
Wired
Al Jazeera
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

- 홈 화면이 정상 로드된다.
- 홈 topic card를 클릭하면 `/topics/{id}` 상세 페이지로 이동한다.
- 상세 페이지에 title, summary, key points, keywords, source/article count가 표시된다.
- 연결 article 목록이 표시된다.
- article 원문 링크가 새 탭으로 열린다.
- 존재하지 않는 topic id에서 not-found 또는 error state가 표시된다.
- API 실패 상황에서 error state가 표시된다.
- loading 상태가 화면을 깨뜨리지 않는다.
- 모바일 폭에서 상세 페이지가 레이아웃을 유지한다.
- 브라우저 console에 secret, token, credential 값이 노출되지 않는다.
- 기존 홈 목록 UI가 깨지지 않는다.

실제 브라우저에서 확인하지 않았다면 완료로 주장하지 않는다.

## 완료 조건

- `/topics/{id}` 상세 route가 추가되어 있다.
- 홈 topic card에서 상세 페이지로 이동할 수 있다.
- Topic Detail API client 또는 fetch 함수가 추가되어 있다.
- Topic Detail 응답 타입과 runtime validation이 구현되어 있다.
- 상세 페이지에 summary, key points, keywords, metadata, 연결 article 목록이 표시된다.
- loading / error / not-found / success 상태가 처리되어 있다.
- 외부 article 원문 링크가 새 탭으로 열린다.
- 기존 홈 topic 목록 UI가 깨지지 않는다.
- 기존 디자인 톤, 레이아웃, spacing, typography를 크게 변경하지 않았다.
- backend, DB, K3s, Docker, Supabase SQL, secret, `.env` 관련 파일을 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/<safe-branch>.md`에 기록되어 있다.
- PR draft와 devlog draft가 실제 변경 사항과 검증 결과를 기준으로 작성되어 있다.
- production 배포 완료라고 주장하지 않는다.
- production verification은 사람이 제공한 로그가 있을 때만 완료로 기록한다.

## 참고 사항

40차에서 `/topics` 목록 API는 홈 화면에 연결되었다.

현재 확인된 detail API 예시:

```text
GET https://api.dev-scj.site/topics/7
```

응답 예시 요약:

```text
id: 7
title_ko: SpaceX IPO로 머스크 세계 최초 트릴리어네어 등극
provider: openai
model: gpt-5-nano
confidence: 0.72
article_count: 3
source_count: 3
articles:
- DW English, role=representative, similarity_score=1.0
- Wired, role=supporting, similarity_score=0.8022
- Al Jazeera, role=supporting, similarity_score=0.8674
```

`confidence`와 `similarity_score`는 다른 값이다.

- `confidence`: topic summary 생성 결과에 대한 confidence
- `similarity_score`: topic 안에서 article이 대표 article과 얼마나 유사한지 나타내는 값

이번 차수에서는 이 값을 사용자-facing 주요 정보로 강조하지 않는다.  
필요하면 개발 확인용으로 작게 표시한다.

현재 summary 품질에는 일부 어색한 문장, 특수문자, source/date 품질 이슈가 있을 수 있다.  
이번 차수에서는 데이터 품질을 수정하지 않고, 상세 탐색 흐름을 구현하는 데 집중한다.

후속 작업 후보:

- topic 목록 검색
- 날짜 필터
- 카테고리 필터
- provider/model 개발용 표시 제거
- summary line-clamp
- 대표 이미지 수집/표시
- topic 품질 개선
- published_at null 기사 처리
- source trust_level 반영
