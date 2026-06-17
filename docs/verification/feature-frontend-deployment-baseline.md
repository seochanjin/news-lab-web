# 검증 기록: Frontend Docker/K3s 배포 기반 구성

## 검증 범위

- Next.js standalone output 설정
- Dockerfile, `.dockerignore`, Docker image build/run 확인
- Docker Hub image build/push workflow YAML 확인
- K3s Deployment/Service/Ingress manifest 초안 확인
- frontend build/lint/typecheck 및 route marker 확인
- secret/credential pattern scan

## 실행한 Command

- `npm run lint`
- `npm run typecheck`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`
- `npm run build`
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`
- `open -a Docker`
- `docker info`
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`
- `docker run --rm -p 3000:3000 news-lab-web:local`
- `curl -I http://localhost:3000`
- `curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"`
- `curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"`
- `curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"`
- `kubectl apply --dry-run=client -f k8s/news-lab-web-deployment.yaml`
- `kubectl apply --dry-run=client -f k8s/news-lab-web-service.yaml`
- `kubectl apply --dry-run=client -f k8s/news-lab-web-ingress.yaml`
- `kubectl apply --dry-run=client --validate=false -f k8s/news-lab-web-deployment.yaml`
- `kubectl apply --dry-run=client --validate=false -f k8s/news-lab-web-service.yaml`
- `kubectl apply --dry-run=client --validate=false -f k8s/news-lab-web-ingress.yaml`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' k8s/news-lab-web-deployment.yaml k8s/news-lab-web-service.yaml k8s/news-lab-web-ingress.yaml`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `docker ps --filter ancestor=news-lab-web:local --format '{{.ID}} {{.Image}} {{.Status}} {{.Ports}}'`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: ok" }' .github/workflows/docker-build.yml`
- `git status --short --branch`
- `git diff --stat`

## 결과

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과.
- `npm run build`: 처음 병렬 실행 시 `Another next build process is already running`으로 실패. 직렬 재실행 후 통과.
- Docker build:
  - 최초 sandbox 실행: Docker API permission denied.
  - escalation 후 Docker daemon 미기동으로 `Cannot connect to the Docker daemon` 실패.
  - `open -a Docker` 실행 후 `docker info`로 Docker Desktop daemon 준비 확인.
  - 재실행한 `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`: 통과. Docker build 내부 `npm ci`에서 `2 moderate severity vulnerabilities` audit notice가 표시됐으나 build는 성공.
- `docker run --rm -p 3000:3000 news-lab-web:local`: Next.js 16.2.7 standalone server가 `http://localhost:3000`에서 기동.
- `curl -I http://localhost:3000`: `HTTP/1.1 200 OK`.
- container route marker curl:
  - `/`: `오늘의 주요 이슈`, `전체 주요 이슈 보기` marker 확인, exit code 0.
  - `/topics`: `주요 이슈 아카이브`, `전체 주요 이슈` marker 확인, exit code 0.
  - `/articles`: `기사 탐색`, `기사 목록` marker 확인, exit code 0.
- Docker run session은 Ctrl-C로 종료했다. `docker ps --filter ancestor=news-lab-web:local ...` 출력 없음으로 실행 중인 verification container 없음 확인.
- `kubectl apply --dry-run=client -f ...`: 세 manifest 모두 API discovery/openapi 조회가 `localhost:8080` 접근 제한으로 실패. 실제 apply는 수행하지 않았다.
- `kubectl apply --dry-run=client --validate=false -f ...`: 세 manifest 모두 API group discovery가 `localhost:8080` 접근 제한으로 실패.
- Ruby YAML parser로 K8s manifest 문법 확인: `Deployment`, `Service`, `Ingress` kind를 각각 확인했고 exit code 0.
- `.github/workflows/docker-build.yml` Ruby YAML parser 확인: 통과.
- `bash -n scripts/new_agent_task.sh`: 통과.
- `bash -n scripts/agent_next_step.sh`: 통과.
- `git diff --check`: 통과.
- `git grep ...`: 완료. 문서, ignore rule, 환경 변수명 reference, Docker Hub secret 이름 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- `git status --short --branch`: `feature/frontend-deployment-baseline` branch 확인. 배포 기반 파일과 workflow 문서 변경 확인.
- `git diff --stat`: tracked 변경 기준 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `next.config.ts` 변경 확인. 신규 untracked 파일은 status에서 별도 확인.

## 수동 브라우저 검증

