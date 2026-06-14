# 승인된 수정: Topic 상세 페이지 MVP

## 사람 승인 대기 중인 수정 후보

없음.

## 승인된 수정

### Fix 1: Topic 상세 페이지 헤더 재사용

#### 배경

현재 홈 화면과 Topic 상세 페이지의 상단 구조가 다르게 표시된다.

홈 화면은 다음 요소를 포함한다.

- `NewsLab` 로고
- 검색 입력창
- 검색 버튼
- 카테고리 navigation

반면 Topic 상세 페이지는 간단한 `NewsLab` 로고와 “주요 이슈 목록” 링크만 표시되어, 같은 서비스 안의 화면인데도 레이아웃 연속성이 약해 보인다.

#### 승인된 변경

Topic 상세 페이지에서도 기존 홈 화면의 상단 헤더/검색/navigation 구조를 재사용한다.

요구사항:

- 기존 홈 화면에서 사용하는 header/search/category navigation 스타일과 구조를 최대한 재사용한다.
- 새로운 header 디자인을 만들지 않는다.
- 전역 layout, theme, font, reset은 변경하지 않는다.
- 홈 화면의 header 동작을 깨뜨리지 않는다.
- 상세 페이지 상단에는 목록으로 돌아갈 수 있는 경로를 유지하거나, 기존 navigation 흐름 안에서 자연스럽게 접근 가능하게 한다.
- 검색 기능 자체를 새로 구현하거나 변경하지 않는다. 기존 검색 UI가 있으면 그대로 재사용한다.
- 상세 페이지 본문 디자인은 현재 구현된 톤을 유지한다.

#### 기대 결과

- 홈과 상세 페이지의 상단 UI가 일관되게 보인다.
- 사용자가 상세 페이지에 들어가도 같은 NewsLab 서비스 안에 있다는 느낌이 유지된다.
- Topic 상세 본문, 핵심 포인트, 관련 기사 영역은 기존 구현을 유지한다.

---

### Fix 2: `app/topics/[id]/error.tsx` error prop 로깅 보완

#### 배경

Antigravity review에서 `app/topics/[id]/error.tsx`의 error boundary 구현에 문제가 지적되었다.

현재 TypeScript 타입 시그니처에는 `error` 객체가 정의되어 있지만, 실제 매개변수 비구조화 할당에서는 `unstable_retry`만 추출하고 있어 error 정보를 사용하지 못한다.

이로 인해 상세 페이지 에러 발생 시 브라우저 console 또는 디버깅 도구에서 실제 error 정보를 확인하기 어렵다.

#### 승인된 변경

`app/topics/[id]/error.tsx`를 수정한다.

요구사항:

- `error` prop을 비구조화 할당으로 받는다.
- `useEffect`를 사용해 error 발생 시 `console.error(error)` 또는 식별 가능한 메시지와 함께 error를 로깅한다.
- 기존 error UI 문구와 retry 동작은 유지한다.
- secret, token, credential, API key, `.env` 값을 로그에 출력하지 않는다.
- error object 외의 민감 정보를 추가로 로깅하지 않는다.
- lint/typecheck/build가 통과해야 한다.

예상 구현 방향:

```tsx
"use client";

import { useEffect } from "react";

type TopicDetailErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function TopicDetailError({
  error,
  unstable_retry,
}: TopicDetailErrorProps) {
  useEffect(() => {
    console.error("Topic detail page error", error);
  }, [error]);

  // 기존 UI 유지
}
```

실제 prop 이름은 현재 Next.js 버전과 기존 구현에 맞춘다.  
현재 코드에서 `reset`이 아니라 `unstable_retry`를 사용 중이면 기존 패턴을 유지한다.

## 거절 또는 보류한 제안

### 보류: 상세 페이지 로딩 속도 개선

상세 페이지가 글 중심 화면인데도 로딩이 느리게 느껴지는 문제가 관찰되었다.

현재 추정 원인:

