# 프론트엔드 HTTPS 리다이렉트 및 app node 고정

## 작업 목적

NewsLab Web frontend의 운영 접속 안정성을 개선하기 위해 HTTP 요청을 HTTPS로 전환하는 Ingress 앞단 설정을 추가하고, frontend Pod가 app workload node에만 배치되도록 K3s manifest를 정리했다.

이번 단계는 repository 변경과 정적 검증까지가 범위다. 실제 K3s apply, rollout, production HTTP/HTTPS 확인, browser verification은 수행하지 않았고 verification 문서에 pending으로 남겼다.

## 기존 문제

이전 TLS 작업 이후 `https://newslab.ai.kr`, `https://www.newslab.ai.kr` 접속 자체는 가능해졌지만, task 기준으로 HTTP 접속이 HTTPS로 자동 전환되지 않는 문제가 남아 있었다. Safari 등 일부 브라우저에서는 scheme 없이 도메인을 입력할 때 HTTP로 접근하면서 보안 경고가 보일 수 있다.

또한 task에 기록된 운영 확인 기준에서는 `news-lab-web` Pod가 `arm-master-node`, `arm-worker-node`에 각각 배치된 상태였다. frontend app workload는 backend `news-api`와 동일하게 `workload=app` node에만 배치해야 하므로 scheduler 정책을 manifest에 명시할 필요가 있었다.

## 변경 내용

- `k8s/news-lab-web-redirect-https-middleware.yaml`
  - Traefik `Middleware` manifest를 추가했다.
  - HTTP 요청을 HTTPS로 permanent redirect하도록 `redirectScheme`을 선언했다.
- `k8s/news-lab-web-ingress.yaml`
  - 기존 cert-manager ClusterIssuer annotation과 TLS host/Secret 설정을 유지했다.
  - `default-news-lab-web-redirect-https@kubernetescrd` Middleware annotation을 추가했다.
- `k8s/news-lab-web-deployment.yaml`
  - `spec.template.spec.nodeSelector.workload: app`을 추가했다.
  - image, API base URL, readiness/liveness probe는 변경하지 않았다.
- `docs/RUNBOOK.md`
  - redirect Middleware, node 배치 정책, client dry-run, 사람이 수행할 apply/HTTP/HTTPS/node 배치 확인 command를 보강했다.
- `docs/verification/fix-frontend-https-redirect-app-node.md`
  - 실제 실행한 정적 검증과 pending 운영 검증을 기록했다.
- `docs/pr/fix-frontend-https-redirect-app-node.md`
  - verification 기록을 근거로 PR 초안을 작성했다.

`docs/fixes/fix-frontend-https-redirect-app-node-approved-fixes.md`에는 승인된 review fix가 없어서 별도 승인 수정 적용은 없었다.

## 구현 상세

HTTP -> HTTPS 전환은 Next.js app 내부 redirect가 아니라 Traefik Ingress Middleware로 처리하도록 했다.

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: news-lab-web-redirect-https
spec:
  redirectScheme:
    scheme: https
    permanent: true
```

Ingress에는 `default` namespace의 Middleware를 Traefik CRD reference 형식으로 연결했다.

```yaml
traefik.ingress.kubernetes.io/router.middlewares: default-news-lab-web-redirect-https@kubernetescrd
```

Deployment에는 Pod template spec 아래에 node 배치 제약을 추가했다.

```yaml
spec:
  template:
    spec:
      nodeSelector:
        workload: app
      containers:
        - name: news-lab-web
