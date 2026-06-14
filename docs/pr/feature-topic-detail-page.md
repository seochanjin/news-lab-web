# Topic 상세 페이지 MVP

## 작업 내용

- 홈의 topic card에서 `/topics/{id}` 상세 페이지로 이동하는 탐색 흐름을 추가했다.
- 기존 Topics Detail API를 사용해 하나의 topic 요약, 핵심 포인트, 키워드, metadata와 연결 article 목록을 표시한다.
- 상세 route의 loading, error, not-found, success 상태를 처리한다.

## 주요 변경 사항

- `lib/api/topics.ts`
  - Topic Detail 및 연결 article 타입과 runtime validation을 추가했다.
  - `getTopicDetail(id)`를 추가하고 잘못된 ID/API 404와 다른 HTTP/schema 오류를 구분한다.
  - 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`과 `cache: "no-store"` 동작을 유지한다.
- `app/topics/[id]/`
  - 숫자로 변환 가능한 양의 정수 ID만 허용하는 dynamic route를 추가했다.
  - API 404와 잘못된 ID는 `notFound()`로 처리한다.
  - Route-level loading, error, not-found UI를 추가하고 error 상태에는 재시도 동작을 제공한다.
- `components/topics/`
  - 상세 화면에 제목, 요약, 핵심 포인트, 키워드, 출처/기사 수, 개발 확인용 provider/model/confidence를 표시한다.
  - 연결 article의 title, source, published time, role, similarity score와 원문 링크를 표시한다.
  - 안전한 `http/https` 원문 URL만 새 탭 링크로 렌더링한다.
- `components/topics/TopicCard.tsx`
  - 홈 topic card 전체를 접근 가능한 Next.js `Link`로 연결했다.
- 승인된 수정 적용
  - 기존 홈 header/search/category navigation을 공용 `SiteHeader`로 추출해 홈과 상세 success/loading/error/not-found 화면에서 재사용한다.
  - 홈에서만 `전체` category를 현재 항목으로 표시하고 상세 route에서는 잘못된 `aria-current`를 표시하지 않는다.
  - 상세 error boundary가 `useEffect`에서 식별 가능한 메시지와 error 객체를 로깅하도록 보완했다.

## 프론트엔드/API 영향

- Frontend에서 기존 `GET /topics/{id}` endpoint를 읽기 전용으로 사용한다.
- Topic Detail API response가 예상 schema와 다르면 상세 error 상태로 처리한다.
- API 404와 유효하지 않은 route ID는 상세 not-found 상태로 처리한다.
- 외부 article 링크와 내부 topic 상세 링크를 구분한다.
- 검색 UI와 category navigation은 기존 형태를 재사용하며 검색/필터 기능 자체는 새로 구현하지 않았다.
- Backend API contract, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`는 변경하지 않았다.

## 상태 및 UX 영향

- Success: topic summary, 핵심 포인트, 키워드, metadata와 연결 article 목록을 기존 홈 디자인 톤으로 표시한다.
- Loading: 상세 데이터를 가져오는 중이라는 route-level 상태를 표시한다.
- Error: API/schema 오류 시 안내 문구와 `unstable_retry` 기반 다시 시도 버튼을 표시한다.
- Not found: 잘못된 ID 또는 API 404 시 목록 복귀 경로와 `noindex` marker가 있는 상태를 표시한다.
- Empty: 핵심 포인트, 키워드 또는 연결 article이 없을 때 각각 읽을 수 있는 빈 상태를 표시한다.
- Accessibility: semantic section/list/article/time markup, focus style, 접근 가능한 내부/외부 링크 label을 사용한다.
- 상세 success/loading/error/not-found 화면은 홈과 동일한 공용 header/search/category navigation을 사용한다.

## README 영향

- README는 변경하지 않았다.
- 로컬 실행 방법, 환경 변수명, dependency, 사용자 설정 방법이 변경되지 않아 README 갱신이 필요하지 않다.
- 현재 route/API 구조 변경은 `docs/ARCHITECTURE.md`에 반영했다.

## 테스트

실행 및 통과:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- `curl -sS https://api.dev-scj.site/topics/7` read-only response contract 확인
- `npm run dev`와 로컬 `/`, `/topics/7`, invalid/missing topic route HTML marker 확인
- 홈/상세 공용 header와 category navigation `aria-current` 구분 확인
- Credential pattern scan

## 확인 결과

- Lint, typecheck, build, shell syntax, whitespace 검증이 통과했다.
- Build에서 `/topics/[id]`가 dynamic server-rendered route로 생성되는 것을 확인했다.
- 실제 Topic Detail API response가 frontend runtime validation과 일치하고 연결 article 3건을 포함하는 것을 확인했다.
- 로컬 `/topics/7` HTML에서 상세 본문, 핵심 포인트, 관련 article source와 외부 링크 속성을 확인했다.
- Invalid/missing topic route에서 not-found 문구와 `noindex` marker를 확인했다.
- 홈, 상세 success, 상세 not-found HTML에서 공용 header/search/category navigation marker를 확인했다.
- 홈 HTML의 `aria-current="page"` 1개와 상세 HTML의 0개를 확인했다.
- Error boundary의 retry 및 error 로깅은 코드 존재만 확인했다.
- 상세 검증 근거는 `docs/verification/feature-topic-detail-page.md`를 따른다.

## 비고

- 실제 브라우저에서 topic card 클릭, viewport별 responsive layout, 외부 링크 새 탭 동작, loading/error/not-found 시각 상태, browser console error 로깅은 확인하지 않았다.
- GitHub Actions, PR 생성/merge, deployment, production verification은 수행하지 않았다.
- Topic 검색, 날짜/카테고리 필터, 이미지 표시, 관리자 기능은 구현하지 않았다.
- 승인 문서에서 보류된 상세 캐싱/로딩 속도 개선과 이미지 표시는 적용하지 않았다.
- Production API 요청은 response contract 확인을 위한 read-only 요청이며 production verification 완료를 의미하지 않는다.
