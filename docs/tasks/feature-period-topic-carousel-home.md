# 작업: 홈 화면 기간별 Topic 캐러셀 구성

## 목표

NewsLab 홈 화면에서 사용자가 기간별 뉴스 흐름을 빠르게 탐색할 수 있도록 다음 세 종류의 Topic을 동일한 캐러셀 UI로 제공한다.

- 오늘의 이슈: Daily Topic
- 최근 3일 흐름: Three-day Topic
- 지난주 흐름: Weekly Topic

현재 홈 화면은 Daily Topic의 첫 번째 항목을 큰 대표 카드로 표시하고, 나머지 Topic을 2열 카드 목록으로 나열한다.

이번 작업에서는 기존 대형 대표 카드와 다중 카드 목록 구조를 기간별 독립 캐러셀 구조로 정리한다. 각 기간은 한 번에 Topic 카드 하나를 보여주며, 사용자는 좌우 이동 버튼으로 해당 기간의 다른 Topic을 탐색할 수 있어야 한다.

홈 화면에서는 Topic의 핵심 정보만 간결하게 제공하고, 전체 Summary와 관련 기사 등의 세부 정보는 상세 화면에서 확인하도록 한다.

---

## 프론트엔드 작업 범위

### 1. 홈 화면 기간별 섹션 구성

홈 화면에 다음 세 섹션을 순서대로 표시한다.

1. 오늘의 이슈
2. 최근 3일 흐름
3. 지난주 흐름

각 섹션은 서로 독립적인 캐러셀로 동작해야 한다.

```text
오늘의 이슈                         1 / N   [이전] [다음]
[ Daily Topic 카드 1개 ]

최근 3일 흐름                       1 / N   [이전] [다음]
[ Three-day Topic 카드 1개 ]

지난주 흐름                         1 / N   [이전] [다음]
[ Weekly Topic 카드 1개 ]
```

한 기간의 캐러셀을 이동해도 다른 기간의 현재 index는 변경되지 않아야 한다.

### 2. 기존 Daily Topic 홈 구조 정리

현재 홈 화면의 다음 구조를 기간별 캐러셀 구조로 변경한다.

- 첫 번째 Daily Topic 대형 대표 카드
- 나머지 Daily Topic 2열 카드 목록
- 카드 하단 키워드 목록
- 출처 수 및 기사 수 표시

Daily Topic도 3일·7일 Topic과 같은 형태의 한 줄 캐러셀로 표시한다.

기존 상세 페이지와 Topic 클릭 동작은 유지한다.

### 3. Topic 카드 공통화

Daily, Three-day, Weekly Topic에 공통으로 사용할 수 있는 기간별 Topic 카드 컴포넌트를 구성한다.

카드에서 기본적으로 표시할 정보는 다음과 같다.

- 기간 또는 날짜
- Topic 제목
- Topic Summary 일부
- 상세 화면 이동이 가능하다는 시각적 단서

홈 카드에서는 다음 정보는 표시하지 않는다.

- 전체 키워드 목록
- 기사 수
- 출처 수
- 전체 Summary
- 관련 기사 목록

제목과 Summary는 정해진 줄 수를 초과하지 않도록 제한한다.

권장 기준:

- 제목: 최대 2줄
- Summary: 최대 2~3줄
- 카드 높이: 같은 viewport 안에서 고정 또는 최소·최대 높이 통일

카드 전체 영역을 클릭하거나 키보드로 활성화하면 해당 Topic 상세 화면으로 이동해야 한다.

### 4. 기간별 API 연결

다음 Backend API를 사용한다.

#### Daily Topic

기존 홈 또는 목록 API 계약을 재사용한다.

```text
GET /topics/home
```

필요한 경우 현재 프론트에서 사용 중인 Daily Topic API client를 유지한다.

#### 최근 3일 Topic

```text
GET /three-day-topics/home
```

#### 지난주 Topic

```text
GET /weekly-topics/home
```

