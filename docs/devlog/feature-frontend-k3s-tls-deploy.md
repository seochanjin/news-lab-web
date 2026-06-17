# 프론트엔드 K3s 배포 및 newslab.ai.kr TLS 연결

## 작업 목적

NewsLab Web frontend를 `newslab.ai.kr`, `www.newslab.ai.kr` 도메인에서 HTTPS로 제공하기 위한 K3s Ingress TLS manifest와 운영 검증 문서를 준비했다.

이번 단계는 frontend Ingress에 cert-manager TLS 선언을 추가하고, 실제 K3s 적용 전에 필요한 read-only/정적 전제조건을 확인하는 작업이다. 실제 `kubectl apply`, rollout, Certificate 발급, HTTPS 접근, production browser verification은 수행하지 않았다.

## 기존 문제

이전 단계에서 frontend Docker/K3s 배포 기반과 ARM64 image 발행 조건은 준비했지만, frontend Ingress에는 아직 cert-manager TLS 설정이 없었다.

확정 도메인은 다음과 같다.

```text
newslab.ai.kr
www.newslab.ai.kr
```

HTTPS 연결을 위해서는 Ingress에 cert-manager ClusterIssuer annotation과 TLS host/secret 선언이 필요하다. 또한 TLS 발급은 DNS, HTTP Ingress routing, cert-manager Certificate/Order/Challenge 상태가 모두 맞아야 하므로, manifest 변경과 실제 운영 검증을 분리해서 기록해야 했다.

## 변경 내용

- `k8s/news-lab-web-ingress.yaml`
  - `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation 추가.
  - TLS hosts에 `newslab.ai.kr`, `www.newslab.ai.kr` 추가.
  - TLS `secretName: news-lab-web-tls` 추가.
  - `ingressClassName: traefik`과 HTTP route host는 유지.
- `docs/ARCHITECTURE.md`
  - frontend Ingress TLS가 `letsencrypt-prod` ClusterIssuer와 `news-lab-web-tls` Secret을 사용하도록 선언된 점을 반영.
  - DNS, certificate 발급, production rollout verification을 수동 단계로 분리.
- `docs/RUNBOOK.md`
  - frontend K3s manifest의 TLS 기준과 TLS 적용 후 확인할 대표 command를 보강.
  - 실행 전에는 완료로 기록하지 않는다는 검증 원칙을 반영.
- `docs/verification/feature-frontend-k3s-tls-deploy.md`
  - 실제 실행한 read-only/정적 검증과 pending 운영 검증을 기록.
- `docs/pr/feature-frontend-k3s-tls-deploy.md`
  - verification 기록을 근거로 PR 초안을 작성.

## 구현 상세

Ingress metadata에 cert-manager ClusterIssuer annotation을 추가했다.

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
```

Ingress spec에는 TLS hosts와 Secret 이름을 선언했다.

```yaml
tls:
  - hosts:
      - newslab.ai.kr
      - www.newslab.ai.kr
    secretName: news-lab-web-tls
```

HTTP rules는 기존 host와 service routing을 유지했다.

```yaml
rules:
  - host: newslab.ai.kr
  - host: www.newslab.ai.kr
```

Deployment는 `seocj/news-lab-web:latest`를 유지하고, frontend API base URL도 기존 `https://api.dev-scj.site`를 유지했다. `/api/health` readiness/liveness probe도 그대로 유지했다.

## 대안 검토

- TLS를 이번 PR에서 선언하지 않고 수동 apply 직전에만 수정하는 방법도 가능했다. 하지만 task의 source of truth가 Ingress TLS 설정 추가를 포함하므로 manifest에 선언해 review 가능한 상태로 두는 방식을 선택했다.
- backend API base URL을 `api.newslab.ai.kr`로 바꾸는 방법은 이번 범위에서 제외했다. backend domain 전환은 별도 작업이며, frontend는 계속 `https://api.dev-scj.site`를 사용한다.
- K3s apply와 rollout까지 agent가 실행하는 방법은 공통 규칙과 task의 금지 명령에 맞지 않는다. 운영 반영은 사람이 직접 실행하고, agent는 read-only/정적 검증과 pending 목록을 남기는 방식으로 제한했다.
- Certificate/Order/Challenge 상태를 지금 확인하는 것은 Ingress 적용 전에는 의미가 제한적이므로, 실제 apply 이후 검증 항목으로 남겼다.

## 선택한 접근과 근거

`docs/tasks/feature-frontend-k3s-tls-deploy.md`는 Ingress가 다음 기준을 만족해야 한다고 명시한다.

```text
ingressClassName: traefik
host: newslab.ai.kr
host: www.newslab.ai.kr
cert-manager cluster issuer: letsencrypt-prod
TLS secretName: news-lab-web-tls
```

따라서 Ingress manifest에 cert-manager annotation과 TLS block만 추가했다. frontend app code, Dockerfile, Docker Hub workflow, backend API 설정은 task의 변경 금지 항목이므로 건드리지 않았다.

## 트레이드오프

- manifest에는 TLS가 선언됐지만, 실제 Certificate 발급 여부는 K3s apply 이후에만 확인할 수 있다.
- `letsencrypt-prod` ClusterIssuer와 DNS A record는 read-only로 확인했지만, HTTP-01 challenge 성공은 Ingress routing과 외부 접근성까지 맞아야 한다.
- `kubectl apply`와 rollout을 실행하지 않았기 때문에, 이번 단계에서 production availability를 주장할 수 없다.
- frontend API base URL을 그대로 유지하므로 frontend 도메인은 바뀌어도 backend API는 계속 `api.dev-scj.site`를 사용한다.

