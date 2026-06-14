# Topic 상세 페이지 MVP

## 작업 목적

홈에서 확인한 자동 생성 topic을 하나의 카드 요약으로 끝내지 않고, 상세 요약과 연결 article까지 이어서 탐색할 수 있는 프론트엔드 경로를 제공한다.

기존 Topics Detail API contract를 변경하지 않고 `/topics/{id}` 상세 route를 추가하며, loading, error, not-found, success 상태를 포함한 최소 완결형 MVP를 구현하는 것이 목표였다.

## 기존 문제

- 홈 topic 목록은 실제 `/topics` API 데이터였지만 개별 topic으로 이동하는 링크가 없었다.
- Topic Detail API의 TypeScript 타입, runtime validation, fetch 함수가 없었다.
- Topic summary, 핵심 포인트, 키워드와 연결 article을 한 화면에서 확인할 수 없었다.
- 상세 요청 중 loading, API/schema 오류, 존재하지 않는 topic 상태를 처리하는 route UI가 없었다.
- 초기 상세 화면의 단순 헤더는 홈의 검색/category navigation 구조와 달라 서비스 화면 간 연속성이 약했다.
- 초기 error boundary는 재시도 UI는 제공했지만 전달받은 error 객체를 로깅하지 않았다.

## 변경 내용

- `lib/api/topics.ts`를 Topic Detail response와 연결 article까지 검증하도록 확장했다.
- `/topics/[id]` dynamic route와 route-level loading, error, not-found 상태를 추가했다.
- Topic summary 영역과 연결 article 목록을 분리된 컴포넌트로 구현했다.
- 홈 topic card 전체를 `/topics/{id}`로 이동하는 접근 가능한 Next.js `Link`로 연결했다.
- 기존 홈 header/search/category navigation을 `SiteHeader`로 추출해 홈과 상세 상태 화면에서 재사용했다.
- 상세 error boundary에 식별 가능한 error 로깅을 추가했다.
- 현재 route/API 구조와 실제 검증 결과를 architecture 및 branch workflow 문서에 반영했다.

## 구현 상세

- Next.js 16의 dynamic route 규칙에 따라 `params` Promise를 await하고 route ID를 runtime에서 양의 안전 정수로 검사한다.
- `getTopicDetail(id)`는 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`로 `GET /topics/{id}`를 조회하고 `cache: "no-store"`를 유지한다.
- Topic Detail과 각 연결 article의 필드를 runtime type guard로 검사해 예상하지 않은 response는 error 상태로 전달한다.
- 잘못된 route ID와 API 404는 `TopicNotFoundError`로 구분한 뒤 `notFound()`를 호출한다.
- 다른 HTTP 실패와 schema 오류는 route error boundary로 전달하고 `unstable_retry()` 기반 다시 시도 버튼을 제공한다.
- Error boundary는 기존 안내 문구와 retry 동작을 유지하면서 `useEffect`에서 식별 가능한 메시지와 error 객체만 로깅한다.
- `loading.tsx`와 공용 `TopicDetailState`로 loading, error, not-found 상태의 본문 톤을 일관되게 유지한다.
- 상세 화면은 제목, 요약, 핵심 포인트, 키워드, 출처/기사 수와 개발 확인용 provider/model/confidence를 표시한다.
- 연결 article은 semantic `section`, `ul`, `li`, `article`, `time` 구조를 사용하고 role과 similarity score를 보조 정보로 표시한다.
- 외부 원문 URL은 `http/https` protocol만 링크로 렌더링하며 `target="_blank"`와 `rel="noopener noreferrer"`를 적용한다.
- `published_at`이 없거나 유효하지 않으면 읽을 수 있는 대체 문구를 표시한다.
- `key_points`, `keywords`, 연결 article이 비어 있는 경우 각각 별도 empty state를 표시한다.
- 기존 Tailwind 색상, border, spacing, typography를 재사용하고 긴 summary/title에는 줄바꿈 가능한 스타일을 적용했다.
- 상세 본문은 모바일에서 세로로 쌓이고 넓은 화면에서는 기존 중앙 정렬 폭을 유지하도록 구성했다.
- 공용 `SiteHeader`는 상세 success/loading/error/not-found 화면에서도 홈과 같은 탐색 구조를 제공한다.
- `SiteHeader`의 active category를 prop으로 구분해 홈에서만 `전체`에 `aria-current="page"`를 표시한다.

## 대안 검토

- 상세 데이터를 Client Component에서 요청할 수 있었지만, 기존 Topics 목록과 page 구조가 Server Component 기반이고 route-level 상태 처리가 요구되어 Server Component fetch를 유지했다.
- API 실패를 page 내부 결과값으로 변환해 렌더링할 수 있었지만, task가 route-level error 상태를 요구하고 Next.js 16의 `unstable_retry()`를 활용할 수 있어 error boundary를 선택했다.
- 상세 UI 전체를 `page.tsx`에 작성할 수 있었지만, route의 ID/상태 분기와 화면 렌더링 책임을 분리하기 위해 상세/기사/상태 컴포넌트로 나눴다.
- 홈과 상세에 헤더 markup을 각각 둘 수 있었지만, 승인된 수정에 따라 기존 홈 구조를 공용 `SiteHeader`로 추출해 중복과 시각적 불일치를 줄였다.
- Topic detail 캐싱 또는 `revalidate`를 적용할 수 있었지만 데이터 freshness 정책과 검증 범위가 커져 승인 문서에서 보류했다.
- 대표 이미지 표시도 검토 대상이었지만 안정적인 API field와 이미지 출처 정책이 없어 적용하지 않았다.

## 선택한 접근과 근거

기존 App Router, Server Component API fetch, Tailwind 스타일 패턴을 유지하면서 상세 route만 추가하는 방식으로 변경 범위를 제한했다.

API client는 response contract와 404 구분을 담당하고, route는 ID 검증과 상태 전환을 담당하며, 화면 컴포넌트는 semantic markup과 상태별 사용자 경험을 담당하도록 역할을 분리했다. 이 구조는 backend contract를 변경하지 않으면서 schema 오류와 존재하지 않는 topic을 서로 다른 사용자 상태로 처리할 수 있다.

승인된 수정은 공용 헤더 재사용과 error 로깅으로 제한했다. 보류된 캐싱/로딩 속도 개선과 이미지 표시는 이번 범위에 포함하지 않았다.

## 트레이드오프

- `cache: "no-store"`를 유지하므로 상세 route의 응답 시간과 가용성은 backend API 상태의 영향을 직접 받는다.
- Runtime type guard를 직접 관리하므로 backend schema가 바뀌면 frontend 검증 코드도 수동으로 갱신해야 한다.
- Route-level loading으로 streaming이 시작된 not-found 응답은 HTTP `200` soft 404가 될 수 있으며 Next.js가 `noindex` marker를 추가한다.
- Provider/model/confidence와 similarity score는 개발 확인에는 유용하지만 사용자-facing 주요 정보는 아니므로 작게 노출한다.
- 공용 헤더는 UI 연속성과 중복 제거에 도움이 되지만, 현재 검색/category UI 자체는 실제 필터 기능을 새로 구현하지 않는다.
- Error 객체 로깅은 디버깅에 도움이 되지만 실제 browser console에서 error를 발생시킨 동작 검증은 아직 수행하지 않았다.

## 테스트 및 브라우저 확인

Verification 문서를 근거로 확인한 결과:

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- `bash -n scripts/new_agent_task.sh`: 통과
- `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- Topic Detail API read-only response contract와 연결 article 3건: 확인
- 로컬 `/`, `/topics/7`, invalid/missing topic route HTML marker: 확인
- 상세 본문, 핵심 포인트, 관련 article source, 외부 링크 속성: 확인
- Not-found 문구와 `noindex` marker: 확인
- 홈/상세 공용 header/search/category navigation marker: 확인
- 홈 `aria-current="page"` 1개, 상세 0개: 확인
- Credential pattern scan: 실제 secret 값 없음
- Error retry 및 error 로깅: 코드 존재만 확인
- Package test script: 없음

