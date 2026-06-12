<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NewsLab Web 프론트엔드 agent 작업 규칙

## 저장소 범위

- 이 저장소는 NewsLab 프론트엔드만 다룬다.
- 작업 범위는 Next.js App Router 페이지와 레이아웃, React 컴포넌트, 프론트엔드 API client, 브라우저 상태 처리, 스타일링, 정적 자산, 프론트엔드 테스트, 프론트엔드 문서다.
- backend API code, DB 변경, Supabase SQL, K3s manifest, Docker 또는 production infrastructure, 배포 설정, secret은 작업 범위 밖이다.
- FastAPI, SQLAlchemy, migration, collector, extractor, CronJob, K3s 구현 지침은 이 프론트엔드 저장소에 추가하지 않는다.

## 변경 금지 경계

- `.env`, `.env.*`, credential, token, private key, deployment secret, 실제 환경 변수 값을 수정하지 않는다.
- 이 저장소에서 backend API 동작이나 코드를 수정하지 않는다. 프론트엔드 API 사용 변경은 작업 범위와 기존 API contract를 따라야 한다.
- 사람이 명시적으로 지시하지 않으면 `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- 사람이 관련 로그를 제공하지 않으면 deployment, rollout, production verification, PR merge 완료를 주장하지 않는다.

## 개발 규칙

- 작업에서 명시적으로 변경하지 않는 한 현재 Next.js App Router, TypeScript, Tailwind CSS 구조를 유지한다.
- Next.js 코드를 변경하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다.
- 현재 저장소 구조를 따르는 작고 검토 가능한 변경을 우선한다.
- 실제 API 연동은 작업 문서가 명시적으로 요청할 때만 구현한다.
- 문서화된 프론트엔드 API base URL 환경 변수명은 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 사용한다. `.env*` 파일을 수정하거나 실제 값을 tracked file에 기록하지 않는다.
- 사용자 대상 데이터 흐름을 변경할 때는 관련 loading, error, empty state를 함께 검토한다.
- UI 변경 시 responsive behavior, accessibility, browser/manual verification을 검토한다.
- 작업에서 요구하고 영향이 문서화된 경우가 아니면 dependency를 추가하지 않는다.

## Agent 작업 흐름

- Agent는 각 branch에 대응하는 workflow 문서를 생성하거나 갱신해야 한다.
  - `docs/tasks/<safe-branch>.md`
  - `docs/reviews/<safe-branch>-antigravity.md`
  - `docs/reviews/<safe-branch>-coderabbit.md`
  - `docs/fixes/<safe-branch>-approved-fixes.md`
  - `docs/verification/<safe-branch>.md`
  - `docs/pr/<safe-branch>.md`
  - `docs/devlog/<safe-branch>.md`
- `docs/tasks/<safe-branch>.md`를 작업 요구사항의 source of truth로 사용한다.
- 실제 실행한 command와 결과만 `docs/verification/<safe-branch>.md`에 기록한다.
- PR과 devlog 초안은 제안된 command나 review 주장 대신 verification 문서를 근거로 작성한다.
- Review 결과만으로 코드를 수정하지 않는다. `docs/fixes/<safe-branch>-approved-fixes.md`에서 사람이 명시적으로 승인한 수정만 적용한다.
- 확인하지 않은 browser, API, deployment, production 검증은 pending으로 남긴다.

## 허용되는 로컬 검증

- Agent는 로컬 read-only 확인 command와 `package.json`에 정의된 로컬 프론트엔드 검증을 실행할 수 있다.
- 작업 위험과 범위에 맞게 검증을 선택한다. 현재 사용 가능한 검증은 다음과 같다.

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

- 실제 수행하고 기록하지 않은 manual browser verification을 완료로 주장하지 않는다.
