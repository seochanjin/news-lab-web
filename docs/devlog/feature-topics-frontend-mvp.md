# Topics API 프론트 목록 연결 MVP

## 작업 목적

자동 생성된 daily topic summary를 홈 화면에서 확인할 수 있도록 기존 Topics API를 프론트엔드에 연결한다.

## 기존 문제

- 홈의 주요 흐름 card는 mock data여서 실제 자동 생성 topic을 확인할 수 없었다.
- Topics API response type, frontend API client, loading/error/empty 상태가 없었다.
- Workflow 문서 생성 script는 현재 branch와 입력 branch가 다른 경우에도 파일을 만들 수 있었다.

## 변경 내용

- Mock topic card를 실제 `/topics` 목록으로 교체했다.
- Topics API client와 topic UI 컴포넌트를 추가했다.
- Branch mismatch workflow 생성 방지 안전장치를 추가했다.
- README와 architecture/runbook을 갱신했다.

## 구현 상세

- `getTopics(page, pageSize)`는 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`로 `/topics` URL을 만들고 `cache: "no-store"`로 조회한다.
- API client에서 top-level response와 각 topic field를 runtime 검사한다.
- `TopicList`는 API 오류를 `TopicsResult`로 변환해 expected error state를 렌더링한다.
- `Suspense` fallback으로 topic loading state를 제공한다.
- `TopicCard`는 실제 summary를 그대로 표시하고 keyword chip, count metadata, 개발 확인용 provider/model을 표시한다.
- 첫 topic card는 기존 prototype의 시각적 우선순위를 유지하도록 넓게 표시한다.
- `new_agent_task.sh`는 파일 생성 전에 현재 branch를 확인하고 입력 branch와 다르면 종료한다.

## 대안 검토

- 기존 `app/page.tsx` 안에 Topics fetch와 UI를 모두 추가할 수 있었지만 파일이 이미 크고 task가 API client/컴포넌트 분리를 요구해 선택하지 않았다.
- 별도 `/topics` route를 추가할 수 있었지만 이번 MVP는 기존 진입점에 최소 섹션을 연결하는 것이 우선이므로 홈에 배치했다.
- Client Component fetch도 가능하지만 현재 홈과 article 목록이 Server Component 기반이므로 같은 패턴을 유지했다.

## 선택한 접근과 근거

Next.js 로컬 문서의 Server Component data fetching과 granular `Suspense` 패턴을 따라 Topics API 영역만 독립적으로 스트리밍한다. API contract와 UI 책임을 분리하면서 기존 홈 레이아웃 변경 범위를 줄였다.

## 트레이드오프

- `cache: "no-store"`로 매 요청마다 backend availability와 응답 시간 영향을 받는다.
- Runtime type guard를 직접 구현해 dependency 추가는 피했지만 schema 변경 시 수동 갱신이 필요하다.
- Provider/model은 개발 확인용으로 노출되며 후속 작업에서 제거할 수 있다.
- 실제 topic 상세 및 연결 article 탐색은 아직 제공하지 않는다.

## 테스트 및 브라우저 확인

- `npm run lint`: 1차 실패 수정 후 최종 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- Shell syntax와 `git diff --check`: 통과
- Topics API read-only response shape: 확인
- Branch mismatch 실패 및 동일 branch 생성 경로: 확인
- `npm run dev`, local `/` HTML marker, `GET / 200`: 확인
- Credential pattern scan: 실제 secret 값 없음
- 실제 브라우저 검증: 수행하지 않음

## 운영 반영

없음. Production deploy와 production verification을 수행하지 않았다.

## README 업데이트 판단

필수. 홈 화면의 topic 영역이 mock에서 실제 `/topics` API 기반으로 변경되어 현재 화면 구성과 데이터 경계를 갱신했다.

## 확인 결과

- 홈 화면에 실제 topic 6개가 카드로 렌더링된다.
- 제목, 요약, 키워드, 출처 수, 기사 수, 날짜, status, provider/model을 표시한다.
- Loading/error/empty/success 상태가 구현되어 있다.
- 기존 mock 키워드/관련 기사 묶음과 실제 기사 목록이 유지된다.
- Workflow script가 잘못된 branch 이름으로 문서를 생성하지 않는다.

## 이번 단계의 의미

NewsLab의 토픽 생성 결과를 사용자-facing 홈 화면에서 직접 확인할 수 있는 첫 프론트엔드 경로가 연결되었다.

## 포트폴리오용 요약

Next.js Server Component와 `Suspense`를 사용해 typed Topics API client, runtime validation, 상태 UI, responsive topic card를 구현하고 branch 기반 agent workflow 안전장치를 강화했다.

## 다음 단계 후보

- `/topics/{id}` 상세 페이지와 연결 article 목록
- 날짜 및 카테고리 필터
- Provider/model 개발용 표시 제거
- 실제 브라우저 responsive/accessibility 검증
