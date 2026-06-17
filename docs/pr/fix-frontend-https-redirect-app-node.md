# 프론트엔드 HTTPS 리다이렉트 및 app node 고정

## 작업 내용

NewsLab Web frontend 운영 접속 안정성을 위해 K3s frontend manifest에 HTTP -> HTTPS redirect 선언과 app workload node 고정을 추가했습니다.

이번 PR은 repository 파일 변경과 정적 검증까지만 포함합니다. 실제 K3s apply, rollout, production HTTP/HTTPS 확인, browser verification은 수행하지 않았고 pending으로 남깁니다.

## 주요 변경 사항

- `k8s/news-lab-web-redirect-https-middleware.yaml`
  - Traefik `Middleware`를 추가했습니다.
  - `redirectScheme.scheme: https`와 `permanent: true`로 HTTP 요청의 HTTPS permanent redirect를 선언했습니다.
  - apiVersion은 task에 기록된 사전 확인 기준인 `traefik.io/v1alpha1`을 사용했습니다.
- `k8s/news-lab-web-ingress.yaml`
  - 기존 cert-manager ClusterIssuer annotation과 TLS host/Secret 설정을 유지했습니다.
  - `traefik.ingress.kubernetes.io/router.middlewares: default-news-lab-web-redirect-https@kubernetescrd` annotation을 추가했습니다.
- `k8s/news-lab-web-deployment.yaml`
  - `spec.template.spec.nodeSelector.workload: app`을 추가했습니다.
  - 기존 image, `imagePullPolicy`, `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`, readiness/liveness probe는 변경하지 않았습니다.
- `docs/RUNBOOK.md`
  - redirect Middleware, app workload node 배치 정책, client dry-run, 수동 apply, HTTP redirect/HTTPS health/node 배치 확인 command를 보강했습니다.
- `docs/verification/fix-frontend-https-redirect-app-node.md`
  - 실제 실행한 정적 검증 command와 결과, pending 운영 검증을 기록했습니다.

`docs/fixes/fix-frontend-https-redirect-app-node-approved-fixes.md`에는 승인된 review fix가 없어서 별도 approved fix 적용은 없습니다.

## 프론트엔드/API 영향

- Next.js app route, page/component, shared component, API client는 변경하지 않았습니다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 값과 API contract는 변경하지 않았습니다.
- HTTP -> HTTPS redirect는 Next.js runtime 내부가 아니라 Traefik Ingress Middleware에서 처리하도록 선언했습니다.
- `nodeSelector`는 Kubernetes scheduler policy 변경이며 frontend rendering/data fetching 동작을 바꾸지 않습니다.
- Backend API code, backend K3s manifest, DB, Supabase SQL, Dockerfile, Docker image build/push workflow, `.env`, `.env.*`, 실제 secret 값은 변경하지 않았습니다.

## 상태 및 UX 영향

- Loading, error, empty, success state 로직은 변경하지 않았습니다.
- Styling, responsive CSS, accessibility, keyboard behavior는 변경하지 않았습니다.
- 운영 반영 후 기대 UX는 `http://newslab.ai.kr`와 `http://www.newslab.ai.kr` 접속이 각각 동일 host의 HTTPS URL로 자동 전환되는 것입니다.
- 이 PR에서 실제 HTTP redirect, Safari 보안 표시, Chrome/모바일 렌더링은 확인하지 않았습니다.

## README 영향

README는 변경하지 않았습니다.

이번 변경은 K3s frontend manifest와 운영 runbook 검증 절차에 해당하므로 `docs/RUNBOOK.md` 업데이트가 적절하다고 판단했습니다.

## 테스트

`docs/verification/fix-frontend-https-redirect-app-node.md`에 기록된 실제 실행 결과 기준입니다.

- `git status --short --branch`
  - branch: `fix/frontend-https-redirect-app-node`
  - 변경 및 신규 workflow 문서/manifest 상태 확인.
- `git diff --check`
  - 통과. 출력 없음.
- YAML parsing
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
  - `k8s/news-lab-web-redirect-https-middleware.yaml: Middleware`
- `git diff -- app components lib src`
  - 출력 없음. Next.js app/component/API client 경로 diff 없음.
- `git diff --stat`
  - tracked diff 기준 `docs/RUNBOOK.md`, `k8s/news-lab-web-deployment.yaml`, `k8s/news-lab-web-ingress.yaml` 변경 확인.
- `git diff -- k8s docs`
  - Runbook, Deployment nodeSelector, Ingress Middleware annotation 변경 확인.
- `sed -n '1,220p' k8s/news-lab-web-redirect-https-middleware.yaml`
  - 신규 Middleware manifest 내용 확인.
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
  - 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등을 탐지했으며 실제 secret 값은 확인되지 않았습니다.
- 범위 제한 secret pattern scan
  - `.github/workflows/docker-build.yml`의 GitHub secret 이름 reference, `k8s/news-lab-web-ingress.yaml`의 TLS Secret resource name, API client의 public env var name만 확인됐고 실제 secret 값은 확인되지 않았습니다.

## 확인 결과

- Repository 기준 구현 항목은 반영했습니다.
  - Traefik redirect Middleware manifest 추가.
  - frontend Ingress에 redirect Middleware annotation 추가.
  - frontend Deployment에 `nodeSelector: workload=app` 추가.
  - Runbook에 redirect 및 node 배치 운영 확인 command 보강.
  - Verification 문서에 실제 검증 결과 기록.
- 정적 검증 기준:
  - whitespace diff check 통과.
  - YAML parser 통과.
  - Next.js app/component/API client diff 없음.
  - 실제 secret 값 추가 없음.
- 수행하지 않은 확인:
  - Traefik Middleware CRD 실제 cluster 조회.
  - server-side dry-run.
  - K3s apply.
  - rollout 확인.
  - Pod node 배치 확인.
  - HTTP redirect 확인.
  - HTTPS 정상 유지 확인.
  - 반복 curl 안정성 확인.
  - Chrome/Safari/모바일 browser verification.

## 비고

- 이 PR은 production 리소스를 직접 변경하지 않습니다. 운영 반영은 사람이 별도 절차로 수행해야 합니다.
- `kubectl apply`, `kubectl delete`, `kubectl rollout restart`, `docker push`, `git push`, `git merge`, production deploy command는 실행하지 않았습니다.
- 운영 반영 후 pending 확인 항목:
  - `news-lab-web` Pod 2개가 `arm-worker-node`에만 배치되는지 확인.
  - `http://newslab.ai.kr` -> `https://newslab.ai.kr` redirect 확인.
  - `http://www.newslab.ai.kr` -> `https://www.newslab.ai.kr` redirect 확인.
  - 기존 HTTPS와 `/api/health` 정상 유지 확인.
  - Safari/Chrome/모바일 브라우저에서 실제 렌더링 확인.
