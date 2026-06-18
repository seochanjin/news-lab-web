# 프론트엔드 API base URL을 api.newslab.ai.kr로 전환

## 작업 내용

- NewsLab frontend의 운영 backend API target을 기존 `https://api.dev-scj.site`에서 `https://api.newslab.ai.kr`로 전환한다.
- Next.js build-time public 환경 변수와 frontend Deployment runtime 환경 변수에 동일한 신규 domain을 사용한다.
- 기존 backend domain은 제거하지 않고 rollback 및 안정화 기간의 병행 운영 대상으로 유지한다.

## 주요 변경 사항

- `.github/workflows/ci.yml`
  - CI build 환경의 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 `https://api.newslab.ai.kr`로 변경했다.
- `.github/workflows/docker-build.yml`
  - Docker image build에 전달하는 public API base URL을 신규 domain으로 변경했다.
- `k8s/news-lab-web-deployment.yaml`
  - frontend container의 동일 환경 변수를 신규 domain으로 맞췄다.
- `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`
  - `NEXT_PUBLIC_*` 값이 `next build` 시 bundle에 고정되는 동작을 문서화했다.
  - API domain 전환에는 image rebuild와 rollout이 필요함을 기록했다.
  - rollout 이후 HTTPS, health endpoint, 주요 route와 browser Network를 확인하는 수동 절차를 추가했다.
- 승인된 review fix는 없다.

## 프론트엔드/API 영향

- API client 구현은 변경하지 않고 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 입력값만 전환했다.
- `/topics/home`, `/topics`, `/topics/{id}`, `/articles` endpoint path와 response contract는 변경하지 않았다.
- component, App Router route, page layout, Server/Client Component 경계는 변경하지 않았다.
- backend API code, DB, Supabase SQL, backend Ingress/TLS는 변경하지 않았다.
- `.env`, `.env.*`, credential, secret은 변경하지 않았다.
- Dockerfile과 image tag 정책은 변경하지 않았다.

## 상태 및 UX 영향

- loading, error, empty state와 pagination 로직은 변경하지 않았다.
- UI, styling, responsive behavior, accessibility와 keyboard behavior는 변경하지 않았다.
- 신규 API domain 접근 실패 시 기존 error UI가 사용되며, 해당 production 동작은 이번 로컬 검증에서 확인하지 않았다.

## README 영향

- README는 환경 변수명과 로컬 placeholder 사용법을 설명하며 운영 domain 값을 고정해 기록하지 않는다.
- 운영 domain 관계와 build/rollout 절차는 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`의 책임이므로 README는 수정하지 않았다.

## 테스트

- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run lint`
  - 통과.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run typecheck`
  - 통과.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run build`
  - 첫 실행은 sandbox의 Google Fonts 네트워크 차단으로 실패했다.
  - 네트워크 접근을 허용해 동일 command를 재실행했고 Next.js `16.2.7` production build가 통과했다.
- production build 산출물 검사
  - `.next/server`와 `.next/standalone/.next/server`에서 `api.newslab.ai.kr`를 포함한 파일 10개를 확인했다.
  - 동일 범위에서 `api.dev-scj.site` 참조가 없음을 확인했다.
- active build/deployment 설정 검색
  - CI, Docker build, frontend Deployment 설정이 모두 `https://api.newslab.ai.kr`를 사용함을 확인했다.
- `git diff --check`
  - 통과.
- credential pattern scan
  - 실제 credential 값은 발견되지 않았다.
  - 정책 문구, GitHub Actions secret reference, Kubernetes TLS Secret 이름 등 예상된 선언만 확인했다.

## 확인 결과

- repository의 active CI, Docker build, frontend Deployment 설정은 신규 API domain을 사용한다.
- production build 산출물에 신규 domain이 고정되고 기존 domain이 포함되지 않은 것을 확인했다.
- 기존 API endpoint path, response schema, UI와 상태 처리에는 변경이 없다.
- Docker image build/push, K3s apply, rollout과 production verification은 수행하지 않았다.
- manual browser verification은 수행하지 않았다.

## 비고

- `NEXT_PUBLIC_*` 값은 build-time에 고정되므로 운영 반영에는 신규 Docker image build/push와 frontend Deployment rollout이 필요하다.
- 다음 항목은 pending이다.
  - Docker image build/push
  - frontend Deployment manifest의 server-side dry-run
  - production Deployment apply 및 rollout
  - `https://newslab.ai.kr`, `https://www.newslab.ai.kr`와 각 `/api/health` 확인
  - `/`, `/topics`, `/articles` production 렌더링과 browser console 확인
  - DevTools Network에서 `api.newslab.ai.kr` 호출 있음 확인
  - DevTools Network에서 `api.dev-scj.site` 호출 없음 확인
- git push, git merge, production-impacting command는 실행하지 않았다.
