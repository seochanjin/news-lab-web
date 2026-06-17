# Antigravity 검토: Frontend Docker/K3s 배포 기반 구성

## 검토 요약

- **목적**: NewsLab Web frontend의 K3s 클러스터 운영을 위한 Dockerfile, GitHub Actions 빌드/푸시 워크플로우, K3s manifests(Deployment, Service, Ingress) 배포 기반 파일 작성 및 로컬 검증 결과 검토.
- **결과**: 요구사항대로 실제 운영 클러스터에 영향을 주지 않는 범위에서 배포 기반 파일이 정확하게 추가 및 작성되었으며, 아키텍처 및 런북 문서 갱신이 완료됨. 로컬 환경에서의 Docker 이미지 빌드 및 런타임 헬스 체크 등이 엄밀히 검증됨.

## 요구사항 충족

- **Next.js Standalone**: `next.config.ts`에 `output: "standalone"` 설정을 선언하여 Next.js의 self-hosting 기능을 안전하게 활성화함.
- **배포 인프라 자산 구축**: K3s 배포를 위한 Deployment, Service(ClusterIP), Ingress manifest 초안이 `k8s/` 디렉터리에 완벽히 구성됨.
- **워크플로우 초안**: 리포지토리 보안(secrets)을 유출하지 않으면서 `main` 브랜치 및 태그 push 이벤트에서 빌드 및 푸시되도록 하는 `.github/workflows/docker-build.yml` 초안 작성이 충족됨.
- **문서 동기화**: `docs/ARCHITECTURE.md`와 `docs/RUNBOOK.md`에 standalone 컨테이너 실행 구조 및 수동 배포 단계 설명이 명확하게 업데이트됨.

## 코드 품질과 유지보수성

- **Multi-stage 빌드**: `Dockerfile`이 `deps`, `builder`, `runner` 단계를 정확히 분리하여 빌드 과정의 의존성 및 용량을 최소화함.
- **컨텍스트 최적화**: `.dockerignore`를 통해 로컬 빌드 부산물, `node_modules`, 워크플로우 문서 및 `.env*` 등을 제외함으로써 안전하고 효율적인 빌드 구조를 유지함.
- **정적 유효성 확인**: Ruby YAML parser 및 client-side validation 검증을 통해 YAML 구성 파일들의 구문 오류가 없음이 증명됨.

## 프론트엔드 동작과 접근성

- **빌드 인자 처리**: `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 빌드 파라미터(`ARG`/`ENV`)로 받아 브라우저 번들링 과정에서 기존 개발 API 타겟(https://api.dev-scj.site)이 정상 주입됨을 확인하였고, 이로 인한 프론트엔드 오작동 위험을 사전에 방지함.
- **컨테이너 구동 및 마크업 검증**: 로컬 포트 3000번으로 구동된 컨테이너에서 curl 마커 조회를 진행해 `/`, `/topics`, `/articles` 등 기존 주요 라우트들의 시맨틱 HTML 응답이 정상 반환됨을 확인하여 기존 프론트엔드 기능에 대한 회귀(regression) 우려가 없음을 확인받음.

## 보안과 범위 검토

- **시크릿 노출 전무**: Docker Hub 자격 증명 등의 민감 데이터는 GitHub secrets를 활용해 처리하며, 코드베이스 상에 하드코딩되거나 노출된 자격 증명은 전혀 없음.
- **작업 범위 완벽 통제**: 실제 클러스터 리소스 변경을 유발하는 `kubectl apply`(dry-run 제외)나 `rollout` 명령어는 일절 실행하지 않고 프론트엔드 정적 파일 구축 수준으로 안전하게 제한함.

## 검증 기록 검토

- **투명한 검증 역사 기록**: `docs/verification/feature-frontend-deployment-baseline.md`에 로컬 빌드, 빌드 인자 테스트, Docker 데몬 기동 관련 장애 대응 기록 등이 매우 투명하고 정밀하게 작성되어 검증에 대한 확실한 신뢰도를 확보함.
- **섣부른 배포 주장 배제**: 수동 브라우저 테스트 및 실제 프로덕션 롤아웃은 "미수행"으로 표시하여, 과도한 검증 완료 주장(over-assertion) 없이 명확히 펜딩 처리하여 검토 기준을 충족함.

## 문서 검토

- **런북과 아키텍처 연계**: `docs/ARCHITECTURE.md`에 신규 배포 가이드라인 및 API 전달 방식을 구조화하였고, `docs/RUNBOOK.md`에 향후 수동 롤아웃을 준비할 사람(승인자)을 위한 단계적 명령어가 적절히 추가되어 문서와 코드의 불일치성이 해결됨.

## 발견된 문제

- **없음**: 본 변경 건에 대한 치명적인 결함이나 코드/인프라 설계상의 버그는 감지되지 않음.

## PR 전 필수 수정

- **없음**: PR을 개시하고 다음 수동 승인 단계를 진행하는 데 방해가 될 만한 필수 수정 조치는 요구되지 않음.

## 선택 개선 사항

- **Ingress TLS 템플릿 추가**: 추후 50차로 계획된 도메인 및 TLS 연결 시 수월하게 작업을 이어나갈 수 있도록, `k8s/news-lab-web-ingress.yaml` 내부에 TLS 비밀값(SecretName) 및 TLS 호스트 매핑 템플릿(주석 형태)을 미리 구비해 두는 것을 권장함.
- **헬스체크 전용 엔드포인트 설계**: Deployment의 Readiness/Liveness Probe가 홈 루트 `/` 경로를 조회 중인데, 성능상 오버헤드를 줄이기 위해 별도의 가벼운 Next.js API route(예: `/api/health` 또는 `app/api/health/route.ts`)를 개설하여 전용 프로브 경로로 등록하는 방안을 장기적으로 검토할 것을 권장함.

## 제안 검증 Command

- **로컬 빌드 및 린트 검사**:
  ```bash
  npm run lint
  npm run typecheck
  npm run build
  ```
- **Docker 빌드 및 로컬 런타임 확인**:
  ```bash
  docker build --build-arg NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site -t news-lab-web:local .
  docker run --rm -p 3000:3000 news-lab-web:local
  ```
- **YAML 파싱 검사**:
  ```bash
  ruby -e 'require "yaml"; ARGV.each { |f| docs = YAML.load_stream(File.read(f)); raise "empty YAML: #{f}" if docs.empty?; puts "#{f}: ok" }' k8s/*.yaml
  ```

## 최종 판단

- 본 배포 기반 구성 변경은 요구되는 standalone 빌드 요건, 컨테이너 빌드 테스트, K3s manifests 구성, 문서 갱신 및 보안 규칙을 성실히 이행했습니다. 검증 기록 역시 로컬 레벨에서의 성공/실패 기록이 엄격하게 분리 작성되어 안전합니다. PR 제출 진행 및 후속 수동 배포 단계(49차)로의 이행을 승인 제안합니다.
