# 작업: 프론트엔드 HTTPS 리다이렉트 및 app node 고정

## 목표

NewsLab Web frontend의 운영 접속 안정성을 개선한다.

이번 작업의 목표는 다음과 같다.

```text
1. http://newslab.ai.kr 요청을 https://newslab.ai.kr 로 자동 리다이렉트한다.
2. http://www.newslab.ai.kr 요청을 https://www.newslab.ai.kr 로 자동 리다이렉트한다.
3. news-lab-web Pod가 master node에 배치되지 않도록 app workload node로 고정한다.
4. HTTPS 기존 동작이 유지되는지 확인한다.
5. 실제 운영 반영 전까지는 apply, rollout, production verification 완료를 주장하지 않는다.
```

현재 50차에서 frontend K3s 배포와 TLS 발급은 완료됐다.

```text
https://newslab.ai.kr
https://www.newslab.ai.kr
```

두 도메인은 HTTPS로 접근 가능하다. 다만 HTTP 접속이 HTTPS로 자동 전환되지 않아 Safari 등 일부 브라우저에서 `보안 안 됨`으로 표시될 수 있다.

또한 50차 운영 확인 결과 `news-lab-web` Pod가 `arm-master-node`, `arm-worker-node`에 각각 하나씩 배치됐다. frontend app workload는 backend `news-api`와 동일하게 `workload=app` node에만 배치되도록 정리한다.

현재 노드 라벨 기준은 다음과 같다.

```text
arm-master-node   workload=infra
arm-worker-node   workload=app
pi-worker-node    workload 없음
```

이번 작업에서는 `news-lab-web` Deployment에 `nodeSelector: workload=app`을 추가해 frontend Pod가 `arm-worker-node`에만 배치되도록 한다.

---

## 프론트엔드 작업 범위

이번 작업은 NewsLab Web frontend repository 안에서 다음 항목만 수행한다.

```text
- Traefik Middleware manifest 추가
- frontend Ingress에 HTTP → HTTPS redirect Middleware annotation 추가
- frontend Deployment에 nodeSelector workload=app 추가
- docs/RUNBOOK.md에 redirect 및 node 배치 검증 command 보강
- docs/verification/fix-frontend-https-redirect-app-node.md에 실제 실행한 검증 결과 기록
- 필요 시 docs/pr 또는 devlog 초안 작성
```

구체적인 변경 의도는 다음과 같다.

### 1. HTTP → HTTPS redirect

Traefik Middleware를 추가해 HTTP 요청을 HTTPS로 permanent redirect한다.

예상 리소스:

```text
kind: Middleware
name: news-lab-web-redirect-https
namespace: default
```

예상 redirect 동작:

```text
http://newslab.ai.kr
-> https://newslab.ai.kr

http://www.newslab.ai.kr
-> https://www.newslab.ai.kr
```

### 2. Ingress Middleware 연결

`news-lab-web-ingress`에 Traefik Middleware annotation을 추가한다.

namespace가 `default`이므로 Middleware reference는 다음 형식을 사용한다.

```text
default-news-lab-web-redirect-https@kubernetescrd
```

### 3. app workload node 고정

`news-lab-web` Deployment의 `spec.template.spec` 아래에 다음 설정을 추가한다.

```yaml
nodeSelector:
  workload: app
```

이 설정은 `containers`와 같은 level이어야 한다.

예상 결과:

```text
news-lab-web Pod 2개 모두 arm-worker-node에 배치
arm-master-node에는 frontend Pod가 배치되지 않음
pi-worker-node는 이번 작업의 배치 대상이 아님
```

---

## 변경하지 않을 항목

다음 항목은 이번 작업에서 변경하지 않는다.

```text
- Backend API code
- Backend K3s manifest
- Backend domain
- frontend API base URL
- DB schema
- Supabase SQL
- Dockerfile
- Docker image build/push workflow
- Docker image tag 정책
- production infrastructure 자체 구성
- cert-manager ClusterIssuer
- Kubernetes Secret 값
- .env
- .env.*
- UI component layout
- page route 구조
- API client 동작
- loading/error/empty state 로직
- styling
- responsive CSS
- accessibility behavior
```

명시적으로 금지한다.

```text
- git push 실행 금지
- git merge 실행 금지
- PR merge 실행 금지
- docker push 실행 금지
- kubectl apply 실행 금지
- kubectl delete 실행 금지
- kubectl rollout restart 실행 금지
- production deploy command 실행 금지
- production-impacting command 실행 금지
```

