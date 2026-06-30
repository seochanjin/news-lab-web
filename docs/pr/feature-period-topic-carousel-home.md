# 홈 화면 기간별 Topic 구성

## 작업 내용

홈 화면에서 기간별 뉴스 흐름을 탐색할 수 있도록 Daily, 최근 3일, 지난주 Topic 섹션을 구성했습니다.

승인된 수정에 따라 Daily Topic은 캐러셀이 아니라 `오늘의 주요 이슈` 하이라이트 영역으로 표시합니다. 첫 번째 Topic은 전체 너비 대표 카드로, 두 번째와 세 번째 Topic은 desktop 2열 보조 카드로 노출하며 mobile에서는 1열로 표시합니다. 최근 3일과 지난주 Topic은 각각 독립적인 1장 캐러셀로 유지합니다.

## 주요 변경 사항

- `app/page.tsx`
  - 기존 홈 Hero 영역을 제거하고 `오늘의 주요 이슈` 섹션부터 시작하도록 변경했습니다.
  - `/topics/home`, `/three-day-topics/home`, `/weekly-topics/home`을 독립적으로 호출합니다.
  - 한 API 요청 실패가 다른 기간 섹션 렌더링을 막지 않도록 기간별 result로 분리했습니다.
  - Daily Topic은 최대 3개만 홈에 전달하고, 최근 3일/지난주 Topic은 상세 route href만 전달합니다.
- `components/home/DailyTopicHighlights.tsx`
  - Daily 대표 카드 1개와 보조 카드 최대 2개를 렌더링하는 홈 전용 컴포넌트를 추가했습니다.
  - 카드에는 실제 날짜, 제목, 제한된 Summary만 표시합니다.
  - 카드 전체를 `Link`로 유지하고 `/topics`의 `전체 주요 이슈 보기` 링크를 제공합니다.
- `components/home/PeriodTopicHome.tsx`
  - Daily 하이라이트와 최근 3일/지난주 캐러셀 섹션을 조합합니다.
  - loading, error, empty 상태를 기간별로 표시합니다.
- `components/home/PeriodTopicSection.tsx`
  - 최근 3일/지난주용 독립 캐러셀을 추가했습니다.
  - 현재 위치 `N / Total`, 이전/다음 버튼, 첫/마지막 disabled 상태를 제공합니다.
  - 자동 재생, 무한 순환, drag animation, 외부 carousel dependency는 추가하지 않았습니다.
- `lib/api/topics.ts`
  - Three-day/Weekly 홈 API와 상세 API client, 응답 타입, not-found error 타입을 추가했습니다.
- `app/three-day-topics/[id]/`, `app/weekly-topics/[id]/`
  - 3일/주간 Topic 상세 route와 `loading`, `error`, `not-found` 상태를 추가했습니다.
- `components/topics/PeriodTopicDetail.tsx`
  - 3일/주간 Topic 상세 화면 공통 컴포넌트를 추가했습니다.
- `components/topics/TopicCard.tsx`, `components/topics/TopicList.tsx`
  - 승인된 문구 정리에 따라 반복 라벨과 일부 fallback/aria 문구를 조정했습니다.

## 프론트엔드/API 영향

- 프론트엔드 App Router page, React component, API client, browser 상태 처리, Tailwind styling 범위만 변경했습니다.
- 새로 사용하는 endpoint는 다음과 같습니다.
  - `GET /three-day-topics/home`
  - `GET /weekly-topics/home`
  - `GET /three-day-topics/{topicId}`
  - `GET /weekly-topics/{topicId}`
- Daily Topic은 기존 `GET /topics/home` 흐름을 유지합니다.
- API base URL은 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 환경 변수명을 그대로 사용합니다.
- Backend API contract, backend code, DB, Supabase SQL, K3s, Dockerfile, production infrastructure, secret, `.env`, `.env.*`는 변경하지 않았습니다.
- `package.json`, lockfile 변경이 없어 새 dependency는 추가하지 않았습니다.

## 상태 및 UX 영향

