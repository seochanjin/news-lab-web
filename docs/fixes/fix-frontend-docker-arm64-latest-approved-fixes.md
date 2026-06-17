# 승인된 수정: 프론트엔드 Docker ARM64 이미지 발행 설정 수정

## 사람 승인 대기 중인 수정 후보

Antigravity 검토 결과, PR 전 반드시 반영해야 하는 필수 수정 후보는 발견되지 않았다.

선택 개선 사항으로 `Ingress TLS 템플릿 도입 고려` 제안이 있었으나, 이번 작업 범위에는 포함하지 않는다.

## 승인된 수정

없음.

이번 리뷰에서는 추가 코드/문서 수정이 필요한 항목이 발견되지 않았다.

## 거절 또는 보류한 제안

### 보류: Ingress TLS 템플릿 추가

Antigravity는 후속 TLS 작업을 쉽게 하기 위해 Ingress에 cert-manager annotation 또는 TLS section 예시를 주석으로 추가하는 방안을 제안했다.

다만 이번 작업은 다음 범위에 한정한다.

```text
- Docker Hub ARM64 image 발행 설정 수정
- main branch push 시 latest tag 발행 설정
- frontend Ingress host를 newslab.ai.kr 기준으로 정리
```

TLS 연결은 cert-manager, DNS, Certificate, Order, Challenge 상태 확인까지 함께 검증해야 하므로 별도 작업으로 분리한다.

따라서 이번 작업에서는 TLS annotation, tls section, secretName 예시를 추가하지 않는다.

## 적용한 변경

리뷰 이후 추가 적용한 변경은 없다.

현재 적용된 변경은 기존 작업 범위 내 변경이다.

```text
- .github/workflows/docker-build.yml: ARM64 build 및 latest tag 발행 설정
- k8s/news-lab-web-ingress.yaml: frontend host를 newslab.ai.kr, www.newslab.ai.kr로 변경
- docs/ARCHITECTURE.md: frontend Ingress 도메인 설명 정리
```

## 필요한 검증

추가 수정 사항이 없으므로 기존 검증 계획을 유지한다.

사람이 push/merge 이후 확인할 항목:

```bash
docker pull seocj/news-lab-web:latest

docker image inspect seocj/news-lab-web:latest \
  --format '{{.Architecture}}/{{.Os}}'
```

기대 결과:

```text
arm64/linux
```

이번 작업에서 완료로 주장하지 않을 항목:

```text
- K3s apply 완료
- Pod Running/Ready
- Ingress 운영 연결 완료
- http://newslab.ai.kr 접속 완료
- https://newslab.ai.kr TLS 완료
- 브라우저 UI 검증 완료
```
