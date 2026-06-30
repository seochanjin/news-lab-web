# 승인된 수정: 홈 화면 기간별 Topic 구성 개선

## 사람 승인 대기 중인 수정 후보

- 없음
- 오늘의 이슈는 여러 개를 한 번에 확인할 수 있는 카드 목록으로 구성하고, 최근 3일·지난주 흐름은 기존 독립 캐러셀 구조를 유지한다.
- 상단 Hero 제거와 카드 밀도 조정을 이번 수정에서 함께 적용한다.

## 승인된 수정

### 홈 상단 Hero 제거

- 홈 상단의 기존 `DAILY TOPICS` Hero 영역을 제거한다.
  - `DAILY TOPICS`
  - `자동 생성된 주요 이슈`
  - `오늘 움직이는 뉴스 흐름을 주요 이슈로 먼저 확인하세요.`
  - Hero 설명 문구
- 홈 진입 시 별도의 소개 Hero 없이 `오늘의 주요 이슈` 섹션부터 표시한다.
- Hero 제거 후 navigation 아래에 과도한 상단 공백이 남지 않도록 본문 margin과 padding을 조정한다.

### 오늘의 주요 이슈 구성

- Daily Topic은 캐러셀 한 장으로 표시하지 않는다.
- 홈에서 Daily Topic 3개를 한 번에 노출한다.
- 표시 구조는 다음과 같이 구성한다.
  - 첫 번째 Topic: 전체 너비 대표 카드
  - 두 번째·세 번째 Topic: Desktop 2열 보조 카드
- Mobile에서는 세 카드를 모두 1열로 표시한다.
- Daily Topic이 3개보다 적으면 존재하는 Topic만 표시한다.
- Daily Topic이 4개 이상이어도 홈에서는 최대 3개만 표시한다.
- 별도의 Daily 이전·다음 캐러셀 버튼과 `N / Total` 표시는 제거한다.
- 필요하다면 섹션 우측에 `전체 주요 이슈 보기` 링크를 유지할 수 있다.
- `전체 주요 이슈 보기`는 기존에 유효한 목록 route가 있을 때만 연결한다.

### 최근 3일·지난주 흐름 구성

- 최근 3일과 지난주 Topic은 현재 구현된 독립 캐러셀 구조를 유지한다.
- 각 기간은 한 번에 Topic 카드 하나를 표시한다.
- 이전·다음 버튼과 현재 위치 `N / Total` 표시를 유지한다.
- 최근 3일과 지난주는 각각 독립적인 index를 사용한다.
- 한 캐러셀을 이동해도 다른 캐러셀의 index는 변경되지 않는다.
- 자동 재생, 무한 순환, drag 기반 복잡한 animation은 추가하지 않는다.

### 카드 정보 구성

- Daily 대표 카드에는 다음 정보만 표시한다.
  - 실제 Topic 날짜
  - 제목
  - 제한된 Summary
- Daily 보조 카드에는 다음 정보만 표시한다.
  - 실제 Topic 날짜
  - 제목
  - 제한된 Summary
- 최근 3일·지난주 카드에는 다음 정보만 표시한다.
  - 제목
  - 제한된 Summary
- 최근 3일·지난주 카드에는 `날짜 미정`이나 프론트에서 계산한 임의 날짜 범위를 표시하지 않는다.
- 모든 홈 카드에서 다음 정보는 제거한다.
  - 키워드
  - 출처 수
  - 기사 수
  - 관련 기사 목록
  - `상세 보기` 텍스트
- 카드 전체를 클릭 가능한 실제 `Link`로 유지한다.
- 카드 hover와 focus-visible 상태를 통해 클릭 가능한 요소임을 표시한다.

### 섹션 문구

홈 섹션 제목은 다음 문구를 사용한다.

- `오늘의 주요 이슈`
- `최근 3일 흐름`
- `지난주 흐름`