- 홈 진입 시 별도 Hero 없이 `오늘의 주요 이슈`, `최근 3일 흐름`, `지난주 흐름` 순서로 표시됩니다.
- Daily 섹션은 한 번에 최대 3개 Topic을 보여주며 Daily용 이전/다음 버튼과 `N / Total` 표시는 없습니다.
- 최근 3일/지난주 섹션은 각각 자체 `currentIndex`를 가진 비순환 캐러셀입니다.
- Topic이 없으면 섹션별 empty state를 표시합니다.
- API 오류가 있으면 해당 섹션에만 error state와 재시도 안내 문구를 표시합니다.
- loading state에는 재시도 안내를 표시하지 않습니다.
- 홈 카드에서는 키워드, 출처 수, 기사 수, 관련 기사 목록, `상세 보기` 텍스트를 표시하지 않습니다.
- 카드 전체는 실제 `Link`이며 hover/focus-visible 상태로 클릭 가능성을 제공합니다.
- 수동 브라우저, viewport, keyboard, screen reader 검증은 아직 수행하지 않았습니다.

## README 영향

README 변경은 없습니다.

근거:
- 로컬 실행 방식 변경 없음.
- dependency 추가 없음.
- 공개 환경 변수명 변경 없음.
- backend/API contract 변경 없음.

## 테스트

`docs/verification/feature-period-topic-carousel-home.md`에 기록된 실제 실행 결과 기준입니다.

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과. Next.js 16.2.7 Turbopack build가 성공했고 route 목록에 `/three-day-topics/[id]`, `/weekly-topics/[id]`가 dynamic route로 포함됨.
- `git diff --check`: 통과.
- `rg -n "dailyIndex|daily.*previous|daily.*next|오늘의 이슈 이전|오늘의 이슈 다음" app components`: 출력 없음. Daily 캐러셀 관련 코드/label 없음.
- `rg -n "DAILY TOPICS|자동 생성된 주요 이슈|오늘 움직이는 뉴스 흐름|날짜 미정|상세 보기|TOPIC FLOW" app components`: 출력 없음.
- `rg -n "topics/home|three-day-topics/home|weekly-topics/home|three-day-topics|weekly-topics" app components lib`: 기대 endpoint와 route 연결 확인.
- `git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock`: 출력 없음. dependency 변경 없음.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 문서, ignore rule, 환경 변수명 reference, GitHub/Kubernetes secret 이름 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으나 실제 secret 값은 확인되지 않음.

미실행:
- `package.json`에 `test` 또는 `npm test` script가 없어 test command는 실행하지 않았습니다.
- 수동 브라우저 검증은 수행하지 않았습니다.

## 확인 결과

- Next.js 코드 변경 전에 로컬 `node_modules/next/dist/docs/`의 App Router 관련 linking/navigation, Server/Client Components, layouts/pages, error handling 문서를 확인했습니다.
- build 기준으로 3일/주간 상세 dynamic route가 포함되는 것을 확인했습니다.
- 홈 범위에서 제거 대상 문구와 Daily 캐러셀 label/code가 남아 있지 않음을 검색으로 확인했습니다.
- dependency 변경이 없음을 lockfile diff로 확인했습니다.
- secret pattern 검색은 수행했으며 실제 secret 값은 확인되지 않았습니다.
- git push, git merge, production deploy command는 실행하지 않았습니다.
- deployment, production verification, PR merge 완료는 수행하거나 확인하지 않았습니다.

## 비고

- 현재 git status 기준 변경 파일에는 tracked 변경 4개와 untracked 신규 route/component/workflow 문서가 포함됩니다.
- Desktop, laptop, tablet, mobile viewport에서 홈 구성과 캐러셀 동작 수동 확인은 pending입니다.
- 실제 API 데이터 기준 Daily, Three-day, Weekly 카드의 날짜/제목/Summary 일치 확인은 pending입니다.
- Daily 상세, Three-day 상세, Weekly 상세 이동과 브라우저 뒤로 가기 확인은 pending입니다.
- keyboard Tab/Enter/Space 흐름과 screen reader label 확인은 pending입니다.
