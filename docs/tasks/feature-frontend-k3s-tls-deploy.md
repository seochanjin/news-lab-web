# 작업: 프론트엔드 K3s 배포 및 newslab.ai.kr TLS 연결

## 목표

NewsLab Web frontend를 K3s 클러스터에 실제 배포하고, 확정 도메인인 `newslab.ai.kr`, `www.newslab.ai.kr`에 대해 HTTP 및 HTTPS 접근을 검증한다.

이번 작업은 48차에서 준비한 frontend Docker/K3s 배포 기반과, 후속 fix에서 정리한 ARM64 Docker image 발행 결과를 실제 K3s 운영 환경에 적용하는 단계다.

목표는 다음과 같다.

```text
1. Docker Hub image seocj/news-lab-web:latest가 ARM64 환경에서 pull 가능한지 확인
2. frontend Deployment/Service/Ingress manifest를 K3s server-side dry-run으로 검증
3. Deployment/Service/Ingress를 K3s에 실제 적용
4. news-lab-web Pod 2개가 Running/Ready 상태가 되는지 확인
5. Service port-forward로 frontend /api/health 확인
6. HTTP Host header 기반으로 Traefik Ingress 라우팅 확인
7. frontend Ingress에 cert-manager TLS 설정 적용
8. Certificate / Order / Challenge / Secret 상태 확인
9. https://newslab.ai.kr, https://www.newslab.ai.kr 접근 확인
```

중요한 전제:

```text
HTTP 검증이 실패하면 TLS 완료로 주장하지 않는다.
Pod/Service/Ingress HTTP 경로가 먼저 정상이어야 TLS 검증으로 넘어간다.
```

이번 작업의 최종 완료 기준은 frontend가 다음 도메인으로 접근 가능한 상태다.

```text
https://newslab.ai.kr
https://www.newslab.ai.kr
```

단, backend API domain 전환은 이번 작업 범위가 아니다. frontend는 여전히 기존 backend API를 사용한다.

```text
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
```

---

## 프론트엔드 작업 범위

이번 작업은 frontend repository에서 진행한다.

```bash
/Users/seochanjin/workspace/NewsLab/news-lab-web
```

작업 대상은 frontend K3s 배포 manifest와 운영 검증 문서다.

포함 범위:

```text
- k8s/news-lab-web-deployment.yaml 확인
- k8s/news-lab-web-service.yaml 확인
- k8s/news-lab-web-ingress.yaml에 TLS 설정 추가
- docs/RUNBOOK.md에 frontend K3s 배포/TLS 검증 절차 보강
- docs/ARCHITECTURE.md에 frontend Ingress/TLS 구조 보강
- docs/verification/feature-frontend-k3s-tls-deploy.md에 실제 수행 명령과 결과 기록
- docs/pr/feature-frontend-k3s-tls-deploy.md 작성
- docs/devlog/feature-frontend-k3s-tls-deploy.md 작성
```

Ingress는 다음 기준을 만족해야 한다.

```text
ingressClassName: traefik
host: newslab.ai.kr
host: www.newslab.ai.kr
cert-manager cluster issuer: letsencrypt-prod
TLS secretName: news-lab-web-tls
```

예상 Ingress 방향:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: news-lab-web-ingress
  labels:
    app.kubernetes.io/name: news-lab-web
    app.kubernetes.io/part-of: newslab
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - newslab.ai.kr
        - www.newslab.ai.kr
      secretName: news-lab-web-tls
  rules:
    - host: newslab.ai.kr
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: news-lab-web
                port:
                  number: 80
    - host: www.newslab.ai.kr
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: news-lab-web
                port:
                  number: 80
```

Deployment는 다음 image를 유지한다.

```text
seocj/news-lab-web:latest
```

Deployment의 frontend API base URL은 아직 기존 backend API를 유지한다.

```text
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
```

---

## 변경하지 않을 항목

이번 작업에서 다음은 변경하지 않는다.

```text
- Backend API code
- Backend K3s manifest
- Backend Docker image
- DB schema
- Supabase SQL
- api.dev-scj.site backend Ingress
- api.newslab.ai.kr backend 연결
- NEXT_PUBLIC_NEWSLAB_API_BASE_URL 값
- frontend page/component/route 기능
- frontend API client 로직
- frontend styling
- loading/error/empty/search/pagination 상태 처리
- Dockerfile
- Docker Hub workflow
- production infrastructure provider 설정
- secret
- .env
- .env.*
```

다음 명령은 agent가 실행하지 않는다.

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
secret/.env 수정 또는 출력
```