다음 반복 라벨은 표시하지 않는다.

- `TOPIC FLOW`
- `DAILY TOPICS`
- `자동 생성된 주요 이슈`

## 추가 승인된 밀도 및 시각적 위계 조정

### 공통 원칙

- Daily, 최근 3일, 지난주 카드의 높이를 억지로 동일하게 맞추지 않는다.
- 카드 높이는 실제 콘텐츠와 padding으로 결정한다.
- 정상 Topic 카드에 큰 고정 `min-height`를 적용하지 않는다.
- loading, empty, error 상태에만 layout shift 방지를 위한 별도 최소 높이를 적용할 수 있다.
- 빈 공간을 채우기 위해 의미 없는 metadata나 장식 요소를 추가하지 않는다.

### Daily 대표 카드

- 첫 번째 Daily Topic은 홈의 중심 콘텐츠로 보이도록 보조 카드보다 강조한다.
- 전체 너비를 사용한다.
- 권장 padding:
  - Desktop: 상하 `28px`, 좌우 `32px`
  - Mobile: `20px`
- 날짜와 제목 사이의 간격을 줄인다.
- 제목과 Summary 사이의 간격을 줄인다.
- 제목은 최대 2줄로 제한한다.
- Summary는 다음 기준으로 제한한다.
  - Desktop: 최대 3줄
  - Mobile: 최대 2줄
- 필요하다면 다음 중 하나의 절제된 강조만 적용한다.
  - 브랜드 색상 왼쪽 border
  - 매우 옅은 브랜드 계열 배경
  - 보조 카드보다 약간 큰 제목
- 강한 그림자나 과도한 장식은 사용하지 않는다.

### Daily 보조 카드

- 두 번째·세 번째 Daily Topic은 Desktop에서 2열 grid로 표시한다.
- Mobile에서는 1열로 표시한다.
- 권장 padding:
  - Desktop: `24px`
  - Mobile: `20px`
- 제목은 최대 2줄로 제한한다.
- Summary는 최대 2줄로 제한한다.
- 대표 카드보다 제목과 padding을 작게 설정해 시각적 위계를 만든다.
- 두 카드의 높이가 내용 차이로 소폭 달라지는 것은 허용한다.
- grid 정렬을 위해 높이를 맞춰야 한다면 과도한 고정 높이 대신 grid stretch 수준만 사용한다.

### 최근 3일·지난주 캐러셀 카드

- 정상 카드의 기존 `min-height: 220px`를 제거한다.
- 새로운 큰 고정 최소 높이를 추가하지 않는다.
- 권장 padding:
  - Desktop: 상하 `24px`, 좌우 `28px`
  - Mobile: `20px`
- 제목은 최대 2줄로 제한한다.
- Summary는 다음 기준으로 제한한다.
  - Desktop: 최대 3줄
  - Mobile: 최대 2줄
- Summary가 없거나 짧은 경우에도 불필요한 빈 공간을 확보하지 않는다.
- 카드 하단 고정 영역이나 `margin-top: auto`가 있다면 제거한다.

### 섹션 간격

- 섹션 간 세로 간격을 줄인다.
  - Desktop 권장: `40px`
  - Mobile 권장: `28px`
- 섹션 제목과 콘텐츠 사이 간격은 `16px` 수준으로 조정한다.
- Daily 대표 카드와 보조 카드 사이 간격은 `16px` 수준으로 조정한다.
- 최근 3일과 지난주 캐러셀 header의 제목, 위치 표시, 버튼이 하나의 영역처럼 보이도록 정렬한다.

### 캐러셀 controls

- 이전·다음 controls는 최근 3일·지난주 섹션 header에 유지한다.
- 현재 위치와 버튼을 다음 순서로 배치한다.

```text
1 / 4  [이전] [다음]
```

