# 작업: 기간별 Topic 상세 페이지 API 매핑 정합성 수정

## 목표

Three-day Topic과 Weekly Topic 상세 페이지가 Backend API의 실제 응답 계약을 정확히 사용하도록 Frontend type, API client, ViewModel 또는 화면 매핑을 수정한다.

현재 Backend API는 기간 정보, `key_points`, `articles` 배열을 정상 반환하지만 Frontend 상세 페이지에서는 다음 문제가 발생한다.

```
Three-day Topic
- 기간 정보 없음 표시
- 관련 기사 총 0건 표시
- Backend 수정 전에는 핵심 포인트 누락

Weekly Topic
- 기간 정보 없음 표시
- 관련 기사 총 0건 표시
```

Backend 운영 확인 결과:

```
GET /three-day-topics/38
- key_points: 9개
- article_count: 4
- articles: 4개

GET /weekly-topics/8
- key_points: 존재
- article_count: 11
- articles: 11개
```

따라서 이번 작업은 Backend를 변경하지 않고 Frontend가 실제 API 필드명을 올바르게 읽고 화면에 표시하도록 상세 페이지 데이터 연결을 수정하는 데 목적이 있다.

최종 기대 흐름은 다음과 같다.

```
Three-day / Weekly 상세 API 호출
→ 실제 응답 type 검증
→ 기간별 field를 공통 ViewModel로 변환
→ key_points 연결
→ articles 배열을 관련 기사 목록으로 연결
→ 실제 목록 길이 기준 개수 표시
→ 외부 원문 링크 제공
```

## 프론트엔드 작업 범위

### Three-day Topic 상세

- `GET /three-day-topics/{topic_id}` 실제 응답 계약을 기준으로 Frontend type을 수정한다.
- 다음 필드를 정확히 연결한다.

```
reference_date
window_start
window_end
title_ko
summary_ko
key_points
keywords
article_count
source_count
articles
```

- `window_start`, `window_end`를 사용자에게 읽기 쉬운 기간 문자열로 표시한다.
- Backend 65차에서 추가된 `key_points`를 상세 화면의 핵심 포인트 영역에 연결한다.
- `articles` 배열을 관련 기사 목록에 연결한다.
- 화면의 관련 기사 개수는 실제 렌더링 배열 길이와 일치해야 한다.
- `published_at`이 `null`인 기사도 오류 없이 렌더링한다.
- `is_representative`, `is_summary_evidence` 역할을 현재 UI에서 사용하고 있다면 기존 의미를 유지한다.

### Weekly Topic 상세

- `GET /weekly-topics/{topic_id}` 실제 응답 계약을 기준으로 Frontend type을 수정한다.
- 다음 필드를 정확히 연결한다.

```
week_start
week_end
window_start
window_end
title_ko
summary_ko
key_points
keywords
article_count
source_count
articles
```

- 기간은 우선 `week_start`, `week_end`를 사용해 표시한다.
- 기존 `key_points` 표시를 유지한다.
- `articles` 배열을 관련 기사 목록에 연결한다.
- 화면의 관련 기사 개수는 실제 렌더링 배열 길이와 일치해야 한다.
- `published_at`이 `null`인 기사도 오류 없이 렌더링한다.

### 공통 상세 UI

- Three-day와 Weekly의 서로 다른 Backend field를 공통 상세 ViewModel 또는 공통 component props로 변환한다.
- Backend response type과 화면 표시용 type을 불필요하게 혼합하지 않는다.
- 기존 공통 상세 component가 있다면 API별 mapper에서 공통 props를 생성한다.
- 관련 기사 항목에는 최소한 다음 정보를 표시한다.

```
기사 제목
출처
발행일 또는 발행일 정보 없음
원문 링크
```

- 기사 링크는 외부 URL이므로 새 탭에서 연다.
- `target="_blank"` 사용 시 `rel="noopener noreferrer"`를 함께 적용한다.
- Backend의 `rank` 순서를 유지한다.
- API가 이미 정렬된 배열을 반환하므로 특별한 이유 없이 Frontend에서 재정렬하지 않는다.
- 현재 상세 페이지의 시각 구조와 디자인을 가능한 범위에서 유지한다.

### 데이터 정합성