`kubectl apply`, `kubectl rollout`, DNS/TLS 운영 확인은 사람이 직접 판단하고 실행한다.  
검증 문서에는 실제 수행한 명령과 결과만 기록한다.

---

## 예상 변경 파일

필수 변경 가능 파일:

```text
k8s/news-lab-web-ingress.yaml
docs/tasks/feature-frontend-k3s-tls-deploy.md
docs/verification/feature-frontend-k3s-tls-deploy.md
docs/pr/feature-frontend-k3s-tls-deploy.md
docs/devlog/feature-frontend-k3s-tls-deploy.md
docs/reviews/feature-frontend-k3s-tls-deploy-antigravity.md
docs/reviews/feature-frontend-k3s-tls-deploy-coderabbit.md
docs/fixes/feature-frontend-k3s-tls-deploy-approved-fixes.md
```

필요 시 변경 가능 파일:

```text
docs/ARCHITECTURE.md
docs/RUNBOOK.md
```

변경하지 않아야 할 파일:

```text
.env
.env.*
Dockerfile
.github/workflows/docker-build.yml
app/**
components/**
lib/**
```

단, 문서 검토 과정에서 실제 구조와 다른 설명이 발견되면 문서만 보정할 수 있다.

---

## 컴포넌트 / Route / API client 영향

이번 작업은 K3s Deployment/Service/Ingress/TLS 연결 작업이다.

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

이번 작업에서는 frontend가 호출하는 backend API base URL을 변경하지 않는다.

유지 값:

```text
https://api.dev-scj.site
```

`api.newslab.ai.kr` backend 전환은 후속 작업에서 처리한다.

---

## 상태 처리

사용자-facing 상태 처리 변경은 없다.

변경하지 않을 항목:

```text
- loading state
- error state
- empty state
- success state
- pagination state
- search state
- topic/article rendering
```

이번 작업에서 확인할 상태는 Kubernetes 운영 상태다.

```text
- Deployment Available
- Pod Running/Ready
- Service endpoint 연결
- Ingress host routing
- Certificate Ready
- Secret 생성
```

---

## 스타일 / 반응형 / 접근성

스타일, 반응형, 접근성 변경은 없다.

변경하지 않을 항목:

```text
- CSS class
- layout
- typography
- color
- responsive breakpoint
- semantic HTML
- aria label
- focus style
- keyboard interaction
```

다만 production browser 확인을 수행한다면 별도 검증 결과로 기록할 수 있다.

수행하지 않았다면 다음 항목은 완료로 주장하지 않는다.

```text
- DevTools Console 확인
- hydration mismatch 확인
- responsive viewport matrix 확인
- keyboard navigation 확인
- accessibility 확인
```

---

## 검증 Command

검증은 다음 순서로 진행한다.

### 1. 로컬 상태 확인

```bash
cd /Users/seochanjin/workspace/NewsLab/news-lab-web

git status --short --branch
git log --oneline -5
```

### 2. Docker image 전제조건 확인

```bash
docker buildx imagetools inspect seocj/news-lab-web:latest

docker pull seocj/news-lab-web:latest

docker image inspect seocj/news-lab-web:latest \
  --format '{{.Architecture}}/{{.Os}}'
```

기대:

```text
linux/arm64 manifest 존재
docker pull 성공
arm64/linux
```

### 3. DNS 확인

```bash
dig +short newslab.ai.kr
dig +short www.newslab.ai.kr
```

기대:

```text
152.67.211.33
```

주의:

```text
DNS가 public IP를 향하지 않으면 HTTP-01 challenge가 실패할 수 있다.
Tailscale 100.x IP를 public DNS A record로 사용하지 않는다.
```

### 4. cert-manager 전제 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get clusterissuer letsencrypt-prod
```

필요 시:

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe clusterissuer letsencrypt-prod
```

기대:

```text
letsencrypt-prod 존재
Ready=True
```

### 5. manifest 정적 확인

