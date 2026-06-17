# 프론트엔드 K3s 배포 및 newslab.ai.kr TLS 연결

## 작업 내용

NewsLab Web frontend Ingress manifest에 `newslab.ai.kr`, `www.newslab.ai.kr`용 cert-manager TLS 설정을 추가했다.

이번 PR은 frontend K3s/TLS 배포를 위한 manifest와 문서 준비, 그리고 read-only/정적 전제조건 확인까지를 포함한다. 실제 K3s `apply`, rollout, Certificate 발급, HTTPS 접근, production browser verification은 수행하지 않았으며 pending으로 남긴다.

## 주요 변경 사항

- `k8s/news-lab-web-ingress.yaml`
  - `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation 추가.
  - TLS hosts에 `newslab.ai.kr`, `www.newslab.ai.kr` 추가.
  - TLS `secretName: news-lab-web-tls` 추가.
  - `ingressClassName: traefik`과 HTTP route host는 유지.
- `docs/ARCHITECTURE.md`
  - frontend Ingress TLS가 cert-manager `letsencrypt-prod` ClusterIssuer와 `news-lab-web-tls` Secret을 사용하도록 선언된 점을 반영.
  - DNS, certificate 발급, production rollout verification은 수동 단계로 분리.
- `docs/RUNBOOK.md`
  - frontend K3s manifest의 TLS 기준을 보강.
  - TLS 적용 후 사람이 확인할 대표 command와 미수행 검증 주의사항 추가.
- `docs/verification/feature-frontend-k3s-tls-deploy.md`
  - 실제 실행한 정적/read-only 검증과 pending 운영 검증 기록.

## 프론트엔드/API 영향

- frontend page/component/route 기능은 변경하지 않았다.
- API client 로직은 변경하지 않았다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 `https://api.dev-scj.site`를 유지한다.
- `api.newslab.ai.kr` backend 전환은 이번 PR 범위가 아니다.
- 사용자-facing route 영향 없음:
  - `/`
  - `/topics`
  - `/topics/[id]`
  - `/search`
  - `/articles`
  - `/api/health`

## 상태 및 UX 영향

- loading/error/empty/success/search/pagination/topic/article rendering 상태 변경 없음.
- CSS, layout, typography, color, responsive breakpoint 변경 없음.
- semantic HTML, aria label, focus style, keyboard interaction 변경 없음.
- 이번 변경은 K3s Ingress TLS manifest와 문서 보강에 한정된다.

## README 영향

README는 수정하지 않았다.

이번 변경은 로컬 개발 안내가 아니라 frontend K3s/TLS 운영 절차에 해당하므로 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/verification/feature-frontend-k3s-tls-deploy.md`에 반영했다.

## 테스트

근거: `docs/verification/feature-frontend-k3s-tls-deploy.md`

- `git status --short --branch`: `feature/frontend-k3s-tls-deploy` branch 확인.
- `git log --oneline -5`: 최근 frontend Docker/K3s 관련 commit 확인.
- `rg -n "seocj/news-lab-web|newslab.ai.kr|www.newslab.ai.kr|api.dev-scj.site|api.newslab.ai.kr|newslab.site|news-lab-web-tls|letsencrypt-prod" k8s docs`:
  - Deployment image, frontend API base URL, Ingress host, TLS Secret, ClusterIssuer reference 확인.
  - `newslab.site`는 과거 문서 또는 기존 도메인 설명에 남아 있으나 현재 `k8s/news-lab-web-ingress.yaml` 운영 host로는 남아 있지 않음.
  - `api.newslab.ai.kr`은 후속 backend domain 후보 설명에만 남아 있고 현재 frontend API base URL로 적용되지 않음.
- Ruby YAML parser:
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
- Docker image 전제조건:
  - `docker buildx imagetools inspect seocj/news-lab-web:latest`: 권한 상승 후 `Platform: linux/arm64` 포함 확인.
  - `docker pull seocj/news-lab-web:latest`: 권한 상승 후 성공.
  - `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'`: 권한 상승 후 `arm64/linux`.
- DNS:
  - `dig +short newslab.ai.kr`: 권한 상승 후 `1xx.xx.xxx.xx`.
  - `dig +short www.newslab.ai.kr`: 권한 상승 후 `1xx.xx.xxx.xx`.
- cert-manager 전제조건:
  - `kubectl get clusterissuer`: `letsencrypt-prod   True   22d`.
  - `kubectl get clusterissuer letsencrypt-prod`: `letsencrypt-prod   True   22d`.
- `git diff --check`: 통과.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`:
  - 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않음.

Pending 검증:

- K3s server-side dry-run.
- 실제 K3s apply.
- Deployment rollout 및 Pod Running/Ready 확인.
- Service port-forward `/api/health` 확인.
- HTTP Host header 기반 Traefik Ingress routing 확인.
- Certificate/Order/Challenge/Secret 확인.
- `https://newslab.ai.kr`, `https://www.newslab.ai.kr` 확인.
- production browser, DevTools Console, hydration, responsive, keyboard/accessibility 확인.

## 확인 결과

- backend API code, backend K3s manifest, backend Docker image, DB schema, Supabase SQL은 변경하지 않았다.
- Dockerfile, Docker Hub workflow, frontend app/component/API client/styling은 변경하지 않았다.
- `.env`, `.env.*`, 실제 secret 값은 수정하지 않았다.
- `git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site`는 유지했다.
- approved-fixes 문서 기준으로 추가 승인 수정은 없었다.

## 비고

- 이 PR의 manifest 변경은 TLS 선언까지이며, Certificate 발급과 HTTPS 성공은 실제 K3s apply 이후 확인해야 한다.
- HTTP 경로가 먼저 정상이어야 cert-manager HTTP-01 challenge와 TLS 검증을 완료로 판단할 수 있다.
- `api.newslab.ai.kr` backend 연결과 frontend API base URL 전환은 후속 작업 범위다.
