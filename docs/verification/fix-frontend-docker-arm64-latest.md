# 검증 기록: 프론트엔드 Docker ARM64 이미지 발행 설정 수정

## 검증 범위

- Docker image GitHub Actions workflow의 ARM64 build 설정 확인
- `main` branch push 시 `latest` tag metadata 설정 확인
- `pull_request` event에서 Docker Hub push가 비활성화되는 조건 확인
- frontend Ingress host가 `newslab.ai.kr`, `www.newslab.ai.kr` 기준인지 확인
- workflow/K8s YAML 문법 확인
- whitespace 및 credential pattern scan

## 실행한 Command

- `sed -n '1,220p' AGENTS.md`
- `sed -n '1,260p' docs/ARCHITECTURE.md`
- `sed -n '1,260p' docs/RUNBOOK.md`
- `sed -n '1,260p' docs/prompts/codex-implement.md`
- `sed -n '1,320p' docs/tasks/fix-frontend-docker-arm64-latest.md`
- `sed -n '1,220p' Dockerfile`
- `sed -n '1,240p' .github/workflows/docker-build.yml`
- `git status --short --branch`
- `sed -n '321,700p' docs/tasks/fix-frontend-docker-arm64-latest.md`
- `git diff -- k8s/news-lab-web-ingress.yaml`
- `sed -n '1,220p' docs/verification/fix-frontend-docker-arm64-latest.md`
- `find docs -maxdepth 2 -type f -name '*fix-frontend-docker-arm64-latest*' | sort`
- `rg -n "newslab\\.site|newslab\\.ai\\.kr|www\\.newslab\\.ai\\.kr|api\\.newslab\\.ai\\.kr" k8s docs .github Dockerfile next.config.ts`
- `git diff -- .github/workflows/docker-build.yml docs/ARCHITECTURE.md docs/RUNBOOK.md`
- `sed -n '1,160p' .github/workflows/docker-build.yml`
- `git status --short --branch`
- `git diff -- .github/workflows/docker-build.yml`
- `git diff --check`
- `cat .github/workflows/docker-build.yml`
- `rg -n "newslab.site|newslab.ai.kr|www.newslab.ai.kr|api.newslab.ai.kr" k8s docs`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: ok" }' .github/workflows/docker-build.yml`
- `ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' k8s/news-lab-web-ingress.yaml`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`

## 결과

- 현재 branch는 `fix/frontend-docker-arm64-latest`다.
- `.github/workflows/docker-build.yml` 변경 확인:
  - `docker/setup-qemu-action@v3`가 `docker/setup-buildx-action@v3` 앞에 추가됐다.
  - `docker/setup-buildx-action@v3`는 유지됐다.
  - `docker/build-push-action@v6`는 유지됐다.
  - Docker metadata tags에 `type=raw,value=latest,enable={{is_default_branch}}`가 추가됐다.
  - build-push-action input에 `platforms: linux/arm64`가 추가됐다.
  - `push: ${{ github.event_name != 'pull_request' }}` 조건은 유지되어 pull request에서는 push하지 않는다.
  - Docker Hub secret 값은 기록하지 않고 `${{ secrets.DOCKERHUB_USERNAME }}`, `${{ secrets.DOCKERHUB_TOKEN }}` 이름만 참조한다.
- `k8s/news-lab-web-ingress.yaml` 변경 확인:
  - host가 `newslab.ai.kr`, `www.newslab.ai.kr`로 설정되어 있다.
  - TLS section, cert-manager annotation, secret 설정은 추가하지 않았다.
- `docs/ARCHITECTURE.md` 변경 확인:
  - Ingress manifest 초안 설명을 `newslab.ai.kr`, `www.newslab.ai.kr` 기준으로 수정했다.
- `git diff --check`: 통과.
- `.github/workflows/docker-build.yml` Ruby YAML parser 확인: 통과.
- `k8s/news-lab-web-ingress.yaml` Ruby YAML parser 확인: `Ingress`.
- `rg -n "newslab.site|newslab.ai.kr|www.newslab.ai.kr|api.newslab.ai.kr" k8s docs`:
  - `k8s/news-lab-web-ingress.yaml`에는 `newslab.ai.kr`, `www.newslab.ai.kr`가 사용된다.
  - `docs/ARCHITECTURE.md`의 현재 배포 기반 설명도 `newslab.ai.kr`, `www.newslab.ai.kr` 기준이다.
  - `newslab.site` match는 과거 feature task/PR/devlog/fixes 문서와 현재 task 문서의 기존 도메인 설명에 남아 있다. 현재 `k8s/news-lab-web-ingress.yaml` 운영 host로는 남아 있지 않다.
- `git grep ...`: 완료. 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- `git status --short --branch`: `.github/workflows/docker-build.yml`, `docs/ARCHITECTURE.md`, `k8s/news-lab-web-ingress.yaml` 변경과 branch workflow 문서 untracked 상태를 확인했다.

## 수동 브라우저 검증

- 미수행. 이번 작업은 GitHub Actions Docker image 발행 workflow와 Ingress host 기준 정리이며, browser UI/DevTools/hydration/responsive 확인은 완료로 주장하지 않는다.

## 대기 중인 검증

- 사람이 push한 뒤 GitHub Actions `Docker image` workflow 실행 확인.
- Docker Hub `seocj/news-lab-web` tag 확인:
  - `latest`
  - `main`
  - `sha-<commit>`
- ARM64 환경에서 `docker pull seocj/news-lab-web:latest` 성공 확인.
- `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'` 결과 `arm64/linux` 확인.
- `docker pull seocj/news-lab-web:main` 및 `docker image inspect seocj/news-lab-web:main --format '{{.Architecture}}/{{.Os}}'` 확인.
- 실제 K3s `kubectl apply`, rollout, Pod Running/Ready, Ingress 연결, DNS/TLS, production verification.
- `newslab.ai.kr` 실제 HTTP/HTTPS 접속 확인.
- image pull 이후 container를 직접 실행하는 browser/manual route 확인.

## 근거 메모

- Next.js application code, route, component, API client, styling, loading/error/empty state는 변경하지 않았다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 `https://api.dev-scj.site`를 유지한다.
- backend API code, backend Docker image, DB schema, Supabase SQL, Docker Hub 실제 secret 값, `.env`, `.env.*`는 수정하지 않았다.
- `git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- GitHub Actions 실행, Docker Hub push, ARM64 image pull, production verification은 실제 수행 로그가 없으므로 pending으로 남긴다.