- `article_count`와 `articles.length`가 모두 존재하는 경우 실제 렌더링 개수는 `articles.length`를 기준으로 한다.
- 불일치가 있어도 화면이 깨지지 않아야 한다.
- 개발 환경에서 필요한 경우 정합성 확인 로직을 둘 수 있지만 운영 UI에 불필요한 경고 문구를 노출하지 않는다.
- 배열 field가 누락되거나 비정상 값인 경우 안전하게 빈 배열로 정규화한다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Three-day Topic 생성 pipeline을 변경하지 않는다.
- Weekly Topic 생성 pipeline을 변경하지 않는다.
- Backend endpoint 이름과 response contract를 변경하지 않는다.
- Homepage의 오늘·최근 3일·지난주 carousel 구성을 변경하지 않는다.
- 홈 화면 카드 레이아웃과 독립 carousel state를 변경하지 않는다.
- Daily Topic 상세 또는 목록 기능을 불필요하게 변경하지 않는다.
- 검색 화면, 원문 모음, archive 화면을 변경하지 않는다.
- 외부 UI library를 새로 도입하지 않는다.
- dependency를 추가하거나 변경하지 않는다.
- 관련 기사 수정을 이유로 상세 페이지 전체 디자인을 재설계하지 않는다.
- 기사 원문 URL을 Frontend proxy로 우회하지 않는다.
- Backend 응답을 임의 field명으로 추측해 호환 alias를 과도하게 추가하지 않는다.
- `article_count` 숫자만으로 가짜 관련 기사 item을 만들지 않는다.
- 테스트나 브라우저 검증을 실행하지 않은 상태에서 완료로 기록하지 않는다.

## 예상 변경 파일

실제 저장소 구조를 먼저 조사한 뒤 필요한 파일만 수정한다.

예상 확인 또는 수정 파일:

```
app/three-day-topics/[id]/page.tsx
app/three-day-topics/[id]/loading.tsx
app/three-day-topics/[id]/error.tsx
app/three-day-topics/[id]/not-found.tsx

app/weekly-topics/[id]/page.tsx
app/weekly-topics/[id]/loading.tsx
app/weekly-topics/[id]/error.tsx
app/weekly-topics/[id]/not-found.tsx

lib/api/three-day-topics.ts
lib/api/weekly-topics.ts

components/topics/*
components/topic-detail/*
types/*
```

예상 테스트 파일:

```
*.test.ts
*.test.tsx
__tests__/*
```

문서 파일:

```
docs/tasks/<current-task>.md
docs/verification/<current-task>.md
docs/reviews/<current-task>-antigravity.md
docs/reviews/<current-task>-coderabbit.md
docs/fixes/<current-task>-approved-fixes.md
docs/pr/<current-task>.md
docs/devlog/<current-task>.md
```

정확한 파일명은 실제 코드 구조를 우선한다.

공통 상세 component 또는 mapper가 이미 존재한다면 중복 component를 새로 만들지 않는다.

Three-day와 Weekly page가 같은 component를 공유하지 않고 있더라도, 이번 수정만을 위해 과도한 공통화 리팩터링을 수행하지 않는다.

## 컴포넌트 / Route / API client 영향

### Route

다음 route의 표시 계약만 수정한다.

```
/three-day-topics/[id]
/weekly-topics/[id]
```

기존 loading, error, not-found 동작을 유지한다.

### API client

Three-day 상세 응답 type은 실제 Backend contract와 일치해야 한다.

예상 형태:

```tsx
type PeriodTopicArticleResponse = {
  article_id: number;
  title: string;
  url: string;
  published_at: string | null;
  source: string;
  rank: number;
  similarity: number;
  is_representative: boolean;
  is_summary_evidence: boolean;
};

type ThreeDayTopicDetailResponse = {
  id: number;
  reference_date: string;
  window_start: string;
  window_end: string;
  title_ko: string;
  summary_ko: string;
  key_points: string[];
  keywords: string[];
  article_count: number;
  source_count: number;
  status: string;
  provider: string;
  model: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
  articles: PeriodTopicArticleResponse[];
};
```

Weekly 상세 응답 type은 실제 Backend contract와 일치해야 한다.

```tsx
type WeeklyTopicDetailResponse = {
  id: number;
  week_start: string;
  week_end: string;
  window_start: string;
  window_end: string;
  title_ko: string;
  summary_ko: string;
  key_points: string[];
  keywords: string[];
  confidence: number | null;
  article_count: number;
  source_count: number;
  status: string;
  provider: string;
  model: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
  articles: PeriodTopicArticleResponse[];
};
```

정확한 optional 여부는 실제 API 응답과 기존 code를 조사해 결정한다.

API response를 기존 Frontend 공통 상세 type으로 변환할 경우 mapper에서 다음을 명시적으로 처리한다.

```
Three-day 기간: window_start ~ window_end
Weekly 기간: week_start ~ week_end
핵심 포인트: key_points ?? []
관련 기사: articles ?? []
관련 기사 개수: articles.length
```

### 상세 component

공통 상세 component가 다음과 같은 잘못된 field를 기대하고 있다면 실제 ViewModel field로 수정한다.

```
related_articles
relatedArticles
period_start
period_end
```

Backend response object를 component가 직접 여러 방식으로 해석하기보다 page 또는 mapper 단계에서 화면 표시용 props를 확정한다.

