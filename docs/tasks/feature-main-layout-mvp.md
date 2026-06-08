# Task: NewsLab Web 메인 레이아웃 MVP 구성

## Goal

NewsLab Web의 첫 사용자-facing 화면이 될 메인 레이아웃 MVP를 구성한다.

이번 작업의 목표는 실제 API 연동이 아니라, 이미지가 없는 뉴스 기사 목록에 적합한 게시판형/커뮤니티형 정보 밀도 레이아웃을 만들고, 이후 `/articles` API 연동을 자연스럽게 붙일 수 있는 화면 구조를 마련하는 것이다.

## Design Direction

- 국내 커뮤니티/게시판형 서비스의 정보 밀도 높은 목록 구조를 참고한다.
- 단, 특정 서비스의 UI를 그대로 복제하지 않고 NewsLab에 맞는 뉴스 목록형 레이아웃으로 재해석한다.
- 이미지를 필수로 사용하지 않는 텍스트 중심 기사 목록을 우선한다.
- 우측에는 광고, 인기 키워드, 수집 상태 등을 넣을 수 있는 sidebar placeholder를 둔다.
- 광고 영역은 실제 광고를 넣지 않고 비어 있는 placeholder로 둔다.
- 모바일에서는 sidebar가 본문 아래로 내려가거나 간결하게 접히는 구조를 사용한다.

## Scope

- README와 AGENTS.md를 한글 중심으로 정리한다.
- 기존 Next.js generated warning block은 `AGENTS.md`에서 보존한다.
- `app/page.tsx`를 NewsLab 메인 레이아웃 MVP로 수정한다.
- mock article data를 사용해 게시판형 기사 목록을 렌더링한다.
- 상단 header 영역을 구성한다.
  - NewsLab 로고/서비스명
  - 검색창 UI
  - 카테고리 navigation
- 본문 영역을 구성한다.
  - 주요 기사/최신 기사 목록
  - 카테고리, 제목, 출처, 시간 표시
  - 이미지 없이도 보기 좋은 텍스트 중심 목록
- sidebar 영역을 구성한다.
  - 광고 placeholder
  - 인기 키워드 placeholder
  - 수집 상태 placeholder
- 모바일 반응형 레이아웃을 구성한다.
- 실제 API 연동이 쉬운 컴포넌트/데이터 구조를 고려한다.
- lint, typecheck, build가 통과해야 한다.

## Do not change

- Do not modify the backend repository.
- Do not modify K3s, Docker, Supabase, DB, or production infrastructure.
- Do not implement real `/articles` API integration in this task.
- Do not add actual advertisement scripts or third-party ad SDKs.
- Do not implement login, comments, posting, or user features.
- Do not add article detail pages.
- Do not commit `.env.local` or real environment values.
- Do not remove the Next.js generated warning block in `AGENTS.md`.
- Do not run git push or PR merge.

## Expected files

- `README.md`
- `AGENTS.md`
- `app/page.tsx`
- `app/globals.css`
- `docs/tasks/feature-main-layout-mvp.md`
- `docs/pr/feature-main-layout-mvp.md`
- `docs/devlog/feature-main-layout-mvp.md`
- `docs/verification/feature-main-layout-mvp.md`
- `docs/reviews/feature-main-layout-mvp-antigravity.md`
- `docs/reviews/feature-main-layout-mvp-coderabbit.md`
- `docs/fixes/feature-main-layout-mvp-approved-fixes.md`

## DB changes

None.

## API changes

None.

## Test commands

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

## Acceptance criteria

- Main page has a NewsLab-specific layout instead of the generated placeholder page.
- Layout contains header, search UI, category navigation, article list, sidebar, and ad placeholder.
- Article list works with mock data and does not require article images.
- Sidebar can later hold ads, ranking, keywords, and collection status.
- Mobile layout remains readable.
- README and AGENTS.md are written primarily in Korean.
- Existing Next.js generated warning block in `AGENTS.md` is preserved.
- No real API integration is added.
- No backend, DB, K3s, Docker, or production infrastructure files are changed.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `git diff --check` passes.
- No secrets or real `.env` values are committed.

## Notes

24차에서 `/articles` API 연동을 진행할 예정이다.
따라서 이번 작업에서는 mock data 구조를 실제 API 응답으로 교체하기 쉽도록 단순하게 유지한다.
