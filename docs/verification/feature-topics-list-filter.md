# 검증 기록: Topic 목록 검색 및 날짜 필터 MVP

## 검증 범위

- `/topics` 목록 explorer route와 `getTopics(1, 50)` 호출
- Topic title, summary, keywords, topic_date 기반 client-side 검색
- Unique topic_date 목록과 최신 날짜 우선 정렬, 날짜 필터
- 필터 결과 개수, API empty, 필터 empty, loading, error, success 상태
- 홈 전체 목록 link와 기존 `/topics/{id}` 상세 route 유지
- 공용 `SiteHeader`, responsive form layout, label/live region/focus 처리
- Backend, DB, K3s, Supabase, secret, `.env*`, production infrastructure 미변경

## 실행한 Command

```bash
curl -sS 'https://api.dev-scj.site/topics?page=1&page_size=50'
```

결과: 통과. Read-only 요청으로 `total=12`, `has_next=false`, topic 12개와 `2026-06-14`, `2026-06-13`, `2026-06-12`, `2026-06-11` 날짜를 확인했다. 이는 production 배포 또는 production verification 완료 주장이 아니다.

```bash
npm run lint
npm run typecheck
npm run build
```

결과: 모두 통과. Build에서 `/topics`와 `/topics/[id]`는 dynamic server-rendered route로 확인되었다.

최종 재검증에서 `npm run build`와 동시에 실행한 첫 `npm run typecheck`는 build가 `.next/types`를 재생성하는 동안 `TS6053`으로 실패했다. Build 완료 후 `npm run typecheck`를 단독 재실행해 통과했다.

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

결과: 모두 통과.

```bash
npm run dev
curl -sS -o /tmp/newslab-topics-list.html -w '%{http_code}\n' http://localhost:3000/topics
curl -sS -o /tmp/newslab-topics-filter-home.html -w '%{http_code}\n' http://localhost:3000
curl -sS -o /tmp/newslab-topics-filter-detail.html -w '%{http_code}\n' http://localhost:3000/topics/7
```

결과: development server가 실행되었고 세 route 요청이 모두 `200`을 반환했다.

```bash
rg -o '주요 이슈 목록|검색과 날짜 필터|주요 이슈 검색|Topic 날짜|전체 날짜|2026년 6월 14일|2026년 6월 13일|2026년 6월 12일|2026년 6월 11일|미-이란 평화협상과 레바논 베이루트 공격으로 고조되는 중동 긴장|스위스 인구 1천만 명 상한 제안 부결|href="/topics/[0-9]+"' /tmp/newslab-topics-list.html
rg -o '전체 주요 이슈 보기|href="/topics"|오늘의 주요 이슈' /tmp/newslab-topics-filter-home.html
rg -o 'SpaceX IPO로 머스크 세계 최초 트릴리어네어 등극|핵심 포인트|관련 기사|DW English|NewsLab|뉴스 카테고리' /tmp/newslab-topics-filter-detail.html
rg -o 'aria-current="page"' /tmp/newslab-topics-list.html | wc -l
rg -o 'id="topic-search"|id="topic-date"|aria-live="polite"|필터 초기화' /tmp/newslab-topics-list.html
```

결과: `/topics`에서 목록 제목, 검색/날짜 UI, 4개 날짜, topic 12개의 상세 link, 주요 topic marker를 확인했다. 홈에서 전체 목록 link를 확인했고 기존 상세 route marker가 유지되었다. `/topics` HTML의 `aria-current="page"`는 0개였고, 검색/날짜 input과 결과 live region marker를 확인했다.

```bash
rg -n 'getTopics\(1, 50\)|toLocaleLowerCase|topic\.topic_date === selectedDate|Array\.from\(new Set|right\.localeCompare\(left\)|aria-live="polite"|조건에 맞는 주요 이슈가 없습니다|아직 생성된 주요 이슈가 없습니다' app components
```

결과: 50건 API 호출, 검색어 trim/소문자 includes 처리, 날짜 정확 일치 필터, unique date 최신순 정렬, 결과 live region, API/filter empty 상태 코드 존재를 확인했다.

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

결과: 문서와 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.

## 결과

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- Shell syntax와 `git diff --check`: 통과.
- Topic 목록 API read-only response contract와 12개 topic/4개 날짜: 확인.
- `/topics`, 홈, 기존 상세 route 로컬 HTML marker: 확인.
- 검색/날짜 결합 필터, 초기화, empty 상태: 코드 존재 확인.
- Package test script: `package.json`에 없음.

