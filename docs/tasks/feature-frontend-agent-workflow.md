# 작업: 프론트엔드 agent workflow 문서 한국어화

## 목표

프론트엔드 agent workflow 문서와 script가 생성하는 template/prompt를 한국어 중심으로 정리한다.

## 프론트엔드 작업 범위

- `AGENTS.md`, architecture/runbook, prompt 문서의 설명과 지시문을 한국어화한다.
- `scripts/new_agent_task.sh`가 생성하는 workflow 문서 template을 한국어화한다.
- `scripts/agent_next_step.sh`가 출력하는 handoff prompt를 한국어화한다.
- 현재 branch의 workflow 문서를 생성하고 실제 작업 및 검증 내용을 기록한다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- Application behavior, package dependency, Next.js 설정을 변경하지 않는다.
- Command 이름, 파일 경로, npm script 이름, branch 이름, API path, 환경 변수명을 번역하지 않는다.

## 예상 변경 파일

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/RUNBOOK.md`
- `docs/prompts/*.md`
- `scripts/new_agent_task.sh`
- `scripts/agent_next_step.sh`
- 현재 branch의 `docs/tasks`, `docs/pr`, `docs/devlog`, `docs/reviews`, `docs/fixes`, `docs/verification` 문서

## 컴포넌트 / Route / API client 영향

없음.

## 상태 처리

없음.

## 스타일 / 반응형 / 접근성

없음.

## 검증 Command

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

## 수동 브라우저 검증

필요하지 않음. Application behavior를 변경하지 않는다.

## 완료 조건

- 설명 문장, 문서 제목, 섹션 설명, agent 지시문이 한국어 중심으로 작성된다.
- Command 이름과 파일 경로 등 식별자는 유지된다.
- 프론트엔드 작업 범위와 금지 규칙이 유지된다.
- PR/devlog/verification이 실제 실행한 검증만 근거로 사용하도록 안내한다.
- 두 shell script가 syntax 검증을 통과한다.

## 참고 사항

- Next.js가 관리하는 `AGENTS.md` 상단 경고 블록은 원문을 유지한다.