각 API 응답을 프론트 내부 공통 카드 모델로 무리하게 합치기보다는, API별 타입은 명확히 유지하고 UI에 필요한 값만 공통 props로 전달한다.

### 5. 상세 페이지 연결

각 카드 클릭 시 기간에 맞는 상세 route로 이동한다.

```text
Daily Topic
→ /topics/{topicId}

Three-day Topic
→ /three-day-topics/{topicId}

Weekly Topic
→ /weekly-topics/{topicId}
```

현재 프로젝트의 실제 route 명명 규칙이 다르면 기존 구조를 우선한다.

3일·7일 상세 route가 아직 구현되어 있지 않다면 이번 작업에서 최소 상세 화면까지 추가하거나, 작업 범위가 과도해질 경우 홈 카드와 목록 연결까지만 구현하고 상세 route 구현 필요성을 명확히 기록한다.

깨진 링크나 존재하지 않는 route로 이동하게 만들어서는 안 된다.

### 6. 캐러셀 이동 기능

각 기간 섹션은 별도의 현재 index를 가진다.

예:

```text
dailyIndex
threeDayIndex
weeklyIndex
```

이동 버튼 동작은 다음을 따른다.

- 다음 버튼: 다음 Topic으로 이동
- 이전 버튼: 이전 Topic으로 이동
- 첫 번째 항목에서는 이전 버튼 비활성화
- 마지막 항목에서는 다음 버튼 비활성화
- Topic이 1개인 경우 양쪽 버튼 모두 비활성화 또는 숨김
- Topic이 0개인 경우 카드 대신 빈 상태 표시

무한 순환 방식보다 시작과 끝을 명확히 알 수 있는 비순환 방식을 우선한다.

자동 재생은 구현하지 않는다.

### 7. 위치 표시

현재 Topic 위치를 다음과 같이 표시한다.

```text
1 / 5
2 / 5
```

스크린 리더가 현재 위치와 전체 항목 수를 이해할 수 있는 텍스트를 제공한다.

---

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Daily, Three-day, Weekly Backend API contract를 변경하지 않는다.
- Backend Topic 생성 정책, 정렬 정책, 기간 계산 정책을 프론트에서 재구현하지 않는다.
- Topic Summary 내용을 프론트에서 임의로 다시 생성하거나 가공하지 않는다.
- 기존 전역 navigation, footer, 검색 기능을 불필요하게 재설계하지 않는다.
- 외부 carousel 라이브러리를 새로 추가하지 않는다. 현재 의존성과 React state, CSS만으로 구현 가능한 범위를 우선한다.
- 자동 슬라이드, 드래그 기반 복잡한 animation, 무한 loop carousel은 구현하지 않는다.
- 이번 작업을 Backend 방식의 UNIT 단위 작업으로 분리하지 않는다.

---

## 예상 변경 파일

실제 프로젝트 구조를 확인한 뒤 경로를 확정하되 다음 범주의 파일이 변경될 수 있다.

```text
app/page.tsx
또는 홈 화면 route component

components/topic/
components/home/
components/carousel/

lib/api/
lib/types/
types/

app/topics/[id]/
app/three-day-topics/[id]/
app/weekly-topics/[id]/

관련 CSS module 또는 global stylesheet

tests/
docs/tasks/
docs/verification/
docs/reviews/
docs/pr/
docs/devlog/
```

예상 컴포넌트 예시:

```text
components/home/PeriodTopicSection.tsx
components/home/TopicCarousel.tsx
components/home/CompactTopicCard.tsx
components/home/CarouselControls.tsx
```

기존 Topic card를 안전하게 확장할 수 있다면 새 컴포넌트를 불필요하게 중복 생성하지 않는다.

---

## 컴포넌트 / Route / API client 영향

### 컴포넌트

#### `PeriodTopicSection`

한 기간의 섹션 제목, 위치 표시, 이동 버튼, 현재 Topic 카드를 담당한다.

예상 props:

```typescript
type PeriodTopicSectionProps = {
  title: string;
  topics: PeriodTopicCardItem[];
  emptyMessage: string;
  period: "daily" | "three-day" | "weekly";
};
```

