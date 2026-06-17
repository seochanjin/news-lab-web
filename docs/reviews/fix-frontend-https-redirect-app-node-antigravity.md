# Antigravity 검토: 프론트엔드 HTTPS 리다이렉트 및 app node 고정

## 검토 요약

- **목적**: http 접속 요청 시 https 강제 리다이렉션을 처리할 Traefik Middleware 설정 및 Ingress 바인딩을 적용하고, frontend Pod가 master node를 배제한 app 전용 노드(`workload=app`)에만 배치되도록 배포 명세서를 보강하며 로컬 검증 결과를 검토함.
- **결과**: Traefik Middleware 리소스 추가 및 Ingress 어노테이션 매핑이 올바르게 구성되었고, Deployment 스케줄링(nodeSelector) 명세서 역시 요구사항대로 안전하게 보완됨. 변경 범위가 소스코드를 제외한 인프라 자산으로 정확히 국한됨을 확인함.

## 요구사항 충족

- **HTTP → HTTPS 자동 전환**: `k8s/news-lab-web-redirect-https-middleware.yaml` 파일을 신설하고, Ingress에 `traefik.ingress.kubernetes.io/router.middlewares: default-news-lab-web-redirect-https@kubernetescrd` 어노테이션을 바인딩하여 안전한 보안 리다이렉트 흐름을 완벽히 구축함.
- **app workload 노드 고정**: `k8s/news-lab-web-deployment.yaml` 내 `spec.template.spec`에 `nodeSelector`를 추가하고 `workload: app`을 주입하여 frontend Pod 2개가 오직 `arm-worker-node`에만 배치되도록 제약을 추가함.
- **런북 가이드 강화**: `docs/RUNBOOK.md`에 HTTP 리다이렉트, https 헬스체크 및 Pod 스케줄링 노드 배치 상태를 조회할 수 있는 kubectl 및 curl 명령어가 명확히 현행화됨.

## 코드 품질과 유지보수성

- **K8s Spec 및 CRD 정합성**: Traefik CRD 표준 명세(`apiVersion: traefik.io/v1alpha1`, `kind: Middleware`)를 엄격히 지켜 명세서를 작성하였으며, YAML 구문 분석에서 이상 없음이 검증됨.
- **최소 변경 원칙 준수**: 비즈니스 로직(Next.js route/component)에 임의의 코드 수정을 가하지 않고, 스케줄링 및 리액션 프록시 선언 영역으로 변경을 정확하게 격리하여 유지보수 안정성을 확보함.

## 프론트엔드 동작과 접근성

- **런타임 기능 안전성**: Next.js 코드 변경이 전혀 감지되지 않아 기존 홈, `/topics`, `/articles` 등 라우트 및 API fetching 동작은 완벽하게 회귀 오류 없이 유지될 것임.

## 보안과 범위 검토

- **시크릿 관리**: Kubeconfig 및 기타 클러스터 인증에 쓰이는 기밀 정보 노출이 없으며, `.env` 및 `.env.*`에 대한 임의의 갱신이 발생하지 않았음을 확인함.
- **통제 범위 준수**: 실제 운영 리소스 변경을 수반할 수 있는 `kubectl apply`, `rollout restart` 명령어는 배제하고 로컬 정적 검증으로 단계를 세밀하게 제약함.

## 검증 기록 검토

- **투명성 유지**: `docs/verification/fix-frontend-https-redirect-app-node.md` 내에 `git diff --check`, YAML 정적 파서 유효성 확인, `git grep` 시크릿 스캔 등이 정상적으로 통과했음이 세부 기록됨.
- **펜딩(Pending) 정책 준수**: 실제 Traefik Middleware 적용, Pod 배치 스케줄링 실상황 관측, 301/308 리다이렉션 curl 결과, 브라우저 렌더링 확인 등은 실제 클러스터 실행 전 "대기 중인 검증(미수행)"으로 구분 명시하여 검토 기준을 충족함.

## 문서 검토

- **런북 가이드 연계**: `docs/RUNBOOK.md`에 `nodeSelector` 스케줄링 규칙과 HTTP permanent redirect 선언에 따른 설명이 명확하게 기술되어 인프라 변경 의도와 문헌이 완벽하게 동기화됨.

## 발견된 문제

- **없음**: 신설된 Middleware 매니페스트 구조, Deployment 노드 선택 어트리뷰트, Ingress 어노테이션 바인딩에 오류나 설계상의 예외는 없음.

## PR 전 필수 수정

- **없음**: PR 제출 및 다음 승인 단계를 밟기 위한 코드/문서상의 필수 조치는 없음.

## 선택 개선 사항

- **pi-worker-node 워크로드 정책 수립 검토**: 현재 런북에 pi-worker-node는 제외 대상으로 명시되어 있으나, 장기적인 엣지 리소스 활용 관점에서 해당 노드 스케줄링 예외/포함 처리에 관한 인프라 로드맵 논의를 이어나갈 것을 권장함.

## 제안 검증 Command

- **K8s 매니페스트 구문 유효성 검사**:
  ```bash
  ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: ok" }' k8s/*.yaml
  ```
- **프론트엔드 빌드 검사**:
  ```bash
  npm run lint
  npm run typecheck
  npm run build
  ```

## 최종 판단

- 본 변경은 HTTP 접속 불안정 문제를 리다이렉트 미들웨어로 해결하고 스케줄링 안정성을 이뤄내기 위해 매니페스트를 정확하게 수정한 상태입니다. 프론트엔드 작업 영역 범위 내에서 안전하게 설계되었으므로, 승인 및 PR 제출 후 실제 클러스터 적용(51차)을 진행할 것을 권장합니다.
