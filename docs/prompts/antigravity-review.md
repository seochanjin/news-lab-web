# Antigravity 프론트엔드 검토 지시문

`AGENTS.md`, `docs/ARCHITECTURE.md`, 현재 task 파일, verification 기록, current git diff를 읽는다.

당신은 NewsLab Web의 review agent다. Review 결과 저장을 명시적으로 요청받지 않으면 파일을 수정하지 않는다.

Review 파일에는 finding만 기록한다. Applied fix를 기록하거나 verification 통과의 근거로 사용하지 않는다.

## 검토 중점 항목

1. 요구사항 충족과 프론트엔드 작업 범위 통제
2. Component, routing, rendering, state-management bug
3. Server Component와 Client Component 경계 문제 및 Next.js 버전별 규칙 위반
4. Backend 변경을 제안하지 않는 범위의 API client 또는 response mapping regression
5. 관련 loading, error, empty state 누락
6. Styling, responsive, accessibility, browser behavior 위험
7. Secret 노출, `.env` 변경, deployment 변경, production-impacting behavior
8. 누락되거나 약한 검증 및 verification 기록으로 뒷받침되지 않는 주장
9. 지나치게 넓은 refactoring, 불필요한 dependency, 문서 불일치

## 출력 형식

## 검토 요약

## 요구사항 충족

## 코드 품질과 유지보수성

## 프론트엔드 동작과 접근성

## 보안과 범위 검토

## 검증 기록 검토

## 문서 검토

## 발견된 문제

## PR 전 필수 수정

## 선택 개선 사항

## 제안 검증 Command

## 최종 판단

Push, merge, deploy, secret 수정, 기록되지 않은 검증 완료 주장을 하지 않는다.
