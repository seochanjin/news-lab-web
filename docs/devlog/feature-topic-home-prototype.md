# NewsLab Web 토픽 중심 메인 화면 목업

## 작업 목적

NewsLab 메인 화면을 최신 기사 목록 중심에서 토픽과 뉴스 흐름 중심의 제품 방향 목업으로 전환한다. 실제 backend 기능 구현 전에 사용자가 NewsLab을 이용할 이유가 화면에서 전달되는지 빠르게 검토하는 것이 목적이다.

## 기존 문제

- 실제 `/articles` 목록은 연결되어 있지만 현재 source 특성상 TechCrunch 최신 기사 목록처럼 보여 차별화된 사용자 가치가 약했다.
- 비슷한 기사 묶음, 많이 등장한 키워드, 주요 흐름 정리라는 NewsLab의 제품 방향이 화면에 드러나지 않았다.
- 개별 기사 목록이 첫 화면 우선순위를 차지해 사용자가 전체 뉴스 흐름을 먼저 파악하기 어려웠다.

## 변경 내용

- 메인 상단에 NewsLab의 뉴스 흐름 정리 가치를 설명하는 section을 추가했다.
- mock topic cards, keyword ranking, related article group preview를 추가했다.
- 실제 `/articles` 최신 기사 목록을 하단 보조 section으로 이동했다.
- mock 영역이 실제 분석 또는 AI 결과로 오해되지 않도록 화면 copy를 추가했다.
- README에 prototype과 실제 API 영역의 차이, deferred backend work를 문서화했다.

## 구현 상세

- `MockTopic`, `MockKeyword`, `MockArticleGroup` 타입과 단순 배열을 `app/page.tsx`에 정의했다.
- `TopicPrototype`은 가치 설명, 오늘의 주요 흐름, 키워드, 기사 묶음 영역을 렌더링한다.
- 각 mock topic card에는 category, 예시 article count, 흐름 설명, signal keywords를 표시한다.
- keyword 영역은 순위와 맥락 label을 표시한다.
- related article group은 향후 clustering 결과가 들어올 형태를 가정한 제목 목록 preview다.
- 실제 `ArticleList`의 fetch, error, empty, loading, external link 동작은 변경하지 않았다.
- 중앙 3단 layout의 center column 내부를 stack으로 바꿔 prototype section 다음에 실제 article list를 배치했다.

## 대안 검토

- 실제 `/articles` 데이터를 frontend에서 임의 clustering할 수 있었지만, 정확하지 않은 로직이 제품 기능처럼 보일 위험이 있어 하지 않았다.
- mock 영역을 별도 route로 만들 수 있었지만 메인 화면 제품 방향을 직접 검토하는 것이 목적이라 `/`에 배치했다.

## 선택한 접근과 근거

- 실제 data pipeline이 없는 상태이므로 mock data를 명확히 표시한 prototype으로 화면 정보 구조만 검증한다.
- 실제 기사 목록은 유지해 현재 동작하는 backend 연결과 향후 토픽 기능의 관계를 함께 확인할 수 있게 했다.
- 기존 header/category/expansion slots를 유지해 이전 layout 작업의 범위를 보존했다.

## 트레이드오프

- mock topic, keyword, group 내용은 실제 최신 기사나 backend 분석 결과와 연결되지 않는다.
- prototype section이 추가되어 실제 최신 기사 목록은 첫 화면 아래로 내려간다.
- 실제 요약 품질, clustering 정확도, keyword freshness는 검증할 수 없다.

## 테스트

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `git diff --check`: 통과.
- `npm run build`: 통과. `/` dynamic server-rendered route 유지.
- credential pattern scan: 실제 secret 값 없음.
- `npm run dev`: 통과.
- local render 확인: mock topic/keyword/group/disclaimer와 실제 API source `TechCrunch` 렌더링, `GET / 200`.

## 운영 반영

- 운영 반영 없음.
- Backend, DB, Supabase, K3s, Docker, production infrastructure 변경 없음.

## README 업데이트 판단

- 필수. prototype UI와 실제 `/articles` 영역의 차이, deferred backend/data pipeline scope, screenshot pending 상태를 문서화했다.

## 확인 결과

- 메인 화면에서 최신 기사보다 오늘의 주요 흐름과 keyword/group preview가 먼저 보인다.
- mock 영역은 실제 분석 결과가 아니라는 점이 화면과 문서에 명확하다.
- 실제 `/articles` 기반 최신 기사 목록과 외부 링크는 유지된다.

## 이번 단계의 의미

- NewsLab을 단순 기사 목록 서비스가 아니라 뉴스 흐름 정리 서비스로 발전시키기 위한 첫 화면 정보 구조를 검토할 수 있게 되었다.

## 포트폴리오용 요약

- 실제 기사 API 목록을 유지하면서 mock topic, keyword ranking, related article groups를 추가해 뉴스 흐름 정리 서비스의 제품 방향을 빠르게 검증하는 Next.js 메인 화면 prototype을 구현했다.

## 다음 단계 후보

- topic/clustering backend response 설계.
- keyword extraction pipeline과 ranking 기준 정의.
- 한국어 summary 생성 및 검증 정책 설계.
- 실제 topic data 기반 loading/error/empty state 설계.
- 토픽 중심 prototype screenshot 업데이트.