```bash
rg -n "seocj/news-lab-web|newslab.ai.kr|www.newslab.ai.kr|api.dev-scj.site|api.newslab.ai.kr|newslab.site|news-lab-web-tls|letsencrypt-prod" k8s docs
```

확인 기준:

```text
- Deployment image는 seocj/news-lab-web:latest
- frontend Ingress host는 newslab.ai.kr, www.newslab.ai.kr
- TLS secretName은 news-lab-web-tls
- cluster issuer는 letsencrypt-prod
- backend API base URL은 https://api.dev-scj.site 유지
- api.newslab.ai.kr은 이번 작업의 적용 대상이 아님
- newslab.site는 현재 운영 manifest host로 남아 있지 않아야 함
```

YAML parser 확인:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' \
  k8s/news-lab-web-deployment.yaml \
  k8s/news-lab-web-service.yaml \
  k8s/news-lab-web-ingress.yaml
```

기대:

```text
Deployment
Service
Ingress
```

### 6. K3s server-side dry-run

사람이 직접 실행한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server -f k8s/news-lab-web-deployment.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server -f k8s/news-lab-web-service.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server -f k8s/news-lab-web-ingress.yaml
```

### 7. 실제 K3s apply

사람이 직접 실행한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply -f k8s/news-lab-web-deployment.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply -f k8s/news-lab-web-service.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply -f k8s/news-lab-web-ingress.yaml
```

### 8. rollout 및 리소스 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl rollout status deployment/news-lab-web

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get deployment news-lab-web -o wide

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get pods -l app.kubernetes.io/name=news-lab-web -o wide

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get svc news-lab-web -o wide

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get ingress news-lab-web-ingress -o wide
```

필요 시 문제 분석:

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe deployment news-lab-web

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe pods -l app.kubernetes.io/name=news-lab-web

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl logs deployment/news-lab-web --tail=100

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe ingress news-lab-web-ingress
```

### 9. Service port-forward 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl port-forward svc/news-lab-web 3000:80
```

다른 터미널:

```bash
curl -I http://localhost:3000/api/health
curl -sS http://localhost:3000/api/health
curl -I http://localhost:3000
```

기대:

```text
/api/health → HTTP 200
/api/health → {"status":"ok","service":"news-lab-web"}
/ → HTTP 200
```

### 10. HTTP Ingress Host header 확인

DNS 전파와 무관하게 public IP로 확인한다.

```bash
curl -I -H "Host: newslab.ai.kr" http://152.67.211.33/api/health

curl -sS -H "Host: newslab.ai.kr" http://152.67.211.33/api/health
```

기대:

```text
HTTP 200
{"status":"ok","service":"news-lab-web"}
```

홈 확인:

```bash
curl -I -H "Host: newslab.ai.kr" http://152.67.211.33

curl -sS -H "Host: newslab.ai.kr" http://152.67.211.33 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
```

www 확인:

```bash
curl -I -H "Host: www.newslab.ai.kr" http://152.67.211.33

curl -sS -H "Host: www.newslab.ai.kr" http://152.67.211.33 | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
```

주요 route marker:

```bash
curl -sS -H "Host: newslab.ai.kr" http://152.67.211.33/topics | rg "주요 이슈 아카이브|전체 주요 이슈"

curl -sS -H "Host: newslab.ai.kr" http://152.67.211.33/articles | rg "기사 탐색|기사 목록"
```

### 11. cert-manager Certificate 확인

Ingress 적용 후 확인한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get certificate

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe certificate news-lab-web-tls
```

Order/Challenge 확인:

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get order,challenge

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe order

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl describe challenge
```

Secret 확인:

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get secret news-lab-web-tls
```

기대:

```text
Certificate Ready=True
Secret news-lab-web-tls 생성
```

### 12. HTTPS 확인

```bash
curl -I https://newslab.ai.kr/api/health
curl -sS https://newslab.ai.kr/api/health

curl -I https://newslab.ai.kr
curl -sS https://newslab.ai.kr | rg "오늘의 주요 이슈|전체 주요 이슈 보기"

curl -I https://www.newslab.ai.kr
curl -sS https://www.newslab.ai.kr | rg "오늘의 주요 이슈|전체 주요 이슈 보기"
```

주요 route:

```bash
curl -sS https://newslab.ai.kr/topics | rg "주요 이슈 아카이브|전체 주요 이슈"