이번 작업에서 agent는 repository 파일 수정과 정적 검증까지만 수행한다.  
실제 K3s 반영은 사람이 수동으로 수행한다.

---

## 예상 변경 파일

예상 변경 파일은 다음과 같다.

```text
k8s/news-lab-web-redirect-https-middleware.yaml
k8s/news-lab-web-ingress.yaml
k8s/news-lab-web-deployment.yaml
docs/RUNBOOK.md
docs/verification/fix-frontend-https-redirect-app-node.md
```

필요 시 다음 문서를 추가 또는 수정할 수 있다.

```text
docs/pr/fix-frontend-https-redirect-app-node.md
docs/devlog 또는 docs/tasks 관련 색인 문서
```

### `k8s/news-lab-web-redirect-https-middleware.yaml`

신규 파일을 추가한다.

Traefik Middleware apiVersion은 현재 클러스터의 CRD 조회 결과에 맞춘다.

사람이 사전 확인한 결과가 `traefik.io/v1alpha1`이면 다음 형식을 사용한다.

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: news-lab-web-redirect-https
  labels:
    app.kubernetes.io/name: news-lab-web
    app.kubernetes.io/part-of: newslab
spec:
  redirectScheme:
    scheme: https
    permanent: true
```

만약 클러스터 조회 결과가 `traefik.containo.us/v1alpha1`이면 apiVersion만 해당 값으로 조정한다.

### `k8s/news-lab-web-ingress.yaml`

기존 cert-manager annotation은 유지한다.

```yaml
cert-manager.io/cluster-issuer: letsencrypt-prod
```

여기에 Traefik Middleware annotation을 추가한다.

```yaml
traefik.ingress.kubernetes.io/router.middlewares: default-news-lab-web-redirect-https@kubernetescrd
```

기존 TLS 설정은 변경하지 않는다.

```yaml
tls:
  - hosts:
      - newslab.ai.kr
      - www.newslab.ai.kr
    secretName: news-lab-web-tls
```

기존 host rule도 유지한다.

```text
newslab.ai.kr
www.newslab.ai.kr
```

### `k8s/news-lab-web-deployment.yaml`

`spec.template.spec` 아래에 `nodeSelector`를 추가한다.

```yaml
spec:
  template:
    spec:
      nodeSelector:
        workload: app
      containers:
        - name: news-lab-web
```

기존 container 설정은 변경하지 않는다.

```text
image: seocj/news-lab-web:latest
imagePullPolicy: Always
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site
readinessProbe: /api/health
livenessProbe: /api/health
```

이번 작업에서는 image tag를 commit SHA로 바꾸지 않는다.  
`latest` tag 개선은 별도 운영 안정화 후보로 남긴다.

### `docs/RUNBOOK.md`

다음 운영 확인 command를 보강한다.

```text
- HTTP redirect 확인
- HTTPS 정상 유지 확인
- frontend Pod node 배치 확인
- 반복 curl 안정성 확인
```

### `docs/verification/fix-frontend-https-redirect-app-node.md`

실제로 실행한 command와 결과만 기록한다.

기록 시 주의한다.

```text
- 실행하지 않은 kubectl apply 결과를 완료로 적지 않는다.
- 실행하지 않은 browser verification을 완료로 적지 않는다.
- 실제 command output을 기반으로 성공/실패/pending을 분리한다.
```

---

## 컴포넌트 / Route / API client 영향

이번 작업은 Kubernetes manifest와 운영 문서 변경이다.

Next.js component, route, API client는 변경하지 않는다.

영향 없음으로 판단하는 항목:

```text
- app route
- page component
- shared component
- API client
- data fetching 로직
- search/pagination 로직
- topic/article rendering 로직
- loading/error/empty state component
```

다만 agent는 변경 전후로 frontend code가 실수로 수정되지 않았는지 확인한다.

확인 command 예시:

```bash
git diff -- app components lib
```

기대 결과:

```text
diff 없음
```

만약 실제 repository 구조상 `src/app`, `src/components`, `src/lib`를 사용한다면 해당 경로를 기준으로 확인한다.

---

## 상태 처리

이번 작업은 UI 상태 처리 변경을 포함하지 않는다.

다음 상태 로직은 변경하지 않는다.

```text
- loading state
- error state
- empty state
- success state
- search result state
- pagination state
- topic list state
- article list state
```

HTTP → HTTPS redirect는 Traefik Ingress 앞단에서 처리되므로, Next.js runtime 상태 처리와 직접 관련이 없다.

Pod node 배치도 Kubernetes scheduler 정책 변경이므로 UI 상태 로직과 직접 관련이 없다.

---

## 스타일 / 반응형 / 접근성

이번 작업은 styling, responsive, accessibility 변경을 포함하지 않는다.

변경하지 않을 항목:

```text
- CSS class
- Tailwind class
- layout
- typography
- color
- spacing
- responsive breakpoint
- keyboard interaction
- ARIA attribute
- focus style
```

따라서 style regression 검증은 필수 구현 범위가 아니다.

다만 실제 운영 반영 이후 사람이 브라우저에서 다음을 수동 확인할 수 있다.

```text
- https://newslab.ai.kr 홈 화면 표시
- https://www.newslab.ai.kr 홈 화면 표시
- Safari에서 보안 경고 없이 HTTPS로 접속되는지
- 모바일 브라우저에서 기존 화면이 유지되는지
```

---

## 검증 Command

agent가 실행 가능한 검증과 사람이 수동으로 실행할 운영 검증을 구분한다.

### agent가 실행 가능한 정적 검증

```bash
git status --short --branch
```

```bash
git diff --check
```

YAML parser가 사용 가능하면 manifest syntax를 확인한다.

예시:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); puts "#{f}: #{docs.map { |d| d["kind"] }.compact.join(", ")}" }' \
  k8s/news-lab-web-deployment.yaml \
  k8s/news-lab-web-service.yaml \
  k8s/news-lab-web-ingress.yaml \
  k8s/news-lab-web-redirect-https-middleware.yaml
```

