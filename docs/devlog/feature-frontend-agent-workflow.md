# 프론트엔드 agent workflow 문서 한국어화

## 작업 목적

프론트엔드 agent workflow를 한국어 중심으로 정리해 향후 작업 범위, 검증 기록, handoff 기준을 일관되게 이해할 수 있도록 한다.

## 기존 문제

- Workflow 문서와 script 출력 prompt의 설명 및 섹션 제목 대부분이 영어였다.
- 기존 branch에는 이번 workflow 변경을 설명하는 branch별 문서가 없었다.

## 변경 내용

- `AGENTS.md`, architecture/runbook, prompt 문서를 한국어화했다.
- Workflow script의 안내, 오류 메시지, 생성 template, 출력 prompt를 한국어화했다.
- 현재 branch용 task, review, fixes, verification, PR, devlog 문서를 생성했다.

## 구현 상세

- Command 이름, 파일 경로, 기술 식별자는 번역하지 않았다.
- `.env*`, secret, backend/K3s/DB, production command 금지 규칙을 유지했다.
- Verification 문서를 실제 실행 결과의 source of truth로 사용하는 흐름을 유지했다.

## 대안 검토

- 모든 영어 용어를 번역하는 방식은 command와 기술 식별자의 정확성을 떨어뜨릴 수 있어 선택하지 않았다.
- 기존 문서를 그대로 두고 한국어 설명을 병기하는 방식은 문서가 장황해지므로 선택하지 않았다.

## 선택한 접근과 근거

설명과 agent 지시문은 한국어로 전환하고 command, 경로, API path, 환경 변수명, framework 용어는 필요한 범위에서 유지했다. 실행 정확성과 한국어 가독성을 함께 유지하기 위한 선택이다.

## 트레이드오프

- `source of truth`, `pending`, `workflow` 같은 일부 익숙한 workflow 용어는 문맥 명확성을 위해 유지했다.
- Next.js 자동 관리 경고 블록은 저장소 지침 보존을 위해 영어 원문을 유지했다.

## 테스트 및 브라우저 확인

- 최종 `bash -n scripts/new_agent_task.sh`: 통과
- 최종 `bash -n scripts/agent_next_step.sh`: 통과
- 최종 `git diff --check`: 통과
- 모든 `agent_next_step.sh` command 출력과 한국어 prompt marker 확인: 통과
- 임시 디렉터리 한국어 template 7개 생성 및 덮어쓰기 거부 확인: 통과
- Manual browser verification: 필요하지 않음
- 최종 결과는 verification 문서를 따른다.

## 운영 반영

없음.

## README 업데이트 판단

필요하지 않음. 사용자 기능이나 로컬 실행 방식이 아니라 내부 agent workflow 문구를 정리한 작업이다.

## 확인 결과

- 핵심 workflow 문서와 prompt가 한국어 중심으로 정리되었다.
- 현재 branch용 workflow 문서가 생성되었다.
- Shell syntax, helper prompt 출력, template 생성, whitespace 검증이 통과했다.

## 이번 단계의 의미

향후 프론트엔드 task에서 agent와 사람이 동일한 한국어 workflow 기준으로 범위와 검증 근거를 관리할 수 있다.

## 포트폴리오용 요약

프론트엔드 저장소의 multi-agent workflow 문서와 shell template을 한국어 중심으로 표준화하고, 실제 검증 기록을 근거로 PR/devlog를 작성하는 흐름을 유지했다.

## 다음 단계 후보

- 실제 후속 프론트엔드 task에서 한국어 template의 사용성을 확인한다.
