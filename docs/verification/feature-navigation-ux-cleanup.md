# 검증 기록: NewsLab 탐색 구조 및 레이아웃 정리

## 검증 범위

- Header service navigation, 공통 layout, 홈 정보 위계
- Topic/Article filter chip 제거 동작과 사용자-facing metadata 정리
- 승인 수정: Header 중심 container 정렬 및 `/search` 통합 검색
- 승인 수정: 검색된 Topic 연결 기사와 직접 기사 검색 결과 병합
- 이전 승인 수정(후속 Fix 5로 제거): Topic archive 검색 입력값과 적용값 분리
- 승인 수정: Topic archive 내부 필터 제거
- frontend lint, typecheck, production build, shell script syntax, diff/credential scan

## 실행한 Command

```bash
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
rg -n "MOCK KEYWORDS|GROUP PREVIEW|많이 보이는 키워드|관련 기사 묶음|provider|gpt-5-nano|confidence|similarity_score|draft" app components
rg -n "주요 이슈|원문 모음|정치|경제|기술|세계|사회|AI|뉴스를 한눈에" components/layout app
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" -- . ':!package-lock.json'
git diff --name-only
git status --short --branch
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
rg -n 'router\.push\(suffix \? `/search\?\$\{suffix\}` : "/search"\)|주요 이슈와 원문 기사|검색 결과|조건에 맞는 주요 이슈가 없습니다|조건에 맞는 원문 기사가 없습니다' app components
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
npm run dev
curl -sS -o /tmp/newslab-search.html -w '%{http_code}\n' 'http://127.0.0.1:3000/search?query=미국'
curl -sS -o /tmp/newslab-search-empty.html -w '%{http_code}\n' 'http://127.0.0.1:3000/search'
for route in / /topics /articles; do curl -sS -o /dev/null -w "$route %{http_code}\n" "http://127.0.0.1:3000$route"; done
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
rg -n 'topics\.slice\(0, 3\)|articles\.slice\(0, 3\)|articleIds\.has|articleUrls\.has|linkedArticles, directArticles|검색된 주요 이슈에 연결된 원문 기사' app/search/page.tsx
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
rg -n 'draftSearchQuery|appliedSearchQuery|setAppliedSearchQuery\(draftSearchQuery\.trim\(\)\)|onSubmit|필터 적용|removeSearchFilter|setSelectedDate\(ALL_DATES\)' components/topics/TopicExplorer.tsx
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
rg -n 'use client|useMemo|useState|아카이브 필터|필터 열기|주요 이슈 검색|이슈 날짜|필터 적용 중|필터 초기화|draftSearchQuery|appliedSearchQuery' components/topics/TopicExplorer.tsx app/topics/page.tsx
rg -n 'TOPIC ARCHIVE|주요 이슈 목록|전체 \{total\}개 중|initialTopics\.map|TopicCard' components/topics/TopicExplorer.tsx
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

## 결과

- `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- `npm run build`: 통과, Next.js 16.2.7 production build 및 `/`, `/articles`, `/topics`, `/topics/[id]` route 생성 성공.
- 두 shell script의 `bash -n`: 통과, syntax 오류 없음.
- `git diff --check`: 통과, whitespace 오류 없음.
- mock/debug marker `rg`: 일치 항목 없음. 명령은 일치 항목이 없어 exit code 1로 종료됨.
- Header marker `rg`: Header top-level navigation에는 `주요 이슈`, `원문 모음`만 확인됨. category 이름은 `/articles` 내부 label mapping에만 남아 있음. tagline은 `sm` 이상에서만 표시하도록 구현됨.
- Credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.
- 변경 파일 확인: frontend app/component와 frontend workflow 문서 범위만 변경됨. backend, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`는 변경하지 않음.
- 승인 수정 후 `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- 승인 수정 후 `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- 승인 수정 후 `npm run build`: 통과, Next.js production build에 `/search` dynamic route가 포함됨.
- 승인 수정 후 두 shell script의 `bash -n` 및 `git diff --check`: 통과.
- 통합 검색 marker 확인: Header submit의 `/search` 이동, 통합 검색 label, 검색 결과/empty state marker를 확인함.
- 승인 수정 후 credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.
- `npm run dev`: Next.js dev server가 `Ready` 상태로 시작됨.
- 로컬 route `curl`: 별도 command 프로세스에서 sandbox 네트워크 격리로 `127.0.0.1:3000` 연결에 실패해 HTTP status `000`을 반환함. route HTML marker는 확인하지 못함.
- Fix 3 적용 후 `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- Fix 3 적용 후 `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- Fix 3 적용 후 `npm run build`: 통과, `/search` dynamic route 포함.
- Fix 3 적용 후 두 shell script의 `bash -n` 및 `git diff --check`: 통과.
- Fix 3 구조 marker 확인: 상위 Topic 3개 제한, Topic별 연결 기사 3개 제한, ID/URL 중복 검사, 연결 기사 우선 병합, 원문 모음 안내 문구를 확인함.
- Fix 3 적용 후 credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.
- Fix 4 적용 후 `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- Fix 4 적용 후 `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- Fix 4 적용 후 `npm run build`: 통과, 기존 `/topics` 및 전체 App Router route 생성 성공.
- Fix 4 적용 후 두 shell script의 `bash -n` 및 `git diff --check`: 통과.
- Fix 4 구조 marker 확인: draft/applied 검색 상태 분리, form submit 적용, chip 제거, 날짜 및 전체 초기화 동작을 확인함.
- Fix 4 적용 후 credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.
- Fix 5 적용 후 `npm run lint`: 통과, ESLint 오류 및 경고 없음.
- Fix 5 적용 후 `npm run typecheck`: 통과, `tsc --noEmit` 오류 없음.
- Fix 5 적용 후 `npm run build`: 통과, 기존 `/topics`, `/search`, `/articles`, `/topics/[id]` route 생성 성공.
- Fix 5 적용 후 두 shell script의 `bash -n` 및 `git diff --check`: 통과.
- Fix 5 제거 marker 확인: `TopicExplorer`와 `/topics` page에서 client/filter state 및 내부 필터 UI marker가 일치 항목 없이 종료됨.
- Fix 5 archive marker 확인: 전체/표시 개수, 주요 이슈 목록, `initialTopics` card mapping을 확인함.
- Fix 5 적용 후 credential scan: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않음.

## 수동 브라우저 검증

- 수행하지 않음.

## 대기 중인 검증

- desktop/mobile에서 Header 줄바꿈, active navigation, 공통 container, 숨겨진 side rail slot 확인
- Header 검색과 Article 검색어/category chip 제거의 실제 브라우저 동작 확인
- `/search?query=...`에서 주요 이슈 우선 표시, 원문 기사 보조 표시, 빈 검색어 안내 상태 확인
- `/search?query=중동`에서 Topic 연결 기사가 직접 검색 결과보다 먼저 표시되고 중복되지 않는지 확인
- `/topics`에 내부 필터 UI 없이 전체 주요 이슈 목록과 개수만 표시되는지 확인
- Header 검색창과 본문 container의 실제 시각적 정렬 확인
- loading/error/empty/not-found 상태의 실제 브라우저 확인
- `.next` 삭제 후 dev server 재실행을 통한 ChunkLoadError 재현 여부 확인
- deployment, production verification, PR merge

## 근거 메모

- Next.js 코드 변경 전 `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`, `05-server-and-client-components.md`, `node_modules/next/dist/docs/03-architecture/accessibility.md`를 확인했다.
- Header와 Article filter 이동에는 `next/link`를 사용했고, 개별 제거 control에 접근 가능한 이름과 focus style을 유지했다.
- `.env.local`은 build 환경으로 감지되었지만 읽거나 수정하거나 tracked file에 값을 기록하지 않았다.