secret 값이 추가되지 않았는지 확인한다.

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

단, 다음 항목은 secret 값이 아니라 reference일 수 있으므로 결과를 구분해서 기록한다.

```text
- Kubernetes Secret resource name
- GitHub Actions secret name reference
- 환경 변수명
- 문서 내 설명
- package-lock.json의 js-tokens package name
```

변경 범위를 확인한다.

```bash
git diff --stat
git diff -- k8s docs
```

Next.js 코드가 변경되지 않았는지 확인한다.

```bash
git diff -- app components lib src || true
```

repository 구조에 맞게 경로는 조정할 수 있다.

### 사람이 수동으로 실행할 K3s 검증

다음 command는 production-impacting 여부가 있으므로 agent가 실행하지 않는다.  
문서에는 pending으로 기록하고, 실제 운영 반영은 사람이 수행한다.

#### Traefik Middleware CRD 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl api-resources | rg -i "middleware|traefik"
```

#### server-side dry-run

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server \
  -f k8s/news-lab-web-redirect-https-middleware.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server \
  -f k8s/news-lab-web-deployment.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server \
  -f k8s/news-lab-web-ingress.yaml
```

#### 실제 apply

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply \
  -f k8s/news-lab-web-redirect-https-middleware.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply \
  -f k8s/news-lab-web-deployment.yaml

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply \
  -f k8s/news-lab-web-ingress.yaml
```

#### rollout 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl rollout status deployment/news-lab-web
```

#### Pod node 배치 확인

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get pods \
  -l app.kubernetes.io/name=news-lab-web \
  -o wide
```

기대 결과:

```text
news-lab-web Pod 2개 모두 arm-worker-node에 배치
arm-master-node에는 news-lab-web Pod 없음
pi-worker-node에는 news-lab-web Pod 없음
```

#### HTTP redirect 확인

```bash
curl -I http://newslab.ai.kr
curl -I http://www.newslab.ai.kr
```

기대 결과:

```text
301 또는 308 Redirect
Location: https://newslab.ai.kr/
Location: https://www.newslab.ai.kr/
```

#### HTTPS 정상 유지 확인

```bash
curl -I https://newslab.ai.kr
curl -I https://www.newslab.ai.kr
curl -sS https://newslab.ai.kr/api/health
curl -sS https://www.newslab.ai.kr/api/health
```

기대 결과:

```text
HTTP/2 200
```

```json
{ "status": "ok", "service": "news-lab-web" }
```

#### 반복 요청 안정성 확인

```bash
for i in {1..20}; do
  echo "---- $i ----"
  curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" https://newslab.ai.kr
done
```

```bash
for i in {1..20}; do
  echo "---- $i ----"
  curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" https://newslab.ai.kr/api/health