- 상세 페이지가 Server Component에서 `/topics/{id}` API 응답을 기다린 뒤 렌더링한다.
- API client가 `cache: "no-store"`를 사용하고 있어 매 요청마다 백엔드 API 왕복이 발생한다.
- production API 또는 외부 네트워크 응답 시간이 그대로 상세 페이지 렌더링 시간에 반영된다.
- loading UI는 존재하지만, 실제 데이터가 도착하기 전까지 상세 본문 렌더링이 지연된다.

이번 PR에서는 로딩 속도 개선을 적용하지 않는다.

보류 이유:

- 현재 41차의 목표는 Topic 상세 페이지 MVP 구현이다.
- 캐싱 정책 변경은 데이터 freshness와 연결된다.
- `revalidate`, route-level cache, client-side fetch, prefetch, API 응답 최적화 중 어떤 방식을 택할지 별도 설계가 필요하다.
- 39차 CronJob으로 topic은 하루 단위로 생성되므로 캐싱 여지가 있지만, 이번 PR에서 함께 변경하면 검증 범위가 커진다.

후속 작업 후보:

- `cache: "no-store"` 유지 여부 재검토
- topic detail API에 `revalidate` 적용 검토
- 홈에서 상세 링크 hover/prefetch 활용 여부 확인
- 상세 페이지 skeleton 개선
- 백엔드 `/topics/{id}` 응답 시간 측정
- API client timeout/error UX 개선

### 보류: 이미지 표시

대표 이미지 수집/표시는 이번 PR에서 보류한다.

보류 이유:

- 현재 DB/API에 안정적인 `image_url` 필드가 없다.
- Google 이미지 검색 결과를 사용하는 방식은 출처, 저작권, hotlink, 결과 변동성 문제가 있다.
- 대표 이미지는 RSS media field, Open Graph image, twitter image 등 수집 구조를 별도 설계한 뒤 적용하는 것이 안전하다.
- 현재 우선순위는 topic 상세 탐색 흐름 완성이다.

## 적용한 변경

- Fix 1 적용:
  - `components/layout/SiteHeader.tsx`에 기존 홈 header/search/category navigation 구조를 공용 컴포넌트로 추출했다.
  - `app/page.tsx`가 공용 `SiteHeader`를 사용하도록 변경해 기존 홈 헤더 구조를 유지했다.
  - `components/topics/TopicDetail.tsx`가 공용 `SiteHeader`를 사용하도록 변경했다.
  - `components/topics/TopicDetailState.tsx`가 공용 `SiteHeader`를 사용하도록 변경해 loading/error/not-found 상태에서도 동일한 상단 구조를 유지했다.
  - 로고와 category navigation으로 홈 목록 경로에 접근할 수 있도록 유지했다.
  - 홈에서만 `전체` category를 현재 항목으로 표시하고 상세 route에서는 잘못된 `aria-current`를 표시하지 않는다.
- Fix 2 적용:
  - `app/topics/[id]/error.tsx`에서 `error` prop을 비구조화 할당으로 받는다.
  - `useEffect`에서 식별 가능한 메시지와 `error` 객체만 `console.error`로 기록한다.
  - 기존 error 문구와 `unstable_retry` 재시도 동작을 유지했다.
- 보류 항목 미적용:
  - 상세 페이지 캐싱/로딩 속도 개선을 적용하지 않았다.
  - 이미지 표시를 적용하지 않았다.

## 필요한 검증

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- `bash -n scripts/new_agent_task.sh`: 통과.
- `bash -n scripts/agent_next_step.sh`: 통과.
- `git diff --check`: 통과.
- 로컬 HTML marker: 홈, 상세 success, 상세 not-found에서 공용 header/search/navigation marker 확인.
- 상세 success HTML marker: Topic 본문과 관련 기사 목록 유지 확인.
- Category navigation 현재 항목: 홈에서 `aria-current="page"` 1개, 상세에서 0개 확인.
- Error boundary 로깅: 코드 존재 확인. 실제 브라우저 console 검증은 수행하지 않음.
- Production deploy 및 production verification: 수행하지 않음.