관련 기사 component에는 안정적인 key를 사용한다.

```
article.article_id
```

## 상태 처리

### Loading

- 기존 상세 route의 loading UI를 유지한다.
- 데이터 mapping 수정 때문에 loading 상태를 제거하지 않는다.

### Error

- API 호출 실패 시 기존 error boundary 또는 error UI를 유지한다.
- Three-day 또는 Weekly 상세 실패를 빈 데이터 성공으로 오인하지 않는다.

### Not Found

- Backend 404는 기존 not-found 처리와 일치해야 한다.
- 유효하지 않은 ID 또는 존재하지 않는 Topic은 기존 route 정책을 유지한다.

### Empty State

- `key_points`가 빈 배열이면 기존 핵심 포인트 empty state를 유지하거나 section을 숨기는 현재 정책을 따른다.
- Backend가 정상적으로 배열을 반환하는 경우 empty state가 잘못 표시되지 않아야 한다.
- `articles`가 실제 빈 배열일 때만 관련 기사 empty state를 표시한다.
- `article_count`가 양수더라도 `articles` 배열이 빈 경우 임의 item을 생성하지 않는다.
- `published_at`이 `null`이면 발행일 영역을 숨기거나 `발행일 정보 없음`처럼 기존 UI 문구로 처리한다.

### Defensive Normalization

API 경계에서 필요한 경우 다음처럼 정규화한다.

```tsx
const keyPoints = Array.isArray(response.key_points) ? response.key_points : [];

const articles = Array.isArray(response.articles) ? response.articles : [];
```

비정상 응답을 조용히 왜곡하기보다 기존 error 처리 정책과 일치하는 범위에서 적용한다.

## 스타일 / 반응형 / 접근성

- 현재 상세 페이지의 카드, border, spacing, typography를 유지한다.
- 관련 기사 영역은 desktop과 mobile에서 가로 overflow가 발생하지 않아야 한다.
- 긴 기사 제목은 layout을 깨지 않도록 줄바꿈한다.
- 긴 URL 자체를 화면 text로 직접 노출하지 않는다.
- 기사 제목 링크는 keyboard focus가 가능해야 한다.
- focus-visible 스타일이 기존 전역 스타일 또는 component 스타일에 의해 유지되는지 확인한다.
- 링크 목적이 제목만으로 이해 가능해야 한다.
- 새 탭 링크에는 `rel="noopener noreferrer"`를 적용한다.
- 출처와 발행일은 보조 정보로 시각적 위계를 낮추되 읽을 수 있는 대비를 유지한다.
- 모바일에서 관련 기사 metadata가 겹치거나 잘리지 않아야 한다.
- 핵심 포인트 list는 기존 semantic list 구조를 유지한다.
- 단순 시각 장식을 위해 접근성 없는 click handler를 추가하지 않는다.
- 전체 article card를 클릭 가능하게 만들 경우 내부 링크 중첩을 만들지 않는다.

## 검증 Command

프로젝트 package manager와 기존 script를 먼저 확인한다.

```bash
cat package.json
```

```bash
rg -n \
  "three-day-topics|weekly-topics|related_articles|articles|window_start|week_start|key_points" \
  app components lib types
```

Lint:

```bash
npm run lint
```

Type check script가 존재하는 경우:

```bash
npm run typecheck
```

별도 typecheck script가 없다면 기존 project convention에 따라 실행한다.

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

관련 테스트 script가 존재하는 경우 실제 파일명과 script에 맞게 실행한다.

```bash
npm test
```

또는:

```bash
npm run test
```

변경 범위 확인:

```bash
git status --short
git diff --stat
git diff --check
git diff --name-only
```

금지 영역 변경 확인:

```bash
git diff -- \
  package.json \
  package-lock.json \
  pnpm-lock.yaml \
  yarn.lock \
  Dockerfile \
  k8s \
  .github
```

기존 홈 화면과 carousel의 의도하지 않은 변경을 확인한다.

```bash
git diff -- \
  app/page.tsx \
  components
```

`components` 전체에 공통 상세 component 수정이 포함될 수 있으므로 실제 diff를 검토해 홈 화면 영향 여부를 판단한다.

Verification 문서에는 실제 실행한 command와 실제 결과만 기록한다.

존재하지 않는 test script를 실행한 것처럼 기록하지 않는다.

## 수동 브라우저 검증

로컬 개발 서버 또는 production 반영 후 다음 route를 확인한다.

### Three-day Topic

```
/three-day-topics/38
```

확인 항목:

