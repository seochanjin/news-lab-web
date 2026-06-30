# 홈 화면 기간별 Topic 구성 개선

## 작업 목적

NewsLab 홈 화면에서 기간별 뉴스 흐름을 더 빠르게 훑을 수 있도록 Daily, 최근 3일, 지난주 Topic 구성을 재정리했다.

최신 승인 수정 기준에서는 Daily Topic을 한 장짜리 캐러셀이 아니라 홈의 중심 콘텐츠로 배치한다. 오늘의 주요 이슈는 대표 카드 1개와 보조 카드 최대 2개로 한 번에 보여주고, 최근 3일 흐름과 지난주 흐름은 각각 독립 캐러셀로 유지한다.

## 기존 문제

기존 홈은 Daily Topic 중심 구조였고, 기간별 Topic 흐름을 함께 비교하기 어려웠다. 초기 구현에서는 Daily, 최근 3일, 지난주를 모두 같은 한 장 캐러셀로 맞췄지만, Daily까지 한 장씩 넘기는 방식은 홈의 정보 밀도와 시각적 중심이 약해지는 문제가 있었다.

또한 기존 Hero의 `DAILY TOPICS` 문구는 오늘·최근 3일·지난주를 함께 보여주는 홈 구조와 맞지 않았다. 홈 카드에 키워드, 출처 수, 기사 수, `상세 보기` 같은 정보가 남으면 홈의 요약 탐색 목적보다 정보 밀도가 과해질 수 있었다.

## 변경 내용

- 홈 상단 Hero 영역을 제거했다.
- Daily Topic은 `오늘의 주요 이슈` 섹션에서 최대 3개만 표시한다.
- Daily 첫 번째 Topic은 전체 너비 대표 카드로 표시하고, 두 번째·세 번째 Topic은 desktop 2열 보조 카드로 표시한다.
- mobile에서는 Daily 카드가 모두 1열로 표시된다.
- 최근 3일 흐름과 지난주 흐름은 각각 독립 캐러셀로 유지했다.
- Three-day/Weekly 홈 API와 상세 API client를 추가했다.
- `/three-day-topics/[id]`, `/weekly-topics/[id]` 최소 상세 route와 loading/error/not-found 상태를 추가했다.
- 홈 카드에서는 날짜/제목/Summary만 표시하고, 키워드·출처 수·기사 수·관련 기사·`상세 보기` 텍스트는 표시하지 않는다.
- Daily 카드에는 실제 날짜만 표시하고, 최근 3일·지난주 홈 카드에는 날짜 영역을 표시하지 않는다.
- 승인 문구 제거 검증이 `app components` 전체를 대상으로 하므로 기존 topic 목록/상세 컴포넌트의 충돌 문구도 정리했다.

## 구현 상세

`app/page.tsx`는 서버 컴포넌트에서 `/topics/home`, `/three-day-topics/home`, `/weekly-topics/home`을 `Promise.all`로 호출하되, 각 API 결과를 독립 `success`/`error` 상태로 변환한다. 한 API가 실패해도 다른 기간 영역 렌더링이 막히지 않도록 했다.

Daily 응답은 `slice(0, 3)`으로 최대 3개만 홈 UI에 전달한다. UI 모델은 기존 API response type을 대체하지 않고 카드에 필요한 props만 별도로 구성한다.

`components/home/DailyTopicHighlights.tsx`는 Daily 전용 하이라이트 영역이다. 첫 번째 Topic은 대표 카드, 나머지 최대 2개는 보조 카드로 렌더링한다. 모든 카드는 `Link`이며 `/topics/{id}`로 이동한다. 섹션 우측의 `전체 주요 이슈 보기`는 기존 `/topics` route로 연결한다.

`components/home/PeriodTopicSection.tsx`는 최근 3일·지난주 캐러셀 전용으로 사용한다. 캐러셀 index는 컴포넌트 내부 state로 관리하며, 첫 항목/마지막 항목에서 이전·다음 버튼을 `disabled` 처리한다. 위치 표시는 `N / Total`로 제공하고 스크린 리더용 `aria-label`을 포함한다.

`components/home/PeriodTopicHome.tsx`는 Daily 하이라이트와 두 기간 캐러셀을 조합한다. loading 상태에서는 재시도 안내를 표시하지 않고, error 상태에서만 `잠시 후 다시 시도해 주세요.`를 표시한다.

`lib/api/topics.ts`에는 Three-day/Weekly 홈 및 상세 fetch 함수를 추가했다. Backend API contract는 변경하지 않고 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 흐름을 그대로 사용한다.

## 대안 검토

Daily, 최근 3일, 지난주를 모두 동일한 캐러셀로 만드는 방식은 구현이 단순하지만, Daily Topic 여러 개를 한 번에 보고 싶은 홈의 정보 밀도를 낮춘다. 최신 승인 수정에서는 Daily를 대표/보조 카드 목록으로 두고, 최근 3일·지난주만 캐러셀로 유지하는 방향을 선택했다.

Three-day/Weekly 상세 route가 없는 상태에서 카드 링크를 `/topics` 같은 목록 route로 우회하는 방법도 있었다. 그러나 task에서 깨진 링크를 금지했고 기간별 상세 route를 요구했기 때문에 최소 상세 route를 추가했다.

외부 carousel 라이브러리 도입, 자동 재생, drag animation, 무한 loop는 승인 문서에서 제외됐다. 현재 요구는 단순한 비순환 이전/다음 이동이므로 React state와 CSS만 사용했다.

## 선택한 접근과 근거

