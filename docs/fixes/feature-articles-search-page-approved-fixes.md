# 승인된 수정: Article 목록 검색 및 카테고리 페이지 MVP

## 사람 승인 대기 중인 수정 후보

없음.

## 승인된 수정

없음.

## 거절 또는 보류한 제안

### 보류: Header 검색 form의 Progressive Enhancement 보완

Antigravity review에서 `HeaderArticleSearch`의 `<form>`이 JavaScript 로드 전 또는 비활성화 상태에서 표준 GET fallback으로 동작하도록 개선할 수 있다는 선택 개선 사항이 제안되었다.

이번 PR에서는 보류한다.

보류 사유:

- 현재 MVP의 필수 요구사항은 header 검색이 `/articles?query=...`로 연결되는 것이다.
- 현재 구현은 JavaScript 활성 환경에서 정상 동작한다.
- Progressive Enhancement 보완은 접근성/강건성 개선으로 유효하지만 필수 blocker는 아니다.
- 44차 탐색 UX 정리 또는 별도 접근성 개선 작업에서 함께 검토한다.

후속 후보:

```text
<form action="/articles" method="get">
```

기반 fallback 구조 검토.

---

### 보류: Header navigation 정보구조 정리

현재 header에는 다음 category navigation이 있다.

```text
전체 / 정치 / 경제 / 기술 / 세계 / 사회 / AI
```

43차에서 `/articles` route가 추가되면서 `전체`는 article 전체 목록으로 연결된다.  
다만 홈 화면의 “오늘의 주요 이슈”, `/topics`의 “주요 이슈 아카이브”, `/articles`의 “전체 기사 목록” 사이의 정보구조는 아직 완전히 정리되지 않았다.

이번 PR에서는 보류한다.

보류 사유:

- 43차의 목표는 article 목록/search/category route MVP 구현이다.
- header 정보구조 개편은 홈, `/topics`, `/topics/{id}`, `/articles` 전체 탐색 UX에 영향을 준다.
- 44차에서 전체 화면 흐름과 함께 정리하는 것이 낫다.

후속 후보:

```text
홈 / 주요 이슈 / 기사 / 정치 / 경제 / 기술 / 세계 / 사회 / AI
```

또는 유사한 navigation 구조 검토.

---

### 보류: 홈·Topics·Articles container 너비 및 카드 밀도 통일

현재 홈, `/topics`, `/topics/{id}`, `/articles` 사이에서 container 너비와 section/card 밀도가 일부 다르게 느껴진다.

이번 PR에서는 보류한다.

보류 사유:

- 43차는 article 탐색 route 연결이 목표다.
- 너비, spacing, card density 정리는 여러 화면을 동시에 봐야 하는 UI/UX 정리 작업이다.
- 44차에서 공통 layout 규칙을 정리하는 것이 중복 수정을 줄인다.

후속 후보:

```text
- 공통 PageShell/SectionContainer 검토
- 홈, topics, topic detail, articles의 max-width 통일
- card spacing과 list density 정리
- summary clamp와 metadata 노출 정책 정리
```

---

### 보류: Turbopack development ChunkLoadError 대응

로컬 개발 중 Turbopack HMR chunk load error가 관찰된 바 있다.

이번 PR에서는 보류한다.

보류 사유:

- `npm run build`가 통과했다.
- 현재 확인된 오류는 development server/HMR 경로의 문제로 보이며 production build 문제로 확정되지 않았다.
- 기능 구현 PR의 blocker로 보지 않는다.

후속 후보:

```text
rm -rf .next
npm run dev
```

재현 여부 확인, Turbopack 비활성화 여부 검토, Next.js issue 확인.

## 적용한 변경

Review 후 적용한 수정 없음.

## 필요한 검증

Baseline 구현 검증은 `docs/verification/feature-articles-search-page.md`에 기록한다.

확인된 주요 검증:

```text
- npm run lint
- npm run typecheck
- npm run build
- bash -n scripts/new_agent_task.sh
- bash -n scripts/agent_next_step.sh
- git diff --check
- Articles API 전체/keyword/category read-only response contract 확인
- /articles 전체/검색/category/결합/empty route HTML marker 확인
- 기존 /, /topics, /topics/{id} route 유지 확인
- CI public API base URL 설정 확인
- Credential pattern scan
```

수동 브라우저 interaction, responsive, keyboard, screen reader, console 검증은 pending으로 유지한다.