- 버튼은 실제 <button> 요소를 사용한다.
- 첫 항목에서는 이전 버튼을 비활성화한다.
- 마지막 항목에서는 다음 버튼을 비활성화한다.
- Topic이 하나뿐이면 양쪽 버튼을 비활성화하거나 숨긴다.
- 버튼은 카드보다 시각적으로 과도한 존재감을 갖지 않도록 조정한다.
- 아이콘 버튼으로 변경할 경우 명확한 aria-label을 제공한다.

## 거절 또는 보류한 제안

- 오늘·최근 3일·지난주를 모두 동일한 1장 캐러셀로 구성하지 않는다.
  - Daily까지 한 장씩 표시하면 홈의 정보 밀도와 시각적 중심이 약해진다.
- 기존 Daily 카드의 키워드, 출처 수, 기사 수는 복구하지 않는다.
- 3일·7일 Topic에 임의의 날짜 범위를 프론트에서 계산해 표시하지 않는다.
- 상세 보기 링크와 카드 전체 클릭을 동시에 유지하지 않는다.
- Daily Topic 10개 전체를 홈에서 다시 나열하지 않는다.
- 최근 3일·지난주를 2열 다중 카드 목록으로 변경하지 않는다.
- 외부 Carousel 라이브러리를 도입하지 않는다.
- 카드 자동 재생, drag animation, 무한 loop는 적용하지 않는다.
- 카드 높이를 맞추기 위해 큰 고정 높이를 강제하지 않는다.
- 빈 공간을 채우기 위한 의미 없는 배지나 설명 문구를 추가하지 않는다.

## 적용할 변경

### app/page.tsx

- 상단 Hero markup 전체를 제거한다.
- Hero 제거 후 홈 본문 시작 지점의 상단 margin과 padding을 조정한다.
- Daily Topic 응답에서 최대 3개를 선택한다.
- Daily Topic은 다음과 같이 전달한다.
  - 첫 번째 항목: 대표 카드
  - 두 번째·세 번째 항목: 보조 카드
- Daily 카드에는 API의 실제 topic_date가 있을 때만 날짜 label을 전달한다.
- 최근 3일·지난주 카드에는 날짜 label을 전달하지 않는다.
- 세 기간 섹션의 렌더링 순서는 다음과 같이 유지한다.
  1. 오늘의 주요 이슈
  2. 최근 3일 흐름
  3. 지난주 흐름
- Daily 캐러셀용 state, 이전·다음 버튼, 위치 표시는 사용하지 않는다.
- 기존 Daily 전체 목록 route가 유효하다면 전체 주요 이슈 보기 링크를 섹션 header 우측에 배치할 수 있다.

### Daily 홈 컴포넌트

기존 컴포넌트를 재사용하거나 다음과 같은 별도 컴포넌트로 분리할 수 있다.

```text
components/home/DailyTopicHighlights.tsx
components/home/DailyTopicCard.tsx
```

요구사항:

- 대표 카드 1개와 보조 카드 최대 2개를 표시한다.
- 대표 카드와 보조 카드의 시각적 위계를 구분한다.
- 모든 카드는 실제 Link로 구현한다.
- 날짜, 제목, Summary만 표시한다.
- 키워드, 출처 수, 기사 수, 상세 보기는 표시하지 않는다.
- Daily Topic이 없으면 의미 있는 empty 상태를 표시한다.
- Daily API 실패가 최근 3일·지난주 렌더링을 막지 않아야 한다.

components/home/PeriodTopicSection.tsx

