# Frontend Docker/K3s 배포 기반 구성

## 작업 목적

NewsLab Web frontend를 K3s 배포 단계로 넘길 수 있도록 Next.js standalone Docker image, Docker Hub workflow 초안, K3s Deployment/Service/Ingress manifest 초안을 준비했다.

이번 단계의 목적은 실제 운영 반영이 아니라, frontend 저장소 안에 검토 가능한 배포 입력물과 로컬 검증 기록을 남기는 것이다.

## 기존 문제

frontend는 Next.js 앱과 CI build 검증은 갖추고 있었지만, production-like container image를 만들 Dockerfile과 K3s에서 참조할 manifest 초안이 없었다.

또한 Deployment health check가 홈(`/`) 렌더링에 묶이면 frontend process 자체 확인과 backend API 호출 흐름이 섞일 수 있다. 승인 수정 단계에서 이를 분리하기 위해 lightweight health route와 probe path 변경을 적용했다.

## 변경 내용

- `next.config.ts`에 `output: "standalone"`을 추가했다.
- Next.js standalone runtime을 사용하는 multi-stage `Dockerfile`을 추가했다.
- `.dockerignore`로 build context에서 dependency, build artifact, env 파일, workflow 문서 산출물을 제외했다.
- `.github/workflows/docker-build.yml` Docker build/push workflow 초안을 추가했다.
- `app/api/health/route.ts`를 추가해 frontend process health 확인용 JSON route를 제공했다.
- `k8s/news-lab-web-deployment.yaml`, `k8s/news-lab-web-service.yaml`, `k8s/news-lab-web-ingress.yaml`을 추가했다.
- 승인 수정에 따라 IngressClass를 `traefik`으로 맞추고 nginx 전용 annotation을 제거했다.
- 승인 수정에 따라 readiness/liveness probe path를 `/api/health`로 변경했다.
- `docs/ARCHITECTURE.md`와 `docs/RUNBOOK.md`에 frontend 배포 구조, health probe, Traefik 기준, 검증/수동 적용 절차를 반영했다.
- `docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md`, `docs/verification/feature-frontend-deployment-baseline.md`, `docs/pr/feature-frontend-deployment-baseline.md`를 최신 작업 상태에 맞춰 갱신했다.

## 구현 상세

- Dockerfile은 `deps`, `builder`, `runner` stage로 구성했다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 build arg/env로 전달하며 초기 값은 기존 public API `https://api.dev-scj.site`를 유지한다.
- runtime stage는 `.next/standalone`, `.next/static`, `public`만 포함하고 `node server.js`로 실행한다.
- container는 `HOSTNAME=0.0.0.0`, `PORT=3000`으로 실행된다.
- workflow는 PR에서 build만 수행하고, non-PR event에서는 Docker Hub push가 가능하도록 `docker/login-action`과 `docker/build-push-action`을 사용한다.
- Docker Hub credential은 실제 값 없이 GitHub secrets 이름만 참조한다.
- `/api/health` route는 backend API, DB, 외부 네트워크를 호출하지 않고 `{"status":"ok","service":"news-lab-web"}`를 반환한다.
- K3s Deployment는 `seocj/news-lab-web:latest`, replicas 2, container port 3000, readiness/liveness probe `/api/health`를 정의한다.
- Service는 ClusterIP port 80을 container의 `http` targetPort로 연결한다.
- Ingress는 `newslab.site`, `www.newslab.site` host를 초안으로 포함하고 `ingressClassName: traefik`을 사용한다.

## 대안 검토

- `next start` 기반 Docker image도 가능하지만, runtime image에 전체 dependency를 포함하기 쉬워 standalone output을 선택했다.
- K3s manifest를 하나의 multi-document YAML로 둘 수도 있었지만, review와 정적 확인 단위를 명확히 하기 위해 Deployment/Service/Ingress를 파일별로 분리했다.
- Deployment probe를 `/`로 둘 수도 있었지만, 홈 렌더링과 backend API 흐름에 영향을 받을 수 있어 frontend process 자체 확인용 `/api/health`를 별도로 두었다.
- Ingress TLS template 추가는 검토됐지만 승인 문서에서 보류됐다. DNS, cert-manager, TLS secret, Ingress 적용 순서와 함께 별도 task에서 검증하는 편이 맞다.

## 선택한 접근과 근거

Next.js 공식 self-hosting/deployment 문서가 standalone output과 minimal `server.js` 배포를 안내하므로 이를 따랐다. 기존 사용자-facing route/component/API client 변경 없이 배포 입력물만 추가하는 방식이 task 범위에 가장 가깝다.

승인 수정은 `docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md`에 명시된 항목만 적용했다. cluster IngressClass 확인 결과가 `traefik`으로 기록되어 있어 manifest 초안을 현재 기준에 맞췄고, frontend health route는 probe 목적을 홈 페이지 렌더링에서 분리하기 위해 추가했다.

