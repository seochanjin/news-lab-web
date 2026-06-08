# Task: NewsLab Web 기사 목록 API 연동

## Goal

NewsLab backend의 `/articles` API를 호출해 메인 화면의 mock article list를 실제 기사 데이터 기반 목록으로 교체한다.

이번 작업의 목표는 완성형 검색/필터/페이지네이션이 아니라, API base URL 환경변수, typed fetch 함수, 기사 목록 렌더링, 기본 error/empty 상태를 갖춘 첫 실제 데이터 연동 기반을 만드는 것이다.

## Scope

- `/articles?page=1&page_size=10` API 응답 구조를 확인한다.
- API 응답에 맞는 TypeScript 타입을 정의한다.
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 사용해 API base URL을 읽는다.
- 실제 기사 목록을 메인 화면에 렌더링한다.
- 기존 메인 레이아웃 구조는 유지한다.
- 검색창과 카테고리 UI는 유지하되 실제 검색/필터 동작은 이번 task에서 구현하지 않는다.
- API 호출 실패 시 기본 error state를 보여준다.
- 기사 목록이 비어 있을 경우 empty state를 보여준다.
- loading state 또는 server-rendering 중 안정적인 fallback을 고려한다.
- README에 실제 API 연동 방식과 화면 캡처 위치를 문서화한다.
- 필요 시 `public/screenshots/` 경로를 만들고 README에 화면 이미지 추가 방식을 정리한다.
- lint, typecheck, build가 통과해야 한다.

## Do not change

- Do not modify the backend repository.
- Do not modify K3s, Docker, Supabase, DB, or production infrastructure.
- Do not implement search query behavior in this task.
- Do not implement category filtering in this task.
- Do not implement pagination UI in this task.
- Do not add login, comments, posting, or article detail pages.
- Do not commit `.env.local` or real secret values.
- Do not add real advertisement scripts or third-party ad SDKs.
- Do not run git push or PR merge.

## Expected files

- `app/page.tsx`
- `app/globals.css` only if needed
- `README.md`
- `docs/tasks/feature-articles-api-list.md`
- `docs/pr/feature-articles-api-list.md`
- `docs/devlog/feature-articles-api-list.md`
- `docs/verification/feature-articles-api-list.md`
- `docs/reviews/feature-articles-api-list-antigravity.md`
- `docs/reviews/feature-articles-api-list-coderabbit.md`
- `docs/fixes/feature-articles-api-list-approved-fixes.md`
- `public/screenshots/` only if screenshot documentation is added

## API changes

None.

## DB changes

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

- Main page renders articles from the backend /articles API.
- Mock article data is removed or clearly isolated from production rendering.
- API base URL is read from NEXT_PUBLIC_NEWSLAB_API_BASE_URL.
- Empty state is displayed when no articles are returned.
- Error state is displayed when API request fails.
- Existing header, search UI, category navigation, central article list, and left/right expansion slot layout remain intact.
- Search/category UI remains visual-only unless explicitly scoped.
- No backend, DB, K3s, Docker, Supabase, or production deployment files are changed.
- .env.local is not committed.
- npm run lint passes.
- npm run typecheck passes.
- npm run build passes.
- git diff --check passes.
- No secrets or real .env values are committed.

## Notes

24차에서는 실제 기사 목록 조회만 연결한다. 검색, 카테고리 필터, 페이지네이션은 후속 task에서 분리한다.

## Confirmed API response

`GET /articles?page=1&page_size=10` returns:

- `page`: number
- `page_size`: number
- `count`: number
- `total`: number
- `has_next`: boolean
- `articles`: array

Article fields:

- `id`: number
- `source_id`: number
- `source`: string
- `title`: string
- `url`: string
- `category`: string, e.g. `tech`
- `summary`: string or null
- `published_at`: ISO datetime string or null
- `tags`: string array
- `created_at`: ISO datetime string

Initial rendering rules:

- Render `articles` from the response.
- Display `category` through a small mapping function, e.g. `tech` → `기술`.
- Display `title`, `source`, and formatted `published_at`.
- Use `summary` as optional secondary metadata or description.
- If `url` exists, title should link to the original article in a new tab.
- Use `total`, `count`, and `has_next` only as lightweight metadata for now. Do not implement pagination UI in this task.
