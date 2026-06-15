# 승인된 수정: Topic 목록 검색 및 날짜 필터 MVP

## 사람 승인 대기 중인 수정 후보

없음.

## 승인된 수정

### Fix 1: `/topics` 페이지 필터 UI를 접이식 보조 패널로 변경

#### 배경

현재 `/topics` 페이지에서 검색과 날짜 필터 영역이 큰 박스로 항상 노출되어 있다.

이 구조는 상단 header의 검색창 및 category navigation과 기능적으로 혼동될 수 있다.

상단 검색/category는 전체 기사 탐색처럼 보이는 반면, 본문 필터는 자동 생성된 topic 목록 내부에서만 동작한다.

#### 승인된 변경

- 검색/날짜 필터 영역을 기본적으로 접힌 보조 패널로 변경한다.

- 버튼 또는 작은 control을 통해 필터를 열고 닫을 수 있게 한다.

- 필터가 열렸을 때만 검색 input, 날짜 select, 초기화 버튼을 표시한다.

- 필터 적용 상태는 목록 상단에서 간단히 알 수 있게 한다.

- topic 목록 카드가 화면의 주 콘텐츠로 먼저 보이도록 한다.

### Fix 2: `/topics` 페이지 문구를 “주요 이슈 아카이브” 맥락으로 정리

#### 배경

현재 `/topics` 페이지의 “검색과 날짜 필터” 문구는 필터 기능을 과도하게 강조한다.

또한 header 검색/category navigation과 본문 topic 필터의 역할 차이가 명확하지 않다.

#### 승인된 변경

- 페이지 제목과 설명을 “주요 이슈 아카이브” 맥락으로 정리한다.

- 필터 제목은 “검색과 날짜 필터”보다 가벼운 표현으로 변경한다.

- 검색 placeholder는 “이슈 제목, 요약, 키워드 검색”처럼 topic 내부 검색임을 명확히 한다.

- 날짜 label은 “Topic 날짜” 대신 “이슈 날짜” 또는 “생성일”처럼 사용자 친화적으로 변경한다.

- 필요한 경우 작은 보조 문구로 “자동 생성된 주요 이슈 목록 안에서 적용됩니다.” 정도를 표시한다.

## 거절 또는 보류한 제안

### 보류: Header 검색/category navigation을 기사 목록 페이지로 연결

현재 header 검색창과 category navigation은 `/` query를 갱신하지만, 별도 article search/list 페이지가 없어 사용자 기대와 다를 수 있다.

다만 이 기능은 Topic 목록 검색이 아니라 article 탐색 기능에 해당한다.

후속 작업 후보:

- `/articles`

- `/articles?query=...`

- `/articles?category=...`

이번 42차에서는 구현하지 않는다.

### 보류: Turbopack development ChunkLoadError 대응

로컬 개발 중 Turbopack HMR chunk load error가 관찰되었다.

이번 PR에서는 production build 검증을 우선 기준으로 삼고, dev server/HMR 문제는 별도 이슈로 보류한다.

## 거절 또는 보류한 제안

### 보류: Header 검색/category navigation을 기사 목록 페이지로 연결

#### 배경

현재 상단 header에는 검색창과 category navigation이 존재한다.

관찰된 동작:

```text
GET /?query=Anthropic 200
```

검색어 입력 또는 category 클릭 시 root page query가 갱신되며 새로고침이 발생한다.  
하지만 현재 별도의 기사 목록/search route가 없기 때문에, 사용자가 기대하는 “검색 결과 기사 목록” 화면으로 이어지지 않는다.

#### 보류 사유

이번 42차의 목표는 Topic 목록 탐색이다.

현재 42차 범위:

- `/topics` 목록 페이지
- topic 검색
- topic 날짜 필터
- topic card → `/topics/{id}` 이동

반면 header 검색/category navigation은 article 탐색 기능에 가깝다.

후속 작업 후보:

```text
/articles
/articles?query=Anthropic
/articles?category=tech
```

따라서 이번 PR에서는 header 검색/category 동작을 새로 구현하지 않는다.  
별도 차수에서 article 목록/search/category page로 분리해 처리한다.

---

### 보류: Turbopack development ChunkLoadError 대응

#### 배경

로컬 개발 중 다음 로그가 반복 관찰되었다.

```text
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
```

이는 development server의 HMR/Turbopack chunk 로딩 문제로 보이며, 현재 production build 검증과 직접 연결된 기능 오류로 단정하지 않는다.

#### 보류 사유

이번 42차의 목표는 Topic 목록 검색 및 날짜 필터 MVP다.

우선 다음 검증을 기준으로 판단한다.

```bash
npm run lint
npm run typecheck
npm run build
```

production build에서도 동일 문제가 재현되는지 확인되지 않았으므로, 이번 PR에서 Turbopack/HMR 문제를 수정하지 않는다.

필요하면 후속 작업에서 다음을 검토한다.

- dev server 재시작
- `.next` 삭제 후 재실행
- Turbopack 비활성화 여부
- Next.js version 관련 issue 확인
- production build/start 기준 재현 여부 확인

## 적용한 변경

- Fix 1 적용
  - `/topics` 필터 영역을 기본 접힘 보조 패널로 변경했다.
  - `aria-expanded`와 `aria-controls`가 있는 토글 버튼으로 필터를 열고 닫을 수 있게 했다.
  - 검색 input, 날짜 select, 초기화 버튼은 패널이 열린 경우에만 표시한다.
  - 패널이 닫혀 있어도 적용된 검색어/날짜와 결과 개수를 목록 상단에서 확인할 수 있게 했다.
- Fix 2 적용
  - 페이지 제목과 설명을 “주요 이슈 아카이브” 맥락으로 변경했다.
  - 필터 제목을 “아카이브 필터”로 변경하고 자동 생성된 주요 이슈 목록 내부에 적용된다는 보조 문구를 추가했다.
  - 검색 placeholder를 “이슈 제목, 요약, 키워드 검색”으로, 날짜 label을 “이슈 날짜”로 변경했다.
- 보류 및 거절 항목은 적용하지 않았다.

## 필요한 검증

- `npm run lint`

- `npm run typecheck`

- `npm run build`

- `git diff --check`

- `/topics` HTML marker 확인

- 필터 패널 열림/닫힘 코드 존재 확인

- 필터 적용 시 topic 목록이 정상적으로 줄어드는지 확인
