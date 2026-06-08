
# NewsLab Web 기사 목록 API 연동

## 작업 내용

- NewsLab backend의 `GET /articles?page=1&page_size=10` API를 메인 기사 목록에 연결했다.
- 기존 header, 검색 UI, category navigation, 중앙 기사 목록, 좌우 expansion slot 레이아웃을 유지했다.
- mock article data를 제거하고 실제 API 응답을 화면용 view model로 변환해 렌더링했다.

## 주요 변경 사항

- `ArticlesApiArticle`, `ArticlesApiResponse`, `ArticleViewModel` 타입을 정의했다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`에서 base URL을 읽고 Server Component에서 `cache: "no-store"`로 API를 호출한다.
- backend category를 한글 표시명으로 변환하고, `published_at`을 한국 시간 기준으로 표시한다.
- summary를 우선 metadata로 사용하고 summary가 없으면 tags를 표시한다.
- 유효한 `http`/`https` 기사 URL이 있으면 title을 안전한 외부 링크로 렌더링한다.
- API error, empty article list, loading 상태를 중앙 기사 목록 영역에 추가했다.
- README에 API 연동 방식과 pending screenshot 경로를 문서화했다.

## API 변경 사항

- Backend API 변경 없음.
- Frontend에서 기존 `GET /articles?page=1&page_size=10` endpoint를 사용한다.

## DB 변경 사항

- 없음.

## README 영향

- mock data 설명을 실제 `/articles` API 연동 설명으로 변경했다.
- API 호출 방식, view model 변환, 상태 화면, screenshot pending 경로를 추가했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- `npm run build`
- actual `/articles?page=1&page_size=10` response shape 확인 명령
- `npm run dev`
- `curl -sS http://localhost:3000` 결과에서 `TechCrunch` 렌더링 확인
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" --glob '!node_modules/**' --glob '!.next/**' --glob '!package-lock.json'`

## 확인 결과

- lint, typecheck, build, whitespace check가 통과했다.
- 실제 API 응답은 `count=10`, `total=83`, `has_next=true`였고 첫 기사 source/category가 `TechCrunch`/`tech`였다.
- 개발 서버 `/`가 200을 반환했고 실제 API source인 `TechCrunch`가 HTML에 렌더링되었다.
- credential scan은 문서와 환경변수 코드 reference, generated marker, `js-tokens` package false positive만 탐지했으며 실제 secret 값은 없었다.

## 비고

- 검색, category filtering, pagination UI는 구현하지 않았다.
- Screenshot은 `public/screenshots/main-articles-api.png` 경로에 정상 추가 및 반영되었다.
- Backend, DB, Supabase, K3s, Docker, production infrastructure는 수정하지 않았다.