#### `TopicCarousel`

현재 index와 이전·다음 이동을 관리한다.

캐러셀 state를 섹션 내부에 두어 Daily, Three-day, Weekly가 서로 영향을 주지 않게 한다.

#### `CompactTopicCard`

기간별 Topic의 공통 표시 UI를 담당한다.

예상 props:

```typescript
type PeriodTopicCardItem = {
  id: number;
  periodLabel: string;
  dateLabel: string;
  title: string;
  summary: string;
  href: string;
};
```

API 응답 타입 자체를 위 타입으로 대체하지 않는다. API adapter 또는 page component에서 UI 모델로 변환한다.

### Route

기존 Daily Topic 상세 route는 유지한다.

Three-day, Weekly 상세 route가 이미 존재하는지 먼저 확인한다.

존재하지 않을 경우 다음 중 하나를 선택한다.

1. 이번 작업 안에서 기존 Daily 상세 구조를 재사용해 최소 상세 route 구현
2. 별도 후속 작업으로 분리하고 홈 카드에서는 유효한 목록 route로 연결

상세 route가 없는데 Topic ID URL을 임의로 만들지 않는다.

### API client

다음 함수가 필요할 수 있다.

```typescript
getDailyTopicsHome();
getThreeDayTopicsHome();
getWeeklyTopicsHome();
```

기존 공통 fetch wrapper, timeout, error 처리, base URL 정책을 재사용한다.

API base URL을 하드코딩하지 않는다.

서버 컴포넌트에서 호출하는 기존 구조라면 불필요하게 client-side fetch로 변경하지 않는다.

캐러셀 이동에 필요한 최소 컴포넌트만 Client Component로 분리한다.

---

## 상태 처리

각 기간은 서로 독립적으로 다음 상태를 처리한다.

### Loading

현재 홈이 Server Component 기반이라면 서버 렌더링 결과를 우선한다.

별도의 client fetch를 사용하는 경우 고정 높이 skeleton 또는 loading placeholder를 표시해 layout shift를 줄인다.

### Success

Topic이 하나 이상이면 첫 항목부터 표시한다.

API가 반환한 순서를 유지한다. 프론트에서 임의 정렬하지 않는다.

### Empty

Topic이 없으면 해당 섹션을 완전히 숨기지 않고 의미 있는 빈 상태를 표시한다.

예:

```text
오늘 생성된 주요 이슈가 없습니다.
최근 3일 동안 생성된 뉴스 흐름이 없습니다.
지난 완료 주간에 생성된 뉴스 흐름이 없습니다.
```

빈 상태에서는 위치 표시와 이동 버튼을 표시하지 않는다.

### Error

한 API 호출이 실패해도 다른 기간 섹션까지 실패시키지 않는다.

예:

- Daily API 실패 → 최근 3일·지난주 섹션은 정상 표시
- Weekly API 실패 → 오늘·최근 3일 섹션은 정상 표시

사용자에게 내부 stack trace, endpoint, 환경변수 이름을 노출하지 않는다.

표시 예:

```text
최근 3일 흐름을 불러오지 못했습니다.
```

필요한 경우 server log에는 원인을 남기되 브라우저 화면에는 간단한 메시지만 표시한다.

### Index 안전성

API 데이터가 변경되거나 항목 수가 줄어들었을 때 현재 index가 배열 범위를 벗어나지 않아야 한다.

Topic 목록이 갱신되면 index를 유효 범위로 보정한다.

---

## 스타일 / 반응형 / 접근성

### 카드 크기

세 기간 카드의 기본 높이와 내부 간격을 통일한다.

카드 내용 길이에 따라 카드 높이가 크게 달라지지 않도록 한다.

- 제목 line clamp 적용
- Summary line clamp 적용
- 고정 또는 일관된 최소 높이
- overflow 처리
- 긴 영문 단어와 URL에 의한 layout 파손 방지

### Desktop

