# NewsLab 탐색 구조 및 레이아웃 정리

## 작업 내용

NewsLab의 탐색 구조를 주요 이슈 중심으로 재정리했다. 공통 Header와 페이지 레이아웃을 통일하고, Header 통합 검색, 주요 이슈 중심 홈, 단순화된 주요 이슈 아카이브, 원문 기사 탐색 흐름을 구현했다.

## 주요 변경 사항

- Header의 카테고리 메뉴를 `주요 이슈`, `원문 모음` 서비스 메뉴로 교체하고 현재 경로 활성 상태를 추가했다.
- Header 검색을 통합 검색 경로 `/search?query=...`로 연결하고, 페이지 콘텐츠와 동일한 960px 중심축에 Header 요소를 정렬했다.
- 공통 `PageShell`을 추가해 홈, 주요 이슈, 상세, 원문 모음, 검색과 각 상태 화면의 콘텐츠 폭 및 빈 사이드 레일 영역을 통일했다.
- 홈의 mock 키워드·기사 묶음과 경고 문구를 제거하고, 주요 이슈와 원문 기사 3건 미리보기를 제공하도록 정리했다.
- `/search`에서 주요 이슈를 먼저 표시하고 원문 기사를 이어서 표시하도록 구현했다.
- 검색과 일치하는 주요 이슈 상위 3건의 상세를 조회해 이슈별 연결 기사 최대 3건을 직접 검색 결과보다 먼저 표시하고, 기사 ID 또는 URL 기준으로 중복을 제거했다.
- `/topics` 내부 검색·날짜·필터 UI를 제거하고 전체 건수, 현재 표시 건수, 주요 이슈 카드 목록만 제공하도록 단순화했다.
- 주요 이슈 카드와 상세에서 내부 상태·provider·model·confidence 정보를 숨기고, 카드 요약과 키워드 노출량을 제한했다.
- 관련 기사에서 유사도 점수를 숨기고, 원문 모음의 검색어·카테고리 필터를 개별 해제할 수 있도록 했다.

## 프론트엔드/API 영향

- 영향 경로: `/`, `/topics`, `/topics/[id]`, `/articles`, 신규 `/search`
- 기존 읽기 전용 API인 `GET /topics`, `GET /topics/{id}`, `GET /articles`를 사용한다.
- 통합 검색은 최대 50개 주요 이슈에서 일치 항목을 찾고, 상위 3개 주요 이슈 상세와 이슈별 최대 3개 연결 기사를 조회한다.
- 원문 기사 직접 검색은 기존 `keyword` 파라미터를 유지한다.
- 기존 API client 및 API contract는 변경하지 않았다.
- backend API, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`, dependency는 변경하지 않았다.

## 상태 및 UX 영향

- 주요 이슈를 1차 탐색 대상으로, 원문 기사를 보조 탐색 대상으로 배치했다.
- 주요 이슈 검색은 Header 통합 검색으로 일원화하고 `/topics`는 아카이브 목록에 집중하도록 정리했다.
- 검색어 없음, 검색 결과 없음, API 오류, loading 상태를 제공하며 기존 error·empty·not-found 상태도 공통 레이아웃에 맞췄다.
- 현재 메뉴에 `aria-current`를 제공하고 검색 및 필터 해제 컨트롤에 접근 가능한 label을 유지했다.
- 실제 브라우저에서의 반응형 레이아웃, 키보드 탐색, 상호작용 검증은 pending이다.

## README 영향

설치, 실행 방법, 환경 변수명, API contract 변경이 없어 README는 수정하지 않았다. 공통 레이아웃과 탐색 구조 설명은 `docs/ARCHITECTURE.md`에 반영했다.

## 테스트

`docs/verification/feature-navigation-ux-cleanup.md`에 기록된 검증 결과:

- `npm run lint`: 통과, 오류 및 경고 없음
- `npm run typecheck`: 통과
- `npm run build`: 통과, `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` 경로 생성 확인
- `bash -n scripts/new_agent_task.sh`: 통과
- `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- Header, 통합 검색, 연결 기사 제한·중복 제거, `/topics` 내부 필터 제거 관련 정적 marker 확인: 통과
- mock/debug marker 검색: 일치 항목 없음
- credential 검색: 문서 및 환경 변수명 참조만 확인, 실제 secret 없음
- `npm run dev`: Ready 상태 확인
- 별도 `curl` 경로 확인: sandbox 격리로 HTTP `000`, route HTML marker 미확인
- manual browser verification: 수행하지 않음

## 확인 결과

- lint, typecheck, production build 및 정적 구조 확인을 통과했다.
- Header 최상위 메뉴가 `주요 이슈`, `원문 모음`으로 제한되고 통합 검색 경로가 추가된 것을 정적으로 확인했다.
- 통합 검색의 주요 이슈 우선 순서, 연결 기사 조회 제한, ID·URL 중복 제거 구조를 정적으로 확인했다.
- 최종 승인된 Fix 5에 따라 `/topics` 내부 필터 UI와 client filter state가 제거된 것을 정적으로 확인했다.
- Fix 4의 draft 제외 동작은 Fix 5로 대체되어 최종 동작에 포함되지 않는다.
- 브라우저, deployment, production, PR merge는 확인하지 않았다.

## 비고

남은 수동 확인 항목:

- desktop/mobile Header 정렬, 공통 콘텐츠 축, 빈 사이드 레일 영역 확인
- Header 검색과 원문 모음 필터 chip 동작 확인
- `/search` 결과 순서, 빈 검색어, 빈 결과, API 오류 상태 확인
- `/search?query=중동`의 연결 기사 우선 표시 및 중복 제거 확인
- `/topics`의 필터 없는 목록, 건수, 카드 표시 확인
- loading, error, empty, not-found 상태 확인
- `.next` 삭제 후 dev `ChunkLoadError` 재현 여부 확인
- deployment, production verification, PR merge 확인

빈 사이드 레일은 향후 UI 확장을 위한 구조만 제공하며 실제 광고, live 콘텐츠, 추천 기능은 포함하지 않는다. `git push`, `git merge`, deploy command, production-impacting command는 실행하지 않았다.
