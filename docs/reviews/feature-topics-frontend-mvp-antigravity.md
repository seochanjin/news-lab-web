# Antigravity 검토: Topics API 프론트 목록 연결 MVP

## 검토 요약

`feature/topics-frontend-mvp` 브랜치에 구현된 백엔드 Topics API 연동 MVP 작업 및 `scripts/new_agent_task.sh` 안전장치 개선 작업에 대한 프론트엔드 코드 리뷰를 진행했습니다. 

전체적으로 Next.js 16 및 React 19의 컴포넌트 경계를 준수하였고, 엄격한 런타임 타입 검증과 `react-hooks/error-boundaries` 규칙을 고려한 상태 분기가 적용되어 있어 코드 안정성이 높습니다. 보안 및 작업 범위 통제 규칙을 철저히 지키며 변경이 수행되었습니다.

## 요구사항 충족

- **Topics API 연동**:
  - `lib/api/topics.ts`에서 `Topic`, `TopicsResponse` 타입 정의 및 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 기반 API 호출 함수 `getTopics` 구현 완료.
  - API 호출 결과에 대해 `isTopic`, `isTopicsResponse`를 통한 런타임 스키마 검증을 추가하여 프론트엔드 안정성을 확보함.
- **컴포넌트 추가**:
  - `components/topics/TopicCard.tsx`에서 개별 토픽 카드를 렌더링하고, 제목, 요약, 키워드, 출처/기사 수, status, provider/model을 화면 요구사항에 맞게 배치함.
  - `components/topics/TopicList.tsx`에서 로딩(`TopicListLoading`), 에러, 빈 목록(Empty), 성공 상태 분기 렌더링을 처리함.
- **홈 화면 연결**:
  - `app/page.tsx` 내 기존 Mock 데이터를 제거하고 `TopicList`와 `Suspense` fallback을 연결하여, 오늘의 주요 이슈 영역이 실제 API를 호출해 렌더링되도록 구현함.
- **안전장치 추가**:
  - `scripts/new_agent_task.sh`가 인자로 전달받은 브랜치명과 현재 git branch를 비교하여 다를 경우 에러 메시지와 올바른 명령어를 가이드하고 비정상 종료되도록 수정함.
- **제한 및 범위 준수**:
  - 상세 페이지(`topics/[id]`), 관리자 기능 등 제외 대상 목록은 구현에서 배제됨.
  - 기존 Tailwind CSS 기반 스타일 및 레이아웃을 해치지 않고 홈 화면의 흐름에 자연스럽게 섹션 형태로 안착시킴.

## 코드 품질과 유지보수성

- **타입 가드와 안정성**:
  - API 응답이 `unknown` 상태에서 명확한 타입 가드(`isTopicsResponse`)를 거치도록 작성하여 타입 안전성이 우수함.
- **Hooks 규칙 준수**:
  - 1차 린트 실패 원인이었던 JSX 내부 `try-catch`로 인한 `react-hooks/error-boundaries` 위반을, API 결과를 `TopicsResult` 유니온 타입 객체로 래핑하여 외부에서 분기 처리하는 방식으로 리팩토링하여 깔끔하게 해결함.
- **날짜 포맷팅**:
  - `formatTopicDate` 내에 `T00:00:00+09:00` 및 `timeZone: "Asia/Seoul"` 설정을 명시하여 타임존 오차로 인한 날짜 오류 가능성을 원천 차단함. 또한 파싱 에러(NaN) 발생 시 원본 문자열을 반환하여 비정상 데이터 유입 시에도 화면이 깨지지 않도록 방어함.

## 프론트엔드 동작과 접근성

- **HTML5 시맨틱 및 접근성**:
  - `TopicCard` 내에서 `<article>`, `<time dateTime={...}>`, 키워드 목록의 `<ul aria-label="주요 키워드">` 등을 사용하여 스크린 리더와 시맨틱 마크업 접근성을 고려함.