done
```

기대 결과:

```text
모든 요청 200
응답 시간이 과도하게 튀지 않음
```

---

## 수동 브라우저 검증

브라우저 검증은 사람이 직접 수행한다.  
agent는 실제 확인 없이 완료로 기록하지 않는다.

확인 대상:

```text
https://newslab.ai.kr
https://www.newslab.ai.kr
http://newslab.ai.kr
http://www.newslab.ai.kr
```

확인 기준:

```text
- http 접속 시 https로 자동 전환되는지
- Safari 주소창에서 “보안 안 됨”이 사라지는지
- Chrome에서 정상 렌더링되는지
- 모바일 브라우저에서 정상 렌더링되는지
- 홈 화면 주요 이슈 영역이 표시되는지
- /topics route가 표시되는지
- /articles route가 표시되는지
```

선택 확인:

```text
- DevTools Console에 치명적인 runtime error가 없는지
- Network tab에서 document, _next/static asset, /api/health가 정상 응답하는지
```

---

## 완료 조건

이번 작업은 다음 조건을 만족하면 완료로 판단한다.

### repository 기준 완료 조건

```text
- k8s/news-lab-web-redirect-https-middleware.yaml 추가
- k8s/news-lab-web-ingress.yaml에 redirect Middleware annotation 추가
- k8s/news-lab-web-deployment.yaml에 nodeSelector workload=app 추가
- docs/RUNBOOK.md에 운영 확인 command 보강
- docs/verification/fix-frontend-https-redirect-app-node.md에 실제 검증 결과 기록
- git diff --check 통과
- YAML parsing 통과
- secret 값 추가 없음
- backend/API/DB/Docker/UI 변경 없음
```

### 운영 반영 후 완료 조건

운영 반영은 사람이 직접 수행한다.

```text
- server-side dry-run 성공
- K3s apply 성공
- news-lab-web rollout 성공
- news-lab-web Pod 2개가 arm-worker-node에만 배치됨
- http://newslab.ai.kr 가 https://newslab.ai.kr 로 redirect됨
- http://www.newslab.ai.kr 가 https://www.newslab.ai.kr 로 redirect됨
- https://newslab.ai.kr HTTP 200 유지
- https://www.newslab.ai.kr HTTP 200 유지
- /api/health 응답 정상
- 반복 curl 20회 기준 실패 없음
- Chrome/Safari/모바일 브라우저 확인 완료
```

---

## 참고 사항

50차에서 frontend K3s 배포와 TLS 연결은 완료됐다.

50차 확인 결과:

```text
- newslab.ai.kr DNS A record는 1xx.xx.xxx.xx
- www.newslab.ai.kr DNS A record는 1xx.xx.xxx.xx
- AAAA record는 없음
- news-lab-web Deployment READY 2/2
- news-lab-web Pod 2개 Running
- news-lab-web-tls Secret 생성
- news-lab-web-tls Certificate Ready=True
- ACME Order valid
- HTTPS /api/health 200
- HTTPS home route 200
- Chrome 및 모바일 브라우저 렌더링 확인
```

외부 Wi-Fi에서 Safari/브라우저 접속이 불안정했으나, 집 Wi-Fi에서는 정상 접속됨을 확인했다.  
따라서 해당 현상은 K3s/Ingress/TLS 장애라기보다 특정 네트워크 환경 또는 HTTP/HTTPS 처리 차이에 따른 이슈로 분리했다.

다만 현재 HTTP 요청이 HTTPS로 자동 리다이렉트되지 않기 때문에, Safari에서 scheme 없이 도메인을 입력하면 `보안 안 됨`으로 표시될 수 있다.  
이번 51차에서는 이 문제를 Traefik Middleware 기반 redirect로 해결한다.

또한 현재 노드 라벨은 다음과 같다.

```text
arm-master-node   workload=infra
arm-worker-node   workload=app
pi-worker-node    workload 없음
```

이번 작업에서는 `pi-worker-node`를 frontend workload 대상으로 포함하지 않는다.  
frontend app workload는 `arm-worker-node`에만 배치한다.

장기적으로 남은 후속 후보:

```text
- backend api.newslab.ai.kr 전환
- frontend API base URL을 api.newslab.ai.kr로 전환
- Docker image tag를 latest에서 commit SHA 기반 immutable tag로 변경
- Next.js Server Action mismatch 로그 재현 여부 관찰
- pi-worker-node workload 정책 별도 정리
```