- 이 컴포넌트는 최근 3일·지난주 캐러셀에 사용한다.
- 카드 하단 상세 보기 텍스트를 표시하지 않는다.
- 카드 전체 Link와 hover/focus-visible 스타일을 유지한다.
- 반복되는 TOPIC FLOW 라벨을 표시하지 않는다.
- 섹션 제목, 현재 위치, 이전·다음 버튼만 표시한다.
- 정상 카드의 고정 min-height: 220px를 제거한다.
- 정상 카드에는 새로운 큰 고정 최소 높이를 추가하지 않는다.
- 카드 내부 상하 padding을 줄인다.
- 제목은 line-clamp-2를 유지한다.
- Summary는 Desktop 최대 3줄, Mobile 최대 2줄로 표시한다.
- Summary가 없는 경우 빈 공간을 확보하지 않는다.
- 카드 하단 고정 영역이나 margin-top: auto가 있다면 제거한다.
- 이전·다음 controls는 카드 내부가 아니라 섹션 header에 유지한다.

components/home/PeriodTopicHome.tsx

- Daily Topic은 캐러셀이 아닌 대표 1개와 보조 최대 2개 구조로 렌더링한다.
- 최근 3일·지난주는 기존 독립 캐러셀 구조를 유지한다.
- loading/error 상태에서도 Hero 또는 TOPIC FLOW 라벨을 표시하지 않는다.
- loading placeholder 높이를 실제 카드 구조와 유사한 수준으로 조정한다.
- Daily loading은 대표 카드와 보조 카드 배치를 과도하게 크게 모사하지 않는다.
- loading 상태에서는 재시도를 요구하는 문구를 표시하지 않는다.
- 재시도 안내는 실제 error 상태에서만 표시한다.
- 기간별 error/empty 상태의 padding도 정상 카드와 유사한 수준으로 줄인다.
- 한 API 실패가 다른 기간 섹션 렌더링을 막지 않도록 기존 독립 상태 처리를 유지한다.

## Codex 적용 결과

- `app/page.tsx`
  - 홈 상단 Hero markup은 제거된 상태를 유지했다.
  - Daily 응답은 `slice(0, 3)`으로 최대 3개만 홈 UI에 전달한다.
  - Daily 섹션 제목을 `오늘의 주요 이슈`로 변경했다.
  - Daily 카드에는 실제 `topic_date`가 있을 때만 날짜 label을 전달한다.
  - 최근 3일·지난주 카드에는 날짜 label을 전달하지 않는다.
  - 세 기간 렌더링 순서는 오늘의 주요 이슈, 최근 3일 흐름, 지난주 흐름으로 유지했다.
- `components/home/DailyTopicHighlights.tsx`
  - Daily 전용 하이라이트 컴포넌트를 추가했다.
  - 첫 번째 Topic은 전체 너비 대표 카드로, 두 번째·세 번째 Topic은 desktop 2열 보조 카드로 표시한다.
  - mobile에서는 모든 Daily 카드가 1열로 표시된다.
  - Daily 이전·다음 버튼과 위치 표시는 렌더링하지 않는다.
  - 모든 Daily 카드는 실제 `Link`로 구현했고 날짜, 제목, 제한된 Summary만 표시한다.
  - `전체 주요 이슈 보기`는 기존 `/topics` route로 연결했다.
- `components/home/PeriodTopicHome.tsx`
  - Daily는 `DailyTopicHighlights`로 렌더링하고 최근 3일·지난주는 기존 `PeriodTopicSection` 캐러셀로 렌더링한다.
  - Daily error/loading heading은 홈의 `h1`으로, 최근 3일·지난주는 `h2`로 유지했다.
  - loading 상태에서는 재시도 안내를 표시하지 않고 error 상태에서만 표시한다.
- `components/home/PeriodTopicSection.tsx`
  - 최근 3일·지난주 캐러셀 전용으로 유지했다.
  - Summary line clamp를 mobile 2줄, desktop 3줄로 조정했다.
  - 정상 카드에 큰 고정 최소 높이를 추가하지 않았다.
- `components/topics/TopicList.tsx`, `components/topics/TopicCard.tsx`, `components/topics/PeriodTopicDetail.tsx`
  - 승인 문구 제거 검증이 `app components` 전체를 대상으로 하므로 기존 목록/상세 컴포넌트의 충돌 문구만 정리했다.
  - 기능, route, API contract는 변경하지 않았다.
