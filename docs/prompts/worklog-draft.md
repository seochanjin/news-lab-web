# 프론트엔드 작업 기록 초안 지시문

`AGENTS.md`, `docs/ARCHITECTURE.md`, task 파일, PR 초안, approved-fixes 문서, verification 문서, 사람이 제공한 manual verification 로그를 읽는다.

`docs/devlog/` 아래에 Notion에 옮기기 쉬운 작업 기록을 작성한다.

실제 검증은 `docs/verification/<safe-branch>.md`를 source of truth로 사용한다. 적용한 승인된 수정은 `docs/fixes/<safe-branch>-approved-fixes.md`를 source of truth로 사용한다.

## 필수 섹션

## 작업 목적

## 기존 문제

## 변경 내용

## 구현 상세

## 대안 검토

## 선택한 접근과 근거

## 트레이드오프

## 테스트 및 브라우저 확인

## 운영 반영

## README 업데이트 판단

## 확인 결과

## 이번 단계의 의미

## 포트폴리오용 요약

## 다음 단계 후보

## 규칙

- 관련 component, routing, API client, styling, loading/error/empty state, accessibility, responsive decision을 설명한다.
- Raw review 파일을 승인 또는 검증 근거로 사용하지 않는다.
- Test 또는 browser 결과를 만들어내지 않는다. 확인하지 않은 항목은 pending으로 남긴다.
- Backend, DB, K3s, Supabase, secret, production infrastructure를 변경하지 않았음을 기록한다.
- 사람이 로그를 제공하지 않으면 PR merge, deployment, production verification 완료를 주장하지 않는다.
- 검토한 대안, 선택 근거, tradeoff, README 영향을 기록한다.
