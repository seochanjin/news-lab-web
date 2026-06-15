# Article 목록 검색 및 카테고리 페이지 MVP

## 작업 내용

- 공용 header 검색과 category navigation이 연결되는 `/articles` 기사 탐색 route를 추가했다.
- 기존 Articles API를 `keyword`와 `category` 조건으로 읽어 검색/category/결합 결과를 표시한다.
- 홈의 최신 기사 목록 로직을 공용 API client와 목록 컴포넌트로 분리해 재사용했다.

## 주요 변경 사항

- `lib/api/articles.ts`에 Articles API type, response validation, 필터 요청 함수를 추가했다.
- `components/articles/`에 재사용 article 목록과 route 상태 UI를 추가했다.
- `/articles` page와 loading/error 상태를 추가했다.
- Header 검색 submit은 trim 후 `/articles?query=...`로 이동하며 현재 category를 유지한다.
- Header category link는 `/articles?category=<slug>`로 이동하고 현재 category에 `aria-current`를 표시한다.
- CI frontend job에 public `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 설정했다.
- Architecture 문서를 Articles API client와 route 구조에 맞게 갱신했다.

## 프론트엔드/API 영향

- 기존 `GET /articles` contract와 `page`, `page_size`, `keyword`, `category` query parameter를 사용한다.
- API response가 예상 shape와 다르거나 HTTP 요청이 실패하면 route error 상태로 전달한다.
- Article 원문 URL은 검증된 HTTP/HTTPS URL만 새 탭 외부 link로 표시한다.
- 기존 `/`, `/topics`, `/topics/{id}` route와 Topics 기능을 유지한다.
- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*` 변경 없음.

## 상태 및 UX 영향

- 검색어/category 조건과 결과 개수를 `/articles` 상단에 표시한다.
- 전체 empty와 검색/category 조건 empty 상태를 구분한다.
- Loading, error, empty, success 상태를 제공한다.
- Header 검색 input, category link, 기사 원문 link에 접근 가능한 label/focus/active 상태를 제공한다.
- 모바일에서는 조건 요약과 article 목록이 세로로 쌓이고 긴 title/summary는 줄바꿈된다.

## README 영향

- 없음. 실행 방법, 사용자 설정, dependency가 변경되지 않았다.
- Public API base URL 환경 변수명은 기존 문서를 재사용하며 route/API 구조는 `docs/ARCHITECTURE.md`에 반영했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- Articles API 전체/keyword/category read-only response 확인
- `/articles` 전체/검색/category/결합/empty 및 기존 route 로컬 HTTP/HTML marker 확인
- Header/category/external link/CI env 코드 marker 확인
- Credential pattern scan

## 확인 결과

- Lint, typecheck, build, shell syntax, whitespace 검증이 통과했다.
- Public API env를 명시한 build는 sandbox Google Fonts 요청 실패 후 네트워크 권한 재실행에서 통과했다.
- Articles API에서 전체 `1355`, Anthropic 검색 `31`, tech category `685`건을 확인했다.
- 현재 API에서 `ai`, `world`, `tech` category data가 존재하고 `politics`, `economy`, `business`, `society`는 0건을 반환하는 것을 확인했다.
- `/articles` 전체/검색/category/결합/empty와 기존 `/`, `/topics`, `/topics/7` 요청이 모두 `200`을 반환했다.
- Anthropic 검색 결과, tech active category, 조건 empty, 외부 원문 link marker를 확인했다.
- 실제 browser interaction은 수행하지 않았다.

## 비고

- 실제 header submit/category 클릭, 새 탭, responsive, keyboard, screen reader, console 검증은 pending이다.
- GitHub Actions 실제 workflow 실행, PR 생성/merge, deployment, production verification은 수행하지 않았다.
- 승인된 수정은 없으며, Header 검색 form Progressive Enhancement, header 정보구조 정리, 공통 container/card 밀도 정리, Turbopack development ChunkLoadError 대응은 보류 상태다.
- Article 상세 page, backend API 변경, DB/infra 변경, 이미지 표시, provider/model 정책은 이번 범위에서 제외했다.
