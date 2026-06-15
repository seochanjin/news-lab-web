# NewsLab 탐색 구조 및 레이아웃 정리

## 작업 목적

NewsLab의 핵심 콘텐츠인 자동 생성 주요 이슈와 요약을 중심으로 탐색 구조를 재정리하고, 홈부터 주요 이슈 상세, 통합 검색, 원문 모음까지 일관된 레이아웃과 정보 위계를 제공한다.

## 기존 문제

- Header가 데이터가 없거나 적은 기사 category를 top-level에 노출해 서비스 구조가 불명확했다.
- Header 검색과 `/topics` 내부 검색의 역할이 겹쳐 사용자가 검색 진입점을 판단하기 어려웠다.
- 홈, `/topics`, `/topics/[id]`, `/articles`와 상태 화면마다 본문 폭과 정렬 기준이 달랐다.
- 좁은 화면에서 Header tagline이 깨질 수 있었고 검색창이 본문 중심축과 어긋나 보였다.
- 홈 mock 영역과 개발용 metadata가 주요 이슈보다 강조되어 실제 서비스 신뢰도와 정보 위계를 흐렸다.
- 한국어 검색어로 주요 이슈가 검색되어도 영어 원문 직접 검색 결과는 비어 보일 수 있었다.

## 변경 내용

- Header를 `주요 이슈`, `원문 모음` 서비스 메뉴로 단순화하고 route별 active state를 적용했다.
- Header 검색을 신규 통합 검색 route `/search?query=...`로 연결했다.
- 공통 `PageShell`로 960px 중심 본문과 작은 화면에서 숨겨지는 빈 좌우 side rail slot을 제공했다.
- 홈 mock 영역을 제거하고 주요 이슈를 중심에 두며 원문 기사는 3건 미리보기로 축소했다.
- `/search`에서 주요 이슈를 먼저 표시하고, 검색된 주요 이슈의 연결 기사와 직접 원문 검색 결과를 병합해 아래에 표시했다.
- `/topics` 내부 검색·날짜·filter chip과 client-side filter state를 제거하고 아카이브 목록에 집중하도록 단순화했다.
- Topic 카드와 상세에서 사용자에게 불필요한 내부 metadata를 숨기고 목록 summary와 keyword 밀도를 낮췄다.
- `/articles`의 검색어·category 조건은 남은 URL parameter를 보존하며 개별 해제할 수 있게 했다.

## 구현 상세

- `SiteHeader`는 홈 logo, 통합 검색, 서비스 navigation을 담당한다. tagline은 `sm` 이상에서만 표시하며 Header 요소를 본문과 같은 중심축에 맞췄다.
- `PageShell`은 홈, 주요 이슈 목록·상세, 원문 모음, 통합 검색과 loading/error/empty/not-found 상태 화면에서 공통으로 사용한다.
- `/search`는 최대 50개 Topic의 `title_ko`, `summary_ko`, `keywords`, `topic_date`를 기준으로 프론트엔드에서 일치 항목을 찾는다.
- 검색된 Topic 상위 3개의 상세 API를 병렬 조회하고, Topic별 연결 기사 최대 3개를 직접 기사 검색 결과보다 먼저 배치한다.
- 연결 기사와 직접 검색 결과는 article ID 또는 URL 기준으로 중복을 제거한다.
- `/topics`는 Server Component에서 받은 전체 Topic 수, 현재 표시 수, Topic 카드 목록만 제공한다.
- `/articles` filter 해제 control은 `next/link`를 사용해 다른 query parameter를 보존한다.
- 현재 메뉴의 `aria-current`, 검색 및 filter 해제 control의 접근 가능한 label과 focus style을 유지했다.
- 기존 Topics·Articles API client와 `GET /topics`, `GET /topics/{id}`, `GET /articles` contract는 변경하지 않았다.

## 대안 검토

- 기존 category navigation을 Header에 유지하는 방법은 데이터 편중과 0건 category 노출 문제를 지속시키므로 제외했다.
- Header 검색을 원문 기사 검색 전용으로 유지하는 방법은 NewsLab의 핵심인 주요 이슈를 건너뛰므로 통합 검색으로 변경했다.
- `/topics` 내부 검색·날짜 필터를 유지하고 입력값과 적용값을 분리하는 Fix 4를 구현했으나, Header 통합 검색과 역할이 중복되어 최종 승인된 Fix 5에서 제거했다.
- 날짜 필터까지 Header에 통합하는 방법은 Header 복잡도를 높여 보류했다.
- 실제 광고·실시간·추천 side rail을 추가하는 방법은 이번 프론트엔드 정리 범위를 넘으므로 빈 확장 slot만 준비했다.

## 선택한 접근과 근거

