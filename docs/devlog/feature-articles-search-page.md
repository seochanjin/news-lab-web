# Article 목록 검색 및 카테고리 페이지 MVP

## 작업 목적

공용 header의 검색창과 category navigation을 실제 기사 탐색 화면에 연결해 NewsLab의 기사 목록 탐색 흐름을 완성한다.

## 기존 문제

- Header 검색 submit과 category link가 전용 기사 목록 없이 root query만 변경했다.
- Articles API fetch, 검증, 표시 로직이 `app/page.tsx` 안에 있어 새 route에서 재사용하기 어려웠다.
- `/topics` build가 CI에서 실행될 때 public API base URL이 없어 실패할 수 있었다.

## 변경 내용

- `/articles` 검색/category Server Component route와 loading/error 상태를 추가했다.
- Articles API type, response validation, `keyword`/`category` 필터 요청을 `lib/api/articles.ts`로 분리했다.
- 홈과 `/articles`가 재사용하는 article 목록과 상태 UI를 `components/articles/`에 추가했다.
- Header 검색 submit과 category navigation을 `/articles`에 연결했다.
- CI frontend build 환경에 public API base URL을 설정했다.
- Architecture와 workflow 문서를 현재 구조 및 검증 결과에 맞게 갱신했다.

## 구현 상세

- Next.js 16 page의 Promise 기반 `searchParams`에서 `query`와 `category`를 읽는다.
- 검색어는 trim 후 backend `keyword` parameter로 전달한다.
- Category는 task의 영어 slug mapping을 사용하고 backend `category` parameter로 전달한다.
- Header 검색은 Client Component에서 trim한 query로 이동하며 현재 category가 있으면 결합 조건을 유지한다.
- `/articles`는 현재 검색어/category와 API `count/total`을 표시하고 조건 초기화 link를 제공한다.
- 전체 목록 empty와 검색/category 결과 empty를 다른 문구로 처리한다.
- Article URL은 HTTP/HTTPS만 허용하고 `target="_blank"`와 `rel="noopener noreferrer"`를 사용한다.
- API 요청 실패와 response shape 오류는 `/articles/error.tsx`에서 처리하며 홈은 기존처럼 section 내부 error 상태를 유지한다.
- 열린 데이터 흐름은 Server Component에 유지하고 header submit 상호작용만 Client Component로 제한했다.

## 대안 검토

- 홈의 article 코드를 복사할 수 있지만 API 검증과 UI가 중복되므로 공용 client/list로 분리했다.
- Header form action을 단순 `/articles` GET form으로 둘 수 있지만 검색어 trim과 현재 category 결합을 위해 작은 Client Component를 사용했다.
- Category를 client-side filter할 수 있지만 backend가 기존 category parameter를 지원하므로 Server Component 요청에 전달했다.
- CI에서 repository variable을 사용할 수 있지만 실제 variable 설정은 이번 범위 밖이므로 task가 허용한 public URL을 workflow env에 명시했다.
- Header 검색 form의 Progressive Enhancement, 전체 header 정보구조 개편, 화면 간 container/card 밀도 통일, Turbopack development ChunkLoadError 대응은 승인 문서에서 보류되어 적용하지 않았다.

## 선택한 접근과 근거

검색 조건이 API 데이터 로드에 영향을 주므로 Server Component page의 `searchParams`를 사용했다. API client와 article 목록만 공용 모듈로 분리해 홈의 기존 UX를 유지하면서 `/articles`를 추가했다. Header에는 submit 동작만 담당하는 작은 Client Component를 두어 전체 header를 client boundary로 만들지 않았다.

## 트레이드오프

- 첫 page 10건만 표시하며 pagination UI는 구현하지 않았다.
- 현재 backend data는 `tech`, `world`, `ai` 중심이라 다른 category는 empty 결과를 표시할 수 있다.
- Header 검색 상태는 URL로 유지되지만 category link를 선택하면 기존 query는 제거된다.
- CI build는 public dev API와 외부 Google Fonts 네트워크 가용성에 영향을 받는다.
- 실제 브라우저 interaction과 responsive/keyboard 동작은 검증하지 않았다.

## 테스트 및 브라우저 확인

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- Public API env 명시 build: sandbox font 요청 실패 후 네트워크 권한 재실행 통과
- Shell syntax와 `git diff --check`: 통과
- Articles API read-only response: 전체 1355, Anthropic 31, tech 685 확인
- Category response: `ai`, `world`, `tech` data 존재, `politics`, `economy`, `business`, `society`는 현재 0건 확인
- `/articles` 전체/검색/category/결합/empty와 기존 route: 모두 HTTP `200`
- Header/category/external link/CI env: HTML 및 코드 marker 확인
- Credential pattern scan: 실제 secret 값 없음
- 실제 브라우저 검증 및 사람이 제공한 manual verification 로그: 없음, pending

## 운영 반영

없음. Git push, merge, production deploy 및 production verification을 수행하지 않았다.

## README 업데이트 판단

불필요. 실행 방법, dependency, 환경 변수명이 변경되지 않았다. Route/API 구조는 `docs/ARCHITECTURE.md`에 반영했다.

## 확인 결과

- `/articles`에서 전체, 검색, category, 결합 조건과 empty 결과가 server-rendered HTML로 제공된다.
- Header 검색/category navigation의 `/articles` 연결 코드와 active category가 구현되어 있다.
- 홈 최신 기사와 기존 Topics route가 유지된다.
- CI workflow에 public API base URL이 설정되어 있다.
- 승인된 review 수정은 없으며 보류 항목은 적용하지 않았다.
- 실제 브라우저 submit/click/new tab/responsive/keyboard/console 검증은 pending이다.

## 이번 단계의 의미

Topic 중심 홈과 아카이브에 더해 개별 기사 탐색 경로를 연결해 header navigation의 사용자 기대와 실제 동작을 맞췄다.

## 포트폴리오용 요약

Next.js App Router의 Server Component `searchParams`와 재사용 API client를 활용해 검색·카테고리 조건을 backend Articles API에 전달하고, 공용 header와 기사 목록 상태 UI를 연결한 article search page를 구현했다.

## 다음 단계 후보

- 실제 브라우저 header 검색/category/새 탭 및 responsive/keyboard/screen reader 검증
- Article pagination 또는 더 보기 UI
- 검색과 category 상태를 유지하는 navigation 정책 정리
- 데이터가 없는 category의 노출 정책 검토
- Header 검색 form Progressive Enhancement 및 전체 navigation 정보구조 검토
- 홈·Topics·Articles 공통 container와 card 밀도 정리
- Article 상세 route 또는 NewsLab 내부 요약 view 검토
- Turbopack development ChunkLoadError 별도 재현 및 조사
- CI 외부 API/font 의존성 완화 검토
