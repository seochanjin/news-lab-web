# 검증 기록: 프론트엔드 HTTPS 리다이렉트 및 app node 고정

## 검증 범위

- Branch: `fix/frontend-https-redirect-app-node`
- Repository 파일 변경과 정적 검증만 수행했다.
- 실제 K3s apply, rollout, production HTTP/HTTPS 확인, browser verification은 수행하지 않았다.
- Next.js application code, route, component, API client, styling, loading/error/empty state는 변경하지 않았다.
- Backend API code, DB, Supabase SQL, backend manifest, Dockerfile, Docker image build/push workflow, `.env`, `.env.*`, 실제 secret 값은 변경하지 않았다.

## 실행한 Command

```bash
git status --short --branch
```

```bash
git diff --check
```

```bash
ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); puts "#{f}: #{docs.map { |d| d["kind"] }.compact.join(", ")}" }' k8s/news-lab-web-deployment.yaml k8s/news-lab-web-service.yaml k8s/news-lab-web-ingress.yaml k8s/news-lab-web-redirect-https-middleware.yaml
```

```bash
git diff -- app components lib src
```

```bash
git diff --stat
```

```bash
git diff -- k8s docs
```

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" -- k8s app components lib next.config.ts Dockerfile .github
```

```bash
sed -n '1,220p' k8s/news-lab-web-redirect-https-middleware.yaml
```

```bash
git diff -- k8s/news-lab-web-deployment.yaml k8s/news-lab-web-ingress.yaml docs/RUNBOOK.md
```

## 결과

- `git status --short --branch`
  - 현재 branch: `fix/frontend-https-redirect-app-node`
  - Modified:
    - `docs/RUNBOOK.md`
    - `k8s/news-lab-web-deployment.yaml`
    - `k8s/news-lab-web-ingress.yaml`
  - Untracked:
    - `k8s/news-lab-web-redirect-https-middleware.yaml`
    - branch workflow 문서들:
      - `docs/tasks/fix-frontend-https-redirect-app-node.md`
      - `docs/verification/fix-frontend-https-redirect-app-node.md`
      - `docs/pr/fix-frontend-https-redirect-app-node.md`
      - `docs/devlog/fix-frontend-https-redirect-app-node.md`
      - `docs/fixes/fix-frontend-https-redirect-app-node-approved-fixes.md`
      - `docs/reviews/fix-frontend-https-redirect-app-node-antigravity.md`
      - `docs/reviews/fix-frontend-https-redirect-app-node-coderabbit.md`
- `git diff --check`: 통과. 출력 없음.
- YAML parsing: 통과.
  - `k8s/news-lab-web-deployment.yaml: Deployment`
  - `k8s/news-lab-web-service.yaml: Service`
  - `k8s/news-lab-web-ingress.yaml: Ingress`
  - `k8s/news-lab-web-redirect-https-middleware.yaml: Middleware`
- `git diff -- app components lib src`: 출력 없음. Next.js app/component/API client 경로 diff 없음.
- `git diff --stat`: tracked diff 기준으로 `docs/RUNBOOK.md`, `k8s/news-lab-web-deployment.yaml`, `k8s/news-lab-web-ingress.yaml`에 23 lines inserted. 신규 untracked Middleware 파일은 `git diff --stat`에 포함되지 않았다.
- `git diff -- k8s docs`: tracked diff 기준으로 다음 변경 확인.
  - `docs/RUNBOOK.md`: Traefik Middleware, `nodeSelector`, client dry-run, apply 금지 command, HTTP redirect/node 배치/HTTPS health 확인 command 보강.
  - `k8s/news-lab-web-deployment.yaml`: `spec.template.spec.nodeSelector.workload: app` 추가.
  - `k8s/news-lab-web-ingress.yaml`: `traefik.ingress.kubernetes.io/router.middlewares: default-news-lab-web-redirect-https@kubernetescrd` 추가.
- `sed -n '1,220p' k8s/news-lab-web-redirect-https-middleware.yaml`: 신규 Middleware 내용 확인.
  - `apiVersion: traefik.io/v1alpha1`
  - `kind: Middleware`
  - `metadata.name: news-lab-web-redirect-https`
  - `spec.redirectScheme.scheme: https`
  - `spec.redirectScheme.permanent: true`
- 전체 `git grep` secret pattern scan:
  - 문서, ignore rule, GitHub secret 이름 reference, 환경 변수명 reference, TLS Secret resource 이름, `package-lock.json`의 `js-tokens` package name 등을 탐지했다.
  - 실제 secret 값, token 값, private key 값은 확인되지 않았다.
- 범위 제한 secret pattern scan:
  - `.github/workflows/docker-build.yml`: GitHub secret 이름 reference `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
  - `k8s/news-lab-web-ingress.yaml`: Kubernetes TLS Secret resource name `news-lab-web-tls`
  - `lib/api/articles.ts`, `lib/api/topics.ts`: public env var name `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`
  - 실제 secret 값은 확인되지 않았다.

## 수동 브라우저 검증

- 수행하지 않았다.
- Chrome, Safari, 모바일 브라우저에서 `http://newslab.ai.kr`, `http://www.newslab.ai.kr`, `https://newslab.ai.kr`, `https://www.newslab.ai.kr`를 직접 확인하지 않았다.

## 대기 중인 검증

- Traefik Middleware CRD 확인:
  - `KUBECONFIG=~/.kube/oci-k3s.yaml kubectl api-resources | rg -i "middleware|traefik"`
- server-side dry-run:
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-redirect-https-middleware.yaml`
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-deployment.yaml`
  - `kubectl apply --dry-run=server -f k8s/news-lab-web-ingress.yaml`
- 실제 K3s apply:
  - `k8s/news-lab-web-redirect-https-middleware.yaml`
  - `k8s/news-lab-web-deployment.yaml`
  - `k8s/news-lab-web-ingress.yaml`
- rollout 확인:
  - `kubectl rollout status deployment/news-lab-web`
- Pod node 배치 확인:
  - `news-lab-web` Pod 2개가 `arm-worker-node`에만 배치되는지 확인.
  - `arm-master-node`와 `pi-worker-node`에 frontend Pod가 없는지 확인.
- HTTP redirect 확인:
  - `http://newslab.ai.kr` -> `https://newslab.ai.kr`
  - `http://www.newslab.ai.kr` -> `https://www.newslab.ai.kr`
- HTTPS 정상 유지 확인:
  - `https://newslab.ai.kr`
  - `https://www.newslab.ai.kr`
  - `/api/health`
- 반복 curl 안정성 확인.
- 브라우저 수동 검증:
  - Safari 보안 표시
  - Chrome 렌더링
  - 모바일 브라우저 렌더링
  - 홈, `/topics`, `/articles` route 표시

## 근거 메모

- Next.js local docs 확인:
  - `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`
  - `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`
- 이번 변경은 Kubernetes manifest와 runbook 문서 변경이다.
- Next.js route, Server Component, Client Component, API client, UI state, styling, responsive, accessibility 동작은 변경하지 않았다.
- HTTP -> HTTPS redirect는 Next.js app 내부가 아니라 Traefik Ingress Middleware에서 처리하도록 선언했다.
- `nodeSelector`는 frontend Deployment scheduling policy만 변경한다.
- `kubectl apply`, `kubectl delete`, `kubectl rollout restart`, `docker push`, `git push`, `git merge`, production deploy command는 실행하지 않았다.
