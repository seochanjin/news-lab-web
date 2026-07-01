# 기간별 Topic 상세 페이지 API 매핑 정합성 수정

## 작업 목적
Three-day Topic과 Weekly Topic 상세 화면이 Backend의 실제 detail 응답을 정확히 읽도록 프론트엔드 API mapping과 상세 화면 표시 기준을 수정하는 것이 목적이었다.

이번 작업은 Backend API, DB, 생성 pipeline을 바꾸지 않고 NewsLab Web 프론트엔드의 type, runtime mapping, 공통 상세 UI props 연결을 실제 응답 contract에 맞추는 범위로 제한했다.

## 기존 문제
기간별 Topic 상세 공통 mapper가 `period_start`, `period_end`, `role`, `similarity_score` 같은 기존 frontend/daily-topic 계열 field를 기대하고 있었다. 실제 period detail 응답은 다음 field를 반환한다.

- Three-day: `reference_date`, `window_start`, `window_end`
- Weekly: `week_start`, `week_end`, `window_start`, `window_end`
- Article: `rank`, `similarity`, `is_representative`, `is_summary_evidence`

이 차이 때문에 정상 API 응답에서도 기간이 “기간 정보 없음”으로 떨어지고, `articles` 배열이 기존 `TopicArticle` shape 검증을 통과하지 못해 관련 기사 0건으로 표시될 수 있었다.

## 변경 내용
- `lib/api/topics.ts`
  - period detail raw response type을 실제 API contract 기준으로 추가했다.
  - Three-day와 Weekly의 날짜 field를 route kind에 따라 공통 상세 ViewModel로 변환하도록 했다.
  - period article 응답을 기존 `TopicArticleList`가 받는 `TopicArticle` props로 변환했다.
  - `articles` field가 배열이 아니거나 item shape가 맞지 않으면 렌더링 가능한 배열만 남기도록 기존 API 경계 정규화 방식을 유지했다.
- `components/topics/PeriodTopicDetail.tsx`
  - 상단 “연결 기사” 개수를 `article_count`가 아니라 실제 렌더링 배열인 `topic.articles.length` 기준으로 표시하도록 변경했다.
- `components/topics/TopicArticleList.tsx`
  - `published_at`이 없거나 파싱 불가한 경우 `발행일 정보 없음`을 표시하도록 변경했다.
  - `summary_evidence` role을 `요약 근거`로 표시할 수 있게 했다.

## 구현 상세
- Three-day mapping:
  - `topic_date`: `reference_date`
  - `period_start`: `window_start`
  - `period_end`: `window_end`
- Weekly mapping:
  - `topic_date`: `week_start`
  - `period_start`: `week_start`
  - `period_end`: `week_end`
- Article mapping:
  - `article_id`, `title`, `url`, `source`, `published_at`은 그대로 전달
  - `similarity`는 `similarity_score`로 변환
  - `is_representative`는 `representative`, `is_summary_evidence`는 `summary_evidence`, 나머지는 `supporting` role로 변환
  - Backend가 반환한 `articles` 배열 순서를 유지하고 frontend 재정렬은 하지 않음

Routing 측면에서는 `/three-day-topics/[id]`, `/weekly-topics/[id]` page와 route-level loading/error/not-found 파일을 변경하지 않았다. 상세 route의 fetch 경로와 404 처리 정책을 유지하고, API client 경계의 mapper만 route kind를 전달받도록 조정했다.

상태 UI는 기존 정책을 유지했다. `key_points`가 비면 기존 핵심 포인트 empty state가 보이고, `articles`가 실제 빈 배열일 때만 관련 기사 empty state가 보인다. `article_count` 숫자로 가짜 관련 기사 item을 만들지 않았다.

접근성과 link 동작은 기존 구조를 유지했다. 관련 기사 제목 링크는 기존 `target="_blank"`와 `rel="noopener noreferrer"`를 그대로 사용하며, URL 문자열 자체를 화면에 길게 노출하지 않는다. 긴 제목은 기존 `break-words` class로 줄바꿈된다.

## 대안 검토
- UI component가 raw backend object를 직접 여러 방식으로 해석하는 방식은 배제했다. Three-day와 Weekly field 차이가 component에 퍼지면 상세 UI 유지보수가 어려워진다.
- `article_count` 값으로 placeholder article을 만드는 방식은 배제했다. 실제 렌더링 가능한 `articles` 배열이 없으면 empty state를 보여야 한다.
- Three-day와 Weekly 전용 상세 component를 새로 만드는 방식도 배제했다. 기존 공통 `PeriodTopicDetail`과 `TopicArticleList`로 표현 가능한 차이이며, 이번 수정만을 위한 과한 component 분리는 필요하지 않았다.

## 선택한 접근과 근거
API client 경계에서 raw response를 공통 상세 ViewModel로 변환하는 방식을 선택했다. 이 방식은 기존 App Router route, loading/error/not-found 동작, 상세 UI 구조를 유지하면서 Backend contract 차이를 `lib/api/topics.ts` 내부로 제한한다.

