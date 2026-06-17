# 승인된 수정: 프론트엔드 K3s 배포 및 newslab.ai.kr TLS 연결

## 사람 승인 대기 중인 수정 후보

Antigravity 검토 결과, PR 전 반드시 반영해야 하는 필수 수정 후보는 발견되지 않았다.

## 승인된 수정

없음.

이번 리뷰에서는 추가 코드/문서 수정이 필요한 항목이 발견되지 않았다.

## 거절 또는 보류한 제안

없음.

Antigravity의 선택 개선 사항은 readiness/liveness probe가 `/api/health`를 사용하는지 후속 K3s dry-run 및 실제 apply 단계에서 확인하라는 검증 관점의 제안이다. 해당 probe 설정은 이미 `k8s/news-lab-web-deployment.yaml`에 반영되어 있으므로 추가 manifest 수정은 하지 않는다.

## 적용한 변경

리뷰 이후 추가 적용한 변경은 없다.

현재 적용된 변경은 기존 작업 범위 내 변경이다.

- `k8s/news-lab-web-ingress.yaml`
  - `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation 추가
  - `newslab.ai.kr`, `www.newslab.ai.kr` TLS hosts 추가
  - `secretName: news-lab-web-tls` 추가
- `docs/ARCHITECTURE.md`
  - frontend Ingress/TLS 설명 보강
- `docs/RUNBOOK.md`
  - frontend K3s 배포 및 TLS 확인 명령 보강
- `docs/verification/feature-frontend-k3s-tls-deploy.md`
  - 정적 검증 및 pending 운영 검증 기록

## 필요한 검증

PR merge 이후 사람이 직접 다음을 수행한다.

- K3s server-side dry-run
- K3s apply
- Deployment rollout 확인
- Pod Running/Ready 확인
- Service port-forward `/api/health` 확인
- HTTP Host header 기반 Ingress 확인
- cert-manager Certificate/Order/Challenge/Secret 확인
- HTTPS 확인

수행하지 않은 K3s apply, rollout, TLS 발급, HTTPS, browser 검증은 완료로 기록하지 않는다.