- `기간 정보 없음`이 표시되지 않는다.
- `window_start`, `window_end` 기반 기간이 표시된다.
- 핵심 포인트 9개가 표시된다.
- 관련 기사 header에 `총 4건`이 표시된다.
- 실제 관련 기사 item 4개가 표시된다.
- 기사 순서가 Backend `rank` 순서와 일치한다.
- 출처가 표시된다.
- `published_at = null`인 DW English 기사도 오류 없이 표시된다.
- 기사 제목 클릭 시 원문이 새 탭에서 열린다.
- 빈 관련 기사 안내 문구가 표시되지 않는다.

### Weekly Topic

```
/weekly-topics/8
```

확인 항목:

- `기간 정보 없음`이 표시되지 않는다.
- `2026-06-22 ~ 2026-06-28` 범위가 표시된다.
- 기존 핵심 포인트가 유지된다.
- 관련 기사 header에 `총 11건`이 표시된다.
- 실제 관련 기사 item 11개가 표시된다.
- 기사 순서가 Backend `rank` 순서와 일치한다.
- 출처와 발행일이 정상 표시된다.
- `published_at = null`인 기사도 오류 없이 표시된다.
- 기사 제목 클릭 시 원문이 새 탭에서 열린다.
- 빈 관련 기사 안내 문구가 표시되지 않는다.

### 반응형

최소 다음 viewport를 확인한다.

```
Desktop: 약 1440px 이상
Tablet: 약 768px
Mobile: 약 375px
```

확인 항목:

- 기사 제목과 metadata가 겹치지 않는다.
- 가로 scroll이 생기지 않는다.
- 관련 기사 item 사이 구분이 유지된다.
- 핵심 포인트와 키워드 영역이 깨지지 않는다.
- 외부 링크 focus와 click이 정상 동작한다.

수동 브라우저 검증을 수행하지 않았다면 Verification에 미수행으로 기록한다.

## 완료 조건

- Three-day Topic 상세 API type이 실제 Backend response와 일치한다.
- Weekly Topic 상세 API type이 실제 Backend response와 일치한다.
- Three-day 상세에서 `key_points`가 표시된다.
- Three-day 상세에서 `window_start`, `window_end` 기반 기간이 표시된다.
- Weekly 상세에서 `week_start`, `week_end` 기반 기간이 표시된다.
- Three-day와 Weekly의 `articles` 배열이 관련 기사 목록에 연결된다.
- Three-day `/three-day-topics/38`에서 관련 기사 4개가 표시된다.
- Weekly `/weekly-topics/8`에서 관련 기사 11개가 표시된다.
- 화면 개수는 실제 렌더링 배열 길이와 일치한다.
- `published_at = null`인 기사도 오류 없이 표시된다.
- 외부 기사 링크가 새 탭에서 안전하게 열린다.
- 실제 빈 배열일 때만 관련 기사 empty state가 표시된다.
- 기존 loading, error, not-found 처리가 유지된다.
- 홈 화면과 기간별 carousel 동작에 회귀가 없다.
- Backend, DB, K3s, Docker, Secret, dependency가 변경되지 않는다.
- lint가 통과한다.
- typecheck가 통과한다.
- build가 통과한다.
- 관련 test script가 존재하면 테스트가 통과한다.
- `git diff --check`가 통과한다.
- Desktop, Tablet, Mobile 수동 브라우저 검증 결과가 기록된다.
- Verification에는 실제 실행한 command와 결과만 기록된다.

## 참고 사항

확인된 Backend 응답 계약은 다음과 같다.

Three-day Topic 38:

```
reference_date: 2026-07-01
window_start: 2026-06-27T20:00:07.233407+00:00
window_end: 2026-06-30T20:00:07.233407+00:00
key_points: 9개
article_count: 4
articles: 4개
```

Weekly Topic 8:

```
week_start: 2026-06-22
week_end: 2026-06-28
key_points: 존재
article_count: 11
articles: 11개
```

Three-day `window_start`, `window_end`는 UTC timestamp다. 화면 표시 시 기존 date utility와 locale 정책을 조사한다.

Backend의 72시간 window를 단순히 임의 날짜 문자열로 잘라 표시하지 않고 기존 프로젝트의 timezone 정책과 일치시킨다.

Weekly는 완료된 calendar week이므로 `week_start`, `week_end`를 표시용 source of truth로 사용한다.

관련 기사 개수는 화면에 실제 표시하는 `articles.length`를 source of truth로 사용한다.

Task 문서는 작업 계획과 범위만 유지한다. 조사 결과, 실제 변경 내용, 실행 command와 결과는 Verification에 기록한다.

## Implementation Units

- [ ] UNIT-01: 기간별 Topic 상세 route, API type, mapper와 관련 기사 component 구조 조사
- [ ] UNIT-02: Three-day·Weekly 기간, key_points와 articles 매핑 수정
- [ ] UNIT-03: lint·typecheck·build·브라우저 검증 및 문서 정리