- 한 섹션에 Topic 카드 하나를 전체 너비로 표시
- 섹션 제목 우측에 위치 표시와 이전·다음 버튼 배치
- 세 기간 섹션 사이의 간격을 일정하게 유지
- 기존 홈 max-width와 typography 체계를 재사용

### Mobile

- 카드 하나가 viewport 너비 안에 들어오게 한다.
- 제목과 controls가 겹치지 않게 한다.
- 이전·다음 버튼 touch target은 최소 44×44px 수준을 권장한다.
- 모바일에서도 한 번에 카드 하나만 표시한다.
- horizontal page overflow가 발생하지 않아야 한다.

### 접근성

- 이전·다음 버튼은 실제 `<button>` 요소 사용
- 아이콘만 사용하는 버튼에는 `aria-label` 제공

예:

```text
오늘의 이슈 이전 항목
오늘의 이슈 다음 항목
최근 3일 흐름 이전 항목
최근 3일 흐름 다음 항목
지난주 흐름 이전 항목
지난주 흐름 다음 항목
```

- disabled 상태는 `disabled` 속성으로 표현
- focus-visible 스타일 유지
- 카드 전체 클릭은 의미 있는 `<a>` 또는 Next.js `Link` 사용
- 키보드 Tab과 Enter로 모든 카드와 control 사용 가능
- 현재 위치는 시각적 텍스트와 스크린 리더에서 이해 가능해야 함
- 좌우 화살표 키 조작은 필수가 아니지만 구현한다면 focus가 캐러셀 내부에 있을 때만 동작하게 한다.
- animation을 추가하는 경우 `prefers-reduced-motion`을 존중한다.

---

## 검증 Command

프로젝트의 실제 package manager와 script를 확인한 후 실행한다.

기본 검증 예시:

```bash
npm run lint
npm run typecheck
npm run build
```

프로젝트에 test script가 있다면:

```bash
npm test
```

또는:

```bash
npm run test
```

변경 파일 확인:

```bash
git status --short
git diff --stat
git diff --check
```

금지 영역 변경 확인:

```bash
git diff --name-only
```

다음 파일이 변경되지 않았는지 확인한다.

```text
.env
.env.*
Backend repository files
K3s manifests
Dockerfile
production secret
```

API 문자열과 route 확인:

```bash
rg -n "three-day-topics|weekly-topics|topics/home" app components lib
```

외부 carousel dependency가 추가되지 않았는지 확인:

```bash
git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock
```

---

## 수동 브라우저 검증

Desktop과 Mobile viewport에서 다음을 확인한다.

### 홈 초기 표시

- 오늘의 이슈가 첫 Topic을 표시한다.
- 최근 3일 흐름이 첫 Topic을 표시한다.
- 지난주 흐름이 첫 Topic을 표시한다.
- 각 섹션의 제목, 날짜, Summary가 올바른 API 데이터와 일치한다.
- 카드 높이가 내용 길이에 따라 과도하게 달라지지 않는다.

### 캐러셀 이동

- 다음 버튼으로 정확히 한 Topic씩 이동한다.
- 이전 버튼으로 정확히 한 Topic씩 이동한다.
- Daily 캐러셀 이동이 3일·Weekly index에 영향을 주지 않는다.
- 3일 캐러셀 이동이 Daily·Weekly index에 영향을 주지 않는다.
- 첫 항목에서 이전 버튼이 비활성화된다.
- 마지막 항목에서 다음 버튼이 비활성화된다.
- 항목이 하나뿐일 때 버튼 상태가 자연스럽다.
- 현재 위치 `N / Total` 표시가 실제 항목과 일치한다.

### 상세 이동

- Daily 카드 클릭 시 Daily Topic 상세 화면으로 이동한다.
- Three-day 카드 클릭 시 Three-day Topic 상세 화면 또는 유효한 연결 화면으로 이동한다.
- Weekly 카드 클릭 시 Weekly Topic 상세 화면 또는 유효한 연결 화면으로 이동한다.
- 브라우저 뒤로 가기 후 이전 캐러셀 화면이 깨지지 않는다.

