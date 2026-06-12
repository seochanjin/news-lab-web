# 검증 기록: Topics API 프론트 목록 연결 MVP

## 검증 범위

- `/topics?page=1&page_size=10` API response shape와 frontend runtime validation
- 실제 topic 목록 카드의 제목, 요약, 키워드, 출처 수, 기사 수, 날짜, status, provider/model 표시
- Topic loading, error, empty, success 상태
- 기존 홈 레이아웃, mock 키워드/관련 기사 묶음, 실제 `/articles` 목록 유지
- `scripts/new_agent_task.sh`의 현재 branch 일치 안전장치
- README, architecture, runbook 문서 일치
- Backend, DB, K3s, Supabase, secret, `.env*`, production infrastructure 미변경

## 실행한 Command

```bash
npm run lint
```

1차 결과: 실패. `components/topics/TopicList.tsx`의 `try/catch` 내부 JSX가 `react-hooks/error-boundaries` 규칙에 위배되었다.

조치: API 호출 오류를 `TopicsResult` 값으로 변환한 뒤 JSX를 `try/catch` 밖에서 분기하도록 수정했다.

최종 결과: 통과.

```bash
npm run typecheck
```

결과: 통과.

```bash
npm run build
```

결과: 통과. `/`는 dynamic server-rendered route로 확인되었다.

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

결과: 모두 통과.

```bash
scripts/new_agent_task.sh wrong/branch "잘못된 브랜치 검증"
```

기대 결과: 현재 branch와 입력 branch가 달라 workflow 문서 생성 없이 실패.

실제 결과: exit code `1`, 현재 branch와 입력 branch 및 `git switch -c wrong/branch` 안내 출력, 관련 파일 생성 없음.

```bash
# 임시 git 저장소의 feature/test-guard branch에서 실행
scripts/new_agent_task.sh feature/test-guard "Branch guard test"
```

결과: 현재 branch와 입력 branch가 일치할 때 workflow 문서 7개 생성.

```bash
curl -sS "https://api.dev-scj.site/topics?page=1&page_size=10"
```

결과: 최초 sandbox 실행은 DNS 제한으로 실패했다. 승인된 read-only 네트워크 접근으로 재실행해 response shape를 확인했다. 이는 production 배포 또는 운영 검증 완료 주장이 아니다.

확인한 top-level key:

```text
has_next, items, page, page_size, total
```

확인한 topic key:

```text
article_count, created_at, id, keywords, model, provider, source_count,
status, summary_ko, title_ko, topic_date, updated_at
```

확인 결과:

```text
itemCount=6
total=6
has_next=false
```

```bash
npm run dev
```

결과: 통과. `http://localhost:3000`에서 development server가 실행되었고 `GET / 200`이 기록되었다.

```bash
curl -sS http://localhost:3000
```

결과: 최초 sandbox 실행은 로컬 서버 연결 제한으로 실패했다. 승인된 read-only 접근으로 재실행해 다음 렌더링 marker를 확인했다.

```text
오늘의 주요 이슈
자동 생성된 전체 6개 이슈 중 6개
draft
openai
gpt-5-nano
많이 보이는 키워드
관련 기사 묶음
최신 기사 이어보기
TechCrunch
```

```bash
rg -n "오늘의 주요 이슈를 불러오는 중입니다|주요 이슈를 불러오지 못했습니다|아직 생성된 주요 이슈가 없습니다|getTopics\(1, 10\)|new URL\(\"/topics\"" components lib app/page.tsx
```

결과: loading, error, empty 상태 문구와 Topics API 호출 코드 존재 확인.

```bash
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
rg -n -i "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env" --glob '!node_modules/**' --glob '!.next/**' --glob '!package-lock.json'
```

결과: 문서, 환경 변수명 reference, 기존 generated marker, package name 관련 항목만 확인했다. 실제 secret 값은 확인되지 않았다.

## 결과

- `npm run lint`: 최종 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- Shell syntax와 `git diff --check`: 통과.
- Topics API response shape: frontend type/runtime validation과 일치.
- 실제 topic 6개와 기존 홈 보조 영역 렌더링: 로컬 HTML에서 확인.
- Branch mismatch 안전장치: 기대한 실패와 파일 미생성 확인.
- 동일 branch workflow 생성: 임시 git 저장소에서 7개 파일 생성 확인.
- Package test script: `package.json`에 없음.

## 수동 브라우저 검증

수행하지 않음. 로컬 server HTML과 `GET / 200`은 확인했지만 실제 브라우저 viewport, interaction, console 검증 완료를 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 desktop/mobile responsive layout 확인
- 실제 브라우저에서 loading/error/empty 상태 시각 확인
- 브라우저 console 확인
- GitHub Actions
- PR 생성 또는 merge
- Deployment 및 production verification

## 근거 메모

- Production API는 response contract 확인을 위한 read-only 요청만 수행했다.
- `.env`, `.env.*`, backend, DB, K3s, Supabase, production infrastructure를 수정하지 않았다.