curl -sS https://newslab.ai.kr/articles | rg "기사 탐색|기사 목록"
```

기대:

```text
https://newslab.ai.kr/api/health → HTTP 200
https://newslab.ai.kr → HTTP 200
https://www.newslab.ai.kr → HTTP 200
```

### 13. 기타 정리 검증

```bash
git diff --check

git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

credential scan에서 GitHub secret 이름, 환경 변수명, 문서 설명, `js-tokens` package name 등이 잡힐 수 있다. 실제 secret 값이 포함되지 않았는지만 확인한다.

---

## 수동 브라우저 검증

가능하면 HTTPS 적용 후 브라우저에서 다음을 확인한다.

```text
https://newslab.ai.kr
https://www.newslab.ai.kr
```

확인 항목:

```text
- 홈 화면 렌더링
- /topics 이동
- /articles 이동
- 주요 이슈 목록 표시
- 기사 목록 표시
- 브라우저 주소창 HTTPS 자물쇠 확인
- DevTools Console 치명적 error 여부
```

선택 확인:

```text
- mobile viewport
- tablet viewport
- desktop viewport
- keyboard navigation
- hydration mismatch warning
```

수행하지 않은 항목은 완료로 기록하지 않는다.

---

## 완료 조건

이번 작업은 다음 조건을 만족하면 완료로 판단한다.

```text
- seocj/news-lab-web:latest ARM64 image pull 성공
- Docker image inspect 결과 arm64/linux 확인
- DNS A record가 newslab.ai.kr, www.newslab.ai.kr 모두 152.67.211.33을 가리킴
- letsencrypt-prod ClusterIssuer 존재 및 사용 가능 확인
- Deployment/Service/Ingress server-side dry-run 통과
- K3s Deployment/Service/Ingress apply 완료
- news-lab-web Deployment rollout 성공
- news-lab-web Pod 2개 Running/Ready
- Service port-forward로 /api/health 200 OK 확인
- HTTP Host header 기반 newslab.ai.kr /api/health 200 OK 확인
- HTTP Host header 기반 /, /topics, /articles marker 확인
- Certificate news-lab-web-tls Ready=True 확인
- Secret news-lab-web-tls 생성 확인
- https://newslab.ai.kr/api/health 200 OK 확인
- https://newslab.ai.kr 홈 접근 확인
- https://www.newslab.ai.kr 접근 확인
```

완료로 주장하지 않을 항목:

```text
- api.newslab.ai.kr backend 전환
- frontend API base URL을 api.newslab.ai.kr로 변경
- backend Ingress 변경
- production browser responsive matrix 전체 확인
- DevTools Console 검증
- accessibility 검증
```

---

## 참고 사항

현재 frontend image는 다음 tag를 기준으로 배포한다.

```text
seocj/news-lab-web:latest
```

이 image는 후속 fix에서 ARM64 pull 가능 상태로 확인되었다.

현재 frontend가 사용하는 backend API base URL은 다음과 같다.

```text
https://api.dev-scj.site
```

이번 작업에서 `api.newslab.ai.kr`은 사용하지 않는다.  
backend domain 전환은 다음 차수에서 별도로 진행한다.

후속 작업 후보:

```text
51차: Backend api.newslab.ai.kr 도메인 및 TLS 연결
52차: Frontend API base URL을 api.newslab.ai.kr로 전환
```

DNS 주의:

```text
newslab.ai.kr, www.newslab.ai.kr은 public DNS A record로 Oracle master node public IP인 152.67.211.33을 가리켜야 한다.
Tailscale 100.x IP를 가비아 public DNS A record에 넣으면 안 된다.
```

TLS 주의:

```text
cert-manager HTTP-01 challenge는 외부에서 http://newslab.ai.kr/.well-known/acme-challenge/... 경로로 접근 가능해야 한다.
HTTP Ingress/DNS가 먼저 정상이어야 TLS 발급이 가능하다.
```

검증 기록 원칙:

```text
실제로 수행한 명령과 결과만 docs/verification에 기록한다.
수행하지 않은 TLS/browser/production 검증은 완료로 주장하지 않는다.
```
