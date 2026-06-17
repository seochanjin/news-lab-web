# 작업: Frontend Docker/K3s 배포 기반 구성

## 목표

NewsLab Web frontend를 K3s 클러스터에서 운영할 수 있도록 Docker/K8s/GitHub Actions 배포 기반을 구성한다.

이번 작업의 목표는 실제 운영 배포가 아니라, 다음 단계를 위한 배포 구성 파일을 준비하고 로컬에서 검증하는 것이다.

구성 목표:

```text
news-lab-web
→ Docker image build 가능
→ Docker Hub push workflow 초안 준비
→ K3s Deployment/Service/Ingress manifest 초안 준비
→ 추후 사람이 수동으로 apply/rollout 가능
```

프론트엔드 서비스는 Next.js standalone output 기반으로 컨테이너 실행할 수 있게 구성한다.

초기 frontend는 기존 backend API를 계속 사용한다.

```text
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
```

도메인 연결은 이번 작업에서 수행하지 않는다.  
`newslab.site`, `www.newslab.site`, `api.newslab.site` 연결은 별도 task에서 진행한다.

## 프론트엔드 작업 범위

작업 repo:

```text
~/workspace/news-lab-web
```

작업 branch:

```text
feature/frontend-deployment-baseline
```

작업 범위:

```text
- Next.js standalone output 설정 확인 또는 추가
- Dockerfile 추가
- .dockerignore 추가
- Docker image build가 가능한지 로컬 검증
- GitHub Actions Docker image build/push workflow 추가 또는 초안 작성
- K3s Deployment manifest 추가
- K3s Service manifest 추가
- K3s Ingress manifest 추가
- docs/ARCHITECTURE.md에 frontend 배포 구조 반영
- docs/RUNBOOK.md에 frontend Docker/K3s 검증 및 수동 배포 절차 추가
- verification 문서에 실제 실행한 검증 command와 결과 기록
```

Docker image 이름 후보:

```text
seocj/news-lab-web:latest
```

K8s resource 이름 후보:

```text
Deployment: news-lab-web
Service: news-lab-web
Ingress: news-lab-web-ingress
container: news-lab-web
container port: 3000
```

초기 Ingress host 후보는 manifest에 명시하되, 실제 DNS/TLS 연결은 하지 않는다.

```text
newslab.site
www.newslab.site
```

또는 적용 전 검토용으로 주석 처리해도 된다.

## 변경하지 않을 항목

다음 항목은 변경하지 않는다.

```text
- Backend API code
- DB
- Supabase SQL
- K3s 운영 리소스 직접 적용
- Docker Hub 실제 secret 값
- production infrastructure
- secret
- .env
- .env.*
- backend repo
```

다음 명령은 실행하지 않는다.

```text
- git push
- git merge
- kubectl apply
- kubectl delete
- kubectl patch
- kubectl rollout
- helm upgrade
- production deploy command
- production-impacting command
```

이번 작업에서 에이전트는 배포 파일을 작성하고 로컬 검증까지만 수행한다.  
실제 운영 반영은 사람이 별도 단계에서 수행한다.

## 예상 변경 파일

예상 변경 파일:

```text
Dockerfile
.dockerignore
next.config.ts
.github/workflows/docker-build.yml
k8s/news-lab-web-deployment.yaml
k8s/news-lab-web-service.yaml
k8s/news-lab-web-ingress.yaml
docs/ARCHITECTURE.md
docs/RUNBOOK.md
docs/tasks/feature-frontend-deployment-baseline.md
docs/verification/feature-frontend-deployment-baseline.md
docs/reviews/feature-frontend-deployment-baseline-antigravity.md
docs/reviews/feature-frontend-deployment-baseline-coderabbit.md
docs/fixes/feature-frontend-deployment-baseline-approved-fixes.md
docs/pr/feature-frontend-deployment-baseline.md
docs/devlog/feature-frontend-deployment-baseline.md
```

실제 프로젝트 구조에 따라 파일명은 조정할 수 있다.

주의:

```text
- 기존 frontend route/component/API client를 불필요하게 수정하지 않는다.
- Docker/K8s 배포 기반 구성에 필요한 파일만 추가/수정한다.
```

## 컴포넌트 / Route / API client 영향

이번 작업은 배포 기반 구성 작업이다.  
기존 route, component, API client 동작은 변경하지 않는다.

유지해야 할 route:

```text
/
 /topics
/topics/[id]
/search
/articles
```

유지해야 할 API mapping:

```text
/             → GET /topics/home
/topics       → GET /topics
/topics/[id]  → GET /topics/{id}
/search       → 기존 통합 검색 구조
/articles     → Articles API
```

`NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 값은 기존과 동일하게 사용한다.

```text
https://api.dev-scj.site
```

Docker build 시에도 이 public environment value가 반영되어야 한다.

권장 방식:

```text
- Dockerfile build stage에서 NEXT_PUBLIC_NEWSLAB_API_BASE_URL build arg/env 처리
- GitHub Actions에서 NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site 지정
```

주의:

```text
NEXT_PUBLIC_* 값은 browser에 노출되는 public config다.
DB URL, API key, token, secret 값은 절대 NEXT_PUBLIC_*에 넣지 않는다.
```

## 상태 처리

이번 작업은 UI 상태 처리 변경이 목적이 아니다.

기존 상태 처리를 유지한다.

```text
- home loading/error/empty/success 유지
- topics archive 상태 유지
- topic detail 상태 유지
- search 상태 유지
- articles 상태 유지
```

Docker/K3s 배포 기반 구성으로 인해 runtime에서 기존 UI 상태가 깨지지 않아야 한다.

컨테이너 실행 시 확인할 상태:

```text
- Next.js server가 port 3000에서 정상 기동
- / 요청이 200 응답
- /topics, /articles 등 주요 route가 200 응답
- API base URL 미설정으로 build/runtime 실패하지 않음
```

## 스타일 / 반응형 / 접근성

이번 작업은 디자인 변경 작업이 아니다.

변경하지 않을 항목:

```text
- Tailwind style
- PageShell/layout
- Header/navigation
- TopicCard style
- ArticleList style
- responsive layout
- accessibility label/focus style
```

Docker/K3s 배포 기반 파일 추가로 인해 UI markup이나 스타일이 변경되지 않아야 한다.

브라우저 수동 검증을 수행하는 경우 다음을 확인한다.

```text
- 홈 주요 이슈 카드 표시
- topic detail 이동
- archive 표시
- search 표시
- articles 표시
- console runtime error/hydration mismatch 없음
```

responsive matrix는 이번 task의 필수 조건은 아니다. 수행하지 않으면 verification에 미수행으로 기록한다.

## 검증 Command

기본 frontend 검증:

```bash
npm run lint
npm run typecheck
npm run build
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build
git diff --check
```

script syntax 검증:

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
```

