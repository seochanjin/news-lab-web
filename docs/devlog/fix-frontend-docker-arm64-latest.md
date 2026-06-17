# 프론트엔드 Docker ARM64 이미지 발행 설정 수정

## 작업 목적

프론트엔드 Docker image 발행 workflow를 ARM64 운영 환경에 맞게 수정했다.

NewsLab 운영 환경은 Oracle A1 ARM node와 Raspberry Pi worker를 포함한 ARM64 기반 K3s 클러스터다. 따라서 `seocj/news-lab-web` image도 `linux/arm64`로 pull 가능해야 하며, K3s Deployment manifest가 참조하는 `latest` tag도 main branch push 시 발행될 필요가 있다.

## 기존 문제

Docker Hub에는 `main`, `sha-*` tag가 생성되어 있었지만 image platform이 `linux/amd64`로만 발행되어 ARM64 환경에서 pull이 실패하는 문제가 있었다.

task에 기록된 실패 메시지는 다음과 같다.

```text
no matching manifest for linux/arm64/v8 in the manifest list entries: no match for platform in manifest: not found
```

또한 K3s Deployment manifest는 `seocj/news-lab-web:latest`를 참조하지만 기존 GitHub Actions workflow는 `latest` tag를 발행하지 않았다.

추가로 frontend Ingress 초안은 이전 임시 도메인인 `newslab.site` 기준이었고, 이번 task에서 최종 frontend 도메인 기준인 `newslab.ai.kr`, `www.newslab.ai.kr`로 정리해야 했다.

## 변경 내용

- `.github/workflows/docker-build.yml`
  - QEMU setup step을 추가했다.
  - Docker metadata에 default branch용 `latest` tag 설정을 추가했다.
  - Docker build-push action에 `platforms: linux/arm64`를 추가했다.
  - pull request에서는 Docker Hub push가 발생하지 않는 기존 조건을 유지했다.
- `k8s/news-lab-web-ingress.yaml`
  - host를 `newslab.ai.kr`, `www.newslab.ai.kr`로 변경했다.
  - TLS section, cert-manager annotation, secret 설정은 추가하지 않았다.
- `docs/ARCHITECTURE.md`
  - frontend Ingress host 설명을 `newslab.ai.kr`, `www.newslab.ai.kr` 기준으로 갱신했다.
- `docs/verification/fix-frontend-docker-arm64-latest.md`
  - 실제 실행한 정적 확인 command와 결과, pending 검증을 기록했다.
- `docs/pr/fix-frontend-docker-arm64-latest.md`
  - verification 기록을 근거로 PR 초안을 작성했다.

## 구현 상세

GitHub-hosted `ubuntu-latest` runner는 기본적으로 amd64 환경이므로, ARM64 image build를 위해 Buildx 전에 QEMU를 설정했다.

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
```

Docker metadata에는 default branch에서만 `latest` tag를 생성하도록 다음 설정을 추가했다.

```yaml
type=raw,value=latest,enable={{is_default_branch}}
```

Docker build-push action에는 ARM64 platform을 지정했다.

```yaml
platforms: linux/arm64
```

push 조건은 기존 값을 유지했다.

```yaml
push: ${{ github.event_name != 'pull_request' }}
```

이 조건 때문에 pull request에서는 build 검증만 수행하고 Docker Hub push는 하지 않는다. main branch push나 tag/workflow dispatch 같은 non-PR event에서는 Docker Hub login 후 push할 수 있는 구조를 유지한다.

Ingress는 HTTP host 기준만 신규 도메인으로 정리했다.

```yaml
rules:
  - host: newslab.ai.kr
  - host: www.newslab.ai.kr
```

## 대안 검토

- `linux/amd64,linux/arm64` multi-platform image를 발행하는 방법도 가능하다. 이번 task는 ARM64 K3s 운영 환경의 pull 실패를 해결하는 것이 목표라 최소 기준인 `linux/arm64`만 지정했다.
- `latest` 대신 Deployment manifest를 `main` tag로 바꾸는 방법도 가능하다. 하지만 기존 Deployment manifest가 `latest`를 참조하고 있고 task 목표가 main push 시 `latest` 발행이므로 workflow tag 설정을 수정했다.
- TLS template을 Ingress에 미리 추가하는 제안이 있었지만 approved-fixes 문서에서 보류했다. TLS는 DNS, cert-manager, Certificate/Order/Challenge 상태 확인까지 함께 검증해야 하므로 별도 작업으로 분리한다.
- frontend backend API base URL을 `api.newslab.ai.kr`로 바꾸는 선택지도 있었지만 이번 task 범위가 아니다. `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 기존 `https://api.dev-scj.site`를 유지했다.

## 선택한 접근과 근거

task의 source of truth는 `docs/tasks/fix-frontend-docker-arm64-latest.md`다. 이 문서는 QEMU 추가, `latest` metadata tag 추가, `platforms: linux/arm64` 지정, Ingress host의 `newslab.ai.kr` 정리를 완료 조건으로 둔다.

따라서 workflow에 필요한 최소 설정만 추가했고, frontend app code는 변경하지 않았다. 승인 수정 문서에는 추가 승인 항목이 없었으므로 review 제안만으로 TLS 관련 변경은 적용하지 않았다.

## 트레이드오프

