# 홈 원문 기사 미리보기 제거 및 로딩 경량화

## 작업 목적

홈(`/`)의 역할을 오늘의 주요 이슈를 빠르게 확인하는 화면으로 명확히 하고, 첫 렌더링에서 불필요한 원문 기사 preview 조회와 UI를 제거한다. 원문 기사 탐색은 기존 `/articles`와 `/search`에서 유지한다.

## 기존 문제

- 홈 하단의 `원문 기사 이어보기`와 최신 기사 3건 preview가 주요 이슈보다 원문 목록을 다시 강조했다.
- 홈 Server Component가 Topics API 외에 Articles API도 조회해 첫 화면 렌더링에 추가 데이터 요청이 필요했다.
- 홈에 article 전용 loading/error/empty 상태가 함께 존재해 화면 역할과 상태 처리가 복잡했다.
- 원문 기사 탐색 전용 route인 `/articles`와 통합 검색 `/search`가 이미 있어 홈 preview의 역할이 중복됐다.

## 변경 내용

- 홈의 `SUPPORTING SOURCES`, `원문 기사 이어보기`, 최신 원문 기사 3건 preview section을 제거했다.
- 홈에서 `getArticles`, `ArticleList`, article preview 전용 loading/error/empty UI를 제거했다.
- 홈은 `TopicList`와 주요 이슈 기준 loading/error/empty/success 흐름만 유지한다.
- `전체 주요 이슈 보기` 링크와 Header의 `/articles`, `/search` 탐색 경로는 유지했다.
- Footer 설명을 기사 목록 중심 문구에서 주요 이슈와 요약 중심 문구로 변경했다.
- 홈과 article component의 역할 변경을 `docs/ARCHITECTURE.md`에 반영했다.

## 구현 상세

- `app/page.tsx`는 Server Component 구조를 유지하며 `TopicExperience` 내부의 `TopicList`만 `Suspense`로 감싼다.
- 홈 전용 `getHomeArticles`, `HomeArticleList`, `HomeArticleListLoading`, `ArticleListHeader`를 제거했다.
- 홈에서 Articles API client import와 `ArticleList` import를 제거해 article preview 요청과 상태 UI가 렌더링되지 않게 했다.
- `components/articles/ArticleList.tsx`와 `lib/api/articles.ts`는 `/articles`, `/search`에서 계속 사용하므로 변경하거나 삭제하지 않았다.
- Header, `PageShell`, Topic 카드와 링크의 기존 responsive 및 접근성 동작은 변경하지 않았다.
- 빈 원문 section heading이나 CTA를 남기지 않았으며, 원문 탐색은 Header의 접근 가능한 서비스 navigation과 통합 검색으로 제공한다.

## 대안 검토

- 홈에 원문 기사 preview를 유지하면서 별도 `Suspense`로 지연시키는 방법은 추가 요청과 원문 목록 강조 문제를 그대로 남기므로 선택하지 않았다.
- 홈에 작은 `/articles` CTA section만 남기는 방법도 검토할 수 있었지만, Header에 `원문 모음` 진입점이 이미 있어 별도 section을 남기지 않았다.
- `ArticleList` 또는 Articles API client를 삭제하는 방법은 `/articles`와 `/search`가 계속 사용하므로 제외했다.
- backend cache, Redis, 통합 검색 endpoint를 도입하는 방법은 프론트엔드 소형 정리 작업의 범위를 넘어 제외했다.
- ChunkLoadError 대응을 위해 Next.js 또는 bundler 설정을 변경하는 방법은 task 범위에서 제외하고 재현 확인 후보로 남겼다.

## 선택한 접근과 근거

홈에서 원문 기사 preview와 관련 데이터 조회를 함께 제거하는 가장 작은 변경을 선택했다. 화면에서 보이지 않는 데이터를 계속 가져오지 않도록 UI 제거와 fetch 제거를 같은 범위에서 처리했고, 원문 기사 기능 자체는 기존 전용 route에 유지했다.

