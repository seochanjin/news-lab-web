# 작업: 홈 Topics API 전환 및 로딩 확인

## 목표

홈(`/`)의 주요 이슈 목록 조회를 기존 범용 Topics archive API에서 홈 전용 경량 API로 전환한다.

기존 구조:

```text
/ → GET /topics?page=1&page_size=10
```

변경 후 구조:

```text
/ → GET /topics/home
```

46차에서 backend에 `GET /topics/home` read-only endpoint를 추가했고, 운영 반영 후 다음 항목을 확인했다.

```text
- https://api.dev-scj.site/topics/home → HTTP 200
- top-level keys: generated_at, items, topic_date
- item keys: article_count, id, keywords, source_count, summary_ko, title_ko, topic_date
- provider/model/confidence/status/articles 제외 확인
- items length = 10
```

운영 응답 시간 비교 결과도 다음과 같이 확인했다.

```text
/topics/home 10회:
0.53s~0.70s, 평균 약 0.60s

/topics?page=1&page_size=10 10회:
0.70s~0.87s, 평균 약 0.82s
```

이번 작업의 목표는 홈 첫 화면의 topic data source를 `/topics/home`으로 전환하고, 기존 `/topics`, `/topics/[id]`, `/search`, `/articles` 동작을 깨지 않는 것이다.

이번 작업에서 프론트 서버 배포, 도메인 연결, backend cache/Redis/snapshot 구현은 수행하지 않는다.

## 프론트엔드 작업 범위

작업 repo:

```text
~/workspace/news-lab-web
```

작업 브랜치:

```text
feature/home-topics-api-switch
```

작업 범위:

```text
- 홈(`/`)의 주요 이슈 데이터 fetch를 `/topics/home`으로 전환
- home 전용 API client 함수 추가
- home 전용 response type/runtime validation 추가
- 기존 `getTopics(page, pageSize)`는 `/topics` archive용으로 유지
- 기존 `getTopicDetail(id)`는 `/topics/[id]` detail용으로 유지
- 홈 TopicList 또는 홈 전용 section에서만 `getHomeTopics()` 사용
- loading/error/empty/success 상태 유지
- `/topics`, `/topics/[id]`, `/search`, `/articles` route 동작 유지
- 필요 시 문서 업데이트
```

권장 API client 구조:

```text
lib/api/topics.ts
- getTopics(page, pageSize)      → 기존 /topics archive용 유지
- getTopicDetail(id)             → 기존 /topics/{id} detail용 유지
- getHomeTopics()                → 신규 /topics/home 홈 전용
```

## 변경하지 않을 항목

다음 항목은 변경하지 않는다.

```text
- Backend API code
- DB
- Supabase SQL
- K3s
- Docker
- production infrastructure
- secret
- .env
- .env.*
- GitHub Actions
- frontend production deploy
- domain/newslab.site 설정
```

금지 작업:

```text
- git push
- git merge
- production deploy command
- production-impacting command
- kubectl apply/delete/patch/rollout
- helm upgrade
- Supabase SQL 실행
- DB write
- backend repo 수정
```

이번 작업은 frontend code와 frontend docs만 대상으로 한다.

## 예상 변경 파일

예상 변경 파일:

```text
lib/api/topics.ts
components/topics/TopicList.tsx
app/page.tsx
docs/tasks/feature-home-topics-api-switch.md
docs/verification/feature-home-topics-api-switch.md
docs/reviews/feature-home-topics-api-switch-antigravity.md
docs/reviews/feature-home-topics-api-switch-coderabbit.md
docs/fixes/feature-home-topics-api-switch-approved-fixes.md
docs/pr/feature-home-topics-api-switch.md
docs/devlog/feature-home-topics-api-switch.md
docs/ARCHITECTURE.md
docs/RUNBOOK.md
```

실제 구현 구조에 따라 파일은 달라질 수 있다.  
최소 변경을 우선한다.

README는 다음 조건에 해당하지 않으면 수정하지 않는다.

```text
- 설치 방법 변경
- 환경 변수 변경
- 실행 방법 변경
- public user-facing 기능 설명 변경이 README 수준으로 필요한 경우
```

이번 작업은 API source 전환이므로, 보통 `docs/ARCHITECTURE.md`와 verification 문서만 수정하면 충분하다.

## 컴포넌트 / Route / API client 영향

### API client

`lib/api/topics.ts`에 home 전용 response type과 fetch 함수를 추가한다.

후보 type:

```ts
export type HomeTopic = {
  id: number;
  topic_date: string | null;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
};

export type HomeTopicsResponse = {
  generated_at: string;
  topic_date: string | null;
  items: HomeTopic[];
};
```

후보 함수:

```ts
export async function getHomeTopics(): Promise<HomeTopicsResponse> {
  // GET /topics/home
}
```

요구사항:

```text
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`를 기존 방식대로 사용
- response runtime validation 추가
- invalid response일 경우 명확한 error throw
- 기존 getTopics/getTopicDetail 함수는 변경하지 않거나, 필요한 최소 공통 유틸만 공유
```

### Home route

`app/page.tsx` 또는 홈 Topic section에서 기존 `/topics` 기반 fetch를 `/topics/home` 기반 fetch로 바꾼다.

기존:

```text
getTopics(1, 10)
```

변경:

```text
getHomeTopics()
```

홈 외 route는 변경하지 않는다.

### TopicList / TopicCard

기존 `TopicCard`가 `/topics/home` item과 호환된다면 재사용한다.  
다만 기존 `Topic` type에 provider/model/status/created_at/updated_at 등이 필수로 선언되어 있으면, home response와 맞지 않는다.

선택지:

```text
A. TopicCard가 필요한 최소 field만 받도록 props type을 좁힌다.
B. HomeTopic을 TopicCard가 받을 수 있는 공통 TopicCardData type으로 매핑한다.
C. Home 전용 TopicList를 만든다.
```

추천:

```text
TopicCard가 실제 렌더링에 필요한 최소 field만 받도록 공통 card type을 분리한다.
```

예상 공통 card field:

```text
id
topic_date
title_ko
summary_ko
keywords
source_count
article_count
```

주의:

```text
- provider/model/status 같은 dev/internal metadata를 다시 UI에 노출하지 않는다.
- 기존 /topics archive page의 card 표시가 깨지지 않게 한다.
```

### Route 영향

변경 대상:

```text
/
```

비변경 대상:

```text
/topics
/topics/[id]
/search
/articles
```

## 상태 처리

홈의 기존 상태 처리를 유지한다.

유지할 상태:

```text
- loading
- error
- empty
- success
```

구체 기준:

```text
- `/topics/home` fetch 전에는 기존 loading 문구 또는 skeleton 유지
- API error 발생 시 기존 error UI 유지
- `items.length === 0`이면 empty UI 표시
- success 시 기존 TopicCard list 표시
```

주의:

```text
- `/topics/home`의 top-level `topic_date`가 null이어도 items가 비어 있으면 정상 empty 상태로 처리
- `generated_at`은 필요하면 개발/운영 확인용으로만 사용하고, 사용자 UI에 과하게 노출하지 않는다
- home 전용 API로 전환해도 archive page의 pagination/count 표시는 유지한다
```

## 스타일 / 반응형 / 접근성

이번 작업은 API source 전환이 목적이다.  
대규모 디자인 변경은 하지 않는다.

유지할 항목:

```text
- 기존 홈 레이아웃
- 기존 TopicCard 스타일
- 기존 반응형 동작
- 기존 heading 구조
- 기존 링크 접근성
- 기존 loading/error/empty 상태의 의미 전달
```

확인할 항목:

```text
- TopicCard link가 `/topics/{id}`로 정상 이동하는지
- 홈에서 주요 이슈 목록이 keyboard navigation 가능한지
- loading/error/empty 상태가 텍스트로 의미를 전달하는지
- mobile width에서 card layout이 깨지지 않는지
```

변경하지 않을 항목:

```text
- Header 구조
- 통합 검색 UX
- /topics archive filter 정책
- /articles UI
- side rail layout
```

## 검증 Command

기본 검증:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git status --short --branch
```

환경 변수 기반 build 확인:

```bash
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build
```

Shell script syntax 확인:

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
```

API response 확인:

```bash
curl -sS https://api.dev-scj.site/topics/home | jq 'keys'
curl -sS https://api.dev-scj.site/topics/home | jq '.items[0] | keys'
curl -sS https://api.dev-scj.site/topics/home | jq '.items | length'
curl -sS https://api.dev-scj.site/topics/home | jq '.items[0] | has("provider"), has("model"), has("confidence"), has("status"), has("articles")'
```

예상 결과:

```text
top-level keys:
generated_at, items, topic_date

item keys:
article_count, id, keywords, source_count, summary_ko, title_ko, topic_date

internal fields:
provider/model/confidence/status/articles 모두 false

