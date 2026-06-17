# 작업: 프론트엔드 Docker ARM64 이미지 발행 설정 수정

## 목표

프론트엔드 Docker image 발행 workflow를 ARM64 운영 환경에 맞게 수정한다.

현재 `seocj/news-lab-web` Docker Hub repository에는 `main`, `sha-*` 태그가 생성되었지만, image platform이 `linux/amd64`로만 발행되어 ARM64 환경에서 pull이 실패한다.

현재 확인된 실패:

```bash
docker pull seocj/news-lab-web:main
```

결과:

```text
no matching manifest for linux/arm64/v8 in the manifest list entries: no match for platform in manifest: not found
```

NewsLab 운영 환경은 Oracle A1 ARM node와 Raspberry Pi worker를 포함한 ARM64 기반 K3s 클러스터이므로, 프론트엔드 image도 최소 `linux/arm64`로 발행되어야 한다.

또한 현재 K3s Deployment manifest는 다음 image를 사용한다.

```yaml
image: seocj/news-lab-web:latest
```

하지만 현재 GitHub Actions workflow는 `latest` 태그를 발행하지 않고 있다. 따라서 `main` branch push 시 `latest` 태그도 함께 발행되도록 수정한다.

이번 작업의 목표는 다음과 같다.

```text
1. GitHub Actions Docker build workflow에서 ARM64 image를 발행하도록 수정
2. main branch push 시 latest tag도 발행되도록 수정
3. pull_request에서는 기존처럼 build 검증만 수행하고 Docker Hub push는 하지 않음
4. K3s 실제 배포 전 image pull 전제조건 확보
```

---

## 프론트엔드 작업 범위

수정 대상은 프론트엔드 repository다.

```bash
/Users/seochanjin/workspace/NewsLab/news-lab-web
```

주요 수정 대상:

```text
.github/workflows/docker-build.yml
```

수정 방향:

### 1. QEMU 설정 추가

GitHub-hosted `ubuntu-latest` runner는 기본적으로 amd64 환경이다. ARM64 image build를 위해 Docker Buildx 전에 QEMU 설정을 추가한다.

예상 추가:

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
```

권장 위치:

```yaml
- name: Checkout
  uses: actions/checkout@v4

- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

### 2. Docker metadata에 latest 태그 추가

현재 tags 설정:

```yaml
tags: |
  type=ref,event=branch
  type=ref,event=tag
  type=sha,prefix=sha-
```

여기에 `main` branch push 시 `latest`도 발행되도록 추가한다.

```yaml
type=raw,value=latest,enable={{is_default_branch}}
```

수정 후 기대 태그:

```text
seocj/news-lab-web:main
seocj/news-lab-web:sha-<commit>
seocj/news-lab-web:latest
```

### 3. Docker build platform 지정

`docker/build-push-action@v6` 설정에 ARM64 platform을 추가한다.

```yaml
platforms: linux/arm64
```

최소 수정 기준은 `linux/arm64`다.

운영 대상:

```text
- Mac M3 local test: arm64
- Oracle A1 K3s node: arm64
- Raspberry Pi worker node: arm64
```

이번 작업에서는 운영 클러스터 기준으로 `linux/arm64` 발행을 우선한다.

---

## 변경하지 않을 항목

다음 항목은 이번 작업에서 변경하지 않는다.

```text
- Backend API code
- Backend Docker image seocj/news-api
- DB schema
- Supabase SQL
- K3s manifest 실제 apply
- Kubernetes Deployment/Service/Ingress 실제 반영
- Docker Hub 수동 push
- production infrastructure
- secret
- .env
- .env.*
- frontend route/page/component 기능
- frontend UI 디자인
- frontend API client 동작
```

다음 명령은 실행하지 않는다.

```text
git push
git merge
PR merge
docker push
kubectl apply
kubectl delete
kubectl patch
kubectl rollout
helm upgrade
DB migration
Supabase SQL 실행
production deploy command
```

GitHub Actions secret 값은 출력하거나 문서에 기록하지 않는다.

---

## 예상 변경 파일

필수:

```text
.github/workflows/docker-build.yml
```

선택:

```text
docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md
docs/verification/feature-frontend-docker-arm64-latest.md
docs/devlog/feature-frontend-docker-arm64-latest.md
docs/pr/feature-frontend-docker-arm64-latest.md
```

문서 작성 시 실제 수행하지 않은 검증은 완료로 기록하지 않는다.  
검증 문서에는 사람이 나중에 실행할 명령과 기대 결과를 분리해서 기록한다.

---

## 컴포넌트 / Route / API client 영향

이번 작업은 GitHub Actions Docker build/push workflow 수정이다.

따라서 frontend component, route, API client에는 기능 변경이 없어야 한다.

영향 없음:

```text
/
/topics
/topics/[id]
/search
/articles
/api/health
```

영향 없음:

```text
NEXT_PUBLIC_NEWSLAB_API_BASE_URL
```

현재 build arg/env는 유지한다.

```yaml
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
```

주의:

```text
api.newslab.ai.kr backend domain 전환은 이번 작업 범위가 아니다.
frontend TLS 연결도 이번 작업 범위가 아니다.
```

---

## 상태 처리

사용자-facing 상태 처리 변경은 없다.

이번 작업은 runtime UI 동작이 아니라 Docker image 발행 방식 수정이다.

변경하지 않을 항목:

```text
- loading state
- error state
- empty state
- pagination state
- search state
- topic/article rendering
```

---

## 스타일 / 반응형 / 접근성

스타일, 반응형, 접근성 변경은 없다.

변경하지 않을 항목:

```text
- CSS class
- layout
- responsive breakpoint
- semantic HTML
- color
- typography
- focus style
- keyboard interaction
```

이번 작업은 GitHub Actions workflow 수정만 포함한다.

---

## 검증 Command

### 1. 로컬 정적 확인

```bash
cd /Users/seochanjin/workspace/NewsLab/news-lab-web

git status --short --branch
git diff -- .github/workflows/docker-build.yml
git diff --check
```

기대:

```text
.github/workflows/docker-build.yml에만 의도한 workflow 수정이 포함됨
trailing whitespace 없음
```

### 2. workflow 내용 확인

```bash
cat .github/workflows/docker-build.yml
```

확인할 항목:

```text
docker/setup-qemu-action@v3 추가됨
docker/setup-buildx-action@v3 유지됨
docker/build-push-action@v6 유지됨
platforms: linux/arm64 추가됨
latest tag 발행 설정 추가됨
pull_request에서는 push하지 않음
main push에서는 Docker Hub push 수행
```

확인할 핵심 설정:

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
```

```yaml
type=raw,value=latest,enable={{is_default_branch}}
```

```yaml
platforms: linux/arm64
```

```yaml
push: ${{ github.event_name != 'pull_request' }}
```

### 3. GitHub Actions 확인

사람이 push한 뒤 GitHub UI에서 확인한다.

```text
GitHub repository
→ Actions
→ Docker image workflow
→ main branch run
```

기대:

```text
workflow 성공
Docker Hub login 성공
Docker buildx build 성공
Docker Hub push 성공
```

### 4. Docker Hub tag 확인

Docker Hub UI에서 확인한다.

```text
seocj/news-lab-web
→ Tags
```

기대 태그:

```text
latest
main
sha-<commit>
```

각 태그의 OS/ARCH 기대:

```text
linux/arm64
```

### 5. 로컬 pull 검증

GitHub Actions 성공 후 사람이 실행한다.

```bash
docker pull seocj/news-lab-web:latest
```

기대:

```text
pull 성공
no matching manifest for linux/arm64/v8 오류 없음
```

platform 확인:

```bash
docker image inspect seocj/news-lab-web:latest \
  --format '{{.Architecture}}/{{.Os}}'
```

기대:

```text
arm64/linux
```

추가 확인:

```bash
docker pull seocj/news-lab-web:main

docker image inspect seocj/news-lab-web:main \
  --format '{{.Architecture}}/{{.Os}}'
```

기대:

```text
arm64/linux
```

---

## 수동 브라우저 검증

이번 작업은 Docker image 발행 workflow 수정이므로 브라우저 검증은 필수 완료 조건이 아니다.

다만 image pull 이후 컨테이너를 직접 실행한 경우에만 아래를 기록한다.

```bash
docker run --rm -p 3000:3000 seocj/news-lab-web:latest
```

다른 터미널:

```bash
curl -I http://localhost:3000
curl -I http://localhost:3000/api/health
curl -sS http://localhost:3000/api/health
```

기대:

```text
/           → HTTP 200
/api/health → HTTP 200
```

기대 JSON:

```json
{ "status": "ok", "service": "news-lab-web" }
```

route marker 확인:

```bash
curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"
curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"
```

주의:

```text
이 검증을 수행하지 않았다면 완료 기록에 포함하지 않는다.
```

---

## 완료 조건

이번 작업의 완료 조건은 다음과 같다.

```text
- .github/workflows/docker-build.yml에 QEMU 설정이 추가됨
- docker/build-push-action에 platforms: linux/arm64 설정이 추가됨
- main branch push 시 latest tag가 발행되도록 metadata tags가 수정됨
- pull_request에서는 Docker Hub push가 발생하지 않음
- GitHub Actions main run 성공
- Docker Hub seocj/news-lab-web에 latest tag 생성
- docker pull seocj/news-lab-web:latest 성공
- image inspect 결과 arm64/linux 확인
```

이번 작업에서 완료로 주장하지 않을 항목:

```text
- K3s Deployment apply 완료
- Pod Running/Ready
- Ingress 연결 완료
- http://newslab.ai.kr 접속 완료
- https://newslab.ai.kr TLS 완료
- cert-manager certificate 발급 완료
```

위 항목은 후속 작업에서 실제 수행 후 기록한다.

---

## 참고 사항

현재 backend는 하나의 manifest 파일에서 Deployment/Service/Ingress/TLS를 함께 관리한 이력이 있다.

예시 backend 구성:

```text
news-api Deployment
news-api Service
news-api Ingress
cert-manager.io/cluster-issuer: letsencrypt-prod
tls:
  hosts:
    - api.dev-scj.site
  secretName: news-api-tls
