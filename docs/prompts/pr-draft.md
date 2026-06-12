# 프론트엔드 PR 초안 지시문

`AGENTS.md`, task 파일, `docs/fixes/<safe-branch>-approved-fixes.md`, `docs/verification/<safe-branch>.md`, current git diff를 읽는다.

`docs/pr/` 아래에 PR 초안을 작성한다.

검증과 manual verification 결과는 verification 문서를 source of truth로 사용한다. 적용한 review fix는 approved-fixes 문서를 source of truth로 사용한다.

## 필수 섹션

## 작업 내용

## 주요 변경 사항

## 프론트엔드/API 영향

## 상태 및 UX 영향

## README 영향

## 테스트

## 확인 결과

## 비고

## 규칙

- 실제 변경이 있는 경우에만 component, route, API client, styling, state 변경을 설명한다.
- Backend, DB, K3s, Supabase, secret, production infrastructure를 변경하지 않았음을 기록한다.
- Verification 문서에 실제 실행으로 기록된 검증만 포함한다.
- 제안되었거나 수행하지 않은 command는 pending 또는 비고로 기록한다.
- Review 파일을 검증 통과의 근거로 사용하지 않는다.
- 실제 근거 없이 PR merge, deployment, production verification, browser verification 완료를 주장하지 않는다.
- README 변경 필요 여부와 근거를 기록한다.