items length:
10
```

로컬 HTML marker 확인 후보:

```bash
npm run dev
```

다른 터미널에서:

```bash
curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"
curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"
```

주의:

```text
- Next.js dev Turbopack ChunkLoadError는 이번 API 전환과 별도 known issue로 기록한다.
- production deploy 검증은 이번 task에서 수행하지 않는다.
```

## 수동 브라우저 검증

가능하면 로컬 브라우저에서 다음을 확인한다.

### Home

```text
/
```

확인:

```text
- 주요 이슈가 정상 표시되는지
- loading이 기존보다 줄었는지 체감 확인
- TopicCard title/summary/keywords/source_count/article_count 표시가 유지되는지
- TopicCard 클릭 시 /topics/{id}로 이동하는지
- error/empty UI가 코드상 유지되는지
```

### Archive

```text
/topics
```

확인:

```text
- 기존 archive 목록이 정상 표시되는지
- /topics는 여전히 기존 /topics API를 사용하는지
- 전체 주요 이슈 보기 링크가 정상인지
```

### Detail

```text
/topics/13
```

또는 현재 운영에 존재하는 topic id.

확인:

```text
- topic detail page가 정상 표시되는지
- connected articles가 유지되는지
- 외부 article link가 새 탭으로 열리는지
```

### Search

```text
/search?query=중동
```

확인:

```text
- 통합 검색이 정상 동작하는지
- matching topics와 raw articles가 기존처럼 표시되는지
```

### Articles

```text
/articles
/articles?category=tech
/articles?query=Anthropic
```

확인:

```text
- 원문 모음 페이지가 정상 표시되는지
- query/category가 기존대로 동작하는지
```

### Responsive

확인 width 후보:

```text
- mobile width
- tablet width
- desktop width
```

확인:

```text
- home topic card layout이 깨지지 않는지
- header가 깨지지 않는지
- horizontal overflow가 없는지
```

### Console

확인:

```text
- API 전환으로 인한 runtime error가 없는지
- Hydration mismatch가 없는지
- Turbopack ChunkLoadError가 발생하면 API 전환과 별도 known issue로 기록
```

수동 브라우저 검증을 수행하지 못하면 verification 문서에 “미수행”으로 명확히 기록한다.

## 완료 조건

완료 조건:

```text
- 홈(`/`)이 `/topics/home`을 사용한다.
- 기존 `/topics?page=1&page_size=10` 홈 fetch가 제거되었거나 홈에서 더 이상 사용되지 않는다.
- `/topics` archive page는 기존 `/topics` API를 계속 사용한다.
- `/topics/[id]` detail page는 기존 `/topics/{id}` API를 계속 사용한다.
- `/search`와 `/articles` 동작이 깨지지 않는다.
- home topic card UI가 기존과 동일하거나 의도한 범위 내에서 유지된다.
- provider/model/confidence/status/debug field가 홈 UI에 다시 노출되지 않는다.
- loading/error/empty/success 상태가 유지된다.
- `npm run lint`가 통과한다.
- `npm run typecheck`가 통과한다.
- `npm run build`가 통과한다.
- `git diff --check`가 통과한다.
- 실행한 검증 command와 결과가 verification 문서에 기록되어 있다.
- backend code, DB, Supabase SQL, K3s, Docker, production infra, secret, `.env*`가 변경되지 않았다.
- production deploy 또는 production verification 완료를 주장하지 않는다.
```

## 참고 사항

Backend 46차에서 `/topics/home` 운영 반영과 응답 구조 확인이 완료되었다.

운영 확인 결과:

```text
GET https://api.dev-scj.site/topics/home
→ HTTP 200
```

응답 구조:

```text
top-level:
generated_at
items
topic_date

items[]:
id
topic_date
title_ko
summary_ko
keywords
source_count
article_count
```

제외 확인:

```text
provider: false
model: false
confidence: false
status: false
articles: false
```

응답 개수:

```text
items length = 10
```

응답 시간 비교:

```text
/topics/home:
0.53s~0.70s, 평균 약 0.60s

/topics?page=1&page_size=10:
0.70s~0.87s, 평균 약 0.82s
```

이번 47차는 이 backend API를 frontend home에서 사용하도록 전환하는 작업이다.

이번 작업은 `newslab.site` 도메인 연결이나 frontend production deploy를 포함하지 않는다.  
도메인 연결과 배포는 별도 차수에서 수행한다.

후속 후보:

```text
48차: 프론트 배포 준비 또는 newslab.site 도메인 연결
49차: 필요 시 Home Topics cache/snapshot/revalidate
50차 이후: embedding 저장 구조 검토로 복귀
```