- 외부 Carousel dependency, 자동 재생, drag animation, 무한 loop, Daily 10개 전체 노출은 적용하지 않았다.

## 목표 화면 구조

```text
오늘의 주요 이슈                              전체 주요 이슈 보기 →

┌──────────────────────────────────────────────────────────┐
│ 2026년 6월 30일                                         │
│ 독일 스타데이 청소년·가족복지시설에서 다수 사망 및...  │
│ 독일 북부 복지시설에서 발생한 총격으로 직원 6명이...   │
└──────────────────────────────────────────────────────────┘

┌───────────────────────────┐ ┌───────────────────────────┐
│ 2026년 6월 30일          │ │ 2026년 6월 29일          │
│ 대법원, Fed 이사 해임... │ │ 유럽 폭염: 프랑스에서... │
│ Summary 최대 2줄         │ │ Summary 최대 2줄         │
└───────────────────────────┘ └───────────────────────────┘


최근 3일 흐름                             1 / 4  [이전] [다음]

┌──────────────────────────────────────────────────────────┐
│ 3일 동안의 흐름: 호주 SNS 연령 제한 규제 확산과...     │
│ 지난 72시간 동안 호주의 청소년 SNS 규제를 둘러싼...    │
└──────────────────────────────────────────────────────────┘


지난주 흐름                              1 / 4  [이전] [다음]

┌──────────────────────────────────────────────────────────┐
│ 유럽 폭염 주간 흐름 — 프랑스 수난에서 서유럽...        │
│ 프랑스에서 시작된 폭염이 영국과 스위스 등으로...       │
└──────────────────────────────────────────────────────────┘
```

## 상태 처리

### Loading

- loading 상태에서는 각 영역이 데이터를 불러오는 중이라는 사실만 표시한다.
- 잠시 후 다시 시도해 주세요.는 loading 상태에 표시하지 않는다.
- 실제 카드보다 과도하게 큰 빈 loading 박스를 만들지 않는다.
- loading placeholder로 인해 layout이 크게 흔들리지 않도록 한다.

### Empty

- Daily Topic이 없으면 다음과 같이 표시한다.
  오늘 생성된 주요 이슈가 없습니다.
- 최근 3일 Topic이 없으면 다음과 같이 표시한다.
  최근 3일 동안 생성된 뉴스 흐름이 없습니다.
- Weekly Topic이 없으면 다음과 같이 표시한다.
  지난 완료 주간에 생성된 뉴스 흐름이 없습니다.
- 빈 상태에서는 위치 표시와 이전·다음 버튼을 표시하지 않는다.

### Error

- 실제 API 오류일 때만 재시도 안내를 표시한다.
- 한 API 호출 실패가 다른 기간 영역 렌더링을 막지 않아야 한다.
- 내부 endpoint, stack trace, 환경변수 이름, Secret을 화면에 노출하지 않는다.
- API 실패 후 무한 loading 상태에 머무르지 않아야 한다.

## 접근성 및 문서 구조

- 오늘의 주요 이슈를 홈 페이지의 <h1>으로 사용한다.
- 최근 3일 흐름, 지난주 흐름은 <h2>로 구성한다.
- Daily 대표·보조 카드와 기간별 캐러셀 카드는 실제 Link로 구현한다.
- 이전·다음 버튼은 실제 <button> 요소를 사용한다.
- disabled 상태는 실제 disabled 속성으로 표현한다.
- 아이콘만 사용하는 버튼에는 기간을 포함한 aria-label을 제공한다.

예:

```text
최근 3일 흐름 이전 항목

최근 3일 흐름 다음 항목

지난주 흐름 이전 항목

지난주 흐름 다음 항목
```

- 모든 카드와 버튼은 Tab 키로 접근할 수 있어야 한다.
- Enter 키로 Topic 상세 화면에 이동할 수 있어야 한다.
- focus-visible 상태가 명확하게 보여야 한다.
- hover에만 의존해 클릭 가능성을 전달하지 않는다.

