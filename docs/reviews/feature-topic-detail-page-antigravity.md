# Antigravity 검토: Topic 상세 페이지 MVP

## 검토 요약

Topic 상세 페이지 MVP 구현 사항에 대한 검토를 완료했습니다. 
홈 화면의 토픽 카드 링크 연결부터 상세 라우트(`app/topics/[id]/page.tsx`), 로딩/에러/Not Found 상태 처리, 그리고 외부 원문 새 창 이동 등의 요구사항이 안정적으로 구현되었습니다. 
다만, 에러 경계(`error.tsx`)에서 `error` prop의 비구조화 할당 누락 및 콘솔 로깅 부재가 확인되어 이 부분에 대한 필수 수정이 필요합니다.
검증 기록은 실제 검증한 내역과 대기 중인 수동 검증 사항을 규칙에 따라 매우 정확하게 분리하여 작성했습니다.

## 요구사항 충족

- **상세 데이터 및 API 연동**: `lib/api/topics.ts`에 `TopicDetail` 및 `TopicArticle` 타입을 정의하고 `isTopicDetail` 등의 런타임 검증을 꼼꼼하게 설계하여 스펙에 정확히 부합합니다.
- **라우팅 및 링크**: 홈 화면의 `TopicCard`를 전체 `<Link>`로 감싸 상세로 이동 가능하도록 하였으며, 외부 원문 기사는 새 탭(`target="_blank"`, `rel="noopener noreferrer"`)으로 안전하게 연결됩니다.
- **상태 처리**: loading, error, not-found, success 상태가 정의된 한글 가이드 문구와 함께 route-level로 올바르게 구현되었습니다.

## 코드 품질과 유지보수성

- Next.js 15+ 명세에 맞추어 dynamic route `params`를 Promise 타입으로 처리하고 `await params`로 ID를 추출하여 미래 버전 호환성을 지켰습니다.
- ID 파싱 시 `parseTopicId`를 통해 안전한 정수(SafeInteger) 검증 및 0 이하의 예외 처리를 정밀하게 수행했습니다.
- 에러 경계(`app/topics/[id]/error.tsx`)에 Next.js v16.2.0의 공식 권장 사항인 `unstable_retry` API를 선제 적용했습니다. 다만, 아래 '발견된 문제'에 명시한 구조 분해 오류 수정이 요구됩니다.

## 프론트엔드 동작과 접근성

- 외부 원문 기사로 향하는 링크에 `aria-label` 속성을 추가하여 스크린 리더 사용성을 개선했습니다.
- `<time>` 컴포넌트에 표준 포맷의 `dateTime` 속성을 적용해 semantic markup 규칙을 준수했습니다.
- 기존의 Slate 및 Teal 톤앤매너와 어울리는 Tailwind CSS를 사용하여 디자인 일관성을 유지했습니다.

## 보안과 범위 검토

- `.env`, `.env.*` 등 민감 파일의 수정이나 실제 Key 노출이 전혀 없습니다.
- 프론트엔드 작업 범위 내에서만 수정이 이루어졌으며 백엔드, DB, 인프라 배포 등 외부 영역 변경은 존재하지 않습니다.

## 검증 기록 검토

- `docs/verification/feature-topic-detail-page.md`에 lint, typecheck, build, dev server HTML marker 검증 결과를 투명하게 잘 기재했습니다.
- 실제 기기/브라우저 테스트를 거치지 않은 화면 상호작용 및 반응형 레이아웃은 "수행하지 않음"과 "대기 중인 검증"으로 철저히 보류하여 규칙을 준수했습니다.

## 문서 검토

- `docs/ARCHITECTURE.md` 파일에 `/topics/[id]` dynamic route 추가와 상태 처리 내용이 정상적으로 갱신되어 아키텍처 문서의 일관성을 제공합니다.

## 발견된 문제

- **[Issue 1] `error.tsx` 내 `error` prop 비구조화 누락 및 로깅 부재**:
  - `app/topics/[id]/error.tsx`의 TypeScript 타입 시그니처에서는 `error` 객체를 정의하고 있으나, 매개변수 비구조화 할당(Destructuring) 부분에서 `unstable_retry`만 추출해 받아왔습니다.
  - 이로 인해 에러가 발생하더라도 클라이언트 브라우저나 디버깅 도구에 에러 정보(`error`)를 기록하지 못하고 있어 디버깅에 저해가 됩니다.

## PR 전 필수 수정

1. **`app/topics/[id]/error.tsx` 수정**:
   - `error` prop을 비구조화 할당으로 받아옵니다.
   - `useEffect` 훅을 추가하여 에러 발생 시 `console.error(error)`로 콘솔에 로깅하는 로직을 보완합니다.

## 선택 개선 사항

- 없음. (MVP 목표에 따라 현재 구성으로 충분합니다.)

## 제안 검증 Command

필수 수정 사항을 반영한 뒤 아래 검증 커맨드를 실행하여 린트 및 빌드 영향도가 없는지 확인합니다:

```bash
npm run lint
npm run typecheck
npm run build
```

## 최종 판단

- 제안된 **[PR 전 필수 수정]** 1건이 완료된 후, 승인 및 병합할 것을 권장합니다.
