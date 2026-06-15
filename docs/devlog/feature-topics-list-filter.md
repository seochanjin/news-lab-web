# 주요 이슈 아카이브 검색 및 날짜 필터 MVP

## 작업 목적

홈에 일부 표시되는 자동 생성 topic을 전체 아카이브에서 검색어와 날짜로 탐색할 수 있게 한다.

## 기존 문제

- 홈은 topic 일부만 보여주며 전체 topic을 찾는 전용 route가 없었다.
- 생성 날짜가 여러 날에 걸쳐 있어 원하는 topic을 제목이나 키워드로 빠르게 찾기 어려웠다.
- Backend에는 이번 범위에서 사용할 검색/날짜 필터 API가 없었다.
- 본문 필터를 항상 크게 노출하면 공용 header의 기사 검색/category navigation과 역할이 혼동될 수 있었다.

## 변경 내용

- `/topics` 주요 이슈 아카이브 Server Component route와 route-level loading/error 상태를 추가했다.
- Topic 목록을 client-side에서 검색하고 날짜로 좁히는 `TopicExplorer`를 추가했다.
- 승인된 수정에 따라 필터를 기본 접힘 보조 패널로 변경하고 페이지 문구를 아카이브 맥락으로 정리했다.
- 기존 `TopicCard`와 `SiteHeader`, `/topics/{id}` 상세 route를 재사용했다.
- 홈 topic section에 전체 아카이브 link를 추가했다.
- Architecture와 workflow 문서를 실제 구현 및 검증 결과에 맞게 갱신했다.

## 구현 상세

- `/topics` page는 `getTopics(1, 50)`으로 기존 Topics API response를 조회한다.
- 직렬화 가능한 topic 배열과 total만 Client Component인 `TopicExplorer`에 전달한다.
- 검색어는 trim 후 locale lowercase로 정규화하고 title, summary, keywords, topic_date를 includes 방식으로 검사한다.
- 날짜 목록은 topic_date의 unique 값을 만들고 문자열 최신순으로 정렬한다.
- 날짜 필터는 선택한 topic_date와 정확히 일치하는 topic만 남기며 검색 조건과 함께 적용한다.
- 필터 패널은 기본 `filtersOpen=false`이며 토글 버튼의 `aria-expanded`와 `aria-controls`로 상태와 대상 영역을 연결한다.
- 패널이 닫힌 상태에서도 활성 검색어·날짜와 현재 결과 개수를 표시하고, 검색 input·날짜 select·초기화 버튼은 열린 경우에만 렌더링한다.
- API items가 없을 때와 필터 결과가 없을 때 서로 다른 empty state를 표시한다.
- 결과 개수는 `aria-live="polite"`와 `role="status"`로 변경을 알린다.
- 열린 필터 form은 모바일에서 세로, desktop에서 검색/날짜/초기화 한 줄 구조를 사용한다.
- 기존 Topic card link와 focus style을 재사용해 상세 route 이동과 keyboard 접근성을 유지한다.
- `SiteHeader`는 active category를 전달하지 않아 `/topics`에서 잘못된 `aria-current`를 표시하지 않는다.

## 대안 검토

- Backend 검색/날짜 query parameter를 추가할 수 있지만 이번 작업 범위 밖이며 현재 확인된 12건은 client-side filtering으로 충분하다.
- URL search params와 서버 필터링을 사용할 수 있지만 이번 MVP는 현재 응답 내 빠른 상호작용이 목표라 local state를 선택했다.
- 기존 홈 `TopicList`를 목록 explorer로 확장할 수 있지만 홈의 loading/error/first-card layout 책임과 필터 상태가 섞이므로 별도 컴포넌트로 분리했다.
- 필터 form을 항상 노출할 수 있지만 목록보다 필터가 먼저 강조되고 header 탐색 기능과 혼동될 수 있어 승인된 기본 접힘 보조 패널을 적용했다.
- Header 검색/category navigation을 article 목록에 연결하는 방안과 Turbopack development ChunkLoadError 대응은 승인 문서에서 보류되어 적용하지 않았다.

## 선택한 접근과 근거