## 변경하지 않을 항목

- Backend API code
- DB 및 Supabase SQL
- K3s manifest 및 production infrastructure
- Docker 및 image build 설정
- Secret
- .env, .env.\*
- Backend Topic 생성 정책
- Backend 정렬 및 기간 계산 정책
- git push
- git merge
- production deploy command
- production-impacting command

Backend API의 가용성, K3s, DNS, Ingress 및 외부 네트워크 timeout 문제는 이번 프론트 UI 수정 범위에 포함하지 않는다.

단, API 실패 시 각 영역이 무한 loading 상태에 머무르지 않고 error 상태로 전환되는지는 검증한다.

## 필요한 검증

### 자동 검증

npm run lint
npm run typecheck
npm run build

테스트가 구성되어 있다면 함께 실행한다.
npm test
또는:
npm run test

변경 범위와 포맷을 확인한다.
git status --short
git diff --stat
git diff --check
git diff --name-only

제거 대상 문구가 남아 있지 않은지 확인한다.
rg -n \
 "DAILY TOPICS|자동 생성된 주요 이슈|오늘 움직이는 뉴스 흐름|날짜 미정|상세 보기|TOPIC FLOW" \
 app components

의도하지 않은 dependency 변경이 없는지 확인한다.
git diff -- \
 package.json \
 package-lock.json \
 pnpm-lock.yaml \
 yarn.lock

Daily 캐러셀 관련 코드가 불필요하게 남아 있지 않은지 확인한다.
rg -n \
 "dailyIndex|daily.*previous|daily.*next|오늘의 이슈 이전|오늘의 이슈 다음" \
 app components

기간별 API와 route 연결을 확인한다.
rg -n \
 "topics/home|three-day-topics/home|weekly-topics/home|three-day-topics|weekly-topics" \
 app components lib

### 수동 브라우저 검증

#### 홈 상단

- 상단 Hero가 완전히 제거됐는지 확인한다.
- navigation 아래에서 오늘의 주요 이슈가 첫 콘텐츠로 표시되는지 확인한다.
- Hero 제거 후 과도한 상단 공백이 남지 않는지 확인한다.
- 검색창과 navigation layout이 기존처럼 유지되는지 확인한다.

#### 오늘의 주요 이슈

- Daily Topic이 최대 3개만 표시되는지 확인한다.
- 첫 번째 Topic이 전체 너비 대표 카드로 표시되는지 확인한다.
- 두 번째·세 번째 Topic이 Desktop에서 2열로 표시되는지 확인한다.
- Mobile에서는 세 카드가 1열로 표시되는지 확인한다.
- Daily 이전·다음 버튼과 위치 표시가 제거됐는지 확인한다.
- Daily 카드에는 실제 날짜가 표시되는지 확인한다.
- 키워드, 출처 수, 기사 수, 상세 보기가 표시되지 않는지 확인한다.
- 대표 카드와 보조 카드 사이에 시각적 위계가 있는지 확인한다.
- Daily Topic이 1개 또는 2개일 때 빈 카드 영역이 생성되지 않는지 확인한다.
- Daily Topic이 4개 이상이어도 홈에는 3개만 표시되는지 확인한다.

#### 최근 3일·지난주

- 최근 3일·지난주 카드에는 날짜 영역이 없는지 확인한다.
- 각 섹션이 독립 캐러셀로 동작하는지 확인한다.
- 이전·다음 버튼과 현재 위치가 정상 동작하는지 확인한다.
- 한 캐러셀을 이동해도 다른 캐러셀 index가 바뀌지 않는지 확인한다.
- 첫 항목과 마지막 항목의 disabled 상태가 정확한지 확인한다.
- Topic이 하나뿐일 때 controls가 자연스럽게 처리되는지 확인한다.

