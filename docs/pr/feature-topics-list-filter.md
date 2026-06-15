# 주요 이슈 아카이브 검색 및 날짜 필터 MVP

## 작업 내용

- 전체 topic을 탐색할 수 있는 `/topics` 주요 이슈 아카이브 route를 추가했다.
- 기존 Topics 목록 API와 `TopicCard`, `SiteHeader`, `/topics/{id}` 상세 route를 재사용했다.
- 승인된 수정에 따라 목록 카드가 먼저 보이도록 검색/날짜 필터를 기본 접힘 보조 패널로 정리했다.

## 주요 변경 사항

- `app/topics/page.tsx`에서 `getTopics(1, 50)`을 호출하고 `TopicExplorer`에 초기 topic을 전달한다.
- `TopicExplorer` Client Component에서 title, summary, keywords, topic_date 검색과 날짜 필터, 초기화를 처리한다.
- 필터 패널은 기본적으로 접혀 있으며 `aria-expanded`와 `aria-controls`가 있는 버튼으로 열고 닫는다.
- 패널이 닫혀 있어도 적용된 검색어·날짜와 현재 결과 개수를 확인할 수 있다.
- API empty와 필터 결과 empty 상태를 구분하고 결과 개수를 live region으로 표시한다.
- `/topics` route-level loading/error UI와 홈의 `/topics` 전체 목록 link를 추가했다.
- Architecture 문서를 현재 목록 explorer 구조에 맞게 갱신했다.

## 프론트엔드/API 영향

- 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`과 `GET /topics?page=1&page_size=50` contract를 재사용한다.
- Server Component가 topic 목록을 조회하고 Client Component가 현재 응답 내에서 필터링한다.
- Backend 검색/날짜 필터 query parameter와 API client contract는 추가하거나 변경하지 않았다.
- 기존 `/topics/{id}` 상세 route와 Topic card link 동작을 유지한다.
- Backend API, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*` 변경 없음.

## 상태 및 UX 영향

- 페이지 제목과 설명을 “주요 이슈 아카이브” 맥락으로 정리했다.
- 본문 필터가 자동 생성된 주요 이슈 목록 내부에 적용된다는 보조 문구를 표시한다.
- 검색어는 앞뒤 공백을 제거하고 title, summary, keywords, topic_date를 대소문자 구분 없이 includes 방식으로 검사한다.
- 날짜 선택지는 API 응답의 unique topic_date를 최신순으로 표시하며 검색어와 함께 적용할 수 있다.
- Loading, error, API empty, filter empty, success 상태를 제공한다.
- 필터 패널 내부 form은 모바일에서 세로로 쌓이고 desktop에서 한 줄로 배치된다.
- 검색/날짜 label, 패널 토글 접근성 속성, 결과 `aria-live`, keyboard focus 가능한 Topic card를 유지한다.
- `/topics`에서는 기존 category에 잘못된 `aria-current`를 표시하지 않는다.

## README 영향

- 없음. 실행 방법, 환경 변수명, dependency와 사용자 설정이 변경되지 않았다.
- Route/API 구조 변경은 `docs/ARCHITECTURE.md`에 반영했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- Topics API read-only response shape 확인
- `npm run dev`와 `/topics`, 홈, 기존 상세 route 로컬 HTML marker 확인
- 접힌 필터 패널, 필터 로직, empty/live region 코드 marker 확인
- Credential pattern scan

## 확인 결과

- Lint, 최종 단독 typecheck, build, shell syntax, whitespace 검증이 통과했다.
- Build에서 `/topics`와 `/topics/[id]` dynamic server-rendered route가 유지되었다.
- Topics API read-only 응답에서 topic 12개, 날짜 4개, `has_next=false`를 확인했다.
- 초기 `/topics` HTML에서 아카이브 문구, `aria-expanded="false"`, “필터 열기”와 topic 상세 link 12개를 확인했다.
- 초기 `/topics` HTML에 검색 input, 날짜 select, filter panel이 노출되지 않는 것을 확인했다.
- 홈 전체 목록 link와 기존 `/topics/7` 상세 marker가 유지되었다.
- 검색/날짜 결합 필터, 초기화, 적용 상태 표시는 코드 존재만 확인했다.
- Credential scan에서 문서와 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.
- 상세 결과는 `docs/verification/feature-topics-list-filter.md`를 따른다.

## 비고

- 실제 브라우저에서 필터 패널 열기/닫기, 검색/날짜 적용, 목록 감소, 초기화, responsive, keyboard, screen reader, console 검증은 pending이다.
- 승인된 수정만 적용했으며 보류된 header 검색/category navigation 연결과 Turbopack development ChunkLoadError 대응은 구현하지 않았다.
- Backend 검색/날짜 필터, 서버 pagination 고도화, 이미지, provider/model 숨김, summary clamp, 관리자 기능은 구현하지 않았다.
- Production API 요청은 read-only contract 확인이며 production verification 완료를 의미하지 않는다.
- GitHub Actions, PR 생성/merge, deployment, production verification은 수행하지 않았다.