```

하지만 frontend는 현재 TLS 작업 전 단계다.

이번 작업은 frontend K3s 배포도 아니고 TLS 연결도 아니다.  
Docker Hub에 ARM64 image와 latest tag를 정상 발행하여, 후속 K3s 배포가 가능한 상태를 만드는 전제조건 수정이다.

후속 작업 권장 순서:

```text
1. Frontend Docker ARM64 및 latest 태그 발행 수정
2. Frontend K3s HTTP 배포 및 newslab.ai.kr 검증
3. Frontend newslab.ai.kr TLS 연결
```

향후 frontend TLS 작업에서는 backend와 유사하게 Ingress에 아래 항목을 추가할 수 있다.

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod

spec:
  tls:
    - hosts:
        - newslab.ai.kr
        - www.newslab.ai.kr
      secretName: news-lab-web-tls
```

단, 이 TLS 변경은 이번 작업 범위에 포함하지 않는다.

## 추가 배경: Frontend Ingress 도메인 변경

기존 frontend Ingress 초안은 임시 도메인인 `newslab.site` 기준으로 작성되어 있었다.

하지만 NewsLab 프로젝트의 최종 도메인을 다음으로 확정했다.

```text
newslab.ai.kr
```

따라서 frontend Ingress host도 기존 `newslab.site` 기준이 아니라 신규 도메인 기준으로 변경한다.

최종 frontend 도메인 구조:

```text
newslab.ai.kr      → frontend
www.newslab.ai.kr  → frontend
```

이번 작업에서 확인 또는 반영할 frontend Ingress 기준:

```yaml
rules:
  - host: newslab.ai.kr
  - host: www.newslab.ai.kr
```

주의:

```text
- TLS section은 이번 작업에서 추가하지 않는다.
- https://newslab.ai.kr 검증은 이번 작업 범위가 아니다.
- 이번 작업에서는 HTTP Ingress host 기준만 newslab.ai.kr로 정리한다.
- api.newslab.ai.kr backend 전환은 이번 작업 범위가 아니다.
- frontend의 NEXT_PUBLIC_NEWSLAB_API_BASE_URL은 아직 https://api.dev-scj.site를 유지한다.
```

## 예상 변경 파일 추가

Docker image 발행 설정 외에 다음 파일도 변경 대상에 포함될 수 있다.

```text
k8s/news-lab-web-ingress.yaml
```

변경 내용:

```text
기존 host:
- newslab.site
- www.newslab.site

변경 host:
- newslab.ai.kr
- www.newslab.ai.kr
```

문서에 기존 도메인 기준 설명이 남아 있다면 함께 정리한다.

확인 명령:

```bash
rg -n "newslab.site|newslab.ai.kr|www.newslab.ai.kr|api.newslab.ai.kr" k8s docs
```

기대:

```text
- k8s/news-lab-web-ingress.yaml에는 newslab.ai.kr, www.newslab.ai.kr가 사용됨
- newslab.site는 더 이상 운영 기준 도메인으로 남아 있지 않음
- api.newslab.ai.kr은 후속 backend domain 전환 후보로만 언급됨
```

## 변경하지 않을 항목 추가

도메인 변경과 관련해 이번 작업에서 변경하지 않을 항목:

```text
- frontend TLS 설정
- cert-manager annotation
- Ingress tls section
- news-lab-web-tls Secret
- backend Ingress host
- api.dev-scj.site 제거
- api.newslab.ai.kr backend 연결
- DNS provider 설정
- 가비아 DNS record 직접 변경
```

## 완료 조건 추가

도메인 변경 관련 완료 조건:

```text
- k8s/news-lab-web-ingress.yaml의 host가 newslab.ai.kr, www.newslab.ai.kr 기준으로 정리됨
- newslab.site가 운영 Ingress host로 남아 있지 않음
- TLS/HTTPS는 완료로 기록하지 않음
- backend API base URL은 기존 https://api.dev-scj.site 유지
```
