
# NewsLab Web 메인 레이아웃 MVP 구성

## 작업 목적

NewsLab Web의 첫 사용자-facing 화면으로 사용할 메인 레이아웃 MVP를 구성한다. 실제 API 연동 전에도 기사 목록의 정보 밀도, 검색/카테고리 위치, 사이드바 영역을 검토할 수 있게 만드는 것이 목표다.

## 기존 문제

- 기존 홈 화면은 frontend baseline placeholder라 실제 뉴스 목록 화면의 구조를 검토하기 어려웠다.
- 검색, 카테고리, 기사 목록, 사이드바 배치가 아직 없었다.
- README와 AGENTS.md가 일부 영문 중심이라 현재 팀 문맥에 맞는 한글 안내가 부족했다.

## 변경 내용

- `app/page.tsx`를 게시판형 뉴스 목록 화면으로 교체했다.
- mock article data를 단순 타입/배열로 구성했다.
- Header, search UI, category navigation, article list, 좌우 empty side slot, footer를 구성했다.
- 시각 확인 결과 mock sidebar card가 실제 콘텐츠 없이 화면을 어색하게 만들어 이번 MVP에서는 제거했다.
- `app/globals.css`에서 밝은 화면 기준의 전역 배경과 폰트 fallback을 정리했다.
- README와 AGENTS.md를 한글 중심으로 수정했다.

## 구현 상세

- `Article` 타입은 `id`, `category`, `title`, `source`, `publishedAt`, optional `metadata`, optional `isBreaking`만 가진다.
- 기사 목록은 `ol/li/article` 구조를 사용했고 이미지 없이도 출처, 시간, 상태 정보가 스캔되도록 배치했다.
- Desktop은 `left slot / center article list / right slot` 3단 grid를 사용한다.
- 중앙 column은 `minmax(420px,760px)`로 제한해 기사 목록이 과도하게 넓어지지 않게 했다.
- 좌우 slot은 `aria-hidden` layout container만 렌더링하고 실제 카드나 mock 콘텐츠는 렌더링하지 않는다.
- Mobile에서는 좌우 slot을 숨기고 단일 column으로 로고, 검색창, 카테고리, 기사 목록이 이어진다.
- Header와 category navigation은 동일한 3단 grid를 사용해 검색창과 카테고리가 중앙 기사 목록 기준선과 맞게 했다.

## 대안 검토

- 별도 컴포넌트 파일 분리를 고려했지만, 이번 task는 MVP 화면 하나라 `app/page.tsx` 안에 유지했다.
- 실제 search/category 상태 처리를 넣을 수 있었지만 API 연동과 필터링 로직은 scope 밖이라 UI만 제공했다.

## 선택한 접근과 근거

- 24차 `/articles` API 연동 시 mock 배열만 교체하면 되도록 데이터 구조를 단순하게 유지했다.
- 특정 커뮤니티 UI를 복제하지 않고, 국내 게시판형 정보 밀도를 뉴스 목록에 맞춰 재구성했다.
- 실제 콘텐츠가 없는 sidebar card는 MVP에서 제거하고, 좌우 빈 slot만 남겨 후속 광고/필터/랭킹/수집 상태/추천 영역을 자연스럽게 추가할 수 있게 했다.

## 트레이드오프

- 검색창과 카테고리는 동작 UI가 아니라 시각적/구조적 placeholder다.
- 좌우 slot은 현재 시각적으로 거의 드러나지 않으므로 후속 기능 추가 전까지는 빈 여백 역할만 한다.
- 기사 상세, 페이지네이션, 댓글, 로그인 등 사용자 기능은 없다.
- mock data라 실제 freshness, source normalization, API error/loading state는 검증하지 않는다.

## 테스트

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `git diff --check`: 통과.
- `npm run build`: 통과.
- credential pattern scan: 문서 reference와 `js-tokens` package name false positive만 확인, 실제 secret 값 없음.

## 운영 반영

- 운영 반영 없음.
- 배포, Docker, K3s, Supabase, DB 설정 변경 없음.

## README 업데이트 판단

- 필수. 메인 레이아웃 MVP의 현재 화면 구성과 scope exclusion을 한글 중심으로 정리했다.

## 확인 결과

- Acceptance criteria의 header, search UI, category nav, article list, future side slot, responsive layout 조건을 충족한다.
- 실제 API 연동과 scope 밖 기능은 추가하지 않았다.

## 이번 단계의 의미

- API 연동 전 NewsLab Web의 기본 정보 구조와 화면 밀도를 검토할 수 있는 기준 화면이 생겼다.

## 포트폴리오용 요약

- Next.js App Router 기반으로 이미지 없는 뉴스 목록에 적합한 게시판형 메인 레이아웃 MVP를 구현하고, 중앙 기사 목록과 좌우 확장 slot 구조로 후속 API/광고/랭킹 영역 추가를 준비했다.

## 다음 단계 후보

- `/articles` API 응답 형식 확정 후 mock article data를 실제 fetch 결과로 교체.
- 검색/카테고리 query parameter와 API filter 연동.
- loading, error, empty state 디자인 추가.