#### 카드 표시

- 모든 카드에서 제목이 최대 2줄로 제한되는지 확인한다.
- Daily 대표 Summary가 Desktop 최대 3줄, Mobile 최대 2줄인지 확인한다.
- Daily 보조 Summary가 최대 2줄인지 확인한다.
- 최근 3일·지난주 Summary가 Desktop 최대 3줄, Mobile 최대 2줄인지 확인한다.
- Summary가 짧거나 없는 경우 카드가 불필요하게 늘어나지 않는지 확인한다.
- 카드 아래쪽에 의미 없는 빈 공간이 남지 않는지 확인한다.
- 긴 영문 제목과 Summary에서 horizontal overflow가 발생하지 않는지 확인한다.

#### 상호작용 및 접근성

- 카드 전체를 클릭해 상세 화면으로 이동할 수 있는지 확인한다.
- hover 상태에서 클릭 가능한 요소임을 인지할 수 있는지 확인한다.
- Tab 키로 카드와 버튼에 접근할 수 있는지 확인한다.
- Enter 키로 카드 상세 화면에 이동할 수 있는지 확인한다.
- focus-visible 상태가 명확한지 확인한다.
- disabled 버튼에 focus가 가지 않는지 확인한다.

#### 상태 처리

- Daily API 실패 시 최근 3일·지난주 영역은 정상 표시되는지 확인한다.
- 최근 3일 API 실패 시 Daily·지난주 영역은 정상 표시되는지 확인한다.
- Weekly API 실패 시 Daily·최근 3일 영역은 정상 표시되는지 확인한다.
- loading 상태에서 재시도 안내가 표시되지 않는지 확인한다.
- error 상태에서만 재시도 안내가 표시되는지 확인한다.
- API 실패 후 무한 loading 상태에 머무르지 않는지 확인한다.
- empty 상태에서 위치 표시와 controls가 사라지는지 확인한다.

#### 반응형

다음 viewport에서 확인한다.
Desktop: 1440px 이상
Laptop: 약 1280px
Tablet: 약 768px
Mobile: 375px 또는 390px

- horizontal overflow가 발생하지 않는지 확인한다.
- Daily 2열 보조 카드가 Mobile에서 정상적으로 1열로 전환되는지 확인한다.
- 섹션 제목과 controls가 겹치지 않는지 확인한다.
- 홈 본문 max-width가 header와 과도하게 어긋나지 않는지 확인한다.
- footer와 navigation에 layout 회귀가 없는지 확인한다.

## 완료 조건

- 상단 DAILY TOPICS Hero가 제거된다.
- 홈의 첫 콘텐츠는 오늘의 주요 이슈다.
- Daily Topic은 캐러셀이 아닌 대표 카드 1개와 보조 카드 최대 2개로 표시된다.
- Daily 캐러셀 controls와 위치 표시는 제거된다.
- 최근 3일·지난주 Topic은 각각 독립 캐러셀로 유지된다.
- 모든 홈 카드에서 키워드, 출처 수, 기사 수, 상세 보기가 제거된다.
- Daily 카드에만 실제 날짜가 표시된다.
- 최근 3일·지난주 카드에는 날짜 영역이 표시되지 않는다.
- 대표 카드와 보조 카드 사이에 명확한 시각적 위계가 있다.
- 카드에 과도한 고정 높이나 불필요한 빈 공간이 없다.
- 제목과 Summary line clamp가 viewport별 기준에 맞게 적용된다.
- 카드 전체 클릭, hover, keyboard focus 동작이 유지된다.
- API별 loading, empty, error 상태가 독립적으로 처리된다.
- Desktop과 Mobile에서 정보 밀도와 시각적 위계가 기존 전체 캐러셀 구조보다 개선된다.
- lint, typecheck, build와 관련 test가 통과한다.
- Backend, K3s, Docker, production infrastructure, Secret, .env\*는 변경되지 않는다.
