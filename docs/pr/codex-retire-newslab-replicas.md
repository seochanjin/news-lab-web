# NewsLab Web 실행 복제본을 0으로 변경

운영 종료 후 저장소의 Deployment가 다시 적용되더라도 프론트 Pod를 시작하지 않도록 replicas를 2에서 0으로 변경하고 종료 이유를 주석으로 기록한다. 앱 코드와 CI 설정은 변경하지 않는다.

검증: YAML 4개 파싱, replicas 이외 설정 동일 여부, HPA 없음, `git diff --check` 통과. 상세 근거는 `docs/verification/codex-retire-newslab-replicas.md`에 기록했다.

외부 리뷰 및 운영 적용은 수행하지 않았다. 사용자가 PR을 검토하고 병합하며, 실제 재가동 시에는 사람이 복제본 수를 다시 결정해야 한다.
