# Antigravity 검토: 홈 Topics API 전환 및 로딩 확인

## 검토 요약

- **목적**: 홈(`/`)의 주요 이슈 조회 대상을 기존 범용 `/topics` API에서 홈 전용 경량 API인 `/topics/home`으로 전환하는 작업에 대한 검토를 진행함.
- **결과**: 작업 범위가 프론트엔드로 정확히 제한되었고, 기존 아카이브/상세/검색/기사 라우트들의 동작을 깨뜨리지 않고 성공적으로 홈 API 소스를 격리 전환함. 런타임 타입 검증 및 컴포넌트 타입 결합도 완화 등이 훌륭하게 설계됨.

## 요구사항 충족

- **홈 API 전환**: `components/topics/TopicList.tsx`에서 기존 `getTopics(1, 10)` 호출을 제거하고 `getHomeTopics()`를 사용하도록 전환 완료.
- **기존 라우트 영향 격리**: 아카이브 `/topics`는 `getTopics`를, 상세 `/topics/[id]`는 `getTopicDetail`을 계속 사용하여 영향 없음. 통합 검색 `/search` 및 원문 기사 `/articles` 관련 데이터 흐름도 이전 상태를 보존함.
- **메타데이터 비노출**: `provider`, `model`, `confidence`, `status`, `articles` 등의 내부 디버깅성 메타데이터가 홈 UI에 노출되지 않도록, 홈 API가 반환하는 정제된 필드들만 바인딩함.

## 코드 품질과 유지보수성

- **중복 코드 제거**: `lib/api/topics.ts`에서 API Base URL 검증 로직인 `getTopicsApiBaseUrl()`을 공통 헬퍼로 추출하여 `getHomeTopics`, `getTopics`, `getTopicDetail`이 안전하게 공유하도록 함.
- **런타임 검증 강화**: `HomeTopic`, `HomeTopicsResponse` 타입을 신규 선언하고, `isHomeTopic` 및 `isHomeTopicsResponse` 타입 가드 함수를 적용하여 외부 API 결과에 대해 런타임 타입 검증을 수행하고 불일치 시 명확하게 Error를 throw하도록 처리함.
- **컴포넌트 디커플링 (Decoupling)**: `TopicCard` 컴포넌트가 특정 `Topic` 타입에 의존하지 않고 필요한 최소 필드만 담은 `TopicCardData` 타입을 props로 받도록 변경하여, 기존 `Topic` 타입과 신규 `HomeTopic` 타입 모두가 안전하게 호환되도록 설계의 유연성을 확보함.

## 프론트엔드 동작과 접근성

- **날짜 null 예외 방어**: 홈 API 응답에서 `topic_date`가 `null`일 수 있는 스펙에 대응하여, `formatTopicDate` 함수에서 `"날짜 미정"` 폴백을 제공하고 `<time>` 태그의 `dateTime` 속성에 `undefined`를 제공해 렌더링 오작동을 차단함.
- **상태 전이(State Transition)**: `TopicList` 컴포넌트에서 데이터 로딩(`TopicListLoading`), API 조회 에러(`result.status === "error"`), 빈 결과(`response.items.length === 0`), 정상 렌더링에 해당하는 4가지 UI 상태 전이를 일관되게 제공하여 접근성 및 정보 전달력을 보존함.

## 보안과 범위 검토

- **시크릿 노출 차단**: 기밀 정보, API key, `.env`나 `.env.*` 등의 설정 파일은 수정되지 않았고 tracked 파일에 기록되지 않았음을 확인함.
- **작업 범위 제한**: 프론트엔드 소스코드 및 문서 파일만 정교하게 변경되었으며, 백엔드 레포 변경 제안이나 K3s, Docker 리소스 수정 등 범위 이외의 작업은 완전히 배제됨.

## 검증 기록 검토

- **로컬 검증 완료**: `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`, `git grep` 등의 로컬 검증 및 secret pattern scan이 정상 동작하고 통과한 기록을 검증 문서 `docs/verification/feature-home-topics-api-switch.md`에 성실하게 기록함.
- **수동 브라우저 테스트 미수행 명시**: 실제 UI 렌더링, 콘솔 에러, 기기별 뷰포트 반응형 레이아웃 확인 등은 검증 기록상 "미수행(대기 중)"으로 투명하게 남겨두어 완료를 속단하지 않는 흐름을 보임.

## 문서 검토

- **아키텍처 문서 동기화**: `docs/ARCHITECTURE.md`에서 프론트엔드가 사용하는 API 사용 방식 및 각 API가 각 라우트(`/`, `/topics`, `/topics/[id]`)에서 매핑되는 설명을 수정 사항에 맞춰 현행화하여 문서 일관성을 유지함.

## 발견된 문제

- **없음**: 코드 구현, 예외 처리, 타입 정의, 아키텍처 문서 동기화 과정에서 유의미한 결함이나 설계 오류가 식별되지 않음.

## PR 전 필수 수정

- **없음**: PR을 진행하기 위해 강제되는 코드나 문서상의 필수 수정 조치는 없음.

## 선택 개선 사항

- **스켈레톤 UI 도입 검토**: 현재 로딩 상태인 `TopicListLoading` 컴포넌트가 텍스트 기반의 로딩 메시지만을 표시하고 있는데, 홈 화면의 시각적 완성도(UX)를 높이기 위해 주요 토픽 카드의 형태를 모방한 스켈레톤(Skeleton) 스타일의 컴포넌트 도입을 검토할 수 있음.

## 제안 검증 Command

- **로컬 빌드 및 타입 검사**:
  ```bash
  npm run lint
  npm run typecheck
  npm run build
  ```
- **로컬 Dev Server 기반 curl 확인**:
  ```bash
  NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run dev
  # 다른 터미널에서
  curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
  ```

## 최종 판단

- 본 변경 건은 요구사항을 정확히 충족하며 프론트엔드 작업 범위 내에서 최소 변경으로 안전하게 구현되었습니다. 검증 문서에 기록된 로컬 검증 역시 모두 통과하였고, 브라우저 수동 검증의 미수행 내역이 투명하게 명시되어 있어 검토 기준을 충족합니다. PR 진행 및 이후 사람(승인자)의 수동 브라우저 검증 후 배포로 전환할 것을 승인 제안합니다.