## 테스트 및 브라우저 확인

근거는 `docs/verification/feature-frontend-k3s-tls-deploy.md`다.

- `git status --short --branch`: `feature/frontend-k3s-tls-deploy` branch 확인.
- `git log --oneline -5`: 최근 frontend Docker/K3s 관련 commit 확인.
- `rg -n "seocj/news-lab-web|newslab.ai.kr|www.newslab.ai.kr|api.dev-scj.site|api.newslab.ai.kr|newslab.site|news-lab-web-tls|letsencrypt-prod" k8s docs`:
  - Deployment image, frontend API base URL, Ingress host, TLS Secret, ClusterIssuer reference 확인.
  - `newslab.site`는 과거 문서 또는 기존 도메인 설명에 남아 있으나 현재 운영 Ingress host로는 남아 있지 않다.
  - `api.newslab.ai.kr`은 후속 backend domain 후보 설명에만 남아 있고 현재 frontend API base URL로 적용되지 않았다.
- Ruby YAML parser:
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
- Docker image 전제조건:
  - `docker buildx imagetools inspect seocj/news-lab-web:latest`: 권한 상승 후 `Platform: linux/arm64` 포함 확인.
  - `docker pull seocj/news-lab-web:latest`: 권한 상승 후 성공.
  - `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'`: 권한 상승 후 `arm64/linux`.
- DNS:
  - `dig +short newslab.ai.kr`: 권한 상승 후 `152.67.211.33`.
  - `dig +short www.newslab.ai.kr`: 권한 상승 후 `152.67.211.33`.
- cert-manager 전제조건:
  - `kubectl get clusterissuer`: `letsencrypt-prod   True   22d`.
  - `kubectl get clusterissuer letsencrypt-prod`: `letsencrypt-prod   True   22d`.
- `git diff --check`: 통과.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`:
  - 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- 수동 브라우저 UI, DevTools Console, hydration, responsive, keyboard, accessibility 확인은 미수행이다.

## 운영 반영

운영 반영은 수행하지 않았다.

`git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.

다음 항목은 pending이다.

- K3s server-side dry-run
- 실제 K3s apply
- Deployment rollout 및 Pod Running/Ready 확인
- Service port-forward `/api/health` 확인
- HTTP Host header 기반 Traefik Ingress routing 확인
- Certificate/Order/Challenge/Secret 확인
- `https://newslab.ai.kr`, `https://www.newslab.ai.kr` 확인
- production browser 확인

## README 업데이트 판단

README는 수정하지 않았다.

이번 변경은 로컬 개발 안내가 아니라 K3s Ingress/TLS 운영 절차와 manifest 구조에 관한 변경이다. 따라서 architecture, runbook, verification 문서에 반영하는 편이 더 적절하다고 판단했다.

## 확인 결과

- frontend Ingress manifest에 cert-manager TLS 선언이 추가됐다.
- `newslab.ai.kr`, `www.newslab.ai.kr` DNS A record는 `152.67.211.33`으로 확인됐다.
- Docker Hub `seocj/news-lab-web:latest`는 `linux/arm64` manifest를 포함하고, local inspect 결과 `arm64/linux`로 확인됐다.
- `letsencrypt-prod` ClusterIssuer는 read-only 조회에서 `Ready=True`로 확인됐다.
- frontend route/page/component/API client는 변경하지 않았다.
- loading/error/empty/success/search/pagination/topic/article rendering 상태는 변경하지 않았다.
- styling, responsive, accessibility, keyboard interaction은 변경하지 않았다.
- backend API code, backend K3s manifest, backend Docker image, DB schema, Supabase SQL은 변경하지 않았다.
- Dockerfile, Docker Hub workflow, `.env`, `.env.*`, 실제 secret 값은 변경하지 않았다.
- approved-fixes 문서 기준으로 추가 승인 수정은 없었다.

## 이번 단계의 의미

frontend HTTPS 연결을 위한 manifest 선언과 전제조건 확인이 완료됐다.

다만 실제 K3s 적용과 Certificate 발급, HTTPS 접근은 아직 검증되지 않았다. 이 단계는 운영 반영 직전의 repository 준비 상태를 만드는 작업이며, 다음 단계에서 사람이 apply와 rollout을 수행해야 최종 완료 여부를 판단할 수 있다.

## 포트폴리오용 요약

NewsLab Web frontend의 K3s Ingress에 cert-manager 기반 TLS 설정을 추가했다. `newslab.ai.kr`와 `www.newslab.ai.kr`에 대해 `letsencrypt-prod` ClusterIssuer와 `news-lab-web-tls` Secret을 선언하고, ARM64 Docker image, DNS A record, ClusterIssuer readiness를 read-only로 확인했다. 실제 K3s apply, Certificate 발급, HTTPS 및 browser 검증은 운영 단계로 분리해 pending으로 기록했다.

## 다음 단계 후보

- K3s server-side dry-run 실행
- K3s Deployment/Service/Ingress apply
- Deployment rollout 및 Pod Running/Ready 확인
- Service port-forward로 `/api/health` 확인
- HTTP Host header 기반 Ingress routing 확인
- cert-manager Certificate/Order/Challenge/Secret 확인
- `https://newslab.ai.kr`, `https://www.newslab.ai.kr` HTTPS 확인
- production browser, DevTools Console, responsive viewport matrix 확인
- backend `api.newslab.ai.kr` domain/TLS 연결
- frontend API base URL을 `api.newslab.ai.kr`로 전환하는 후속 작업