수행하지 않았거나 pending인 항목:

- 실제 브라우저에서 홈 topic card 클릭과 상세 route 이동 확인
- Desktop/mobile responsive layout 확인
- 외부 article 링크 새 탭 동작 확인
- Loading/error/not-found 상태의 실제 시각 및 retry 동작 확인
- Browser console의 Topic detail error 로깅 확인
- GitHub Actions
- PR 생성 또는 merge
- Deployment 및 production verification

## 운영 반영

운영 반영은 수행하지 않았다.

- Git push, merge, production deploy command를 실행하지 않았다.
- Production API 요청은 response contract 확인을 위한 read-only 요청만 수행했다.
- PR merge, deployment, production verification 완료를 주장하지 않는다.
- Backend, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`를 변경하지 않았다.

## README 업데이트 판단

README는 변경하지 않았다.

로컬 실행 방법, 환경 변수명, dependency, 사용자 설정 방법은 변경되지 않았다. 새 route와 Topics Detail API client 구조는 개발 구조에 해당하므로 `docs/ARCHITECTURE.md`에 반영했다.

## 확인 결과

- 홈 topic card에서 `/topics/{id}` 상세 route로 이동할 수 있는 링크가 렌더링된다.
- 상세 화면에 topic summary, 핵심 포인트, 키워드, metadata와 연결 article 목록이 렌더링된다.
- Loading, error, not-found, success와 관련 empty state가 구현되어 있다.
- API 404/잘못된 ID와 다른 HTTP/schema 오류가 서로 다른 상태로 처리된다.
- 안전한 외부 article 링크에 새 탭과 보안 속성이 적용되어 있다.
- 홈과 상세 상태 화면이 공용 header/search/category navigation을 사용한다.
- 실제 브라우저 interaction, responsive layout, console 검증은 pending이다.

## 이번 단계의 의미

NewsLab의 자동 생성 topic을 홈 요약에서 실제 출처 기사까지 이어서 탐색할 수 있는 첫 상세 흐름이 연결되었다.

단순 상세 화면 추가뿐 아니라 API contract 검증, route 상태 처리, semantic article 목록, 공용 navigation 구조를 함께 구성해 이후 검색/필터 또는 topic 품질 기능을 확장할 수 있는 프론트엔드 기반을 마련했다.

## 포트폴리오용 요약

Next.js App Router dynamic route와 Server Component fetch를 사용해 typed Topics Detail API client, runtime schema validation, 404/error 분리, route-level loading/error/not-found UI, semantic article 목록을 구현했다. 기존 홈 header를 공용 컴포넌트로 재사용하고 접근 가능한 내부/외부 링크와 상태별 UX를 구성했으며, lint/typecheck/build와 로컬 HTML marker로 동작 근거를 기록했다.

## 다음 단계 후보

- 실제 브라우저에서 desktop/mobile responsive 및 keyboard/accessibility 검증
- Browser console error 로깅과 retry 동작 검증
- `cache: "no-store"` 유지 여부와 `revalidate` 등 상세 route 캐싱 정책 설계
- Topic detail API 응답 시간 측정과 timeout/error UX 검토
- Provider/model/confidence 및 similarity score 노출 정책 정리
- Topic 검색, 날짜 필터, 카테고리 필터
- 안정적인 이미지 API field와 출처 정책 수립 후 대표 이미지 표시 검토
