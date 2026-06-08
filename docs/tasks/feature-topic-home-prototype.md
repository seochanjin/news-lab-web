# Task: NewsLab Web 토픽 중심 메인 화면 목업

## Goal

NewsLab Web의 메인 화면을 단순 최신 기사 목록 중심에서 토픽/키워드/기사 묶음 중심의 뉴스 정리 화면으로 전환하는 목업을 구성한다.

현재 `/articles` API 연동만으로는 사용자가 NewsLab을 이용해야 할 이유가 약하다. 이번 작업의 목표는 실제 백엔드 토픽 API를 구현하기 전에, NewsLab이 지향하는 “많은 뉴스를 묶고 요약해서 흐름을 보여주는 서비스”의 화면 방향을 빠르게 검증하는 것이다.

## Product Direction

NewsLab은 단순 RSS 목록 뷰어가 아니라 다음 가치를 제공하는 방향으로 발전한다.

- 해외 기술, 경제, 전쟁/국제 정세, 속보, 국내 정치, 국내 경제, 국내 기술 뉴스를 함께 수집한다.
- 비슷한 기사와 중복 이슈를 묶어서 보여준다.
- 많이 등장한 키워드를 보여준다.
- 사용자가 개별 기사를 모두 읽지 않아도 주요 흐름을 파악할 수 있게 한다.
- 영어 원문 기사도 한국어 사용자가 이해할 수 있도록 토픽/요약 중심으로 정리한다.

## Scope

- 메인 화면 상단을 “오늘의 주요 흐름” 중심으로 재구성한다.
- 제품 방향 검증용 mock topic card를 추가한다.
- mock keyword/ranking 영역을 추가한다.
- mock related article group 영역을 추가한다.
- 기존 `/articles` API 기반 최신 기사 목록은 하단 보조 영역으로 유지한다.
- 기존 header, search UI, category navigation, 좌우 expansion slot 구조는 가능한 유지한다.
- README에 토픽 중심 목업 화면의 의도와 screenshot 경로를 정리한다.
- devlog에 단순 최신 기사 목록의 사용자 가치 한계와 토픽 중심 전환 판단을 기록한다.
- 실제 토픽/키워드/클러스터링 API는 구현하지 않는다.

## Do not change

- Do not modify the backend repository.
- Do not modify DB, Supabase, K3s, Docker, or production infrastructure.
- Do not implement real AI summarization.
- Do not implement real article clustering.
- Do not implement real keyword extraction pipeline.
- Do not implement pagination or load-more UI.
- Do not implement search behavior.
- Do not implement category filtering.
- Do not commit `.env.local` or real secret values.
- Do not run git push or PR merge.

## Expected files

- `app/page.tsx`
- `app/globals.css` only if needed
- `README.md`
- `public/screenshots/` if screenshot is updated
- `docs/tasks/feature-topic-home-prototype.md`
- `docs/pr/feature-topic-home-prototype.md`
- `docs/devlog/feature-topic-home-prototype.md`
- `docs/verification/feature-topic-home-prototype.md`
- `docs/reviews/feature-topic-home-prototype-antigravity.md`
- `docs/reviews/feature-topic-home-prototype-coderabbit.md`
- `docs/fixes/feature-topic-home-prototype-approved-fixes.md`

## UI Requirements

- Add a hero/summary section that explains the value of NewsLab.
- Add “오늘의 주요 흐름” topic cards.
- Topic cards may be mock data, but should look like they are summarizing grouped news issues.
- Add keyword chips or ranking area.
- Add related article group preview area.
- Keep real `/articles` list, but make it secondary to the topic/summary sections.
- Clearly avoid presenting mock topic summaries as verified AI-generated summaries.
- Use Korean UI copy for topic summaries and labels.
- Keep external article links working in the latest article list.

## Mock topic examples

Example topic directions:

- AI 서비스와 보안 이슈
- 글로벌 기술 투자와 반도체 흐름
- 전쟁/국제 정세 속보
- 국내 정치 주요 쟁점
- 국내 경제와 금리/물가 흐름
- 국내 기술/산업 동향

## Acceptance criteria

- 메인 화면이 단순 기사 목록보다 “뉴스 흐름 정리 서비스”처럼 보인다.
- 오늘의 주요 흐름, 키워드, 관련 기사 묶음 영역이 있다.
- 실제 `/articles` API 기반 최신 기사 목록은 유지된다.
- 토픽/키워드/묶음은 mock/prototype임이 문서에서 명확하다.
- 실제 AI 요약, 클러스터링, 백엔드 API, DB 변경은 없다.
- README와 AGENTS는 한글 중심 기조를 유지한다.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `git diff --check` passes.
- No secrets or real `.env` values are committed.

## Test commands

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

## Notes

이번 작업은 제품 방향 검증용 프론트 목업이다.  
실제 토픽 생성, 키워드 추출, 기사 클러스터링, 한국어 요약은 후속 백엔드/파이프라인 작업으로 분리한다.