Docker build 검증:

```bash
docker build \
  --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site \
  -t news-lab-web:local .
```

Docker image 실행 검증:

```bash
docker run --rm -p 3000:3000 news-lab-web:local
```

다른 터미널에서:

```bash
curl -I http://localhost:3000
curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"
curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"
```

K8s manifest 정적 확인:

```bash
kubectl apply --dry-run=client -f k8s/news-lab-web-deployment.yaml
kubectl apply --dry-run=client -f k8s/news-lab-web-service.yaml
kubectl apply --dry-run=client -f k8s/news-lab-web-ingress.yaml
```

주의:

```text
dry-run=client는 manifest 문법 검증용이다.
실제 kubectl apply는 실행하지 않는다.
```

secret scan:

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

검증 결과는 `docs/verification/feature-frontend-deployment-baseline.md`에 실제 실행 결과만 기록한다.

## 수동 브라우저 검증

가능하면 local Docker container 또는 local dev server에서 브라우저 검증을 수행한다.

확인 route:

```text
http://localhost:3000
http://localhost:3000/topics
http://localhost:3000/topics/13
http://localhost:3000/search?query=중동
http://localhost:3000/articles
```

확인 항목:

```text
- / 홈 주요 이슈 카드 표시
- 홈 topic card 클릭 시 /topics/{id} 이동
- /topics archive 표시
- /topics/{id} detail 및 연결 기사 표시
- /search?query=중동 통합 검색 결과 표시
- /articles 원문 기사 목록 표시
- DevTools Console에 API 전환 또는 Docker runtime으로 인한 runtime error 없음
- hydration mismatch 없음
```

수동 브라우저 검증을 수행하지 못하면 verification에 “미수행”으로 명시한다.

responsive viewport matrix는 이번 task의 필수 조건이 아니다.  
수행하지 않았으면 “mobile/tablet/desktop responsive matrix 미수행”으로 기록한다.

## 완료 조건

완료 조건:

```text
- Next.js standalone output 기반 Dockerfile이 추가되어 있다.
- .dockerignore가 추가되어 불필요한 파일이 image build context에 포함되지 않는다.
- Docker build가 local에서 성공한다.
- Docker container가 port 3000에서 기동한다.
- container 기준 /, /topics, /articles 등 주요 route가 응답한다.
- GitHub Actions Docker image build/push workflow가 추가되어 있다.
- workflow에는 public API base URL만 포함되고 secret 값은 포함되지 않는다.
- K3s Deployment/Service/Ingress manifest 초안이 추가되어 있다.
- manifest는 news-lab-web frontend service를 port 3000으로 노출하는 구조다.
- manifest 문법 검증 또는 dry-run 검증이 수행되어 있다.
- 기존 route/component/API client 동작을 불필요하게 변경하지 않았다.
- docs/ARCHITECTURE.md에 frontend 배포 구조가 반영되어 있다.
- docs/RUNBOOK.md에 frontend Docker/K3s 수동 배포 절차가 추가되어 있다.
- npm run lint가 통과한다.
- npm run typecheck가 통과한다.
- npm run build가 통과한다.
- git diff --check가 통과한다.
- 검증 문서에 실제 실행 command와 결과가 기록되어 있다.
- backend, DB, Supabase SQL, K3s 운영 리소스, Docker Hub secret, production infra, .env*는 수정하지 않았다.
- git push, git merge, kubectl apply, kubectl rollout, production deploy command는 실행하지 않았다.
```

## 참고 사항

현재 backend API는 다음 주소를 사용한다.

```text
https://api.dev-scj.site
```

48차 frontend 배포 기반에서도 이 값을 유지한다.

```text
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
```

도메인 전략은 다음과 같다.

```text
newslab.site       → frontend
www.newslab.site   → frontend
api.newslab.site   → backend API
```

단, `api.newslab.site` 전환은 이번 작업에서 하지 않는다.  
초기 frontend는 `api.dev-scj.site`를 계속 바라본다.

`newslab.site` 하나만 구입하면 `api.newslab.site`, `www.newslab.site`는 DNS에서 만드는 subdomain이다. 별도 도메인 구매가 아니다.

이번 작업 이후 후속 단계 후보:

```text
49차: frontend K3s 수동 배포 및 운영 검증
50차: newslab.site / www.newslab.site 도메인 및 TLS 연결
51차: api.newslab.site backend 도메인 추가 검토
52차 이후: backend embedding 저장 구조 검토
```

주의:

```text
이번 task에서는 실제 운영 배포를 완료했다고 주장하지 않는다.
실제 운영 반영은 사람이 별도 절차로 kubectl apply/rollout 및 DNS/TLS 검증을 수행한 뒤 기록한다.
```
