# NewsLab Web 종료 설정 기록

- 기존 프론트 Deployment replicas 2를 0으로 변경했다.
- 애플리케이션 코드, CI, 환경 파일, Secret, 서비스 및 Ingress 설정은 유지했다.
- 서버 적용 없이 원본 저장소의 별도 브랜치에서 준비했다.
- 실제 검증은 `docs/verification/codex-retire-newslab-replicas.md`에 기록한다. 외부 리뷰는 미수행이다.

- 사용자가 후속으로 커밋·푸시 및 main 대상 PR 생성을 승인했다. 운영 적용과 병합은 이 작업에 포함하지 않는다.
