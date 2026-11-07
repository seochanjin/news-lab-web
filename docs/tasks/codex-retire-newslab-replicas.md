# NewsLab Web 운영 종료 상태 반영

- 사용자 요청: 저장소에 남은 실행 복제본 수를 0으로 바꾸어 재적용 시에도 프론트 Pod가 시작되지 않도록 한다.
- 브랜치: `codex/retire-newslab-replicas`
- 허용 변경: `k8s/news-lab-web-deployment.yaml`의 replicas 및 종료 주석, 이 브랜치의 workflow 문서.
- 기존 `replicas: 2`를 `replicas: 0`으로 변경한다. 사용자 명시적 요청에 한해 AGENTS.md의 일반 인프라 변경 제한을 예외로 적용한다.
- 앱 코드, 환경 파일, Secret, image, Service, Ingress, CI 설정은 변경하지 않는다.
- 로컬 YAML 파싱, 기존 manifest와 replicas 이외 설정 동일 여부, HPA 유무, whitespace를 검증한다.
- 최초 구현은 로컬 변경까지만 수행했다. 이후 사용자가 PR 생성을 명시적으로 요청하여 이 브랜치의 커밋·푸시 및 main 대상 PR 생성을 승인했다.
- 운영 적용과 PR 병합은 수행하지 않는다.
