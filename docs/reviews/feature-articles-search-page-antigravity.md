# Antigravity 검토: Article 목록 검색 및 카테고리 페이지 MVP

## 검토 요약

Article 목록 검색 및 카테고리 페이지 MVP 구현 사항에 대한 정밀 검토를 마쳤습니다.
기존에 끊겨 있던 Header 검색 폼과 카테고리 메뉴의 라우팅 흐름을 `/articles` 검색 페이지로 완벽하게 연결하고, 기사 탐색, 결과 개수 표시, 초기화 및 각종 로드 상태 처리를 안정적으로 마무리했습니다.
이전 토픽 상세/목록 리뷰에서의 보완 사항이 전부 반영되어, 에러 경계(`error.tsx`) 내 에러 로깅 등이 모범적으로 완성되었습니다.
또한, 42차 빌드 에러를 유발했던 GitHub Actions CI의 빌드 타임 환경 변수(`NEXT_PUBLIC_NEWSLAB_API_BASE_URL`) 누락 문제도 적합하게 수정되었습니다.
즉시 승인 및 병합이 가능한 우수한 코드 품질을 갖추고 있습니다.

## 요구사항 충족

- **라우트 및 검색/필터 연동**: `/articles` route가 추가되었으며 `query` (검색어) 및 `category` (카테고리) 조건에 부합하게 `lib/api/articles.ts` API 호출이 일관성 있게 일어납니다.
- **헤더 콤포넌트 분리 및 연결**: 공용 검색 폼을 `HeaderArticleSearch` 컴포넌트로 깔끔하게 분리하고, 검색 실행 시 `/articles?query=...` 로의 이동을 구현했습니다. 카테고리 클릭 또한 영어 슬러그 매핑 규칙에 맞춰 유도됩니다.
- **CI 환경 개선**: `.github/workflows/ci.yml` 파일에 정적 빌드용 퍼블릭 API 주소를 추가하여 Prerendering 에러를 선제 차단했습니다.

## 코드 품질과 유지보수성

- `app/articles/page.tsx`에서 Promise 형태의 `searchParams`를 Next.js 15+ 규정에 맞추어 `await searchParams`로 올바르게 비동기 처리했습니다.
- `lib/api/articles.ts`의 `getArticles`에 런타임 타입 가드(`isArticlesResponse`, `isArticle`)를 구성하여 안전한 API 연동을 보장하고, 404 및 500 계열의 API 장애 시 `app/articles/error.tsx` 바운더리로 에러가 원활히 버블링되도록 구조화했습니다.
- 기존 홈 화면(`app/page.tsx`) 내부의 인라인 기사 목록 요소를 독립적인 `components/articles/ArticleList.tsx`로 이관 및 공유하여 중복 코드를 방지하고 유지보수성을 극대화했습니다.

## 프론트엔드 동작과 접근성

- **시큐어 웹 링크**: 원문 링크 렌더링 시 `getSafeArticleUrl` 유틸리티를 적용해 `http:` 및 `https:` 프로토콜 유효성 검사를 진행하여 XSS 인젝션 위험을 효과적으로 회피했습니다. 새 창 열기 속성(`target="_blank"`, `rel="noopener noreferrer"`)과 접근성 `aria-label`도 적정하게 부여되었습니다.
- **접근성 준수**: 공용 헤더의 카테고리 내비게이션에 현재 선택 상태를 기반으로 동적인 `aria-current="page"`를 적용하여 스크린 리더 접근성 규격을 준수했습니다.

## 보안과 범위 검토

- `.env` 등 형상 관리 대상 제외 파일에 대한 수정이나 노출이 발견되지 않았습니다.
- CI 워크플로에 추가된 환경 변수값은 퍼블릭 API 도메인 정보이므로 보안상 무해합니다.
- 백엔드 API 수정 요구 없이 오직 프론트엔드 영역의 구현으로만 요구 스펙을 실현했습니다.

## 검증 기록 검토

- `docs/verification/feature-articles-search-page.md`에 build, typecheck, lint 등의 패키지 검증과 HTTP route 마커 수집 결과가 구체적이고 정합성 있게 기록되었습니다.
- 브라우저 viewport 반응 및 실제 사용자 상호작용 등 검증이 생략된 영역은 "수행하지 않음" 및 "대기 중인 검증"으로 기재하여 검증 무결성을 지켰습니다.

## 문서 검토

- `docs/ARCHITECTURE.md` 문서 내에 `/articles` route 추가, API client 분리 및 searchParams 연동 구조 등의 내용이 정확히 반영되었습니다.

## 발견된 문제

- **심각한 문제 없음**: 배포를 중단할 만한 결함이나 기획 위반은 발견되지 않았습니다.

## PR 전 필수 수정

- 없음.

## 선택 개선 사항

- **[Suggestion 1] `HeaderArticleSearch` 폼의 Progressive Enhancement (점진적 향상) 보완**:
  - `HeaderArticleSearch.tsx` 내 `<form>` 요소에 `action={submitSearch}` 함수 액션을 사용하고 있습니다.
  - 브라우저에 JS 로드가 지연되거나 비활성화된 시점에 유저가 뉴스 검색을 실행할 경우, 폼 제출이 동작하지 않는 한계가 있습니다.
  - `<form action="/articles" ...>` 와 같이 기본 fallback action URL을 할당해 주면, JS 기능이 완전히 활성화되기 전에도 브라우저 표준 GET 전송 메커니즘을 통해 `/articles?query=xxx` 로 이동하므로 접근성과 사용성 측면에서 더욱 강건해집니다.

## 제안 검증 Command

병합 전 코드의 무결성 확보를 위해 로컬에서 상시 수행 가능한 빌드 및 정적 분석 명령어:

```bash
npm run lint
npm run typecheck
npm run build
```

## 최종 판단

- 필수 수정 사항(Blocker)이 발견되지 않았으며 코드 구현 수준과 문서화 정합성 모두 훌륭합니다. 검토의 최종 판단은 **즉시 승인 및 병합**을 권장합니다.
