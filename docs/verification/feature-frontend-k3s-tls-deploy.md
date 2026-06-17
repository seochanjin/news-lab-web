# 검증 기록: 프론트엔드 K3s 배포 및 newslab.ai.kr TLS 연결

## 검증 범위

- frontend Ingress manifest TLS 설정 추가 확인
- Deployment/Service/Ingress YAML 정적 문법 확인
- Docker Hub `seocj/news-lab-web:latest` ARM64 manifest 및 local image architecture 확인
- `newslab.ai.kr`, `www.newslab.ai.kr` DNS A record 확인
- cert-manager `letsencrypt-prod` ClusterIssuer read-only 확인
- whitespace 및 credential pattern scan

## 실행한 Command

- `sed -n '1,220p' AGENTS.md`
- `sed -n '1,280p' docs/ARCHITECTURE.md`
- `sed -n '1,280p' docs/RUNBOOK.md`
- `sed -n '1,260p' docs/prompts/codex-implement.md`
- `sed -n '1,760p' docs/tasks/feature-frontend-k3s-tls-deploy.md`
- `git status --short --branch`
- `find k8s .github/workflows app/api docs -maxdepth 3 -type f \( -name '*frontend-k3s-tls-deploy*' -o -name 'news-lab-web-*.yaml' -o -name 'docker-build.yml' -o -name 'route.ts' \) | sort`
- `sed -n '1,180p' k8s/news-lab-web-ingress.yaml`
- `sed -n '1,160p' k8s/news-lab-web-deployment.yaml`
- `sed -n '1,120p' k8s/news-lab-web-service.yaml`
- `sed -n '1,220p' docs/verification/feature-frontend-k3s-tls-deploy.md`
- `rg -n "TLS|cert-manager|letsencrypt|newslab.ai.kr|news-lab-web-tls|K3s Manifest|Docker Build" docs/ARCHITECTURE.md docs/RUNBOOK.md`
- `sed -n '96,114p' docs/ARCHITECTURE.md`
- `sed -n '82,118p' docs/RUNBOOK.md`
- `git status --short --branch`
- `git log --oneline -5`
- `rg -n "seocj/news-lab-web|newslab.ai.kr|www.newslab.ai.kr|api.dev-scj.site|api.newslab.ai.kr|newslab.site|news-lab-web-tls|letsencrypt-prod" k8s docs`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' k8s/news-lab-web-deployment.yaml k8s/news-lab-web-service.yaml k8s/news-lab-web-ingress.yaml`
- `docker buildx imagetools inspect seocj/news-lab-web:latest`
- `dig +short newslab.ai.kr`
- `dig +short www.newslab.ai.kr`
- `docker pull seocj/news-lab-web:latest`
- `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'`
- `git diff --check`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `git diff -- k8s/news-lab-web-ingress.yaml docs/ARCHITECTURE.md docs/RUNBOOK.md`
- `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer`
- `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer letsencrypt-prod`

## 결과

- 현재 branch는 `feature/frontend-k3s-tls-deploy`다.
- 최근 commit 확인:
  - `c5f6443 fix: 프론트엔드 Docker main/latest 태그 발행 수정`
  - `b41f2e2 fix: 프론트엔드 Docker 이미지 발행 및 도메인 설정 수정 (#14)`
  - `7cba341 feat: Frontend Docker/K3s 배포 기반 구성 (#13)`
  - `c76222f feat: 홈 Topics API 전환 (#12)`
  - `cdb5027 refactor: 홈 원문 기사 미리보기 제거 (#11)`
- `k8s/news-lab-web-ingress.yaml` 변경 확인:
  - `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation 추가.
  - TLS hosts에 `newslab.ai.kr`, `www.newslab.ai.kr` 추가.
  - TLS `secretName: news-lab-web-tls` 추가.
  - `ingressClassName: traefik` 유지.
  - HTTP rules host는 `newslab.ai.kr`, `www.newslab.ai.kr` 유지.
- `k8s/news-lab-web-deployment.yaml` 확인:
  - image는 `seocj/news-lab-web:latest`.
  - `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 `https://api.dev-scj.site` 유지.
  - readiness/liveness probe는 `/api/health` 유지.
- `k8s/news-lab-web-service.yaml` 확인:
  - `ClusterIP`, service port 80, targetPort `http` 유지.
- `docs/ARCHITECTURE.md` 변경 확인:
  - Ingress TLS가 cert-manager `letsencrypt-prod` ClusterIssuer와 `news-lab-web-tls` Secret을 사용하도록 선언된 점을 반영했다.
  - DNS, certificate 발급, production rollout verification은 별도 수동 단계로 남겼다.
