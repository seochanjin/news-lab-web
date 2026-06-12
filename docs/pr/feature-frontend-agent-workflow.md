# 프론트엔드 agent workflow 문서 한국어화

## 작업 내용

- 프론트엔드 agent workflow 문서와 prompt를 한국어 중심으로 정리했다.
- Workflow script가 생성하거나 출력하는 template과 handoff prompt를 한국어화했다.
- 현재 branch의 workflow 문서 7개를 생성했다.

## 주요 변경 사항

- 프론트엔드 scope, 금지 규칙, 검증 기록 흐름을 한국어로 명확히 표현했다.
- Command 이름, 파일 경로, 환경 변수명, 기술 식별자는 유지했다.
- `new_agent_task.sh`의 한국어 template 생성과 `agent_next_step.sh`의 한국어 prompt 출력을 유지했다.

## 프론트엔드/API 영향

Application behavior 및 API 변경 없음.

## 상태 및 UX 영향

없음.

## README 영향

없음. 이번 작업은 agent workflow 내부 문서와 script template 한글화에 한정된다.

## 테스트

- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- `scripts/new_agent_task.sh feature/frontend-agent-workflow "프론트엔드 agent workflow 문서 한국어화"`

## 확인 결과

- 최종 shell syntax 검증과 `git diff --check`가 통과했다.
- 현재 branch용 workflow 문서 7개가 한국어 template으로 생성되었다.
- 임시 디렉터리에서 한국어 template 7개 생성과 기존 파일 덮어쓰기 거부를 확인했다.
- 모든 `agent_next_step.sh` command의 정상 출력과 한국어 prompt marker를 확인했다.
- 최종 검증 결과는 `docs/verification/feature-frontend-agent-workflow.md`를 따른다.

## 비고

- Backend, DB, K3s, Supabase, secret, production infrastructure를 수정하지 않았다.
- Deployment, production verification, PR merge를 수행하거나 완료로 주장하지 않는다.
