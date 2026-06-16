# 홈 Topics API 전환 및 로딩 확인

## 작업 내용

홈(`/`) 주요 이슈 목록의 data source를 archive API `GET /topics?page=1&page_size=10`에서 홈 전용 경량 API `GET /topics/home`으로 전환했다.

## 주요 변경 사항

- `lib/api/topics.ts`
  - `HomeTopic`, `HomeTopicsResponse` type 추가
  - `/topics/home` runtime validation 추가
  - `getHomeTopics()` 추가
  - 기존 `getTopics()`와 `getTopicDetail()`은 archive/detail용으로 유지
- `components/topics/TopicList.tsx`
  - 홈 목록 fetch를 `getHomeTopics()`로 변경
  - home response에 archive total이 없으므로 count 문구 조정
- `components/topics/TopicCard.tsx`
  - 카드 props를 렌더에 필요한 최소 field로 좁혀 `Topic`과 `HomeTopic` 모두 재사용
  - nullable `topic_date` fallback 처리
- `docs/ARCHITECTURE.md`
  - 홈 `/topics/home`, archive/search `/topics`, detail `/topics/{id}` contract 구분 반영

## 프론트엔드/API 영향

- 홈(`/`)만 `/topics/home`을 사용한다.
- `/topics` archive page는 기존 `/topics` API를 계속 사용한다.
- `/search`는 기존 `/topics`와 `/articles` API 흐름을 유지한다.
- `/topics/[id]`는 기존 `/topics/{id}` detail API를 유지한다.
- provider/model/confidence/status/articles 같은 내부 field는 홈 type/UI에 노출하지 않는다.

## 상태 및 UX 영향

- 홈 loading/error/empty/success 상태 구조는 유지했다.
- TopicCard 링크는 계속 `/topics/{id}`로 이동한다.
- 대규모 디자인 변경은 없다.

## README 영향

설치 방법, 환경 변수명, 실행 방법 변경이 없어 README는 수정하지 않았다.

## 테스트

근거: `docs/verification/feature-home-topics-api-switch.md`

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build`: 통과
- `/topics/home` API shape 확인: top-level keys, item keys, items length 10, internal fields 제외 확인
- `git diff --check`: 통과
- `git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"`: 실제 secret 값 없음
- `bash -n scripts/new_agent_task.sh`: 통과
- `bash -n scripts/agent_next_step.sh`: 통과
- local dev server HTML marker curl: `/`, `/topics`, `/articles` exit code 0
- local dev server 수동 브라우저 확인:
  - `/` 홈 주요 이슈 카드 표시 확인
  - 홈 topic card 클릭 시 `/topics/{id}` 상세 이동 확인
  - `/topics` archive 표시 확인
  - `/topics/13` detail 및 연결 기사 목록 표시 확인
  - `/search?query=중동` 통합 검색 결과 표시 확인
  - `/articles` 원문 기사 목록 표시 확인
  - DevTools Console에서 API 전환으로 인한 runtime error 또는 hydration mismatch 없음 확인

## 확인 결과

- backend API code, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env`, `.env.*`는 변경하지 않았다.
- git push, git merge, production deploy command는 실행하지 않았다.
- production deploy/verification, domain 연결은 수행하지 않았다.

## 비고

- production deploy/verification, domain 연결은 이번 PR 초안 기준 pending이다.
- 별도 mobile/tablet/desktop responsive viewport matrix 검증은 기록되지 않았다.
