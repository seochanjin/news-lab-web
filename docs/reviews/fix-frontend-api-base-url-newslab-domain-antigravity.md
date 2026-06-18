# Antigravity 검토: 프론트엔드 API base URL을 api.newslab.ai.kr로 전환

## 검토 요약

프론트엔드 API base URL을 기존 `https://api.dev-scj.site`에서 신규 backend 운영 도메인 `https://api.newslab.ai.kr`로 안전하게 전환했습니다. CI/CD 파이프라인, Docker build arg, Kubernetes Deployment manifest의 환경 변수가 적절히 수정되었고, 이에 수반되는 Next.js 환경 변수의 build-time 고정 특성에 대한 설명이 관련 아키텍처 및 런북 문서에 충실하게 보완되었습니다. 불필요한 소스 코드 수정 없이 전환에 필요한 설정 파일만 최소한의 범위로 정확하게 변경되었습니다.

## 요구사항 충족

- [x] frontend의 backend API base URL 설정을 `https://api.newslab.ai.kr`로 변경
- [x] GitHub Actions Docker build 단계에서 API base URL build arg 신규 도메인 전환 (`.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`)
- [x] K3s frontend Deployment manifest의 API base URL 환경 변수 수정 (`k8s/news-lab-web-deployment.yaml`)
- [x] 기존 도메인 `api.dev-scj.site`는 런북 및 아키텍처 문서에서 rollback/병행 운영 문맥에만 존재하도록 정리 완료

## 코드 품질과 유지보수성

- API 호출부(`lib/api/topics.ts`, `lib/api/articles.ts`)는 기존의 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` 환경 변수 참조 설계를 그대로 따르고 있어 컴포넌트나 API client 등의 코드 수준 변경이 전혀 필요하지 않았습니다. 변경 영향도가 설정 레벨로 국한되어 유지보수성이 매우 높습니다.
- 과도한 리팩토링이나 외부 의존성(dependency) 추가 없이 오직 필요한 환경 설정 변경만 최소한으로 적용되었습니다.

## 프론트엔드 동작과 접근성

- UI 컴포넌트, 스타일, 라우팅, 상태 관리(loading, error, empty) 등의 핵심 프론트엔드 로직에 어떠한 변경도 발생하지 않았으므로, 변경 전의 프론트엔드 사용자 경험 및 웹 접근성(Accessibility)에 미치는 regression 위험이 전혀 존재하지 않습니다.

## 보안과 범위 검토

- `.env` 및 `.env.*` 파일에 임의 수정을 가하지 않았으며, Git에 비밀번호나 인증 토큰 같은 secret 정보가 유출되지 않았음을 credential pattern scan 결과를 통해 검증했습니다.
- `NEXT_PUBLIC_*` 접두사가 포함된 환경 변수는 Next.js 설계상 브라우저에 노출되는 public 설정이므로 도메인 주소가 노출되어도 보안상 무방합니다.
- backend 저장소, DB, Ingress TLS 등의 작업 외 범위의 리소스는 수정되지 않았습니다.

## 검증 기록 검토

- `docs/verification/fix-frontend-api-base-url-newslab-domain.md` 문서에 로컬 린트(`npm run lint`), 타입체크(`npm run typecheck`), 빌드(`npm run build`) 등의 사전 정적 검증이 모두 성공적으로 진행 및 기록되었음을 확인했습니다.
- 특히 Next.js production 빌드 산출물 내에 신규 도메인인 `api.newslab.ai.kr`만 정상 반영되고 기존 도메인인 `api.dev-scj.site` 참조가 완전히 제거되었는지 빌드 폴더를 탐색하여 확인한 검증 방식은 빌드 타임 환경 변수 고정 문제를 잘 확인한 우수한 사례입니다.
- 실제 production 환경 배포 및 배포 후 브라우저 동작 검증은 아직 수행되지 않았음을 명확히 명시하고, 이를 "대기 중인 검증(Pending)"으로 분리하여 사실에 기반한 검증 기록을 작성하였습니다.

## 문서 검토

- `docs/ARCHITECTURE.md` 및 `docs/RUNBOOK.md`에 Next.js의 `NEXT_PUBLIC_*` 변수 특성(빌드 시 번들에 하드코딩되므로 도메인 변경 시 컨테이너 이미지를 다시 빌드하고 롤아웃해야 함)을 명확하게 문서화하였습니다.
- 런북 문서에 신규 롤아웃 배포 이후 실제로 수동 검증을 위해 호출할 curl 명령어 및 확인해야 할 브라우저 Network 탭 성공/실패 조건들이 일목요연하게 정리되어 있어 향후 안정적인 검증이 가능합니다.

## 발견된 문제

- 없음. (작업 요구사항 및 규칙을 철저히 준수하여 변경이 완료되었습니다.)

## PR 전 필수 수정

- 없음.

## 선택 개선 사항

- 없음.

## 제안 검증 Command

실제 롤아웃 수행 후, 배포 담당자가 아래 명령어를 통해 최종 검증할 것을 권장합니다.

```bash
# 1. K3s Deployment 롤아웃 완료 상태 대기 및 확인
KUBECONFIG=~/.kube/oci-k3s.yaml kubectl rollout status deployment/news-lab-web

# 2. 운영 환경 프론트엔드 HTTPS 도메인 및 Health check endpoint 정상 응답 확인
curl -I https://newslab.ai.kr
curl -sS https://newslab.ai.kr/api/health
```

## 최종 판단

- **승인 (Approve)**
  - 본 프론트엔드 API base URL 도메인 전환 작업은 요구사항에 맞춰 안전하게 설계 및 변경이 이루어졌으며, 로컬 검증 기록 역시 우수하므로 PR 진행을 승인합니다.
