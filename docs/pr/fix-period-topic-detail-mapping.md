# 기간별 Topic 상세 페이지 API 매핑 정합성 수정

## 작업 내용
Three-day Topic과 Weekly Topic 상세 페이지가 실제 Backend detail 응답 field를 사용하도록 프론트엔드 API mapping과 상세 화면 표시 기준을 수정했습니다.

이번 PR은 Backend를 변경하지 않고 `/three-day-topics/[id]`, `/weekly-topics/[id]` 상세 route가 기간, 핵심 포인트, 관련 기사 배열을 기존 공통 상세 UI에 올바르게 전달하도록 맞춥니다.

## 주요 변경 사항
- `lib/api/topics.ts`
  - `PeriodTopicArticleResponse`, `ThreeDayTopicDetailResponse`, `WeeklyTopicDetailResponse` type을 실제 period detail 응답 contract 기준으로 추가했습니다.
  - Three-day detail은 `reference_date`, `window_start`, `window_end`를 읽어 공통 상세 ViewModel의 날짜 field로 변환합니다.
  - Weekly detail은 `week_start`, `week_end`를 우선 사용해 공통 상세 ViewModel의 날짜 field로 변환합니다.
  - Period article의 `rank`, `similarity`, `is_representative`, `is_summary_evidence` 기반 응답을 기존 관련 기사 UI용 `TopicArticle` props로 변환합니다.
  - `articles` 배열은 Backend 반환 순서를 유지하고 프론트엔드에서 재정렬하지 않습니다.
- `components/topics/PeriodTopicDetail.tsx`
  - 상단 “연결 기사” 개수를 `article_count`가 아니라 실제 렌더링 배열인 `topic.articles.length` 기준으로 표시합니다.
- `components/topics/TopicArticleList.tsx`
  - `published_at`이 없거나 파싱 불가한 경우 `발행일 정보 없음`을 표시합니다.
  - `is_summary_evidence`에서 변환된 `summary_evidence` role을 `요약 근거`로 표시할 수 있도록 했습니다.
- workflow 문서
  - task, verification, PR/devlog, review/fixes 문서를 branch 규칙에 맞춰 포함했습니다.

## 프론트엔드/API 영향
- 변경 route는 `/three-day-topics/[id]`, `/weekly-topics/[id]` 상세 표시 계약입니다.
- Backend endpoint 이름과 response contract는 변경하지 않았습니다.
- Daily Topic 상세, 홈 carousel, archive, 검색, 원문 모음은 의도적으로 변경하지 않았습니다.
- dependency 변경 없음.
- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`는 변경하지 않았습니다.

## 상태 및 UX 영향
- 기존 loading, error, not-found route 파일은 유지했습니다.
- 관련 기사 empty state는 실제 `articles` 배열이 빈 경우에만 표시됩니다.
- 핵심 포인트 empty state 정책은 기존 상세 UI를 유지합니다.
- 외부 기사 링크의 `target="_blank"`와 `rel="noopener noreferrer"`는 기존대로 유지됩니다.
- `published_at`이 `null`인 관련 기사도 오류 없이 발행일 대체 문구를 표시합니다.

## README 영향
- README 변경 없음.
- API mapping과 상세 화면 표시 기준 수정이며, 로컬 실행 방법이나 환경 변수 문서가 바뀌지 않았습니다.

## 테스트
- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- `git diff --check`: 통과
- `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock Dockerfile k8s .github`: 출력 없음
- `git diff --name-only`: 변경 tracked file은 `components/topics/PeriodTopicDetail.tsx`, `components/topics/TopicArticleList.tsx`, `lib/api/topics.ts`
- `git diff --stat`: 3 files changed, 134 insertions(+), 19 deletions(-)
- `git diff -- app/page.tsx components`: 홈 `app/page.tsx` 변경 없음. component diff는 period detail count와 article list null 발행일/role 문구 변경만 확인
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 기존 문서, ignore rule, workflow secret 이름 reference, Kubernetes TLS Secret 이름, `package-lock.json`의 `js-tokens` package name 등 기존 reference 탐지
- `git diff -U0 | rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: match 없음

## 확인 결과
- 실제 코드 변경 파일: `lib/api/topics.ts`, `components/topics/PeriodTopicDetail.tsx`, `components/topics/TopicArticleList.tsx`
- workflow 문서 파일: `docs/tasks/fix-period-topic-detail-mapping.md`, `docs/verification/fix-period-topic-detail-mapping.md`, `docs/pr/fix-period-topic-detail-mapping.md`, `docs/devlog/fix-period-topic-detail-mapping.md`, `docs/reviews/fix-period-topic-detail-mapping-antigravity.md`, `docs/reviews/fix-period-topic-detail-mapping-coderabbit.md`, `docs/fixes/fix-period-topic-detail-mapping-approved-fixes.md`
- 승인된 review fix: 없음. `docs/fixes/fix-period-topic-detail-mapping-approved-fixes.md`에 승인 항목이 없습니다.
- Browser/manual verification은 수행하지 않았습니다.
- Production verification, deployment, rollout, PR merge는 수행하지 않았습니다.

## 비고
- pending manual verification:
  - `/three-day-topics/38`에서 기간, 핵심 포인트 9개, 관련 기사 4개, null 발행일 기사 표시, 원문 링크 새 탭 동작 확인
  - `/weekly-topics/8`에서 `2026-06-22 ~ 2026-06-28` 기간, 관련 기사 11개, null 발행일 기사 표시, 원문 링크 새 탭 동작 확인
  - desktop/tablet/mobile viewport에서 관련 기사 metadata 겹침과 가로 overflow 확인
- `npm run build` 출력에서 `.env.local` 감지가 표시됐지만 `.env*` 파일은 읽거나 수정하지 않았고 실제 값을 tracked file에 기록하지 않았습니다.