- **반응형 레이아웃**:
  - Tailwind CSS Grid(`grid gap-3 sm:grid-cols-2`)를 활용하여 모바일 화면에서는 1열 세로 스택, 데스크톱 이상 화면에서는 2열로 자연스럽게 배치되도록 구현함. 첫 번째 카드의 경우 `sm:col-span-2`를 주어 주요 토픽 강조 효과와 시각적 밸런스를 잡음.

## 보안과 범위 검토

- **환경 변수**:
  - 실제 API base URL을 하드코딩하거나 `.env*` 파일에 커밋하지 않고 `process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 사용함.
- **비인가 동작 부재**:
  - `git push`, `git merge`, production 배포 명령 및 배포 설정 수정 등의 영향 행위는 수행하지 않음.
  - backend API 코드, DB 마이그레이션 등 프론트엔드 작업 범위 밖의 변경이 전혀 발생하지 않음.

## 검증 기록 검토

- `docs/verification/feature-topics-frontend-mvp.md`에 기반하여 검증 내용 검토:
  - `npm run lint`, `npm run typecheck`, `npm run build` 결과 모두 최종 통과된 근거가 명확함.
  - `scripts/new_agent_task.sh`에 구현된 브랜치 가드 기능에 대해 실패 케이스(wrong branch)와 성공 케이스를 분리하여 실제로 검증하고 exit code와 에러 로그를 투명하게 기록함.
  - 로컬 개발 서버 작동 및 HTML 마커 확인을 `curl`을 통해 실체 있는 결과로 검증함.
  - **AGENTS.md 규칙 준수**: 실제로 확인하지 않은 manual browser verification, deployment, production verification 등은 '대기 중인 검증'으로 분류하여 완료로 주장하지 않는 엄격함을 보임.

## 문서 검토

- `docs/tasks/feature-topics-frontend-mvp.md`를 요구사항의 단일 소스(Source of Truth)로 올바르게 사용함.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md` 문서에 Topics API 연동 및 브랜치 가드 스크립트 수정 사항이 아키텍처 관점에서 충실히 갱신됨.

## 발견된 문제

- **현재 코드상 크리티컬한 문제나 버그는 없음.**
- (참고사항) `TopicCard.tsx`에서 개발 확인용 `provider`와 `model`은 `sm:ml-auto`와 `text-slate-500`를 주어 디자인 톤을 해치지 않고 작게 노출되고 있음. 후속 차수에서 해당 정보 숨김 처리 시 `TopicCard` 내부 렌더링 조건만 수정하면 됨.

## PR 전 필수 수정

- **없음**

## 선택 개선 사항

- `lib/api/topics.ts`의 `isTopic`에서 `topic.keywords`가 API 스펙상 누락되거나 null로 올 가능성이 있을 경우, `Array.isArray(topic.keywords)` 이전에 옵셔널 체이닝 등의 처리가 필요할 수 있으나 현재 API는 `keywords`를 필수 필드로 내려주고 있어 현재 스키마 상에서는 문제없이 런타임에 올바르게 필터링됨.

## 제안 검증 Command

로컬 CI 및 수동 브라우저 검증을 위한 명령:

```bash
# 로컬 빌드 및 린트 재확인
npm run lint
npm run typecheck
npm run build

# 로컬 개발 서버 구동 후 브라우저 viewport 및 console 확인
npm run dev
```

## 최종 판단

- **승인 권장 (Approve)**
  - 작업 범위 통제 규칙과 아키텍처 규칙을 충실히 지킨 우수한 구현입니다.
  - 실질적인 오류 처리와 시맨틱 태그 활용, 브랜치 불일치 시의 가드 스크립트 기능이 요구사항에 맞춰 완전히 동작합니다.
  - 발견된 필수 수정 사항이 없으므로 검토 승인을 권장합니다. (리뷰 결과 반영은 사람이 `docs/fixes/feature-topics-frontend-mvp-approved-fixes.md`에 승인 내역을 기재한 뒤 수행하도록 가이드합니다.)
