# 홈 원문 기사 미리보기 제거 및 로딩 경량화

## 작업 내용

홈(`/`)을 오늘의 주요 이슈 중심 화면으로 단순화했다. 홈 하단의 원문 기사 미리보기와 해당 데이터를 가져오던 Articles API 조회를 제거하고, 원문 기사 탐색은 기존 `/articles`와 `/search` 흐름에서 유지하도록 역할을 분리했다.

## 주요 변경 사항

- 홈의 `SUPPORTING SOURCES`, `원문 기사 이어보기`, 최신 원문 기사 3건 미리보기 section을 제거했다.
- 홈 Server Component에서 `getArticles`, `ArticleList`, article preview 전용 loading/error/empty UI를 제거했다.
- 홈은 기존 `TopicList`와 주요 이슈 loading/error/empty 상태만 유지한다.
- `전체 주요 이슈 보기` 링크와 Header의 `/articles`, `/search` 탐색 경로는 유지했다.
- Footer 설명을 기사 목록 중심 문구에서 주요 이슈와 요약 중심 문구로 변경했다.
- 홈과 article component의 역할 변경을 `docs/ARCHITECTURE.md`에 반영했다.

## 프론트엔드/API 영향

- 영향 route: `/`
- 홈 렌더링에서 Articles API 조회를 제거하고 Topics API 기반 주요 이슈 목록만 조회한다.
- `/articles`와 `/search`의 `getArticles`, `ArticleList`, 원문 기사 상태 UI는 유지한다.
- `/topics`, `/topics/[id]`, `/search`, `/articles`의 route 역할과 기존 API contract는 변경하지 않았다.
- Articles API client, Topics API client, Header, `PageShell`, dependency는 변경하지 않았다.
- Backend API, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`는 변경하지 않았다.

## 상태 및 UX 영향

- 홈에서 원문 기사 목록과 article 전용 loading/error/empty 상태가 제거된다.
- 홈의 성공·loading·error·empty 흐름은 주요 이슈 목록 기준으로 유지된다.
- Articles API 실패가 홈 렌더링에 영향을 주지 않게 된다.
- 홈의 원문 기사 직접 CTA는 제거했지만 Header의 `원문 모음`과 통합 검색 진입점은 유지된다.
- 실제 desktop/mobile 레이아웃, 홈 하단 여백, 브라우저 상호작용은 확인하지 않았다.

## README 영향

설치·실행 방법, 환경 변수명, dependency, API contract 변경이 없어 README는 수정하지 않았다. 홈과 article component의 역할 변경은 `docs/ARCHITECTURE.md`에 반영했다.

## 테스트

`docs/verification/feature-home-article-preview-cleanup.md`에 기록된 검증 결과:

- `npm run lint`: 통과, ESLint 오류 및 경고 없음
- `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음
- `npm run build`: 통과, `/`, `/articles`, `/search`, `/topics`, `/topics/[id]` route 생성 확인
- `bash -n scripts/new_agent_task.sh`: 통과
- `bash -n scripts/agent_next_step.sh`: 통과
- `git diff --check`: 통과
- 홈 article preview 제거 marker 검색: `app/page.tsx`에서 일치 항목 없음
- `/articles`, `/search`의 `getArticles`, `ArticleList` 사용 유지 확인
- `/topics` archive 이동 링크와 Header의 `/articles`, `/search` 탐색 경로 유지 확인
- credential scan: 문서·ignore rule·환경 변수명 reference만 확인, 실제 secret 값 없음
- `npm run dev`: Turbopack dev server가 190ms에 Ready 상태로 시작됨
- manual browser verification: 수행하지 않음

## 확인 결과

- 정적 marker 확인으로 홈의 원문 기사 section, `getArticles`, `ArticleList` 참조가 제거된 것을 확인했다.
- `/articles`와 `/search`의 기존 원문 기사 조회 및 목록 사용이 유지된 것을 확인했다.
- lint, typecheck, production build, shell syntax, whitespace 검증을 통과했다.
- dev server 시작 로그에서는 ChunkLoadError가 확인되지 않았지만, 브라우저 및 `.next` 삭제 후 재현 검증은 수행하지 않았다.
- deployment, production verification, PR merge는 확인하지 않았다.

## 비고

승인된 수정 문서에 명시된 추가 수정은 없다.

남은 수동 확인 항목:

- desktop/mobile 홈에서 원문 기사 preview가 표시되지 않고 주요 이슈 중심으로 자연스럽게 보이는지 확인
- 홈 하단 여백과 footer 표시 확인
- `/topics` archive 및 Topic 상세 이동 확인
- `/search?query=중동`의 주요 이슈·원문 결과 흐름 확인
- `/articles` 원문 목록 및 filter 동작 확인
- 브라우저 console 신규 오류와 Turbopack ChunkLoadError 재현 여부 확인
- `.next` 삭제 후 dev server 재실행을 통한 ChunkLoadError 재현 여부 확인
- deployment, production verification, PR merge 확인

`git push`, `git merge`, deploy command, production-impacting command는 실행하지 않았다.
