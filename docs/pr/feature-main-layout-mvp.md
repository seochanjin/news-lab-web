
# NewsLab Web 메인 레이아웃 MVP 구성

## 작업 내용

- NewsLab Web 메인 화면을 mock article data 기반의 게시판형 뉴스 목록 MVP로 구현했다.
- 실제 `/articles` API 연동 없이 이후 교체하기 쉬운 단순 데이터 구조를 `app/page.tsx`에 두었다.
- README와 AGENTS.md를 한글 중심으로 정리하고 기존 Next.js generated warning block은 보존했다.

## 주요 변경 사항

- Header에 NewsLab 서비스명과 검색창 UI를 추가했다.
- 카테고리 navigation에 전체, 정치, 경제, 기술, 세계, 사회, AI 항목을 구성했다.
- 이미지 없는 텍스트 중심 기사 목록을 category, title, source, time, metadata로 렌더링했다.
- 좌우 대칭 슬롯(`data-layout-slot="left"` 및 `"right"`)을 비워두는 3단 레이아웃 구조를 적용하여 향후 광고, 필터, 인기 키워드 영역 배치에 대비했다.
- Desktop에서는 좌우 슬롯을 활성화하여 중앙 기사 정렬의 균형을 유지하고, mobile에서는 슬롯을 숨겨 기사 본문에 집중하는 반응형 구조를 구현했다.
- 좌우 slot은 실제 콘텐츠를 렌더링하지 않는 layout container로 남겨 후속 광고, 필터, 랭킹, 수집 상태, 추천 영역 추가 여지를 확보했다.
- 중앙 기사 목록은 `minmax(420px, 760px)` 기준으로 제한해 너무 넓어지지 않게 했다.
- Header는 로고를 왼쪽, 검색창을 중앙 column에 배치하고 카테고리 navigation도 중앙 기사 목록 시작 위치에 맞췄다.
- Mobile에서는 좌우 slot을 숨기고 로고, 검색창, 카테고리, 기사 목록이 세로로 배치되도록 했다.
- `app/globals.css`의 기본 배경, box sizing, 한글 fallback font를 정리했다.

## API 변경 사항

- 없음. 실제 API fetch, typed API client, `/articles` 연동은 추가하지 않았다.

## DB 변경 사항

- 없음.

## README 영향

- 프로젝트 설명, 로컬 실행, 현재 화면 구성, 환경변수, 검증, 범위 안내를 한글 중심으로 정리했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- `npm run dev`
- `curl -I http://localhost:3000`
- `npm run build`
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`
- `rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" --glob '!node_modules/**' --glob '!.next/**' --glob '!package-lock.json'`

## 확인 결과

- lint, typecheck, build, whitespace check가 통과했다.
- credential scan은 문서의 `.env` 안내, `AGENTS.md`의 generated warning marker, `package-lock.json`의 `js-tokens` 패키지명을 탐지했으나 실제 secret 값은 확인되지 않았다.

## 비고

- Backend, DB, Supabase, K3s, Docker, production infrastructure는 수정하지 않았다.
- 로그인, 댓글, 글쓰기, 기사 상세, 페이지네이션, 실제 광고 스크립트는 구현하지 않았다.