- 미수행. Browser UI, DevTools Console, hydration mismatch, keyboard navigation, responsive viewport matrix는 완료로 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 local Docker container 또는 dev server 기준 `/`, `/topics`, `/topics/{id}`, `/search?query=...`, `/articles` 확인.
- mobile/tablet/desktop responsive viewport matrix 확인.
- browser console runtime error/hydration mismatch 확인.
- cluster kubeconfig가 준비된 환경에서 `kubectl apply --dry-run=client` 또는 server-side dry-run 재확인.
- GitHub Actions Docker image workflow 실행 확인.
- Docker Hub secret 설정 및 push 확인.
- K3s 실제 `kubectl apply`, rollout, DNS/TLS, production verification은 이번 task 범위 밖이며 미수행.

## 근거 메모

- Next.js 설정 변경 전 `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`, `01-app/02-guides/self-hosting.md`, `01-app/02-guides/environment-variables.md`, `01-app/03-api-reference/05-config/01-next-config-js/output.md`를 확인했다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site`는 browser에 노출되는 public frontend API base URL로 secret 값이 아니다.
- `.env`, `.env.*`, backend API code, DB, Supabase SQL, K3s 운영 리소스, Docker Hub 실제 secret 값, production infrastructure는 수정하지 않았다.
- `git push`, `git merge`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.

## 승인 수정 적용 후 검증

### 실행한 Command

- `sed -n '1,220p' docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md`
- `sed -n '1,220p' docs/verification/feature-frontend-deployment-baseline.md`
- `sed -n '1,200p' k8s/news-lab-web-deployment.yaml`
- `sed -n '1,180p' k8s/news-lab-web-ingress.yaml`
- `rg -n "nginx|traefik|readiness|liveness|probe|health|Ingress|ingress" docs/ARCHITECTURE.md docs/RUNBOOK.md`
- `find app -maxdepth 3 -type f | sort`
- `sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `sed -n '92,112p' docs/ARCHITECTURE.md`
- `sed -n '72,116p' docs/RUNBOOK.md`
- `sed -n '1,180p' docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md`
- `npm run lint`
- `npm run typecheck`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`
- `docker run --rm -p 3000:3000 news-lab-web:local`
- `curl -I http://localhost:3000/api/health`
- `curl -sS http://localhost:3000/api/health`
- `curl -I http://localhost:3000`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' k8s/news-lab-web-deployment.yaml k8s/news-lab-web-service.yaml k8s/news-lab-web-ingress.yaml`
- `git diff --check`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `docker ps --filter ancestor=news-lab-web:local --format '{{.ID}} {{.Image}} {{.Status}} {{.Ports}}'`
- `git diff --stat`
- `git status --short --branch`

### 결과

- 승인된 수정 범위 확인:
  - 적용 대상은 IngressClass `traefik` 정정, nginx annotation 제거, frontend `/api/health` route 추가, Deployment readiness/liveness probe path `/api/health` 변경이었다.
  - Ingress TLS template은 보류 항목이므로 추가하지 않았다.
- Next.js route handler 관련 문서 확인:
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`를 확인했다.
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과.
  - build output route 목록에 `ƒ /api/health`가 포함됐다.
- `docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .`: 통과.
  - Docker build 내부 Next.js build output route 목록에 `ƒ /api/health`가 포함됐다.
- `docker run --rm -p 3000:3000 news-lab-web:local`: Next.js 16.2.7 standalone server가 `http://localhost:3000`에서 기동.
- `curl -I http://localhost:3000/api/health`: `HTTP/1.1 200 OK`, `content-type: application/json`.
- `curl -sS http://localhost:3000/api/health`: `{"status":"ok","service":"news-lab-web"}`.
- `curl -I http://localhost:3000`: `HTTP/1.1 200 OK`.
- Docker run session은 Ctrl-C로 종료했다. `docker ps --filter ancestor=news-lab-web:local ...` 출력 없음으로 실행 중인 verification container 없음 확인.
- Ruby YAML parser로 K8s manifest 문법 확인: `Deployment`, `Service`, `Ingress` kind를 각각 확인했고 exit code 0.
- `git diff --check`: 통과.
- `bash -n scripts/new_agent_task.sh`: 통과.
- `bash -n scripts/agent_next_step.sh`: 통과.
- `git grep ...`: 완료. 문서, ignore rule, 환경 변수명 reference, Docker Hub secret 이름 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- `git status --short --branch`: `feature/frontend-deployment-baseline` branch 확인. `app/api/`, `k8s/`, Docker/workflow 파일, workflow 문서 변경 확인.
- `git diff --stat`: tracked 변경 기준 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `next.config.ts` 변경 확인. 신규 untracked 파일은 status에서 별도 확인.

### 미수행 항목

- 실제 `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- DNS/TLS 연결, Docker Hub push, GitHub Actions 실행 확인, production verification은 수행하지 않았다.
- 수동 브라우저 검증, DevTools Console 확인, responsive viewport matrix 확인은 수행하지 않았다.