기존 Server Component API fetch 패턴을 유지하고, 상호작용이 필요한 필터 상태만 Client Component 경계로 분리했다. 기존 API client, Topic card, 공용 header를 재사용해 backend contract와 상세 route를 변경하지 않았다. 필터는 보조 패널로 낮춰 topic 카드가 주 콘텐츠로 먼저 보이게 하고, 패널이 닫혀도 적용 상태는 잃지 않도록 구성했다.

## 트레이드오프

- 현재 API 응답의 첫 50건만 client-side filtering 대상이며 서버 pagination 고도화는 하지 않았다.
- 필터 상태가 URL에 저장되지 않아 새로고침이나 링크 공유 시 조건이 유지되지 않는다.
- 모든 topic card 데이터가 Client Component로 전달되지만 현재 데이터 규모에서는 구현이 단순하고 빠른 상호작용을 제공한다.
- 필터가 기본으로 접혀 있어 처음 사용하는 사용자는 토글을 한 번 열어야 하지만 topic 목록과 header 탐색 기능의 역할 구분은 명확해진다.
- 실제 패널 열기/닫기, 검색/날짜 상호작용과 responsive/keyboard 동작은 브라우저에서 검증하지 않았다.

## 테스트 및 브라우저 확인

- `npm run lint`: 통과
- `npm run typecheck`: 최종 단독 실행 통과
- `npm run build`: 통과
- Shell syntax와 `git diff --check`: 통과
- Topics API read-only response: topic 12개, 날짜 4개 확인
- 로컬 `/topics`, 홈, 기존 상세 route HTML marker: 확인
- 승인 수정 후 초기 `/topics`: `200`, 아카이브 문구, `aria-expanded="false"`, “필터 열기”, topic 상세 link 12개 확인
- 승인 수정 후 초기 HTML: 검색 input, 날짜 select, filter panel이 노출되지 않음을 확인
- 검색/날짜 결합 필터, 초기화, 적용 상태, empty 상태: 코드 존재 확인
- Credential pattern scan: 실제 secret 값 없음
- 실제 브라우저 검증 및 사람이 제공한 manual verification 로그: 없음, pending

## 운영 반영

없음. Git push, merge, production deploy 및 production verification을 수행하지 않았다.

## README 업데이트 판단

불필요. 실행 방법, 환경 변수명, dependency와 사용자 설정이 변경되지 않았다. Route/API 구조는 `docs/ARCHITECTURE.md`에 반영했다.

## 확인 결과

- `/topics` 주요 이슈 아카이브 route와 topic 12개 상세 link가 초기 HTML에 렌더링된다.
- 기본 접힘 필터 패널과 승인된 아카이브 문구가 구현되어 있다.
- 검색/날짜 필터, 결과 개수, 초기화, API/filter empty 상태가 코드에 구현되어 있다.
- 홈 전체 목록 link와 기존 상세 route marker가 유지된다.
- 실제 브라우저에서 필터 패널과 검색/날짜 동작, responsive, keyboard, screen reader, console 검증은 pending이다.

## 이번 단계의 의미

홈 요약과 topic 상세 사이에 전체 아카이브 탐색 단계를 추가하고, 기사 탐색처럼 보이는 공용 header와 topic 내부 필터의 역할을 구분했다.

## 포트폴리오용 요약

Next.js Server/Client Component 경계를 활용해 기존 Topics API 50건을 서버에서 조회하고, 기본 접힘 보조 패널 안에서 검색어·날짜 결합 필터와 접근 가능한 결과 상태를 제공하는 주요 이슈 아카이브를 구현했다.

## 다음 단계 후보

- 실제 브라우저에서 필터 패널 열기/닫기, 검색/날짜/초기화 및 responsive/keyboard/screen reader 확인
- 필터 상태 URL search params 동기화 검토
- 서버 pagination 및 backend 검색/날짜 필터 설계
- Header article 검색/category navigation을 위한 별도 `/articles` route 검토
- Turbopack development ChunkLoadError 별도 재현 및 조사
- Provider/model 숨김, confidence/similarity score 정책, summary clamp와 카드 밀도 정리
