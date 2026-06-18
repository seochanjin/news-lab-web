# NewsLab Web Runbook

이 runbook은 로컬 프론트엔드 개발과 파일 기반 agent workflow를 다룬다. Backend, DB, K3s, Supabase, production operation은 다루지 않는다.

## 로컬 설정

`.node-version`에 선언된 Node.js 버전과 npm을 사용한다.

```bash
npm ci
```

Agent는 `.env`, `.env.*` 파일을 수정하지 않는다. 사람이 로컬 API 접근을 설정할 때 사용하는 문서화된 환경 변수명은 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`이다.

## 로컬 개발

Next.js development server를 실행한다.

```bash
npm run dev
```

기본 로컬 URL은 `http://localhost:3000`이다.

Manual browser 확인은 작업 범위에 맞게 선택한다. 일반적인 확인 항목은 다음과 같다.

- 변경한 route가 runtime error 없이 렌더링된다.
- component, routing, styling 변경이 관련 viewport width에서 정상 동작한다.
- keyboard focus, label, link, interactive control을 사용할 수 있다.
- 변경한 loading, error, empty state에 접근할 수 있고 내용을 읽을 수 있다.
- API 기반 UI가 backend 동작을 수정하지 않고 예상한 프론트엔드 contract를 사용한다.

실제로 수행한 manual check만 완료로 기록한다. Production verification 또는 deployment 완료를 주장하지 않는다.

## 프론트엔드 검증

사용 가능한 package script:

```bash
npm run lint
npm run typecheck
npm run build
```

추가 저장소 검증:

```bash
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

작업 범위와 비용에 맞는 검증을 선택한다. 실제 실행한 command와 결과만 해당 branch의 verification 문서에 기록한다.

## Docker Build 확인

Frontend container는 Next.js standalone output을 사용한다. Docker build에는 public API base URL을 build arg로 전달한다.

```bash
docker build \
  --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr \
  -t news-lab-web:local .
```

로컬에서 container를 실행한다.

```bash
docker run --rm -p 3000:3000 news-lab-web:local
```

다른 터미널에서 주요 route marker를 확인한다.

```bash
curl -I http://localhost:3000/api/health
curl -sS http://localhost:3000/api/health
curl -I http://localhost:3000
curl -sS http://localhost:3000 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
curl -sS http://localhost:3000/topics | rg "주요 이슈 아카이브|전체 주요 이슈"
curl -sS http://localhost:3000/articles | rg "기사 탐색|기사 목록"
```

`NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 browser에 노출되는 public frontend config다. Next.js는 이 값을 `next build` 시 browser bundle에 고정하므로 API target을 변경하면 image를 다시 build하고 rollout해야 한다. Deployment runtime env만 변경해도 기존 image의 browser bundle 값은 바뀌지 않는다. DB URL, token, credential, private key 같은 secret을 `NEXT_PUBLIC_*` 값에 넣지 않는다.

현재 운영 frontend API target은 `https://api.newslab.ai.kr`이다. 기존 `https://api.dev-scj.site`는 rollback과 안정화 기간의 병행 운영 대상이며 frontend 운영 build/deployment 설정에는 사용하지 않는다.

## K3s Manifest 확인

K3s manifest는 `k8s/` 아래에 둔다.

- `k8s/news-lab-web-deployment.yaml`
- `k8s/news-lab-web-service.yaml`
- `k8s/news-lab-web-ingress.yaml`

Deployment probe는 frontend process 자체 확인용 `/api/health` route를 사용한다. 이 route는 backend API, DB, 외부 네트워크를 호출하지 않는다.

Ingress는 `newslab.ai.kr`, `www.newslab.ai.kr` host와 cert-manager `letsencrypt-prod` ClusterIssuer를 사용한다. TLS Secret 이름은 `news-lab-web-tls`다. DNS, Certificate 발급, HTTPS 확인은 실제 운영 환경에서 사람이 별도로 검증해야 한다.

HTTP에서 HTTPS로의 전환은 Traefik Middleware `news-lab-web-redirect-https`로 선언한다. Ingress annotation은 `default-news-lab-web-redirect-https@kubernetescrd`를 참조한다.

Frontend app workload는 `workload=app` node에만 배치되도록 Deployment에 `nodeSelector`를 둔다. 현재 운영 라벨 기준에서 `arm-worker-node`가 app workload 대상이며, `arm-master-node`와 라벨이 없는 node는 frontend Pod 배치 대상이 아니다.

문법 확인은 client dry-run으로 수행할 수 있다.

```bash
kubectl apply --dry-run=client -f k8s/news-lab-web-deployment.yaml
kubectl apply --dry-run=client -f k8s/news-lab-web-service.yaml
kubectl apply --dry-run=client -f k8s/news-lab-web-ingress.yaml
kubectl apply --dry-run=client -f k8s/news-lab-web-redirect-https-middleware.yaml
```

Agent는 실제 운영 리소스 변경 command를 실행하지 않는다. 다음 명령은 사람이 별도 승인·절차로 수행해야 하며, agent verification에는 수행하지 않은 것으로 남긴다.

```bash
kubectl apply -f k8s/news-lab-web-redirect-https-middleware.yaml
kubectl apply -f k8s/news-lab-web-deployment.yaml
kubectl apply -f k8s/news-lab-web-service.yaml
kubectl apply -f k8s/news-lab-web-ingress.yaml
kubectl rollout status deployment/news-lab-web
```

