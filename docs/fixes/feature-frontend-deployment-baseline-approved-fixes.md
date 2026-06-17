# 승인된 수정: Frontend Docker/K3s 배포 기반 구성

## 사람 승인 대기 중인 수정 후보

- 없음.

## 승인된 수정

### 1. Ingress Controller 기준 정정

현재 K3s 클러스터의 IngressClass를 확인한 결과, 사용 중인 Ingress Controller는 `nginx`가 아니라 `traefik`이다.

확인 command:

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get ingressclass
```

확인 결과:

```text
NAME      CONTROLLER                      PARAMETERS   AGE
traefik   traefik.io/ingress-controller   <none>       23d
```

따라서 `k8s/news-lab-web-ingress.yaml`의 Ingress 설정을 현재 클러스터 기준에 맞게 수정한다.

수정 방향:

```text
- ingressClassName: nginx → ingressClassName: traefik
- nginx.ingress.kubernetes.io/proxy-buffering annotation 제거
```

이 수정은 실제 운영 적용이 아니라 manifest 초안의 클러스터 정합성을 맞추는 변경이다.

### 2. Frontend health endpoint 추가 및 probe path 변경

현재 Deployment의 readiness/liveness probe가 `/`를 바라보고 있다.

```text
readinessProbe.path = /
livenessProbe.path = /
```

홈(`/`)은 frontend page rendering과 backend API 호출 흐름에 영향을 받을 수 있으므로, frontend container 자체의 생존 확인 용도로는 과하다.

따라서 가벼운 health endpoint를 추가하고 probe path를 해당 endpoint로 변경한다.

수정 방향:

```text
- app/api/health/route.ts 추가
- readinessProbe.path: / → /api/health
- livenessProbe.path: / → /api/health
```

health endpoint는 backend API, DB, 외부 네트워크를 호출하지 않고 frontend process가 정상 응답 가능한지만 확인한다.

예상 응답:

```json
{
  "status": "ok",
  "service": "news-lab-web"
}
```

## 거절 또는 보류한 제안

### 1. Ingress TLS template 추가

Ingress TLS secret/hosts template 추가는 보류한다.

이유:

```text
- 이번 task는 Docker/K3s 배포 기반 구성까지가 범위다.
- newslab.site / www.newslab.site DNS 및 TLS 연결은 별도 task에서 진행할 예정이다.
- TLS 설정은 cert-manager, DNS propagation, Ingress 적용 순서와 함께 검증해야 하므로 이번 task에 섞지 않는다.
```

후속 task 후보:

```text
newslab.site 도메인 및 TLS 연결
```

## 적용할 변경

- `k8s/news-lab-web-ingress.yaml`
  - `ingressClassName`을 `traefik`으로 수정
  - nginx 전용 annotation 제거

- `app/api/health/route.ts`
  - frontend 전용 lightweight health route 추가

- `k8s/news-lab-web-deployment.yaml`
  - readinessProbe path를 `/api/health`로 수정
  - livenessProbe path를 `/api/health`로 수정

- 필요 시 `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/verification/feature-frontend-deployment-baseline.md`에 변경 사항 반영

## 적용한 변경

- `k8s/news-lab-web-ingress.yaml`
  - `ingressClassName`을 `traefik`으로 수정했다.
  - nginx 전용 `nginx.ingress.kubernetes.io/proxy-buffering` annotation을 제거했다.

- `app/api/health/route.ts`
  - backend API, DB, 외부 네트워크를 호출하지 않는 frontend 전용 lightweight health route를 추가했다.
  - 응답은 `{ "status": "ok", "service": "news-lab-web" }` 형태다.

- `k8s/news-lab-web-deployment.yaml`
  - readinessProbe path를 `/api/health`로 수정했다.
  - livenessProbe path를 `/api/health`로 수정했다.

- `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`
  - `/api/health` probe 용도와 Traefik IngressClass 기준을 반영했다.

- `docs/verification/feature-frontend-deployment-baseline.md`
  - 승인 수정 적용 후 실제 실행한 검증 command와 결과를 기록한다.

## 적용하지 않은 변경

- Ingress TLS template은 승인 문서에서 보류된 항목이므로 추가하지 않았다.
- 실제 `kubectl apply`, rollout, DNS/TLS 연결, production verification은 수행하지 않는다.

## 필요한 검증

수정 후 다음 검증을 수행한다.

```bash
npm run lint
npm run typecheck
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build
```

Docker build 검증:

```bash
docker build \
  --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site \
  -t news-lab-web:local .
```

Docker run 검증:

```bash
docker run --rm -p 3000:3000 news-lab-web:local
```

다른 터미널에서 확인:

```bash
curl -I http://localhost:3000/api/health
curl -sS http://localhost:3000/api/health
curl -I http://localhost:3000
```

K8s/YAML 정적 검증:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: #{docs.map { |d| d["kind"] }.join(",")}" }' k8s/news-lab-web-deployment.yaml k8s/news-lab-web-service.yaml k8s/news-lab-web-ingress.yaml
```

Diff 및 script 검증:

```bash
git diff --check
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
```

Secret scan:

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

주의:

```text
- 실제 kubectl apply는 수행하지 않는다.
- 실제 rollout은 수행하지 않는다.
- DNS/TLS 연결은 수행하지 않는다.
- production verification 완료를 주장하지 않는다.
```
