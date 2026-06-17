# 프론트엔드 Docker ARM64 이미지 발행 설정 수정

## 작업 내용

프론트엔드 Docker image 발행 workflow를 ARM64 운영 환경에 맞게 수정했다.

기존 workflow는 Docker Hub에 `main`, `sha-*` tag를 발행했지만 ARM64 K3s 환경에서 pull 가능한 `linux/arm64` image와 Deployment manifest가 참조하는 `latest` tag 발행 조건이 부족했다. 이번 변경은 GitHub Actions Docker build 설정을 ARM64 기준으로 맞추고, frontend Ingress host 초안을 `newslab.ai.kr` 기준으로 정리하는 작업이다.

## 주요 변경 사항

- `.github/workflows/docker-build.yml`
  - `docker/setup-qemu-action@v3`를 추가했다.
  - 기존 `docker/setup-buildx-action@v3`와 `docker/build-push-action@v6`는 유지했다.
  - Docker metadata tags에 `type=raw,value=latest,enable={{is_default_branch}}`를 추가했다.
  - build-push-action input에 `platforms: linux/arm64`를 추가했다.
  - `push: ${{ github.event_name != 'pull_request' }}` 조건을 유지해 pull request에서는 Docker Hub push가 발생하지 않게 했다.
- `k8s/news-lab-web-ingress.yaml`
  - frontend Ingress host를 `newslab.ai.kr`, `www.newslab.ai.kr`로 변경했다.
  - TLS section, cert-manager annotation, secret 설정은 추가하지 않았다.
- `docs/ARCHITECTURE.md`
  - frontend Ingress manifest 초안 설명을 `newslab.ai.kr`, `www.newslab.ai.kr` 기준으로 갱신했다.

## 프론트엔드/API 영향

- frontend route/page/component/API client 코드는 변경하지 않았다.
- 사용자-facing route 영향 없음:
  - `/`
  - `/topics`
  - `/topics/[id]`
  - `/search`
  - `/articles`
  - `/api/health`
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 `https://api.dev-scj.site`를 유지한다.
- `api.newslab.ai.kr` backend domain 전환은 이번 PR 범위가 아니다.

## 상태 및 UX 영향

- loading/error/empty/search/pagination/topic/article rendering 상태 변경 없음.
- CSS, layout, responsive breakpoint, semantic HTML, focus style, keyboard interaction 변경 없음.
- 이번 변경은 Docker image 발행 workflow와 Ingress host 초안 정리이며, 브라우저 UI 동작을 바꾸지 않는다.

## README 영향

README는 수정하지 않았다.

이번 변경은 기존 로컬 개발/설치 흐름이 아니라 Docker image 발행 workflow와 K3s Ingress host 초안에 한정된다. 관련 검증과 pending 항목은 `docs/verification/fix-frontend-docker-arm64-latest.md`에 기록했다.

## 테스트

근거: `docs/verification/fix-frontend-docker-arm64-latest.md`

- `git status --short --branch`: `fix/frontend-docker-arm64-latest` branch 확인.
- `git diff -- .github/workflows/docker-build.yml`: QEMU, `latest` tag metadata, `platforms: linux/arm64`, PR push 방지 조건 확인.
- `git diff --check`: 통과.
- `cat .github/workflows/docker-build.yml`: workflow 내용 확인.
- `rg -n "newslab.site|newslab.ai.kr|www.newslab.ai.kr|api.newslab.ai.kr" k8s docs`:
  - `k8s/news-lab-web-ingress.yaml`에는 `newslab.ai.kr`, `www.newslab.ai.kr`가 사용됨.
  - `docs/ARCHITECTURE.md`의 현재 배포 기반 설명도 신규 도메인 기준으로 갱신됨.
  - `newslab.site` match는 과거 task/PR/devlog/fixes 문서와 현재 task 문서의 기존 도메인 설명에 남아 있으며, 현재 K8s Ingress 운영 host로는 남아 있지 않음.
- `.github/workflows/docker-build.yml` Ruby YAML parser 확인: 통과.
- `k8s/news-lab-web-ingress.yaml` Ruby YAML parser 확인: `Ingress`.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않음.

Pending 검증:

- GitHub Actions `Docker image` workflow main branch run 확인.
- Docker Hub `seocj/news-lab-web` tag 확인:
  - `latest`
  - `main`
  - `sha-<commit>`
- ARM64 환경에서 `docker pull seocj/news-lab-web:latest` 성공 확인.
- `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'` 결과 `arm64/linux` 확인.
- `docker pull seocj/news-lab-web:main` 및 image inspect 확인.
- image pull 이후 container 직접 실행 및 `/`, `/api/health` route 확인.
- browser UI/DevTools/hydration/responsive 확인.

## 확인 결과

- backend API code, backend Docker image, DB schema, Supabase SQL, Docker Hub 실제 secret 값, `.env`, `.env.*`는 변경하지 않았다.
- `git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다.
- K3s Deployment apply, Pod Running/Ready, Ingress 운영 연결, DNS/TLS, production verification은 수행하지 않았다.
- approved-fixes 문서 기준으로 추가 승인 수정은 없었다.
- 보류 항목인 Ingress TLS template, cert-manager annotation, tls section, `news-lab-web-tls` Secret은 추가하지 않았다.

## 비고

- 이 PR은 Docker Hub에 ARM64 image와 `latest` tag가 발행될 수 있도록 workflow 전제조건을 맞추는 변경이다.
- 실제 ARM64 image 발행 여부는 push 이후 GitHub Actions와 Docker Hub에서 확인해야 한다.
- `newslab.ai.kr` / `www.newslab.ai.kr` host는 manifest 초안 기준이며, 실제 DNS/TLS/HTTP 접속 검증은 별도 단계로 남아 있다.