- `platforms: linux/arm64`만 지정했기 때문에 amd64 image가 필요한 환경에서는 별도 조정이 필요하다.
- GitHub Actions 실제 실행과 Docker Hub push는 로컬에서 검증할 수 없으므로, 이번 단계에서는 workflow syntax와 설정 확인까지만 완료로 기록했다.
- `latest` tag는 Deployment manifest와 맞추기 쉽지만, 운영에서 immutable tag 전략이 필요하면 `sha-*` 또는 version tag 기반 rollout 정책을 별도 설계해야 한다.
- Ingress host는 신규 도메인 기준으로 바꿨지만 DNS/TLS/HTTP 접속 검증은 수행하지 않았다.

## 테스트 및 브라우저 확인

근거는 `docs/verification/fix-frontend-docker-arm64-latest.md`다.

- `git status --short --branch`: `fix/frontend-docker-arm64-latest` branch 확인.
- `git diff -- .github/workflows/docker-build.yml`: QEMU, `latest` tag metadata, `platforms: linux/arm64`, PR push 방지 조건 확인.
- `git diff --check`: 통과.
- `cat .github/workflows/docker-build.yml`: workflow 내용 확인.
- `rg -n "newslab.site|newslab.ai.kr|www.newslab.ai.kr|api.newslab.ai.kr" k8s docs`:
  - `k8s/news-lab-web-ingress.yaml`에는 `newslab.ai.kr`, `www.newslab.ai.kr`가 사용된다.
  - `docs/ARCHITECTURE.md`의 현재 배포 기반 설명도 신규 도메인 기준이다.
  - `newslab.site` match는 과거 문서와 현재 task의 기존 도메인 설명에 남아 있으며, 현재 K8s Ingress 운영 host로는 남아 있지 않다.
- `.github/workflows/docker-build.yml` Ruby YAML parser 확인: 통과.
- `k8s/news-lab-web-ingress.yaml` Ruby YAML parser 확인: `Ingress`.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았다.
- 수동 브라우저 UI/DevTools/hydration/responsive 확인은 미수행이다.
- GitHub Actions 실행, Docker Hub tag 확인, ARM64 pull 확인은 미수행이다.

## 운영 반영

운영 반영은 수행하지 않았다.

`git push`, `git merge`, `docker push`, `kubectl apply`, `kubectl rollout`, production deploy command는 실행하지 않았다. K3s Deployment apply, Pod Running/Ready, Ingress 운영 연결, DNS/TLS, production verification은 모두 pending이다.

## README 업데이트 판단

README는 수정하지 않았다.

이번 변경은 사용자 설치/로컬 개발 흐름이 아니라 Docker image 발행 workflow와 K3s Ingress host 초안 정리에 한정된다. 검증 결과와 pending 운영 확인은 branch verification 문서에 기록하는 것이 더 적합하다고 판단했다.

## 확인 결과

- GitHub Actions workflow가 ARM64 build 전제인 QEMU와 `platforms: linux/arm64`를 포함하게 됐다.
- main/default branch에서 `latest` tag metadata가 생성되도록 설정했다.
- pull request에서는 Docker Hub push를 하지 않는 조건을 유지했다.
- frontend Ingress host 초안은 `newslab.ai.kr`, `www.newslab.ai.kr` 기준으로 정리됐다.
- frontend route/page/component/API client는 변경하지 않았다.
- loading/error/empty/search/pagination/topic/article rendering 상태는 변경하지 않았다.
- styling, responsive, accessibility, keyboard interaction은 변경하지 않았다.
- backend API code, backend Docker image, DB schema, Supabase SQL, Docker Hub 실제 secret 값, `.env`, `.env.*`는 변경하지 않았다.
- TLS template, cert-manager annotation, tls section, `news-lab-web-tls` Secret은 추가하지 않았다.

## 이번 단계의 의미

K3s ARM64 node에서 frontend image pull을 진행하기 위한 workflow 전제조건을 정리했다.

아직 실제 image 발행과 ARM64 pull 검증은 완료되지 않았지만, main branch push 이후 GitHub Actions와 Docker Hub에서 확인할 기준이 명확해졌다. 또한 frontend Ingress host 초안이 신규 도메인 기준으로 정리되어 후속 HTTP 배포와 TLS 작업으로 이어갈 수 있다.

## 포트폴리오용 요약

NewsLab Web frontend의 Docker image 발행 workflow를 ARM64 운영 환경에 맞게 조정했다. GitHub Actions에 QEMU와 `linux/arm64` build platform을 추가하고, main/default branch에서 `latest` tag가 발행되도록 metadata를 설정했다. 동시에 frontend Ingress host 초안을 `newslab.ai.kr` 기준으로 정리하되, TLS와 production rollout은 별도 검증 단계로 분리했다.

## 다음 단계 후보

- main branch push 후 GitHub Actions `Docker image` workflow 실행 확인
- Docker Hub `seocj/news-lab-web`의 `latest`, `main`, `sha-*` tag 확인
- ARM64 환경에서 `docker pull seocj/news-lab-web:latest` 확인
- `docker image inspect seocj/news-lab-web:latest --format '{{.Architecture}}/{{.Os}}'` 결과 `arm64/linux` 확인
- K3s 수동 apply/rollout 및 Pod Ready 확인
- `newslab.ai.kr` HTTP Ingress 접속 확인
- frontend TLS/cert-manager 설정 및 HTTPS 검증
- image pull 이후 browser UI, DevTools console, responsive viewport matrix 확인