- `docs/RUNBOOK.md` 변경 확인:
  - `newslab.ai.kr`, `www.newslab.ai.kr`, `letsencrypt-prod`, `news-lab-web-tls` 기준을 추가했다.
  - TLS 적용 후 사람이 확인할 대표 command를 추가했고, 실제 실행 전에는 완료로 기록하지 않는다고 명시했다.
- `rg -n "seocj/news-lab-web|newslab.ai.kr|www.newslab.ai.kr|api.dev-scj.site|api.newslab.ai.kr|newslab.site|news-lab-web-tls|letsencrypt-prod" k8s docs`:
  - K8s Deployment image, frontend API base URL, Ingress host, TLS Secret, ClusterIssuer reference를 확인했다.
  - `newslab.site` match는 과거 task/devlog/PR/fixes 문서 또는 기존 도메인 설명에 남아 있으며, 현재 `k8s/news-lab-web-ingress.yaml` 운영 host로는 남아 있지 않다.
  - `api.newslab.ai.kr` match는 task 문서와 과거 문서의 후속 backend domain 후보 설명에 남아 있으며, 현재 frontend API base URL로 적용되지 않았다.
- Ruby YAML parser 확인:
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
- `docker buildx imagetools inspect seocj/news-lab-web:latest`:
  - 최초 sandbox 실행은 Docker Hub DNS 조회 실패로 실패했다.
  - 권한 상승 후 재실행 결과 `docker.io/seocj/news-lab-web:latest` manifest에 `Platform: linux/arm64`가 포함됨을 확인했다.
- `dig +short newslab.ai.kr`:
  - 최초 sandbox 실행은 socket bind 권한 문제로 실패했다.
  - 권한 상승 후 재실행 결과 `152.67.211.33`.
- `dig +short www.newslab.ai.kr`:
  - 최초 sandbox 실행은 socket bind 권한 문제로 실패했다.
  - 권한 상승 후 재실행 결과 `152.67.211.33`.
- `docker pull seocj/news-lab-web:latest`:
  - 최초 sandbox 실행은 Docker credential helper 오류로 실패했다.
  - 권한 상승 후 재실행 결과 pull 성공. 출력: `Status: Image is up to date for seocj/news-lab-web:latest`.
- `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'`:
  - 최초 sandbox 실행은 Docker socket 권한 문제로 실패했다.
  - 권한 상승 후 재실행 결과 `arm64/linux`.
- `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer`:
  - `letsencrypt-prod   True   22d`.
- `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer letsencrypt-prod`:
  - `letsencrypt-prod   True   22d`.
- `git diff --check`: 통과.
- `git grep ...`: 완료. 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.

## 수동 브라우저 검증

- 미수행. Browser UI, DevTools Console, hydration mismatch, responsive viewport matrix, keyboard navigation, accessibility 확인은 완료로 주장하지 않는다.

## 대기 중인 검증

- K3s server-side dry-run:
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-deployment.yaml`
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-service.yaml`
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-ingress.yaml`
- 실제 K3s apply:
  - `kubectl apply -f k8s/news-lab-web-deployment.yaml`
  - `kubectl apply -f k8s/news-lab-web-service.yaml`
  - `kubectl apply -f k8s/news-lab-web-ingress.yaml`
- rollout 및 resource 상태:
  - Deployment rollout 성공
  - Pod 2개 Running/Ready
  - Service, Ingress 확인
- Service port-forward `/api/health` 확인.
- HTTP Host header 기반 `newslab.ai.kr`, `www.newslab.ai.kr` routing 확인.
- cert-manager Certificate/Order/Challenge/Secret 확인:
  - Certificate `news-lab-web-tls` Ready=True
  - Secret `news-lab-web-tls` 생성
- HTTPS 확인:
  - `https://newslab.ai.kr/api/health`
  - `https://newslab.ai.kr`
  - `https://www.newslab.ai.kr`
- production browser 확인.

## 근거 메모

- 이번 변경은 Ingress TLS manifest와 frontend 배포 문서 보강에 한정했다.
- Next.js application code, route, component, API client, styling, loading/error/empty state는 변경하지 않았다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 `https://api.dev-scj.site`를 유지한다.
- backend API code, backend K3s manifest, backend Docker image, DB schema, Supabase SQL, `.env`, `.env.*`, 실제 secret 값은 수정하지 않았다.
- `git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- K3s server-side dry-run, 실제 apply, rollout, Certificate Ready, HTTPS, browser verification은 수행하지 않았으므로 pending으로 남긴다.