새 dependency나 API contract 변경 없이 기존 Next.js App Router, Server Component, Tailwind, API client를 재사용했다. 공통 레이아웃 컴포넌트와 서비스 중심 Header로 화면 기준을 통일하고, 검색은 `/search` 한 곳에서 주요 이슈 우선 흐름을 제공하도록 구성했다.

한국어 검색에서 직접 원문 결과가 없을 수 있는 문제는 backend 검색 변경 대신 기존 Topic detail의 연결 기사를 제한적으로 병합해 해결했다. 조회량과 결과 밀도를 통제하기 위해 Topic 상위 3개, Topic별 기사 3개 제한을 적용했다.

## 트레이드오프

- Header에서 category 바로가기는 사라졌지만 `/articles` 내부 category URL과 관련 상태는 유지된다.
- `/topics`의 날짜·내부 검색 필터를 제거해 아카이브가 단순해졌지만, 날짜 기반 탐색은 후속 작업이 필요하다.
- 통합 검색은 최대 50개 Topic을 프론트엔드에서 필터링하므로 전체 Topic을 대상으로 하는 서버 검색은 아니다.
- 검색된 Topic 상세를 최대 3건 추가 조회해 연결 기사 품질을 높이는 대신 통합 검색 요청 수가 증가한다.
- 빈 side rail은 확장 지점만 제공하며 현재 사용자에게 별도 콘텐츠를 보여주지 않는다.

## 테스트 및 브라우저 확인

`docs/verification/feature-navigation-ux-cleanup.md`에 기록된 결과:

- `npm run lint`: 통과, 오류 및 경고 없음
- `npm run typecheck`: 통과
- `npm run build`: 통과, 최종 build에서 `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` route 생성 확인
- `bash -n scripts/new_agent_task.sh`, `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- Header, 통합 검색, Topic 연결 기사 제한·중복 제거, `/topics` 내부 필터 제거 관련 정적 marker 확인: 통과
- mock/debug marker 검색: 일치 항목 없음
- credential scan: 문서·ignore rule·환경 변수명 reference만 확인, 실제 secret 값 없음
- `npm run dev`: Ready 상태 확인
- 별도 `curl` route 확인: sandbox 네트워크 격리로 HTTP `000`, route HTML marker 미확인
- 수동 브라우저, responsive, keyboard, ChunkLoadError 재현 확인: pending

사람이 제공한 manual verification 로그는 확인되지 않았다.

## 운영 반영

수행하지 않았다. `git push`, `git merge`, deployment, production-impacting command를 실행하지 않았으며 production verification과 PR merge 완료를 주장하지 않는다.

## README 업데이트 판단

설치·실행 방법, 환경 변수명, dependency, API contract가 변경되지 않아 README는 수정하지 않았다. 신규 `/search`, 공통 `PageShell`, 주요 이슈 중심 탐색 구조는 `docs/ARCHITECTURE.md`에 반영했다.

## 확인 결과

최종 승인 상태 기준으로 lint, typecheck, production build, shell syntax, whitespace 검증을 통과했다. 정적 marker로 Header 서비스 메뉴, 통합 검색 구조, 연결 기사 제한·중복 제거, `/topics` 내부 필터 제거를 확인했다.

실제 브라우저에서 Header 정렬, 검색 이동, 결과 순서, filter 해제, 상태 화면은 확인하지 않았다. deployment, production verification, PR merge도 확인하지 않았다.

## 이번 단계의 의미

NewsLab의 탐색 기준을 기사 category 나열에서 주요 이슈와 요약 중심으로 전환했다. 공통 레이아웃과 통합 검색을 마련해 사용자가 주요 이슈를 먼저 이해하고 필요할 때 근거 원문으로 이동하는 흐름을 만들었다.

## 포트폴리오용 요약

Next.js App Router 기반 뉴스 프론트엔드에서 category 중심 navigation을 주요 이슈 중심 서비스 구조로 재설계했다. 공통 responsive shell과 통합 검색 route를 추가하고, 검색된 Topic의 연결 기사와 직접 검색 결과를 제한·중복 제거해 병합했으며, loading/error/empty 상태와 접근 가능한 탐색 control을 유지했다.

## 다음 단계 후보

- desktop/mobile에서 Header 정렬, active navigation, 공통 container, side rail slot 확인
- Header 검색, `/search` 결과 순서·empty/error 상태, Topic 연결 기사 우선 표시와 중복 제거 확인
- `/articles` 검색어·category filter 해제 동작과 `/topics` 단순 목록 확인
- loading/error/empty/not-found 상태의 실제 브라우저 확인
- 필요 시 URL 기반 Topic archive 날짜 필터 재검토
- `.next` 삭제 후 dev server 재실행을 통한 ChunkLoadError 재현 여부 확인
