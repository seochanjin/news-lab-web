# 프론트엔드 API base URL을 api.newslab.ai.kr로 전환

## 작업 목적

- NewsLab frontend가 backend API를 호출할 때 사용하는 운영 base URL을 기존 `https://api.dev-scj.site`에서 `https://api.newslab.ai.kr`로 전환한다.
- Next.js build-time 설정과 frontend Deployment runtime 환경 변수를 동일한 신규 domain으로 정렬한다.
- 기존 backend domain은 제거하지 않고 rollback 및 안정화 기간의 병행 운영 대상으로 유지한다.

## 기존 문제

- CI build, Docker image build, frontend Deployment 환경 변수에 기존 API domain이 운영값으로 남아 있었다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`은 `NEXT_PUBLIC_*` 환경 변수이므로 `next build` 시 산출물에 고정된다.
- 따라서 Deployment runtime 환경 변수만 바꾸면 이미 생성된 frontend image의 API target은 변경되지 않는다.

## 변경 내용

- `.github/workflows/ci.yml`
  - CI build의 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 `https://api.newslab.ai.kr`로 변경했다.
- `.github/workflows/docker-build.yml`
  - Docker image build에 전달하는 동일 환경 변수 값을 신규 domain으로 변경했다.
- `k8s/news-lab-web-deployment.yaml`
  - frontend container의 runtime 환경 변수도 신규 domain으로 맞췄다.
- `docs/ARCHITECTURE.md`
  - frontend 운영 API target과 `NEXT_PUBLIC_*`의 build-time 고정 특성을 기록했다.
- `docs/RUNBOOK.md`
  - local Docker build 예시를 신규 domain으로 갱신했다.
  - image rebuild와 rollout 필요성 및 rollout 이후 수동 확인 절차를 추가했다.
- 승인된 review fix는 없었다.

## 구현 상세

- `lib/api/topics.ts`와 `lib/api/articles.ts`는 기존처럼 `process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 읽고 endpoint path를 조합한다.
- `/topics/home`, `/topics`, `/topics/{id}`, `/articles` path와 query parameter, response validation은 변경하지 않았다.
- component, App Router route, page layout, Server/Client Component 경계는 변경하지 않았다.
- loading, error, empty state, pagination과 retry 동작은 변경하지 않았다.
- CSS/Tailwind, responsive layout, semantic markup, ARIA와 keyboard behavior는 변경하지 않았다.
- Next.js `16.2.7` 로컬 환경 변수 가이드를 확인해 public 환경 변수가 build 시 bundle에 고정되는 구조를 검토했다.
- production build 산출물에서 신규 domain이 포함되고 기존 domain이 포함되지 않은 것을 확인했다.

## 대안 검토

- Deployment runtime 환경 변수만 변경:
  - 기존 image에 고정된 public 환경 변수 값을 바꾸지 못하므로 제외했다.
- API client에 신규 domain을 직접 하드코딩:
  - 환경별 설정 분리를 훼손하고 기존 환경 변수 contract를 우회하므로 제외했다.
- runtime config endpoint 도입:
  - 하나의 image를 여러 환경에 재사용할 수 있지만 API client와 초기화 경로를 넓게 변경해야 하므로 이번 단일 domain 전환 범위에서 제외했다.
- Docker image tag 정책 변경:
  - `latest` 제거 또는 commit SHA 기반 tag 도입은 task에서 명시적으로 제외했다.

## 선택한 접근과 근거

- 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` contract와 Dockerfile의 build arg 전달 구조를 유지했다.
- CI, Docker workflow, Deployment 값을 같은 domain으로 맞춰 build/runtime 설정 불일치를 줄였다.
- API client와 UI를 변경하지 않아 endpoint contract와 사용자 상태 처리에 대한 회귀 범위를 최소화했다.
- 운영 절차는 architecture와 runbook에 기록하고 실제 image push와 rollout은 사람의 별도 작업으로 남겼다.

## 트레이드오프

