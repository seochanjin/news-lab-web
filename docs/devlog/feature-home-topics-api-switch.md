# 홈 Topics API 전환 및 로딩 확인

## 작업 목적

홈(`/`)의 주요 이슈 목록 fetch를 archive API `GET /topics?page=1&page_size=10`에서 홈 전용 경량 API `GET /topics/home`으로 전환했다.

## 기존 문제

홈이 archive 목록 API를 사용해 pagination metadata와 내부 topic metadata를 포함한 더 큰 응답 contract에 의존하고 있었다. 이번 task의 backend 변경으로 홈 화면에는 `id`, `topic_date`, `title_ko`, `summary_ko`, `keywords`, `source_count`, `article_count`만 필요한 경량 응답을 사용할 수 있게 됐다.

## 변경 내용

- `lib/api/topics.ts`에 `HomeTopic`, `HomeTopicsResponse`, `getHomeTopics()`와 runtime validation을 추가했다.
- `components/topics/TopicList.tsx`의 홈 목록 fetch를 `getHomeTopics()`로 변경했다.
- `components/topics/TopicCard.tsx` props를 카드 렌더에 필요한 최소 field로 좁혀 archive `Topic`과 home `HomeTopic`이 모두 재사용할 수 있게 했다.
- `docs/ARCHITECTURE.md`에 홈 전용 `/topics/home`과 archive/search용 `/topics` 구분을 반영했다.

## 구현 상세

- 기존 `getTopics(page, pageSize)`는 `/topics` archive/search용으로 유지했다.
- 기존 `getTopicDetail(id)`는 `/topics/{id}` detail용으로 유지했다.
- API base URL 조회는 기존 환경 변수 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 그대로 사용한다.
- 홈 응답의 `topic_date`가 `null`일 수 있어 `TopicCard`에서 `날짜 미정` fallback과 optional `dateTime`을 처리한다.
- provider/model/confidence/status/articles는 home type과 UI에 추가하지 않았다.

## 대안 검토

- Home 전용 카드 컴포넌트를 새로 만들 수 있었지만, 렌더 필드가 기존 `TopicCard`와 같아 props type을 공통 최소 field로 좁히는 쪽이 변경량이 작았다.
- Archive `Topic`을 home shape로 변환하는 mapper도 가능했지만, 불필요한 변환 없이 structural typing으로 재사용했다.

## 선택한 접근과 근거

작업 범위가 API source 전환이므로 UI와 route 구조는 유지하고 API client/type boundary만 확장했다. 이 방식은 `/topics`, `/topics/[id]`, `/search`, `/articles`의 기존 API 사용을 보존하면서 홈만 `/topics/home`을 사용하게 한다.

## 트레이드오프

- 홈 header에는 archive total이 없으므로 `전체 N개 중 M개` 대신 `주요 이슈 M개` 문구를 사용한다.
- `generated_at`과 top-level `topic_date`는 현재 UI에 노출하지 않고 runtime validation만 수행한다.

## 테스트 및 브라우저 확인

근거는 `docs/verification/feature-home-topics-api-switch.md`에 기록했다.

- `npm run lint`, `npm run typecheck`, `npm run build`, env 기반 build 모두 통과.
- `/topics/home` 운영 API shape 확인 완료.
- local dev server에서 `/`, `/topics`, `/articles` HTML marker curl 확인 완료.
- 수동 브라우저, responsive viewport, browser console 확인은 미수행.

## 운영 반영

frontend production deploy, production verification, domain 연결은 이번 task에서 수행하지 않았다.

## README 업데이트 판단

설치 방법, 환경 변수명, 실행 방법이 바뀌지 않아 README는 수정하지 않았다.

## 확인 결과

- 홈은 `getHomeTopics()`를 통해 `/topics/home`을 사용한다.
- Archive/search는 기존 `getTopics()`를 계속 사용한다.
- Topic detail은 기존 `getTopicDetail()`을 계속 사용한다.
- backend, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`는 변경하지 않았다.

## 이번 단계의 의미

홈 첫 화면의 API contract를 경량화하면서 archive/detail/search/articles route의 기존 contract를 분리해 유지했다.

## 포트폴리오용 요약

NewsLab Web 홈 주요 이슈 섹션을 홈 전용 Topics API로 전환하고, runtime response validation과 shared card data type을 정리해 archive/detail/search 흐름과 독립적으로 유지했다.

## 다음 단계 후보

- 실제 브라우저에서 `/`, `/topics`, `/topics/{id}`, `/search`, `/articles` 확인
- mobile/tablet/desktop responsive 확인
- 필요 시 frontend deploy와 domain 연결은 별도 task에서 진행