## 트레이드오프

- `NEXT_PUBLIC_*` 값은 build time에 browser bundle로 고정된다. 환경별 promotion이 필요하면 image를 환경별로 build하거나 runtime config 전략을 별도 설계해야 한다.
- K8s manifest는 초안이며 cluster별 resource limit, rollout strategy, TLS secret, image tag 전략은 실제 운영 환경에 맞춰 후속 조정이 필요하다.
- `/api/health`는 frontend process 응답 가능성만 확인한다. backend API 연결 상태나 도메인/TLS 상태를 검증하지 않는다.
- 로컬 kubectl dry-run은 API discovery 접근 제한으로 실패해 Ruby YAML parser로 manifest syntax를 보완 확인했다.

## 테스트 및 브라우저 확인

근거는 `docs/verification/feature-frontend-deployment-baseline.md`에 기록했다.

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과.
- `npm run build`: 최초 병렬 실행은 build lock으로 실패했고, 직렬 재실행은 통과.
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`: Docker daemon 기동 후 통과.
- `docker run --rm -p 3000:3000 news-lab-web:local`: Next.js standalone server 기동 확인.
- `curl -I http://localhost:3000`: `HTTP/1.1 200 OK`.
- `curl -I http://localhost:3000/api/health`: `HTTP/1.1 200 OK`, `content-type: application/json`.
- `curl -sS http://localhost:3000/api/health`: `{"status":"ok","service":"news-lab-web"}`.
- container 기준 `/`, `/topics`, `/articles` route marker curl: 모두 exit code 0.
- `kubectl apply --dry-run=client ...`: API discovery/openapi 조회가 `localhost:8080` 접근 제한으로 실패.
- Ruby YAML parser로 K8s manifest kind 확인: `Deployment`, `Service`, `Ingress`.
- Docker workflow YAML parser 확인: 통과.
- `bash -n scripts/new_agent_task.sh`: 통과.
- `bash -n scripts/agent_next_step.sh`: 통과.
- `git diff --check`: 통과.
- credential scan: 문서, ignore rule, 환경 변수명 reference, Docker Hub secret 이름 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- 수동 브라우저 UI/console/hydration 확인과 responsive viewport matrix는 미수행이다.

## 운영 반영

운영 배포는 수행하지 않았다.

Docker Hub push, K3s `kubectl apply`, rollout, DNS/TLS 연결, production verification은 모두 pending이다. `newslab.site`, `www.newslab.site`는 Ingress manifest 초안에만 포함되어 있으며 실제 연결 완료를 주장하지 않는다.

## README 업데이트 판단

README는 수정하지 않았다.

README의 설치/로컬 개발 흐름과 환경 변수명은 바뀌지 않았다. 배포 관련 절차는 운영 runbook 성격이므로 `docs/RUNBOOK.md`에 추가하는 쪽을 선택했다.

## 확인 결과

- standalone Docker image build와 local container route marker 확인이 가능해졌다.
- frontend process health 확인용 `/api/health` route가 추가됐다.
- K3s frontend Deployment/Service/Ingress manifest 초안이 추가됐다.
- Ingress manifest는 현재 확인된 cluster IngressClass 기준인 `traefik`을 사용한다.
- 기존 사용자-facing route/component/API client/UI 스타일은 변경하지 않았다.
- 기존 loading/error/empty/success 상태 처리, responsive layout, accessibility label/focus style은 변경하지 않았다.
- backend API code, DB, Supabase SQL, K3s 운영 리소스 직접 적용, Docker Hub 실제 secret 값, production infrastructure, `.env`, `.env.*`는 변경하지 않았다.
- git push, git merge, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.

## 이번 단계의 의미

frontend를 수동 K3s 배포 검토 단계로 넘길 수 있는 최소 배포 입력물과 검증 기록을 마련했다.

다음 단계에서는 같은 파일을 사람이 검토하고 cluster 환경에서 dry-run/apply/rollout, Docker Hub workflow, domain/TLS 연결을 별도로 확인할 수 있다.

## 포트폴리오용 요약

Next.js App Router frontend를 standalone Docker image로 패키징하고, Docker Hub build/push workflow 초안과 K3s Deployment/Service/Ingress manifest를 구성했다. frontend 전용 health endpoint를 추가해 probe를 홈 렌더링에서 분리했고, 로컬 Docker build/run 및 주요 route HTTP marker를 검증했다. 실제 production rollout은 별도 수동 단계로 분리했다.

## 다음 단계 후보

- cluster kubeconfig가 준비된 환경에서 K8s dry-run 또는 server-side dry-run 재확인
- Docker Hub repository secrets 설정 후 workflow 실행 확인
- frontend image push 및 K3s 수동 apply/rollout
- `newslab.site`, `www.newslab.site` DNS/TLS 연결
- local Docker container 또는 dev server 기준 browser console, hydration, responsive viewport matrix 확인
