# 작업: Topics API 프론트 목록 연결 MVP

## 목표

NewsLab 백엔드의 Topics API를 프론트엔드에 연결해, 자동 생성된 daily topic summary를 화면에서 확인할 수 있도록 한다.

이번 작업의 목표는 `/topics` 목록 API를 호출하고, 응답 데이터를 topic 카드 목록으로 표시하는 MVP를 구현하는 것이다.

대상 API:

```text
GET https://api.dev-scj.site/topics?page=1&page_size=10
```

표시 대상 데이터:

- `title_ko`
- `summary_ko`
- `keywords`
- `source_count`
- `article_count`
- `topic_date`
- `status`
- 개발 확인용 `provider`, `model`

이번 차수에서는 topic 상세 페이지, article 원문 상세, 날짜 필터, 카테고리 필터, 관리자 기능은 구현하지 않는다.

## 프론트엔드 작업 범위

- Topics API 응답 타입 정의
- Topics API fetch 함수 또는 API client 추가
- Topic 목록을 렌더링하는 컴포넌트 추가
- Topic 카드 컴포넌트 추가
- loading / error / empty 상태 처리
- 기존 홈 화면 또는 적절한 목록 페이지에 topic 목록 섹션 연결
- API base URL 처리 방식 정리
  - 기존 환경 변수 또는 API client 구조가 있으면 재사용한다.
  - 없으면 프론트 프레임워크에 맞는 public API base URL 이름을 제안하거나 최소 범위로 추가한다.
  - 예: Vite면 `VITE_API_BASE_URL`, Next.js면 `NEXT_PUBLIC_API_BASE_URL`
- 기존 화면과 라우팅을 깨지 않도록 최소 변경한다.
- `scripts/new_agent_task.sh`가 현재 branch와 입력 branch가 다를 경우 workflow 문서를 생성하지 않도록 안전장치를 추가한다.
- 기존 디자인 시스템, 레이아웃, 색상, spacing, typography를 우선 재사용한다.
- 새로운 UI 스타일을 만들기보다 기존 컴포넌트/클래스/스타일 패턴을 찾아서 따른다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- `/topics/{id}` 상세 페이지는 구현하지 않는다.
- topic 생성, 재실행, 삭제, 상태 변경 같은 관리자 기능은 구현하지 않는다.
- 백엔드 API 스펙은 변경하지 않는다.
- 실제 production 배포는 수행하지 않는다.
- secret 값, token, credential, API key를 코드나 문서에 기록하지 않는다.
- `scripts/new_agent_task.sh`는 branch를 자동 생성하거나 전환하지 않는다.

## 예상 변경 파일

실제 프론트 구조를 먼저 확인한 뒤 결정한다.

예상 후보:

```text
src/
src/api/
src/lib/
src/components/
src/pages/
src/app/
src/routes/
src/hooks/
src/styles/
```

가능한 변경 예시:

```text
src/api/topics.ts
src/types/topic.ts
src/components/topics/TopicList.tsx
src/components/topics/TopicCard.tsx
src/pages/Home.tsx
```

또는 Next.js 구조라면:

```text
app/page.tsx
components/topics/TopicList.tsx
components/topics/TopicCard.tsx
lib/api/topics.ts
types/topic.ts
```

문서/워크플로우 파일:

```text
docs/tasks/<safe-branch>.md
docs/verification/<safe-branch>.md
docs/pr/<safe-branch>.md
docs/devlog/<safe-branch>.md
scripts/new_agent_task.sh
```

## 컴포넌트 / Route / API client 영향

### API client

Topics API 응답 타입을 정의한다.

```ts
type Topic = {
  id: number;
  topic_date: string;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
  provider: string;
  model: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type TopicsResponse = {
  items: Topic[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};
```

API client는 다음 조건을 만족해야 한다.

- `page`, `page_size`를 인자로 받을 수 있어야 한다.
- HTTP 실패 시 error 상태를 반환하거나 throw한다.
- 응답 스키마를 사용하는 컴포넌트와 분리한다.
- API base URL은 하드코딩을 최소화한다.
- production API URL을 직접 넣어야 한다면 한 곳에서만 관리한다.

### 컴포넌트

Topic 목록 컴포넌트는 다음 역할을 가진다.

```text
TopicList
- API 호출
- loading/error/empty 상태 분기
- TopicCard 목록 렌더링
```

Topic 카드 컴포넌트는 다음 데이터를 표시한다.

