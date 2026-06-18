# 작업: 프론트엔드 API base URL을 api.newslab.ai.kr로 전환

## 목표

NewsLab frontend가 backend API를 호출할 때 기존 `https://api.dev-scj.site` 대신 신규 backend 운영 도메인 `https://api.newslab.ai.kr`를 사용하도록 전환한다.

52차 작업에서 backend Ingress에 `api.newslab.ai.kr` host와 `news-api-newslab-tls` Certificate가 정상 적용되었고, 다음 항목이 운영 환경에서 검증되었다.

- `news-api-newslab-tls` Certificate `Ready=True`
- ACME Order `valid`
- `https://api.newslab.ai.kr/health` 반복 요청 20회 모두 `200`
- 기존 `https://api.dev-scj.site/health` 반복 요청 20회 모두 `200`

이번 작업은 frontend가 사용하는 API base URL만 신규 backend 도메인으로 전환한다. 기존 backend 도메인 `api.dev-scj.site`는 제거하지 않고 병행 운영 상태로 유지한다.

## 프론트엔드 작업 범위

- frontend의 backend API base URL 설정을 `https://api.newslab.ai.kr`로 변경한다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 또는 이에 준하는 API base URL 환경 변수를 확인한다.
- Next.js client bundle에 API base URL이 build-time으로 포함되는 구조인지 확인한다.
- GitHub Actions Docker build 단계에서 API base URL build arg를 주입하는 경우 신규 도메인으로 변경한다.
- K3s frontend Deployment manifest에 API base URL env가 선언되어 있는 경우 신규 도메인으로 변경한다.
- 운영 frontend가 신규 backend API 도메인을 호출하도록 정리한다.
- 문서에서 frontend/backend 운영 도메인 관계를 최신 상태로 갱신한다.
- `api.dev-scj.site`는 rollback, legacy, 병행 운영 설명 문맥에만 남긴다.
- 실제 Docker push, K3s apply, rollout restart, production deploy는 사람이 수행한다.

## 변경하지 않을 항목

- Backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`
- `git push`, `git merge`, production deploy command, production-impacting command를 실행하지 않는다.
- backend repository를 수정하지 않는다.
- backend Ingress/TLS 설정을 수정하지 않는다.
- `api.dev-scj.site`를 제거하지 않는다.
- frontend UI/UX를 수정하지 않는다.
- frontend component layout, route 구조, styling을 수정하지 않는다.
- topic/articles API response schema를 변경하지 않는다.
- Docker image tag 정책을 개선하지 않는다.
- `latest` tag 제거 또는 commit SHA 기반 image tag 전환은 이번 범위에서 제외한다.
- 인증서, Secret, kubeconfig, production credential을 문서나 로그에 기록하지 않는다.

## 예상 변경 파일

실제 변경 전 다음 command로 참조 위치를 먼저 확인한다.

```bash
rg -n "api.dev-scj.site|api.newslab.ai.kr|NEXT_PUBLIC_NEWSLAB_API_BASE_URL|API_BASE_URL|NEWSLAB_API" .
```

예상 변경 후보는 다음과 같다.

- `.github/workflows/*.yml`
  - Docker build 시 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` build arg를 주입하는 경우 수정
- `k8s/news-lab-web-deployment.yaml`
  - frontend Deployment env에 API base URL이 선언되어 있는 경우 수정
- `docs/ARCHITECTURE.md`
  - frontend/backend 운영 도메인 구조 갱신
- `docs/RUNBOOK.md`
  - frontend API base URL 전환 후 검증 절차 추가
- `docs/tasks/fix-frontend-api-base-url-newslab-domain.md`
  - 작업 요구사항 기록
- `docs/verification/fix-frontend-api-base-url-newslab-domain.md`
  - 정적 검증, build 검증, 운영 rollout 이후 수동 검증 결과 기록
- `docs/pr/fix-frontend-api-base-url-newslab-domain.md`
  - PR 설명 작성
- `docs/devlog/fix-frontend-api-base-url-newslab-domain.md`
  - 작업 과정 및 판단 기록
- `docs/reviews/fix-frontend-api-base-url-newslab-domain-antigravity.md`
  - Antigravity review 결과 기록
- `docs/reviews/fix-frontend-api-base-url-newslab-domain-coderabbit.md`
  - CodeRabbit review 결과가 있는 경우 기록
- `docs/fixes/fix-frontend-api-base-url-newslab-domain-approved-fixes.md`
  - 승인된 review fix가 있는 경우 기록

실제 수정 파일은 검색 결과를 기준으로 최소화한다.

## 컴포넌트 / Route / API client 영향

이번 작업은 frontend API base URL 전환 작업이다.

- 컴포넌트 구조 변경 없음
- route 구조 변경 없음
- page layout 변경 없음
- API response schema 변경 없음
- API endpoint path 변경 없음
- fetcher 또는 API client의 base URL 입력값만 변경
- 기존 `/topics`, `/articles`, home 화면이 동일한 API path를 신규 backend domain으로 호출해야 함

변경 전후 개념은 다음과 같다.

```text
Before:
https://api.dev-scj.site + 기존 API path

After:
https://api.newslab.ai.kr + 기존 API path
```

예상 확인 대상 화면:

- `https://newslab.ai.kr`
- `https://newslab.ai.kr/topics`
- `https://newslab.ai.kr/articles`

브라우저 DevTools Network에서 다음을 확인해야 한다.

```text
api.newslab.ai.kr 호출 있음
api.dev-scj.site 호출 없음
```

## 상태 처리

이번 작업은 API base URL 전환이므로 frontend 상태 관리 로직은 변경하지 않는다.

- loading 상태 처리 변경 없음
- error 상태 처리 변경 없음
- empty state 변경 없음
- pagination 상태 변경 없음
- topic/articles 상태 구조 변경 없음
- retry 정책 변경 없음

단, 운영 검증 시 신규 backend 도메인 호출 실패가 발생하면 기존 error UI가 정상적으로 노출되는지 확인할 수 있다. 이 확인은 보조 검증이며, 이번 작업의 구현 범위에는 포함하지 않는다.

## 스타일 / 반응형 / 접근성

이번 작업은 설정 및 배포 경로 변경이므로 스타일, 반응형, 접근성 변경은 없다.

- CSS/Tailwind/style 파일 변경 금지
- layout 변경 금지
- color, spacing, typography 변경 금지
- mobile/desktop responsive UI 변경 금지
- ARIA, semantic markup 변경 금지

스타일 관련 파일이 변경되었다면 의도하지 않은 변경으로 보고 되돌린다.

## 검증 Command

### 1. 참조 위치 확인

```bash
rg -n "api.dev-scj.site|api.newslab.ai.kr|NEXT_PUBLIC_NEWSLAB_API_BASE_URL|API_BASE_URL|NEWSLAB_API" .
```

확인 기준:

- 운영 API base URL은 `https://api.newslab.ai.kr`로 변경되어야 한다.
- `api.dev-scj.site`는 rollback, legacy, 병행 운영 설명 문맥에만 남아야 한다.
- 실제 frontend build/deployment 설정에 `api.dev-scj.site`가 남아 있으면 실패로 본다.

### 2. package manager 확인

```bash
ls
cat package.json
```

lockfile을 확인해 실제 package manager를 판단한다.

예상 후보:

```text
package-lock.json -> npm
pnpm-lock.yaml    -> pnpm
yarn.lock         -> yarn
```

### 3. 정적 검사

repository에 정의된 script를 기준으로 수행한다.

예상 후보:

```bash
npm run lint
npm run typecheck
npm run build
```

pnpm을 사용하는 경우:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

yarn을 사용하는 경우:

```bash
yarn lint
yarn typecheck
yarn build
```

실제 존재하지 않는 script는 실행하지 말고 `package.json` 기준으로 가능한 검증만 수행한다.

### 4. Docker build 설정 확인

```bash
rg -n "NEXT_PUBLIC_NEWSLAB_API_BASE_URL|api.dev-scj.site|api.newslab.ai.kr" .github k8s docs
```

확인 기준:

- GitHub Actions Docker build arg가 있다면 `https://api.newslab.ai.kr`를 사용해야 한다.
- K3s Deployment env가 있다면 `https://api.newslab.ai.kr`를 사용해야 한다.
- 기존 `api.dev-scj.site`는 운영 설정값으로 남지 않아야 한다.

### 5. manifest dry-run command 문서화

production cluster 접근이 필요한 command는 사람이 수행한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl apply --dry-run=server -f k8s/news-lab-web-deployment.yaml
```

### 6. production rollout 이후 확인 command 문서화

사람이 Docker image build/push와 K3s rollout을 수행한 뒤 확인한다.

```bash
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl rollout status deployment/news-lab-web

KUBECONFIG=~/.kube/oci-k3s.yaml kubectl get pods -l app=news-lab-web -o wide
```

### 7. frontend HTTPS 확인 command 문서화

```bash
curl -I https://newslab.ai.kr
curl -I https://www.newslab.ai.kr
curl -sS https://newslab.ai.kr/api/health
curl -sS https://www.newslab.ai.kr/api/health
```

## 수동 브라우저 검증

production rollout 이후 사람이 브라우저에서 확인한다.

### 확인 URL

```text
https://newslab.ai.kr
https://newslab.ai.kr/topics
https://newslab.ai.kr/articles
```

### 확인 항목

- home 화면 정상 렌더링
- topics 화면 정상 렌더링
- articles 화면 정상 렌더링
- console error 없음
- API 요청 실패로 인한 error UI 없음
- 브라우저 DevTools Network에서 `api.newslab.ai.kr` 호출 확인
- 브라우저 DevTools Network에서 `api.dev-scj.site` 호출이 없는지 확인
- 기존 frontend health endpoint 정상 응답 확인

### Network 확인 기준

성공 조건:

```text
api.newslab.ai.kr 호출 있음
api.dev-scj.site 호출 없음
```

실패 조건:

```text
api.dev-scj.site 호출이 계속 발생함
api.newslab.ai.kr 호출이 실패함
CORS error 발생
Mixed content error 발생
topics/articles 데이터 로딩 실패
```

## 완료 조건

- frontend 운영 API base URL이 `https://api.newslab.ai.kr`로 변경되어 있다.
- GitHub Actions Docker build arg 또는 이에 준하는 build-time 환경 설정이 신규 도메인을 사용한다.
- K3s frontend Deployment env에 API base URL이 있다면 신규 도메인을 사용한다.
- `api.dev-scj.site`는 운영 frontend API base URL로 남아 있지 않다.
- `api.dev-scj.site`는 rollback, legacy, 병행 운영 설명 문맥에만 남아 있다.
- backend repository, DB, Supabase SQL, backend Ingress/TLS는 변경하지 않았다.
- frontend UI, route, component, styling은 변경하지 않았다.
- lint/typecheck/build 중 repository에서 가능한 검증이 통과했다.
- `docs/verification/fix-frontend-api-base-url-newslab-domain.md`에 실제 검증 결과가 기록되어 있다.
- `docs/pr/fix-frontend-api-base-url-newslab-domain.md`에 PR 설명이 작성되어 있다.
- `docs/devlog/fix-frontend-api-base-url-newslab-domain.md`에 작업 과정과 판단 근거가 기록되어 있다.
- production rollout 이후 `https://newslab.ai.kr`, `/topics`, `/articles`가 정상 동작한다.
- 브라우저 Network에서 `api.newslab.ai.kr` 호출이 확인된다.
- 브라우저 Network에서 `api.dev-scj.site` 호출이 확인되지 않는다.
- 기존 backend 도메인 `api.dev-scj.site`는 제거하지 않았다.

## 참고 사항

- 52차에서 backend `api.newslab.ai.kr` 도메인/TLS 전환은 완료됐다.
- 52차 운영 검증 결과 `https://api.newslab.ai.kr/health`와 `https://api.dev-scj.site/health`는 각각 반복 요청 20회 모두 `200`을 반환했다.
- 이번 작업은 backend 신규 도메인을 만드는 작업이 아니라 frontend가 사용할 backend base URL을 전환하는 작업이다.
- Next.js의 `NEXT_PUBLIC_*` 값은 일반적으로 client bundle에 build-time으로 포함될 수 있으므로, 단순 K8s env 변경만으로 충분한지 반드시 확인한다.
- 새 API base URL이 build-time에 포함되는 구조라면 Docker image rebuild와 rollout이 필요하다.
- Docker image tag 정책 개선은 이번 범위에서 제외한다.
- 기존 backend 도메인 `api.dev-scj.site` 제거는 frontend 전환 이후 안정화 기간을 둔 뒤 별도 작업으로 판단한다.
- 후속 작업은 embedding 저장 구조 검토 및 재사용 설계, article embedding 저장/재사용 MVP, daily pipeline 분리 설계 순서로 진행한다.
