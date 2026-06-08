
# NewsLab Web 기사 목록 API 연동

## 작업 목적

메인 화면의 mock article list를 NewsLab backend `/articles` API의 실제 기사 목록으로 교체하고, 후속 검색/필터/페이지네이션 작업의 기반을 만든다.

## 기존 문제

- 메인 화면이 mock article data만 렌더링해 backend 수집 결과를 확인할 수 없었다.
- API 응답 타입, 화면용 view model 변환, error/empty/loading 상태가 없었다.

## 변경 내용

- mock article 배열을 제거하고 Server Component API fetch를 추가했다.
- API response와 article view model 타입을 분리했다.
- category, published time, summary/tags metadata, external URL을 기존 기사 row에 매핑했다.
- API error, empty, loading 상태를 추가했다.
- README에 API 연동과 screenshot 경로를 문서화했다.

## 구현 상세

- `getArticles()`는 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`로 `/articles?page=1&page_size=10` URL을 만들고 `cache: "no-store"`로 조회한다.
- API 응답의 top-level pagination shape를 확인한 뒤 `ArticleViewModel[]`로 변환한다.
- category mapping은 `tech`를 `기술`로 표시하는 등 알려진 영문 category를 한글 UI label로 바꾼다.
- `published_at`은 `Asia/Seoul` 기준 날짜/시간으로 표시하며 null/invalid 값은 `발행 시간 미상`으로 처리한다.
- external URL은 `http` 또는 `https` protocol만 허용하고 `target="_blank"`, `rel="noopener noreferrer"`를 적용한다.
- summary가 있으면 metadata로 사용하고, 없으면 최대 3개 tag를 표시한다.
- 중앙 article list를 `Suspense`로 감싸 기존 header와 layout을 유지하면서 loading fallback을 제공한다.

## 대안 검토

- Client Component에서 fetch하는 방식을 고려할 수 있지만 초기 기사 목록은 Server Component에서 조회하는 편이 client JavaScript와 상태 관리 복잡도를 줄인다.
- fetch utility를 별도 파일로 분리할 수 있지만 현재 endpoint가 하나라 이번 task에서는 `app/page.tsx` 내부에 유지했다.

## 선택한 접근과 근거

- Next.js 16 로컬 문서의 Server Component data fetching 방식과 `fetch(..., { cache: "no-store" })` 규칙을 따랐다.
- API response 타입과 UI view model을 분리해 backend field 변화와 UI 표현 책임을 구분했다.
- 기존 23차 3단 layout 구조는 유지하고 article list 영역만 실제 데이터 기반으로 교체했다.

## 트레이드오프

- 매 요청마다 API를 조회하므로 backend availability와 응답 시간에 영향을 받는다.
- top-level response shape는 검사하지만 각 article field의 완전한 runtime schema validation library는 추가하지 않았다.
- 검색, category filter, pagination UI는 아직 동작하지 않는다.

## 테스트

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `git diff --check`: 통과.
- `npm run build`: 통과. `/`는 dynamic server-rendered route로 확인.
- actual `/articles` response shape 확인: 통과. `count=10`, `total=83`, `has_next=true`, source/category `TechCrunch`/`tech`.
- `npm run dev`: 통과.
- local page render 확인: `/` 200 및 `TechCrunch` 렌더링 확인.
- credential pattern scan: 실제 secret 값 없음.

## 운영 반영

- 운영 반영 없음.
- Backend, DB, Supabase, K3s, Docker, production infrastructure 변경 없음.

## README 업데이트 판단

- 필수. 실제 API 연동 방식, 환경변수 사용, 상태 처리, screenshot pending 경로를 추가했다.

## 확인 결과

- 실제 API 기사 10건이 기존 중앙 기사 목록 레이아웃에 렌더링된다.
- API 실패와 빈 목록에 대한 기본 상태 화면이 있다.
- 기존 header, visual-only search/category, 좌우 expansion slot 구조가 유지된다.

## 이번 단계의 의미

- NewsLab backend에서 수집한 기사를 사용자-facing 메인 화면에서 확인할 수 있는 첫 실제 데이터 경로가 연결되었다.

## 포트폴리오용 요약

- Next.js Server Component에서 typed `/articles` API 응답을 조회하고 view model로 변환해, error/empty/loading 상태와 안전한 external link를 포함한 실제 뉴스 목록을 구현했다.

## 다음 단계 후보

- 검색 query와 category filter API 연동.
- pagination UI 및 page query parameter 연동.
- runtime schema validation 강화.
- `public/screenshots/main-articles-api.png` 화면 캡처 추가.