이 접근은 API contract나 공통 component를 변경하지 않으면서 홈의 정보 위계를 주요 이슈 중심으로 정리하고, Articles API 실패가 홈 렌더링에 영향을 줄 가능성을 제거한다.

## 트레이드오프

- 홈에서 최신 원문 기사로 직접 이동하는 CTA는 사라졌지만 Header의 `원문 모음`과 통합 검색 경로는 유지된다.
- 홈의 데이터 요청은 줄었지만 실제 브라우저 성능과 체감 로딩 개선은 측정하지 않았다.
- 홈 하단 구성이 단순해졌지만 desktop/mobile에서 여백이 자연스러운지는 수동 브라우저 확인이 필요하다.
- dev server 시작 로그에서는 ChunkLoadError가 없었지만 브라우저 chunk 요청과 `.next` 삭제 후 재현 여부는 확인하지 않았다.

## 테스트 및 브라우저 확인

`docs/verification/feature-home-article-preview-cleanup.md`에 기록된 결과:

- `npm run lint`: 통과, ESLint 오류 및 경고 없음
- `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음
- `npm run build`: 통과, `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` route 생성 확인
- `bash -n scripts/new_agent_task.sh`, `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- 홈 article preview 제거 marker 검색: `app/page.tsx`에서 일치 항목 없음
- `/articles`, `/search`의 `getArticles`, `ArticleList` 사용 유지 확인
- `/topics` archive 이동 링크와 Header의 `/articles`, `/search` 경로 유지 확인
- credential scan: 문서·ignore rule·환경 변수명 reference만 확인, 실제 secret 값 없음
- `npm run dev`: Turbopack dev server가 190ms에 Ready 상태로 시작됨
- manual browser verification: 수행하지 않음

사람이 제공한 manual verification 로그는 확인되지 않았다.

## 운영 반영

수행하지 않았다. `git push`, `git merge`, deployment, production-impacting command를 실행하지 않았으며 production verification과 PR merge 완료를 주장하지 않는다.

## README 업데이트 판단

설치·실행 방법, 환경 변수명, dependency, API contract가 변경되지 않아 README는 수정하지 않았다. 홈이 Topics API만 조회하고 article component가 `/articles`, `/search`에서 사용되는 구조는 `docs/ARCHITECTURE.md`에 반영했다.

## 확인 결과

정적 marker 확인으로 홈의 원문 기사 section, `getArticles`, `ArticleList` 참조가 제거된 것을 확인했다. `/articles`와 `/search`의 원문 기사 조회 및 목록 사용은 유지됐고 lint, typecheck, production build, shell syntax, whitespace 검증을 통과했다.

실제 브라우저에서 홈 정보 위계, 하단 여백, 관련 route 동작은 확인하지 않았다. ChunkLoadError 브라우저 재현, deployment, production verification, PR merge도 확인하지 않았다.

## 이번 단계의 의미

홈을 여러 콘텐츠를 함께 나열하는 화면에서 오늘의 주요 이슈에 집중하는 진입 화면으로 정리했다. 원문 기사 기능을 삭제하지 않고 전용 탐색 route로 분리해 화면 역할을 명확히 하면서 홈의 서버 데이터 요청을 줄였다.

## 포트폴리오용 요약

Next.js App Router 홈 Server Component에서 중복된 원문 기사 preview UI와 Articles API 요청을 제거했다. 주요 이슈 중심 정보 구조를 유지하면서 원문 기사 기능은 `/articles`와 `/search`에 보존하고, loading/error/empty 상태를 홈 역할에 맞게 단순화했다.

## 다음 단계 후보

- desktop/mobile 홈에서 주요 이슈 중심 레이아웃과 하단 여백 확인
- `/topics`, `/search?query=중동`, `/articles`의 기존 탐색 흐름 브라우저 확인
- 홈 변경 전후 실제 API 요청 수와 렌더링 성능 측정
- 브라우저 console의 신규 오류 및 Turbopack ChunkLoadError 재현 여부 확인
- `.next` 삭제 후 dev server 재실행 또는 필요 시 `next dev --webpack` 우회 검토