API base URL 전환 image를 rollout한 뒤에는 사람이 다음 항목을 확인한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl rollout status deployment/news-lab-web
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get pods -l app.kubernetes.io/name=news-lab-web -o wide
curl -I https://newslab.ai.kr
curl -I https://www.newslab.ai.kr
curl -sS https://newslab.ai.kr/api/health
curl -sS https://www.newslab.ai.kr/api/health
```

브라우저에서는 `/`, `/topics`, `/articles`가 정상 렌더링되는지 확인하고 DevTools Network에서 `api.newslab.ai.kr` 요청이 있으며 `api.dev-scj.site` 요청이 없는지 확인한다.

TLS 적용 후 사람이 확인할 대표 항목은 다음과 같다. 실제 실행 전에는 완료로 기록하지 않는다.

```bash
kubectl get certificate
kubectl describe certificate news-lab-web-tls
kubectl get secret news-lab-web-tls
curl -I https://newslab.ai.kr/api/health
curl -I https://www.newslab.ai.kr
```

HTTP redirect와 node 배치 적용 후 사람이 확인할 대표 항목은 다음과 같다. 실제 실행 전에는 완료로 기록하지 않는다.

```bash
kubectl get pods -l app.kubernetes.io/name=news-lab-web -o wide
curl -I http://newslab.ai.kr
curl -I http://www.newslab.ai.kr
curl -I https://newslab.ai.kr
curl -I https://www.newslab.ai.kr
curl -sS https://newslab.ai.kr/api/health
curl -sS https://www.newslab.ai.kr/api/health
```

기대 결과는 `news-lab-web` Pod가 `workload=app` node에만 배치되고, HTTP 요청이 동일 host의 HTTPS URL로 permanent redirect되며, 기존 HTTPS와 `/api/health` 응답이 정상 유지되는 것이다.

Docker Hub push workflow는 `.github/workflows/docker-build.yml`에 초안으로 둔다. 실제 push에는 GitHub repository secrets `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` 설정이 필요하다. 실제 secret 값은 tracked file에 기록하지 않는다.

## Agent 작업 흐름

Branch용 workflow 문서를 생성한다.

```bash
scripts/new_agent_task.sh feature/<task-name> "<task title>"
```

이 script는 파일만 생성한다. Branch 생성 또는 전환, remote pull, agent 실행, 검증 실행은 하지 않는다.
현재 git branch와 입력한 `branch-name`이 다르면 workflow 문서를 생성하지 않고 종료한다.

생성하는 파일:

- `docs/tasks/<safe-branch>.md`
- `docs/pr/<safe-branch>.md`
- `docs/devlog/<safe-branch>.md`
- `docs/reviews/<safe-branch>-antigravity.md`
- `docs/reviews/<safe-branch>-coderabbit.md`
- `docs/fixes/<safe-branch>-approved-fixes.md`
- `docs/verification/<safe-branch>.md`

Branch 이름은 다음과 같이 안전한 파일명으로 변환한다.

```text
feature/article-filters -> feature-article-filters
```

기존 workflow 파일은 덮어쓰지 않는다.

현재 branch의 workflow 파일 경로를 출력한다.

```bash
scripts/agent_next_step.sh files
```

재사용 가능한 handoff prompt를 출력한다.

```bash
scripts/agent_next_step.sh codex-implement
scripts/agent_next_step.sh antigravity-review
scripts/agent_next_step.sh antigravity-review-write
scripts/agent_next_step.sh fixes-draft
scripts/agent_next_step.sh codex-apply-fixes
scripts/agent_next_step.sh pr-draft
scripts/agent_next_step.sh devlog-draft
```

`agent_next_step.sh`는 context와 prompt만 출력한다. Codex, Antigravity, CodeRabbit, GitHub, test, browser automation, production command를 실행하지 않는다.

## Workflow 문서 역할

- `docs/tasks/`: 목표, 프론트엔드 범위, 제외 항목, 예상 파일, 검증, acceptance criteria를 정의한다.
- `docs/reviews/`: finding을 기록한다. Finding만으로 코드 수정이 승인되지 않는다.
- `docs/fixes/`: candidate, approved, rejected, deferred, applied fix를 구분한다.
- `docs/verification/`: 실제 test와 manual verification 결과의 source of truth다.
- `docs/pr/`: task, diff, approved fix, verification 근거로 PR 초안을 작성한다.
- `docs/devlog/`: engineering decision과 실제 verification 근거를 기록한다.

PR과 devlog 초안은 제안된 검증을 완료된 결과로 바꾸어 쓰면 안 된다. 사람이 로그를 제공하지 않으면 deployment, production verification, PR merge는 pending으로 남긴다.

## 프론트엔드 작업 점검 목록

각 작업에서 관련 항목만 검토한다.

- Component 또는 page 동작
- App Router route와 layout 영향
- Server Component와 Client Component 경계
- API client 또는 response mapping 변경
- Loading, error, empty state
- Styling과 responsive behavior
- Accessibility와 keyboard behavior
- Browser/manual verification
- README와 architecture 문서 영향
- Backend, DB, K3s, Supabase, secret, production infrastructure 미변경