```text
TopicCard
- 제목
- 요약
- 키워드 chip 목록
- 출처 수
- 기사 수
- topic 날짜
- status
- provider/model은 개발 확인용으로 작게 표시하거나 숨김 처리
```

### Route / Page

기존 홈 화면이 있다면 홈에 “오늘의 주요 이슈” 섹션으로 추가한다.

기존 라우팅 구조가 불명확하거나 홈 변경 영향이 크면 별도 route/page를 제안한다.

예시:

```text
/
또는
/topics
```

이번 MVP에서는 route 추가보다 기존 진입점에 최소 섹션을 붙이는 방식을 우선 검토한다.

## Workflow script 안전장치

현재 `scripts/new_agent_task.sh`는 branch를 생성하거나 전환하지 않고, 입력받은 branch 이름을 기준으로 workflow 문서만 생성한다.

이 방식은 안전하지만, 사용자가 `main`에서 실수로 실행하면 잘못된 workflow 문서가 생성될 수 있다.

이번 작업에서는 다음 안전장치를 추가한다.

- 현재 git branch를 확인한다.
- 현재 branch와 인자로 받은 `branch-name`이 다르면 workflow 문서를 생성하지 않고 종료한다.
- 오류 메시지에 현재 branch, 입력 branch, 먼저 실행해야 할 `git switch -c <branch-name>` 안내를 출력한다.
- branch를 자동 생성하거나 전환하지는 않는다.

예상 실패 동작:

```bash
git branch --show-current
# main

./scripts/new_agent_task.sh feature/topics-frontend-mvp "Topics API 프론트 목록 연결 MVP"
# 오류: 현재 branch와 입력 branch가 다릅니다.
# 현재 branch: main
# 입력 branch: feature/topics-frontend-mvp
# 먼저 실행하세요: git switch -c feature/topics-frontend-mvp
```

정상 사용 흐름:

```bash
git checkout main
git pull origin main
git switch -c feature/topics-frontend-mvp
./scripts/new_agent_task.sh feature/topics-frontend-mvp "Topics API 프론트 목록 연결 MVP"
```

## 상태 처리

다음 상태를 반드시 처리한다.

### Loading

API 요청 중 사용자에게 로딩 상태를 보여준다.

예시 문구:

```text
오늘의 주요 이슈를 불러오는 중입니다.
```

### Error

API 요청 실패 시 화면이 깨지지 않도록 error state를 표시한다.

예시 문구:

```text
주요 이슈를 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

개발 중에는 console error를 남겨도 되지만, 사용자 화면에 stack trace나 내부 URL, credential 정보가 노출되면 안 된다.

### Empty

`items`가 빈 배열이면 empty state를 표시한다.

예시 문구:

```text
아직 생성된 주요 이슈가 없습니다.
```

### Success

`items`가 있으면 topic card 목록을 표시한다.

## 스타일 / 반응형 / 접근성

스타일은 기존 프로젝트의 방식에 맞춘다.

- 기존 CSS module, Tailwind, styled-components, plain CSS 중 실제 사용 중인 방식을 따른다.
- 새로운 UI library를 추가하지 않는다.
- 기존 화면에서 사용 중인 색상, border, radius, shadow, spacing, typography 패턴을 우선 재사용한다.
- 기존 카드/섹션/리스트 UI가 있다면 해당 스타일을 참고해 TopicCard를 만든다.
- 기존 디자인과 다른 강한 색상, 과한 shadow, 새로운 버튼 스타일, 독립적인 디자인 시스템을 만들지 않는다.
- “오늘의 주요 이슈” 섹션은 기존 홈 화면의 레이아웃 흐름을 깨지 않게 삽입한다.
- 모바일에서도 카드가 세로로 자연스럽게 쌓이도록 한다.
- 긴 summary는 레이아웃을 깨지 않도록 처리한다.
- keyword는 기존 badge/chip 스타일이 있으면 재사용하고, 없으면 단순한 inline list 또는 최소한의 chip 형태로 구현한다.
- 카드 제목은 heading 계층을 고려한다.
- loading/error/empty 상태는 기존 안내 문구 스타일을 우선 재사용한다.
- 버튼이나 링크를 추가하는 경우 접근 가능한 label을 제공한다.

## 검증 Command

실제 package manager와 package.json scripts를 먼저 확인한다.

우선 실행 가능한 후보:

```bash
npm install
npm run lint
npm run build
npm run test
```

단, package manager가 `pnpm` 또는 `yarn`이면 해당 명령을 따른다.

예시:

```bash
pnpm lint
pnpm build
pnpm test
```

또는:

```bash
yarn lint
yarn build
yarn test
```

필수 검증:

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

프론트 코드 변경 후 가능한 경우:

```bash
npm run lint
npm run build
```

`new_agent_task.sh`의 branch mismatch 안전장치는 가능한 범위에서 확인한다.

예시:

```bash
./scripts/new_agent_task.sh wrong/branch "잘못된 브랜치 검증"
```

위 명령은 실패가 기대값이다. 검증 기록에는 다음을 명확히 구분해서 남긴다.

```text
기대 결과: 현재 branch와 입력 branch가 달라 workflow 문서 생성 없이 실패
실제 결과: 실패 메시지 출력, 파일 생성 없음
```

테스트 명령이 없으면 없는 것으로 기록하고, 가능한 build/lint/manual browser 검증을 수행한다.

실행한 명령과 결과는 반드시 다음 파일에 기록한다.

```text
docs/verification/<safe-branch>.md
```

## 수동 브라우저 검증

로컬 개발 서버를 실행한다.

예시:

```bash
npm run dev
```

또는 프로젝트에 맞는 명령을 사용한다.

브라우저에서 확인한다.

검증 항목:

- 페이지가 정상 로드된다.
- `/topics` API 요청이 성공한다.
- 2026-06-12 기준 topic id 4, 5, 6 또는 최신 topic 목록이 표시된다.
- 제목, 요약, 키워드, 출처 수, 기사 수가 표시된다.
- loading 상태가 순간적으로라도 깨지지 않는다.
- API 실패 상황에서 error state가 표시된다.
- 빈 목록 상황에 대한 empty state 코드가 존재한다.
- 기존 화면의 주요 UI가 깨지지 않는다.
- 브라우저 console에 secret, token, credential 값이 노출되지 않는다.

production API를 직접 호출하는 경우, 이는 read-only 확인으로만 제한한다.

## 완료 조건

- Topics API client 또는 fetch 함수가 추가되어 있다.
- Topic 응답 타입이 정의되어 있다.
- Topic 목록 UI가 화면에 표시된다.
- loading / error / empty / success 상태가 처리되어 있다.
- 기존 프론트 화면이 깨지지 않는다.
- `scripts/new_agent_task.sh`는 현재 branch와 입력 branch가 다를 때 workflow 문서를 생성하지 않는다.
- `scripts/new_agent_task.sh`는 branch를 자동 생성하거나 전환하지 않는다.
- backend, DB, K3s, Docker, secret, `.env` 관련 파일을 변경하지 않았다.
- 실행한 검증 명령과 결과가 `docs/verification/<safe-branch>.md`에 기록되어 있다.
- PR draft와 devlog draft가 실제 변경 사항과 검증 결과를 기준으로 작성되어 있다.
- production 배포 완료라고 주장하지 않는다.
- production verification은 사람이 제공한 로그가 있을 때만 완료로 기록한다.
- 기존 홈 화면의 전체 디자인 톤, 레이아웃, spacing을 크게 변경하지 않았다.
- Topic UI는 기존 컴포넌트/스타일 패턴을 우선 재사용한다.
- 새로운 UI library, 전역 스타일 리셋, 대규모 CSS 구조 변경을 하지 않았다.

## 참고 사항

백엔드 Topics API는 39차에서 CronJob 자동화 및 manual Job 검증을 완료했다.

확인된 production API 응답 예시:

```text
GET https://api.dev-scj.site/topics?page=1&page_size=10
```

최근 확인 결과:

```text
total: 6
2026-06-12 topic id: 4, 5, 6
provider: openai
model: gpt-5-nano
status: draft
```

이번 프론트 작업은 백엔드 API를 수정하지 않고, 이미 제공되는 `/topics` 목록을 화면에 노출하는 작업이다.

현재 summary 품질에는 일부 어색한 문장이나 특수문자가 포함될 수 있다. 이번 차수에서는 데이터 품질을 수정하지 않고, 화면 표시와 상태 처리를 우선 구현한다.

후속 작업 후보:

- `/topics/{id}` 상세 페이지
- topic에 연결된 article 목록 표시
- 원문 링크 이동
- 날짜 필터
- 카테고리 필터
- provider/model 개발용 표시 제거
- summary 품질 개선
- 저품질 source 또는 coupon/promo article filtering