작업 요구사항도 “Backend response type과 화면 표시용 type을 불필요하게 혼합하지 않는다”와 “API별 mapper에서 공통 props를 생성한다”를 요구하므로, raw response type과 화면용 `PeriodTopicDetail` type을 분리하는 접근이 가장 직접적이었다.

## 트레이드오프
- `PeriodTopicDetail` type은 화면용 ViewModel로 유지하고 raw response type과 분리했다. type 수는 늘지만 UI component가 API별 field를 알 필요가 없어진다.
- Runtime validation은 period article item의 필수 field를 확인한 뒤 유효한 item만 렌더링한다. 비정상 item이 섞이면 해당 item은 빠질 수 있지만, 화면은 깨지지 않고 실제 렌더링 배열 길이 기준으로 개수를 표시한다.
- Three-day의 `window_start`, `window_end`는 timestamp 문자열일 수 있다. 현재 상세 UI의 날짜 formatter는 기존 정책을 유지하며, 실제 브라우저 표시 검증은 pending으로 남겼다.

## 테스트 및 브라우저 확인
Verification 문서에 기록된 실제 실행 결과는 다음과 같다.

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과. Next.js 16.2.7 build가 성공했고 `/three-day-topics/[id]`, `/weekly-topics/[id]` route가 dynamic server-rendered route로 포함됐다.
- `git diff --check`: 통과
- `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock Dockerfile k8s .github`: 출력 없음
- `git diff --name-only`: 변경 tracked file은 `components/topics/PeriodTopicDetail.tsx`, `components/topics/TopicArticleList.tsx`, `lib/api/topics.ts`
- `git diff --stat`: 3 files changed, 134 insertions(+), 19 deletions(-)
- `git diff -- app/page.tsx components`: 홈 `app/page.tsx` 변경 없음. component diff는 period detail count와 article list null 발행일/role 문구 변경만 확인
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 기존 문서, ignore rule, workflow secret 이름 reference, Kubernetes TLS Secret 이름, `package-lock.json`의 `js-tokens` package name 등 기존 reference 탐지
- `git diff -U0 | rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: match 없음

수동 브라우저 검증은 수행하지 않았다. 사람이 제공한 manual verification 로그도 없다. 따라서 `/three-day-topics/38`, `/weekly-topics/8`, desktop/tablet/mobile responsive 확인, 원문 링크 새 탭 동작 확인은 pending이다.

## 운영 반영
운영 배포, rollout, production verification, PR merge는 수행하지 않았다.

Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`는 수정하지 않았다. `git push`, `git merge`, production-impacting command도 실행하지 않았다.

## README 업데이트 판단
README는 수정하지 않았다.

이번 변경은 API response mapping과 상세 화면 표시 기준 수정이며, 로컬 실행 방법, 환경 변수명, 배포 절차, 사용자 문서가 바뀌지 않았다. `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 사용 방식도 변경하지 않았다.

## 확인 결과
- 실제 코드 변경 파일:
  - `lib/api/topics.ts`
  - `components/topics/PeriodTopicDetail.tsx`
  - `components/topics/TopicArticleList.tsx`
- workflow 문서 파일:
  - `docs/tasks/fix-period-topic-detail-mapping.md`
  - `docs/verification/fix-period-topic-detail-mapping.md`
  - `docs/pr/fix-period-topic-detail-mapping.md`
  - `docs/devlog/fix-period-topic-detail-mapping.md`
  - `docs/reviews/fix-period-topic-detail-mapping-antigravity.md`
  - `docs/reviews/fix-period-topic-detail-mapping-coderabbit.md`
  - `docs/fixes/fix-period-topic-detail-mapping-approved-fixes.md`
- 승인된 review fix: 없음. `docs/fixes/fix-period-topic-detail-mapping-approved-fixes.md`에 승인 항목이 없다.

## 이번 단계의 의미
Three-day/Weekly 상세 화면이 실제 period topic detail 응답을 표시할 수 있도록 frontend contract mismatch를 제거했다.

특히 기간 field와 article field의 불일치를 API client 경계에서 해결해, 상세 UI는 기존 공통 component 구조를 유지하면서 `key_points`, `articles`, 실제 렌더링 개수 기준 표시를 받을 수 있게 됐다.

## 포트폴리오용 요약
기간별 Topic 상세 페이지의 API response mapping을 실제 Backend contract에 맞게 수정했다. Three-day와 Weekly의 날짜 field 차이를 API client에서 공통 ViewModel로 정규화하고, 관련 기사 배열을 실제 article 응답 field에서 변환해 상세 화면의 기간, 핵심 포인트, 관련 기사 개수가 올바르게 표시되도록 했다. lint, typecheck, build와 diff 범위 검증을 통과했으며, 실브라우저 확인은 별도 pending으로 분리했다.

## 다음 단계 후보
- backend 연결 상태에서 `/three-day-topics/38` manual browser verification 수행
- backend 연결 상태에서 `/weekly-topics/8` manual browser verification 수행
- desktop 약 1440px, tablet 약 768px, mobile 약 375px에서 관련 기사 metadata와 긴 제목 layout 확인
- 실제 원문 링크 새 탭 동작 확인