```

이번 작업은 Kubernetes manifest와 운영 문서 변경이므로 다음 frontend application 영역은 변경하지 않았다.

- App Router route
- page/layout component
- shared component
- API client
- data fetching
- loading/error/empty/success state
- Tailwind styling
- responsive behavior
- accessibility와 keyboard behavior

## 대안 검토

Next.js `redirects`, route handler, middleware/proxy로 HTTP -> HTTPS를 처리하는 대안도 생각할 수 있지만, 이번 문제는 public Ingress 앞단에서 들어오는 scheme 처리 문제다. self-hosted Next.js 앞에 reverse proxy/Ingress를 두는 구조에서는 redirect를 Traefik에서 처리하는 편이 app 코드와 브라우저 대상 rendering 로직을 건드리지 않고 목적을 달성한다.

Pod 배치 역시 app 코드나 Docker image 변경이 아니라 Kubernetes scheduler policy 문제이므로 Deployment manifest의 `nodeSelector`가 가장 직접적인 변경이다.

`nodeAffinity`를 사용하는 방법도 있지만, 현재 task의 node label 정책은 단순히 `workload=app`에 고정하는 것이다. 더 복잡한 affinity를 도입할 필요는 없었다.

Docker image tag를 immutable tag로 바꾸는 대안은 task에 장기 후보로만 남아 있고 이번 범위가 아니므로 적용하지 않았다.

## 선택한 접근과 근거

선택한 접근은 Traefik Middleware + Ingress annotation + Deployment `nodeSelector`다.

근거는 다음과 같다.

- task가 명시한 expected manifest와 resource 이름을 그대로 따른다.
- HTTP -> HTTPS redirect는 Ingress layer의 책임으로 두어 Next.js app code 변경을 피한다.
- `nodeSelector: workload=app`은 현재 task에 기록된 node label 기준과 일치한다.
- 기존 TLS host, TLS Secret, cert-manager ClusterIssuer, frontend API base URL, health probe를 유지해 변경 범위를 줄였다.
- 운영 반영 전에는 apply/rollout/production verification 완료를 주장하지 않는 규칙을 지켰다.

## 트레이드오프

Middleware manifest와 Ingress annotation을 추가해 repository에는 redirect 의도가 명확히 표현됐지만, 실제 redirect 동작은 cluster에 apply된 뒤에만 확인할 수 있다. 따라서 repository 기준 정적 검증은 완료됐지만 HTTP 301/308 응답은 아직 확인되지 않았다.

`nodeSelector`는 단순하고 검토하기 쉽지만, `workload=app` node가 충분하지 않거나 라벨이 잘못되면 Pod scheduling에 영향을 줄 수 있다. 이 위험은 운영 반영 후 `kubectl get pods -o wide`와 rollout 확인으로 검증해야 한다.

이번 작업은 UI 코드 변경이 없으므로 `npm run build` 같은 Next.js build 검증보다 manifest YAML parsing, diff 범위 확인, secret scan을 우선했다.

## 테스트 및 브라우저 확인

verification 문서 기준으로 실제 실행한 검증은 다음과 같다.

- `git status --short --branch`
  - branch와 변경 파일 상태를 확인했다.
- `git diff --check`
  - 통과. 출력 없음.
- YAML parsing
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
  - `k8s/news-lab-web-redirect-https-middleware.yaml: Middleware`
- `git diff -- app components lib src`
  - 출력 없음. Next.js app/component/API client 경로 diff 없음.
- `git diff --stat`, `git diff -- k8s docs`
  - Runbook, Deployment `nodeSelector`, Ingress Middleware annotation 변경을 확인했다.
- `sed -n '1,220p' k8s/news-lab-web-redirect-https-middleware.yaml`
  - 신규 Middleware manifest 내용을 확인했다.
- secret pattern scan
  - 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등이 탐지됐지만 실제 secret 값은 확인되지 않았다.

브라우저 검증은 수행하지 않았다. Chrome, Safari, 모바일 브라우저에서 HTTP redirect, HTTPS 렌더링, 홈/`/topics`/`/articles` 표시를 직접 확인하지 않았다.

## 운영 반영

운영 반영은 수행하지 않았다.

실행하지 않은 command와 확인 항목은 pending이다.

- Traefik Middleware CRD 실제 cluster 조회
- server-side dry-run
- K3s apply
- `news-lab-web` rollout 확인
- Pod 2개가 `arm-worker-node`에만 배치되는지 확인
- `http://newslab.ai.kr` -> `https://newslab.ai.kr` redirect 확인
- `http://www.newslab.ai.kr` -> `https://www.newslab.ai.kr` redirect 확인
- 기존 HTTPS와 `/api/health` 정상 유지 확인
- 반복 curl 안정성 확인
- Safari/Chrome/모바일 browser verification

## README 업데이트 판단

README는 변경하지 않았다.

이번 변경은 사용자 로컬 개발 절차나 일반 프로젝트 소개보다 K3s frontend manifest와 운영 확인 절차에 가깝다. 따라서 README보다 `docs/RUNBOOK.md`에 redirect, node 배치, pending 운영 검증 command를 보강하는 것이 적절하다고 판단했다.

## 확인 결과

Repository 기준으로는 task의 구현 항목을 반영했다.

- Traefik redirect Middleware manifest 추가
- frontend Ingress Middleware annotation 추가
- frontend Deployment `nodeSelector: workload=app` 추가
- Runbook 운영 확인 command 보강
- Verification 문서에 실제 실행 결과와 pending 항목 기록
- PR 초안 작성

확인된 정적 결과는 다음과 같다.

- whitespace diff check 통과
- YAML parser 통과
- Next.js app/component/API client diff 없음
- 실제 secret 값 추가 없음

변경하지 않은 영역은 다음과 같다.

- Backend API code
- backend K3s manifest
- DB schema
- Supabase SQL
- Dockerfile
- Docker image build/push workflow
- Docker image tag 정책
- frontend API base URL
- `.env`, `.env.*`
- 실제 secret 값
- UI route/component/styling/state/accessibility/responsive behavior

## 이번 단계의 의미

이 단계는 HTTPS 운영 경험에서 남은 두 가지 운영 안정성 문제를 manifest 수준에서 정리한 단계다.

첫째, 사용자가 HTTP로 접근해도 동일 host의 HTTPS endpoint로 전환되도록 Ingress 앞단의 redirect 정책을 선언했다. 둘째, frontend Pod가 infra/master node에 배치되지 않도록 app workload node 기준을 명시했다.

다만 실제 사용자가 체감하는 redirect와 node 배치 효과는 cluster 반영 이후에만 검증된다. 이번 devlog는 repository 준비와 정적 검증 완료를 기록하며, production 반영 완료를 의미하지 않는다.

## 포트폴리오용 요약

NewsLab Web frontend K3s manifest에 Traefik Middleware 기반 HTTP -> HTTPS permanent redirect를 추가하고, frontend Deployment가 `workload=app` node에만 배치되도록 `nodeSelector`를 선언했다. Next.js app code와 API client는 변경하지 않고 Ingress/scheduler layer에서 문제를 해결하도록 범위를 분리했으며, YAML parsing, diff 범위 확인, secret scan으로 repository 기준 검증을 수행했다. 실제 K3s apply, rollout, production HTTP/HTTPS, browser verification은 운영 단계 pending으로 분리했다.

## 다음 단계 후보

- Traefik Middleware CRD 확인과 server-side dry-run 수행
- K3s apply 후 rollout 확인
- Pod node 배치가 `arm-worker-node`로 고정됐는지 확인
- HTTP -> HTTPS redirect의 301/308 응답과 `Location` header 확인
- 기존 HTTPS home route와 `/api/health` 정상 유지 확인
- 반복 curl로 안정성 확인
- Safari, Chrome, 모바일 브라우저 수동 확인
- backend `api.newslab.ai.kr` 전환 검토
- frontend API base URL을 `api.newslab.ai.kr`로 전환 검토
- Docker image tag를 `latest`에서 immutable tag로 전환 검토