## 수동 브라우저 검증

수행하지 않음. 로컬 development server와 초기 HTML/code marker는 확인했지만 실제 검색 입력, 날짜 선택, 초기화, 클릭, viewport, keyboard, console 검증 완료를 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 검색어 title/summary/keywords/topic_date 필터 동작 확인
- 실제 브라우저에서 날짜 필터와 검색어 결합 동작 확인
- 필터 결과 개수, 필터 empty state, 초기화 버튼 동작 확인
- Topic card 클릭 후 상세 route 이동 확인
- 실제 브라우저에서 desktop/mobile responsive layout 확인
- Keyboard focus와 screen reader 결과 안내 확인
- Loading/error/API empty 상태 시각 확인
- 브라우저 console 확인
- GitHub Actions
- PR 생성 또는 merge
- Deployment 및 production verification

## 근거 메모

- Production API는 response contract 확인을 위한 read-only 요청만 수행했다.
- Backend 검색/날짜 필터/query parameter, pagination 고도화, 이미지, provider/model 정책, summary clamp를 구현하지 않았다.
- `.env`, `.env.*`, backend, DB, K3s, Supabase, production infrastructure를 수정하지 않았다.

## 승인 수정 적용 후 검증

적용 범위:

- 승인 Fix 1: `/topics` 필터 UI 기본 접힘 보조 패널
- 승인 Fix 2: “주요 이슈 아카이브” 맥락의 페이지 및 필터 문구
- 보류된 header 검색/category navigation과 Turbopack development ChunkLoadError 대응은 적용하지 않음

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

결과: 모두 통과. Build에서 `/topics`와 `/topics/[id]` dynamic server-rendered route가 유지되었다.

```bash
rg -n 'filtersOpen|aria-controls="topic-filter-panel"|aria-expanded|필터 열기|필터 닫기|필터 적용 중|이슈 제목, 요약, 키워드 검색|이슈 날짜|주요 이슈 아카이브|TOPIC ARCHIVE' app/topics/page.tsx components/topics/TopicExplorer.tsx
```

결과: 기본 `filtersOpen=false`, 패널 토글의 `aria-controls`/`aria-expanded`, 열기/닫기 문구, 적용 상태 요약, 승인된 아카이브 문구가 코드에 존재함을 확인했다.

```bash
npm run dev
curl -sS -o /tmp/newslab-topics-approved-fixes.html -w '%{http_code}\n' http://localhost:3000/topics
curl -sS -o /tmp/newslab-topics-approved-fixes.html -w '%{http_code}\n' http://127.0.0.1:3000/topics
```

결과: 첫 `localhost` 요청은 development server 시작 직후 실행되어 연결 실패와 `000`을 반환했다. 이어 실행한 `127.0.0.1` 요청은 `200`을 반환했다.

```bash
rg -o 'TOPIC ARCHIVE|주요 이슈 아카이브|아카이브 필터|자동 생성된 주요 이슈 목록 안에서 적용됩니다.|필터 열기|전체 이슈|href="/topics/[0-9]+"' /tmp/newslab-topics-approved-fixes.html
rg -o 'id="topic-search"' /tmp/newslab-topics-approved-fixes.html | wc -l
rg -o 'id="topic-date"' /tmp/newslab-topics-approved-fixes.html | wc -l
rg -o 'aria-expanded="false"' /tmp/newslab-topics-approved-fixes.html | wc -l
rg -o 'id="topic-filter-panel"' /tmp/newslab-topics-approved-fixes.html | wc -l
rg -o 'href="/topics/[0-9]+"' /tmp/newslab-topics-approved-fixes.html | wc -l
```

결과: 아카이브 문구, “필터 열기”, “전체 이슈”를 확인했다. 초기 HTML에서 검색 input, 날짜 select, filter panel은 각각 0개이고 `aria-expanded="false"`는 1개였다. Topic 상세 link 12개는 초기 화면에 유지되었다.

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

결과: 승인 수정 적용 후 재실행했다. 문서와 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.

승인 수정 적용 후에도 실제 브라우저에서 패널 열기/닫기, 필터 적용 시 목록 감소, 적용 상태 표시, responsive, keyboard, screen reader, console 검증은 수행하지 않았다.