### 상태 처리

- 특정 API를 실패시키거나 mock했을 때 다른 섹션은 정상 표시된다.
- 빈 배열 응답 시 의미 있는 빈 상태가 표시된다.
- 오류 메시지에 내부 endpoint, stack trace, secret 정보가 노출되지 않는다.
- 긴 제목과 긴 Summary에서 layout이 깨지지 않는다.
- 영문 키워드와 긴 단어가 카드 너비를 넘지 않는다.

### 반응형

다음 크기에서 확인한다.

```text
Desktop: 1440px 이상
Laptop: 약 1280px
Tablet: 약 768px
Mobile: 375px 또는 390px
```

- horizontal overflow 없음
- controls와 제목이 겹치지 않음
- touch target 확보
- 모바일에서도 카드 하나씩 정상 표시
- navigation과 footer layout 회귀 없음

### 접근성

- Tab으로 카드와 버튼에 접근 가능
- Enter 또는 Space로 버튼 조작 가능
- Enter로 카드 상세 이동 가능
- focus 표시가 보임
- disabled 버튼에 focus가 가지 않음
- screen reader용 label이 기간별로 구분됨

---

## 완료 조건

- 홈 화면에 오늘·최근 3일·지난주 세 기간 섹션이 표시된다.
- 세 섹션이 각각 독립적인 캐러셀로 동작한다.
- 각 캐러셀은 한 번에 Topic 카드 하나만 보여준다.
- 이전·다음 버튼과 현재 위치가 정확히 동작한다.
- 기존 Daily 대형 대표 카드와 2열 Topic 목록은 새 캐러셀 구조로 정리된다.
- 홈 카드에는 날짜, 제목, 제한된 Summary만 표시한다.
- 키워드, 출처 수, 기사 수는 홈 카드에서 제거된다.
- Topic 카드 높이가 일관되게 유지된다.
- 카드 클릭 시 유효한 상세 또는 연결 route로 이동한다.
- Daily, Three-day, Weekly API가 독립적으로 호출되고 한 API 실패가 전체 홈 실패로 이어지지 않는다.
- Loading, empty, error 상태가 기간별로 처리된다.
- Desktop과 Mobile에서 layout이 깨지지 않는다.
- 키보드와 스크린 리더를 고려한 접근성 속성이 적용된다.
- 기존 navigation, 검색, footer, 다른 route에 회귀가 없다.
- lint, typecheck, build와 프로젝트 내 관련 test가 통과한다.
- `git diff --check`가 통과한다.
- Backend, K3s, Docker, production infrastructure, secret, `.env*`는 변경되지 않는다.
- 구현 전체 완료 후 Antigravity 전체 리뷰를 수행할 수 있는 상태다.

---

## 참고 사항

- 이번 프론트 작업은 Backend 작업처럼 UNIT 단위로 분리하지 않는다.
- Codex가 전체 구현과 로컬 검증을 수행한 뒤 Antigravity 전체 리뷰를 한 번 진행한다.
- 각 기간의 Topic 개수는 서로 다를 수 있으므로 하나의 공통 index를 사용하지 않는다.
- `3일차`, `7일차`라는 표현은 사용자 UI에 사용하지 않는다.
- 사용자 표시 문구는 다음을 사용한다.

```text
오늘의 이슈
최근 3일 흐름
지난주 흐름
```

- Weekly Topic은 rolling 최근 7일이 아니라 완료된 calendar week이므로 `최근 7일`보다 `지난주 흐름`이 정확하다.
- 캐러셀은 자동 재생하거나 무한 반복하지 않는다.
- 홈에서는 정보 밀도를 낮추고 상세 화면에서 전체 Summary, 키워드, 기사·출처 정보를 제공한다.
- 현재 프로젝트의 컴포넌트, route, API client 패턴을 먼저 조사한 뒤 기존 구조를 최대한 재사용한다.
- 구현 중 상세 route 부재나 API 응답 계약 차이를 발견하면 임의로 우회하지 말고 task/verification 문서에 명시한다.
