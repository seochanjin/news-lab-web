# Topics API 프론트 목록 연결 MVP

## 작업 내용

- 홈 화면의 mock topic card를 실제 `/topics` API 기반 주요 이슈 목록으로 교체했다.
- Topics API client, runtime response validation, topic 목록 및 카드 컴포넌트를 분리했다.
- `scripts/new_agent_task.sh`에 현재 branch와 입력 branch 일치 안전장치를 추가했다.

## 주요 변경 사항

- `lib/api/topics.ts`에 `Topic`, `TopicsResponse`, runtime type guard, `getTopics(page, pageSize)`를 추가했다.
- `components/topics/TopicList.tsx`에서 API 호출과 loading/error/empty/success 상태를 처리한다.
- `components/topics/TopicCard.tsx`에서 제목, 요약, 키워드, 출처 수, 기사 수, 날짜, status, provider/model을 표시한다.
- 기존 mock 키워드/관련 기사 묶음과 실제 `/articles` 최신 기사 영역은 유지했다.
- README, architecture, runbook을 실제 Topics API 연결 상태에 맞게 갱신했다.

## 프론트엔드/API 영향

- 기존 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 재사용한다.
- Frontend에서 기존 `GET /topics?page=1&page_size=10` endpoint를 읽기 전용으로 사용한다.
- Backend API 변경 없음.

## 상태 및 UX 영향

- 실제 topic 목록을 responsive card grid로 표시한다.
- Topic loading, error, empty 상태를 추가했다.
- 기존 홈 레이아웃, 색상, spacing, typography 패턴을 유지했다.

## README 영향

- 홈 화면의 실제 `/topics` API 연결과 mock 영역의 경계를 문서화했다.
- 기존 screenshot은 Topics API 연결 전 목업임을 명시했다.

## 테스트

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `bash -n scripts/new_agent_task.sh`
- `bash -n scripts/agent_next_step.sh`
- `git diff --check`
- Topics API read-only response shape 확인
- Branch mismatch 실패 및 동일 branch 생성 경로 확인
- `npm run dev`와 로컬 HTML marker 확인
- Credential pattern scan

## 확인 결과

- Lint는 1차 실패 원인을 수정한 뒤 최종 통과했다.
- Typecheck, build, shell syntax, whitespace 검증이 통과했다.
- Topics API의 현재 6개 item과 예상 response key를 확인했다.
- 로컬 `/`에서 실제 topic count/status/provider/model, 기존 mock 보조 영역, 실제 기사 영역 렌더링을 확인했다.
- Branch mismatch 시 exit code `1`과 파일 미생성을 확인했다.
- 상세 결과는 `docs/verification/feature-topics-frontend-mvp.md`를 따른다.

## 비고

- `/topics/{id}`, 날짜/카테고리 필터, 관리자 기능은 구현하지 않았다.
- Backend, DB, K3s, Supabase, secret, `.env*`, production infrastructure를 수정하지 않았다.
- 실제 브라우저 및 production verification은 완료로 주장하지 않는다.
