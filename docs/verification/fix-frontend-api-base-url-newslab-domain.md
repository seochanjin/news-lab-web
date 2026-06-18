# 검증 기록: 프론트엔드 API base URL을 api.newslab.ai.kr로 전환

## 검증 범위

- GitHub Actions CI와 Docker build의 public API base URL
- frontend Deployment manifest의 API base URL
- Next.js production build 성공 여부와 build 산출물에 고정된 API domain
- 문서 및 diff 정합성

## 실행한 Command

- `rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' "api\.dev-scj\.site|api\.newslab\.ai\.kr|NEXT_PUBLIC_NEWSLAB_API_BASE_URL|API_BASE_URL|NEWSLAB_API" .`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run lint`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run typecheck`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run build`
- `rg -n "NEXT_PUBLIC_NEWSLAB_API_BASE_URL|api\.dev-scj\.site|api\.newslab\.ai\.kr" .github/workflows/ci.yml .github/workflows/docker-build.yml k8s/news-lab-web-deployment.yaml Dockerfile docs/ARCHITECTURE.md docs/RUNBOOK.md`
- `rg -l "api\.newslab\.ai\.kr" .next/server .next/standalone/.next/server | sort -u | wc -l`
- `if rg -n "api\.dev-scj\.site" .next/server .next/standalone/.next/server; then exit 1; else echo "production build output contains no api.dev-scj.site references"; fi`
- `git diff --check`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env" -- ':!package-lock.json' ':!docs/tasks/**' ':!docs/reviews/**' ':!docs/fixes/**' ':!docs/verification/**' ':!docs/pr/**' ':!docs/devlog/**'`

## 결과

- 참조 위치 조사:
  - 실제 운영 build 설정은 `.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`에 있었다.
  - frontend Deployment runtime env는 `k8s/news-lab-web-deployment.yaml`에 있었다.
  - API client는 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`과 endpoint path를 그대로 사용하므로 코드 변경이 필요하지 않았다.
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- 첫 번째 `npm run build`: sandbox에서 Google Fonts 연결이 차단되어 `Geist`, `Geist Mono` fetch 오류로 실패.
- 네트워크 접근을 허용해 동일 build command 재실행: 통과.
  - Next.js `16.2.7` production build가 compile, TypeScript, page data collection, static page generation을 완료했다.
  - `/`, `/articles`, `/search`, `/topics`, `/topics/[id]`, `/api/health` route build가 완료됐다.
- production build 산출물 확인:
  - `.next/server`와 `.next/standalone/.next/server`에서 `api.newslab.ai.kr`를 포함한 파일 10개를 확인했다.
  - 같은 production 산출물 범위에서 `api.dev-scj.site` 참조가 없음을 확인했다.
- active 설정 확인:
  - CI build env: `https://api.newslab.ai.kr`
  - Docker build arg source: `https://api.newslab.ai.kr`
  - frontend Deployment env: `https://api.newslab.ai.kr`
  - 기존 domain은 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`의 rollback/병행 운영 및 수동 확인 문맥에만 남겼다.
- `git diff --check`: 통과.
- credential pattern scan:
  - 실제 credential 값은 발견되지 않았다.
  - `.env` 정책 문구, GitHub Actions secret reference, Kubernetes TLS Secret 이름 등 예상된 선언만 확인했다.

## 수동 브라우저 검증

- 수행하지 않음.
- production rollout 이후 `/`, `/topics`, `/articles` 렌더링과 DevTools Network 확인이 필요하다.

## 대기 중인 검증

- Docker image build/push
- `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server -f k8s/news-lab-web-deployment.yaml`
- production Deployment apply 및 rollout
- production frontend HTTPS와 `/api/health` 확인
- browser console 확인
- DevTools Network에서 `api.newslab.ai.kr` 호출 있음 확인
- DevTools Network에서 `api.dev-scj.site` 호출 없음 확인

## 근거 메모

- Next.js `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`를 확인했다.
- 해당 가이드에 따라 `NEXT_PUBLIC_*` 값은 `next build` 시 bundle에 고정되므로, 이번 전환은 Docker image rebuild와 rollout이 필요하다.
- `.env`, `.env.*`, API client, component, route, style, backend code는 수정하지 않았다.
- git push, git merge, Docker push, kubectl apply, rollout, production command는 실행하지 않았다.
