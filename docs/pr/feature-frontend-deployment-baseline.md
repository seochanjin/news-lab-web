# Frontend Docker/K3s 배포 기반 구성

## 작업 내용

NewsLab Web frontend를 Next.js standalone output 기반 Docker image로 build/run할 수 있게 구성하고, 추후 사람이 수동으로 검토·적용할 수 있는 Docker Hub workflow 초안과 K3s Deployment/Service/Ingress manifest 초안을 추가했다.

이번 PR은 실제 운영 배포가 아니라 frontend 배포 기반 파일 준비와 로컬 검증까지를 범위로 한다.

## 주요 변경 사항

- `next.config.ts`
  - Next.js self-hosted container 실행을 위해 `output: "standalone"`을 설정했다.
- `Dockerfile`
  - `deps`, `builder`, `runner` stage를 분리했다.
  - `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` build arg를 Next.js build에 전달한다.
  - standalone output의 `server.js`를 production container에서 실행한다.
- `.dockerignore`
  - dependency, `.next`, env 파일, 로컬 산출물, workflow 문서 산출물을 Docker build context에서 제외한다.
- `.github/workflows/docker-build.yml`
  - PR에서는 Docker image build만 수행하고, non-PR event에서는 Docker Hub login 후 push할 수 있는 workflow 초안을 추가했다.
  - 실제 Docker Hub secret 값은 포함하지 않고 GitHub secrets 이름만 참조한다.
- `app/api/health/route.ts`
  - backend API, DB, 외부 네트워크를 호출하지 않는 frontend process health route를 추가했다.
  - 응답은 `{"status":"ok","service":"news-lab-web"}`이다.
- `k8s/`
  - `news-lab-web` Deployment, Service, Ingress manifest 초안을 추가했다.
  - container port 3000, Service port 80, Ingress host `newslab.site`, `www.newslab.site`를 정의했다.
  - readiness/liveness probe는 `/api/health`를 사용한다.
  - IngressClass는 승인 수정에 따라 `traefik`으로 맞췄고 nginx 전용 annotation은 제거했다.
- `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`
  - standalone Docker/K3s 배포 구조, health probe, Traefik IngressClass 기준, 로컬 검증/수동 적용 절차를 문서화했다.

## 프론트엔드/API 영향

- 기존 사용자-facing route와 page/component/API client 동작은 변경하지 않았다.
- 유지되는 route/API mapping:
  - `/` → `GET /topics/home`
  - `/topics` → `GET /topics`
  - `/topics/[id]` → `GET /topics/{id}`
  - `/search` → 기존 통합 검색 구조
  - `/articles` → Articles API
- 새로 추가된 frontend route는 `/api/health`이며, container/process health 확인용이다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 public frontend API base URL `https://api.dev-scj.site`를 사용한다.
- DB URL, API key, token, credential, private key는 추가하지 않았다.

## 상태 및 UX 영향

- UI markup, Tailwind styling, PageShell, Header, TopicCard, ArticleList는 변경하지 않았다.
- 기존 loading/error/empty/success 상태 처리는 변경하지 않았다.
- Docker container 기준 `/`, `/topics`, `/articles` route marker를 확인했다.
- `/api/health` probe 추가로 Deployment health check가 홈 페이지 렌더링과 backend API 호출 흐름에 직접 의존하지 않게 됐다.

## README 영향

README는 수정하지 않았다.

배포 기반 상세 절차와 주의사항은 `docs/RUNBOOK.md`에 추가했다. 기존 README의 설치/로컬 실행 안내와 환경 변수명 설명은 이번 변경 범위와 충돌하지 않는다.

## 테스트

근거: `docs/verification/feature-frontend-deployment-baseline.md`

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과
- `npm run build`: 최초 병렬 실행은 build lock으로 실패, 직렬 재실행 후 통과
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`: Docker daemon 기동 후 통과
- `docker run --rm -p 3000:3000 news-lab-web:local`: Next.js standalone server 기동 확인
- `curl -I http://localhost:3000`: `HTTP/1.1 200 OK`
- `curl -I http://localhost:3000/api/health`: `HTTP/1.1 200 OK`, `content-type: application/json`
- `curl -sS http://localhost:3000/api/health`: `{"status":"ok","service":"news-lab-web"}`
- container route marker curl:
  - `/`: `오늘의 주요 이슈`, `전체 주요 이슈 보기` marker 확인
  - `/topics`: `주요 이슈 아카이브`, `전체 주요 이슈` marker 확인
  - `/articles`: `기사 탐색`, `기사 목록` marker 확인
- Ruby YAML parser로 K8s manifest syntax 확인: `Deployment`, `Service`, `Ingress` kind 확인
- Docker workflow YAML parser 확인: 통과
- `bash -n scripts/new_agent_task.sh`: 통과
- `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 문서, ignore rule, 환경 변수명 reference, Docker Hub secret 이름 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않음

Pending 또는 실패로 기록된 검증:

- `kubectl apply --dry-run=client -f ...`: local API discovery/openapi 조회가 `localhost:8080` 접근 제한으로 실패했다.
- `kubectl apply --dry-run=client --validate=false -f ...`: API group discovery가 `localhost:8080` 접근 제한으로 실패했다.
- 수동 브라우저 UI/Console/hydration/responsive 검증은 미수행이다.
- GitHub Actions Docker workflow 실제 실행 확인은 미수행이다.
- Docker Hub push와 secret 설정 확인은 미수행이다.

## 확인 결과

- backend API code, DB, Supabase SQL, K3s 운영 리소스 직접 적용, Docker Hub 실제 secret 값, production infrastructure, `.env`, `.env.*`는 변경하지 않았다.
- `git push`, `git merge`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- DNS/TLS 연결, Docker Hub push, production deploy/verification은 수행하지 않았다.
- 승인 수정 중 Ingress TLS template 추가는 보류 항목이므로 적용하지 않았다.
- Docker run 검증 session은 Ctrl-C로 종료했고, `docker ps --filter ancestor=news-lab-web:local ...` 출력 없음으로 실행 중인 verification container가 없음을 확인했다.

## 비고

- `newslab.site`, `www.newslab.site` host는 manifest 초안에만 포함되어 있으며 DNS/TLS 연결은 별도 task 범위다.
- cluster kubeconfig가 준비된 환경에서 kubectl dry-run 또는 server-side dry-run 재확인이 필요하다.
- 실제 K3s apply/rollout은 사람이 별도 승인·절차로 수행해야 한다.