홈은 Server Component 데이터 조회를 유지하고, state가 필요한 최근 3일·지난주 캐러셀만 Client Component에서 처리했다. 이는 Next.js 로컬 문서의 Server/Client Components 기준과 기존 App Router 구조에 맞다.

Daily는 캐러셀에서 분리해 정적 카드 목록으로 렌더링했다. Daily는 홈의 첫 콘텐츠이자 중심 콘텐츠이므로 첫 카드를 강조하고 보조 카드를 같이 보여주는 구성이 정보 밀도와 탐색성을 동시에 만족한다.

카드는 모두 실제 `Link`로 구성해 Tab/Enter 접근과 Next.js client-side navigation을 유지했다. 버튼은 실제 `button`이고 disabled 상태도 `disabled` 속성으로 표현했다.

## 트레이드오프

- Daily는 최대 3개만 보여주므로 홈에서 모든 Daily Topic을 직접 볼 수 없다. 대신 `/topics` 목록 route로 전체 탐색을 연결했다.
- Three-day/Weekly 상세 화면은 최소 상세 구현이다. 상세 API 응답이 더 명확해지면 기간별 상세 UI를 보강할 수 있다.
- 기존 topic 목록/상세 컴포넌트의 충돌 문구를 일부 바꿨지만, 기능·route·API contract는 바꾸지 않았다. 이는 승인 문서의 전체 `app components` 문구 검증을 통과하기 위한 문구 정리다.
- 수동 브라우저 검증은 아직 수행하지 않았으므로 실제 viewport별 밀도와 상호작용 검증은 pending이다.

## 테스트 및 브라우저 확인

`docs/verification/feature-period-topic-carousel-home.md` 기준으로 다음 검증을 수행했다.

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- `git diff --check`: 통과
- dependency diff 확인: `package.json`, lockfile 변경 없음
- 제거 대상 문구 검색: `DAILY TOPICS|자동 생성된 주요 이슈|오늘 움직이는 뉴스 흐름|날짜 미정|상세 보기|TOPIC FLOW` 출력 없음
- Daily 캐러셀 잔여 코드 검색: `dailyIndex|daily.*previous|daily.*next|오늘의 이슈 이전|오늘의 이슈 다음` 출력 없음
- 기간별 API와 route 연결 검색: `/topics/home`, `/three-day-topics/home`, `/weekly-topics/home`, 3일/주간 상세 route 연결 확인
- secret pattern scan: 문서·ignore rule·환경 변수명 reference·GitHub/Kubernetes secret 이름 reference·`js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않음

`package.json`에 `test` 또는 `npm test` script가 없어 test command는 실행하지 않았다.

수동 브라우저 검증은 미수행이다. Desktop, laptop, tablet, mobile viewport에서 Daily 대표/보조 카드, 최근 3일·지난주 캐러셀 이동, disabled 버튼, focus-visible, empty/error 상태를 확인해야 한다.

## 운영 반영

운영 반영은 수행하지 않았다.

`git push`, `git merge`, production deploy command, production-impacting command는 실행하지 않았다. Deployment, production verification, PR merge 완료도 주장하지 않는다.

Backend API code, DB, Supabase SQL, K3s manifest, Dockerfile, production infrastructure, secret, `.env`, `.env.*`는 수정하지 않았다.

## README 업데이트 판단

README 업데이트는 필요하지 않다고 판단했다.

로컬 실행 방식, 환경 변수명, package script, dependency가 변경되지 않았다. API base URL도 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 정책을 그대로 사용한다.

## 확인 결과

정적 검증 기준으로 홈 UI 구성 변경과 3일/주간 상세 route 추가는 빌드 가능한 상태다.

Next.js build route 목록에는 `/three-day-topics/[id]`, `/weekly-topics/[id]`가 dynamic route로 포함됐다. 제거 대상 문구와 Daily 캐러셀 잔여 코드 검색도 통과했다.

수동 브라우저 검증과 실제 API 데이터 기반 확인은 pending이다.

## 이번 단계의 의미

홈 화면이 단순 Daily 목록 또는 모든 기간 동일 캐러셀 구조에서 벗어나, Daily는 한 번에 여러 이슈를 보여주는 중심 영역으로, 최근 3일·지난주는 흐름을 넘겨 보는 보조 영역으로 분리됐다.

이로써 홈의 첫 화면 정보 밀도와 기간별 탐색 목적이 더 명확해졌다. 상세 정보는 각 Topic 상세 route로 넘기고 홈은 날짜, 제목, 제한된 Summary만 보여주는 방향을 유지했다.

## 포트폴리오용 요약

NewsLab Web 홈 화면을 기간별 뉴스 흐름 탐색 UI로 개선했다. Daily Topic은 대표 카드 1개와 보조 카드 최대 2개로 구성하고, 최근 3일·지난주 Topic은 독립 캐러셀로 제공했다. Three-day/Weekly API client와 상세 route를 추가하고, API별 error/empty/loading 상태를 독립 처리했다. lint, typecheck, build, diff check, 문구 검색, dependency diff, secret scan 검증을 통과했다.

## 다음 단계 후보

- 실제 API 데이터로 홈 렌더링 확인
- Desktop, laptop, tablet, mobile viewport 수동 브라우저 검증
- Daily 카드가 1개, 2개, 3개 이상일 때 layout 확인
- 최근 3일·지난주 캐러셀의 독립 index, disabled 버튼, 위치 표시 확인
- loading, empty, error 상태를 수동 또는 mock 환경에서 확인
- Antigravity 전체 리뷰 수행
