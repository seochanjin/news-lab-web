# NewsLab Web Runbook

이 runbook은 로컬 프론트엔드 개발과 파일 기반 agent workflow를 다룬다. Backend, DB, K3s, Supabase, production operation은 다루지 않는다.

## 로컬 설정

`.node-version`에 선언된 Node.js 버전과 npm을 사용한다.

```bash
npm ci
```

Agent는 `.env`, `.env.*` 파일을 수정하지 않는다. 사람이 로컬 API 접근을 설정할 때 사용하는 문서화된 환경 변수명은 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`이다.

## 로컬 개발

Next.js development server를 실행한다.

```bash
npm run dev
```

기본 로컬 URL은 `http://localhost:3000`이다.

Manual browser 확인은 작업 범위에 맞게 선택한다. 일반적인 확인 항목은 다음과 같다.

- 변경한 route가 runtime error 없이 렌더링된다.
- component, routing, styling 변경이 관련 viewport width에서 정상 동작한다.
- keyboard focus, label, link, interactive control을 사용할 수 있다.
- 변경한 loading, error, empty state에 접근할 수 있고 내용을 읽을 수 있다.
- API 기반 UI가 backend 동작을 수정하지 않고 예상한 프론트엔드 contract를 사용한다.

실제로 수행한 manual check만 완료로 기록한다. Production verification 또는 deployment 완료를 주장하지 않는다.

## 프론트엔드 검증

사용 가능한 package script:

```bash
npm run lint
npm run typecheck
npm run build
```

추가 저장소 검증:

```bash
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

작업 범위와 비용에 맞는 검증을 선택한다. 실제 실행한 command와 결과만 해당 branch의 verification 문서에 기록한다.

## Agent 작업 흐름

Branch용 workflow 문서를 생성한다.

```bash
scripts/new_agent_task.sh feature/<task-name> "<task title>"
```

이 script는 파일만 생성한다. Branch 생성 또는 전환, remote pull, agent 실행, 검증 실행은 하지 않는다.

생성하는 파일:

- `docs/tasks/<safe-branch>.md`
- `docs/pr/<safe-branch>.md`
- `docs/devlog/<safe-branch>.md`
- `docs/reviews/<safe-branch>-antigravity.md`
- `docs/reviews/<safe-branch>-coderabbit.md`
- `docs/fixes/<safe-branch>-approved-fixes.md`
- `docs/verification/<safe-branch>.md`

Branch 이름은 다음과 같이 안전한 파일명으로 변환한다.

```text
feature/article-filters -> feature-article-filters
```

기존 workflow 파일은 덮어쓰지 않는다.

현재 branch의 workflow 파일 경로를 출력한다.

```bash
scripts/agent_next_step.sh files
```

재사용 가능한 handoff prompt를 출력한다.

```bash
scripts/agent_next_step.sh codex-implement
scripts/agent_next_step.sh antigravity-review
scripts/agent_next_step.sh antigravity-review-write
scripts/agent_next_step.sh fixes-draft
scripts/agent_next_step.sh codex-apply-fixes
scripts/agent_next_step.sh pr-draft
scripts/agent_next_step.sh devlog-draft
```

`agent_next_step.sh`는 context와 prompt만 출력한다. Codex, Antigravity, CodeRabbit, GitHub, test, browser automation, production command를 실행하지 않는다.

## Workflow 문서 역할

- `docs/tasks/`: 목표, 프론트엔드 범위, 제외 항목, 예상 파일, 검증, acceptance criteria를 정의한다.
- `docs/reviews/`: finding을 기록한다. Finding만으로 코드 수정이 승인되지 않는다.
- `docs/fixes/`: candidate, approved, rejected, deferred, applied fix를 구분한다.
- `docs/verification/`: 실제 test와 manual verification 결과의 source of truth다.
- `docs/pr/`: task, diff, approved fix, verification 근거로 PR 초안을 작성한다.
- `docs/devlog/`: engineering decision과 실제 verification 근거를 기록한다.

PR과 devlog 초안은 제안된 검증을 완료된 결과로 바꾸어 쓰면 안 된다. 사람이 로그를 제공하지 않으면 deployment, production verification, PR merge는 pending으로 남긴다.

## 프론트엔드 작업 점검 목록

각 작업에서 관련 항목만 검토한다.

- Component 또는 page 동작
- App Router route와 layout 영향
- Server Component와 Client Component 경계
- API client 또는 response mapping 변경
- Loading, error, empty state
- Styling과 responsive behavior
- Accessibility와 keyboard behavior
- Browser/manual verification
- README와 architecture 문서 영향
- Backend, DB, K3s, Supabase, secret, production infrastructure 미변경