- API domain을 다시 변경할 때마다 frontend image rebuild와 rollout이 필요하다.
- Deployment runtime 환경 변수만으로 API target을 바꾸는 유연성은 얻지 못한다.
- 대신 새로운 runtime config 계층이나 dependency 없이 기존 배포 구조를 유지했고, 변경 범위를 설정값과 문서로 제한했다.

## 테스트 및 브라우저 확인

- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run lint`
  - 통과했다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run typecheck`
  - 통과했다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.newslab.ai.kr npm run build`
  - 첫 실행은 sandbox의 Google Fonts 네트워크 차단으로 `Geist`, `Geist Mono` fetch 오류가 발생했다.
  - 네트워크 접근을 허용해 동일 command를 재실행했고 Next.js production build가 통과했다.
  - `/`, `/articles`, `/search`, `/topics`, `/topics/[id]`, `/api/health` route build가 완료됐다.
- production build 산출물 검사
  - `.next/server`와 `.next/standalone/.next/server`에서 신규 domain을 포함한 파일 10개를 확인했다.
  - 동일 범위에서 기존 domain 참조가 없음을 확인했다.
- active 설정 검색
  - CI, Docker build, frontend Deployment 설정이 모두 신규 domain을 사용함을 확인했다.
- `git diff --check`
  - 통과했다.
- credential pattern scan
  - 실제 credential 값은 발견되지 않았다.
  - 정책 문구, GitHub Actions secret reference, Kubernetes TLS Secret 이름 등 예상된 선언만 확인했다.
- 사람이 제공한 manual verification 로그는 없으며 browser verification은 수행하지 않았다.

## 운영 반영

- Docker image build/push, frontend Deployment manifest의 server-side dry-run, K3s apply와 rollout은 수행하지 않았다.
- production frontend HTTPS와 `/api/health` 확인도 수행하지 않았다.
- rollout 이후 사람이 다음 항목을 확인해야 한다.
  - `https://newslab.ai.kr`, `https://www.newslab.ai.kr`
  - `/`, `/topics`, `/articles`
  - browser console error 및 API error UI
  - DevTools Network의 `api.newslab.ai.kr` 호출
  - DevTools Network에 `api.dev-scj.site` 호출이 없는지 여부
- git push, git merge, production-impacting command는 실행하지 않았다.

## README 업데이트 판단

- README는 환경 변수명과 로컬 placeholder 사용법을 설명하며 운영 domain 값을 고정해 기록하지 않는다.
- 운영 domain 관계는 architecture, build와 rollout 절차는 runbook의 책임이므로 README는 변경하지 않았다.

## 확인 결과

- repository의 active CI, Docker build, frontend Deployment 설정이 `https://api.newslab.ai.kr`로 정렬되었다.
- production build 산출물에도 신규 domain이 고정되고 기존 domain이 포함되지 않았다.
- backend API code, DB, Supabase SQL, backend Ingress/TLS, secret과 `.env*`는 변경하지 않았다.
- API endpoint와 response schema, component, route, UI/UX, 상태 처리, styling, responsive, accessibility는 변경하지 않았다.
- production rollout과 browser verification 완료 여부는 아직 확인할 수 없다.

## 이번 단계의 의미

- backend 신규 domain 준비 이후 frontend image가 해당 domain을 사용하도록 build될 수 있는 repository 상태를 만들었다.
- build 산출물 검사를 통해 설정 파일 변경이 실제 Next.js output에 반영되는지 정적으로 확인했다.
- 운영 전환 완료는 신규 image의 build/push, rollout과 browser Network 검증 후 확정할 수 있다.

## 포트폴리오용 요약

- Next.js public 환경 변수의 build-time 고정 특성을 근거로 CI, Docker build, Deployment의 API domain을 일관되게 전환했다.
- API client와 UI contract를 유지하면서 production build 산출물을 검사해 신규 domain 반영과 기존 domain 제거를 정적으로 검증했다.

## 다음 단계 후보

- 신규 frontend image build/push
- frontend Deployment manifest server-side dry-run
- frontend Deployment rollout
- frontend HTTPS와 health endpoint 확인
- production browser Network와 console 검증
- 안정화 기간 이후 legacy backend domain 제거 여부를 별도 판단
