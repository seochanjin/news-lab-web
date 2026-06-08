# NewsLab Web 토픽 중심 메인 화면 목업

## 작업 내용

- 메인 화면의 우선순위를 단순 최신 기사 목록에서 토픽/키워드/기사 묶음 중심으로 전환했다.
- 실제 토픽 backend 없이 제품 방향을 검토할 수 있도록 mock prototype UI를 추가했다.
- 기존 `/articles` API 최신 기사 목록은 하단 보조 section으로 유지했다.

## 주요 변경 사항

- NewsLab이 뉴스 흐름 정리 서비스로 제공하려는 가치를 설명하는 상단 section을 추가했다.
- mock data 기반 `오늘의 주요 흐름` topic card를 추가했다.
- mock keyword ranking과 관련 기사 묶음 preview를 추가했다.
- 모든 mock 영역에 `제품 방향 목업`, `예시 데이터`, 실제 분석 결과가 아니라는 안내를 표시했다.
- 기존 header, 검색 UI, category navigation, 중앙 column, 좌우 expansion slot 구조를 유지했다.
- 실제 `/articles` API article list를 `최신 기사 이어보기` 하단 section으로 이동했다.

## API 변경 사항

- 없음.
- 기존 `GET /articles?page=1&page_size=10` 호출을 그대로 유지한다.
- 실제 topic, keyword, clustering API는 추가하지 않았다.

## DB 변경 사항

- 없음.

## README 영향

- 토픽 중심 제품 방향 목업과 실제 `/articles` 목록의 역할을 구분해 문서화했다.
- 토픽 중심 메인 화면 목업 스크린샷(`public/screenshots/main-articles-re01.png`)을 추가하고 README에 반영했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- `npm run build`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" --glob '!node_modules/**' --glob '!.next/**' --glob '!package-lock.json'`
- `npm run dev`
- `curl -sS http://localhost:3000 | rg -o "오늘의 주요 흐름|많이 보이는 키워드|관련 기사 묶음|실제 분석이나 검증 결과가 아닙니다|TechCrunch" | sort -u`

## 확인 결과

- lint, typecheck, build, whitespace check가 통과했다.
- `/`는 dynamic server-rendered route로 유지된다.
- 로컬 `/`에서 mock topic/keyword/group sections, mock disclaimer, 실제 API source `TechCrunch`가 함께 렌더링되었다.
- credential scan은 문서, 환경변수 코드 reference, generated marker, `js-tokens` package false positive만 탐지했으며 실제 secret 값은 없었다.

## 비고

- 실제 AI 요약, 기사 clustering, keyword extraction은 구현하지 않았다.
- 검색, category filtering, pagination/load-more는 구현하지 않았다.
- 토픽 중심 목업 스크린샷은 `public/screenshots/main-articles-re01.png` 경로에 정상 추가 및 반영되었다.
- Backend, DB, Supabase, K3s, Docker, production infrastructure는 수정하지 않았다.
