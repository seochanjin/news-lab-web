# 검증 기록: Topic 상세 페이지 MVP

## 검증 범위

- Topic Detail API response shape와 frontend runtime validation
- `/topics/[id]` dynamic route의 success, loading, error, not-found 상태 구현
- 홈 topic card의 상세 route link
- 상세 화면의 요약, 핵심 포인트, 키워드, metadata, 연결 article 목록
- 외부 article URL 새 탭 속성과 안전한 URL protocol 처리
- Backend, DB, K3s, Supabase, secret, `.env*`, production infrastructure 미변경

## 실행한 Command

```bash
curl -sS https://api.dev-scj.site/topics/7
```

결과: 통과. Read-only 요청으로 실제 detail response의 top-level field와 연결 article 3건을 확인했다. 이는 production 배포 또는 production verification 완료 주장이 아니다.

```bash
npm run lint
npm run typecheck
npm run build
```

결과: 모두 통과. Build에서 `/topics/[id]`는 dynamic server-rendered route로 확인되었다.

```bash
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

결과: 모두 통과.

```bash
npm run dev
curl -sS -o /tmp/newslab-topic-home.html -w '%{http_code}\n' http://localhost:3000
curl -sS -o /tmp/newslab-topic-detail-7.html -w '%{http_code}\n' http://localhost:3000/topics/7
curl -sS -o /tmp/newslab-topic-detail-invalid.html -w '%{http_code}\n' http://localhost:3000/topics/not-a-number
curl -sS -o /tmp/newslab-topic-detail-missing.html -w '%{http_code}\n' http://localhost:3000/topics/999999999
```

결과: development server 실행과 네 route 요청이 통과했다. 모든 응답은 `200`이었다. Not-found route는 `loading.tsx`로 streaming이 시작되어 Next.js 문서에 설명된 soft 404 동작을 따르며 HTML에 `noindex` marker가 포함되었다.

```bash
rg -o 'SpaceX IPO로 머스크 세계 최초 트릴리어네어 등극|핵심 포인트|주요 키워드|관련 기사|대표 기사|DW English|Wired|Al Jazeera|target="_blank"|noopener noreferrer' /tmp/newslab-topic-detail-7.html
rg -o '해당 주요 이슈를 찾을 수 없습니다|주요 이슈 목록으로 돌아가기|noindex' /tmp/newslab-topic-detail-invalid.html /tmp/newslab-topic-detail-missing.html
rg -n '주요 이슈 상세를 불러오는 중입니다|주요 이슈 상세를 불러오지 못했습니다|해당 주요 이슈를 찾을 수 없습니다|target="_blank"|rel="noopener noreferrer"|getTopicDetail|TopicNotFoundError' app components lib
```

결과: 상세 success marker, article source 3개, 외부 링크 새 탭 속성, invalid/missing ID not-found marker, loading/error 상태 코드 존재를 확인했다.

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

결과: 문서와 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.

### 승인 수정 적용 후 재검증

```bash
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

결과: 모두 통과. Build에서 `/`와 `/topics/[id]`는 dynamic server-rendered route로 확인되었다.

```bash
npm run dev
curl -sS -o /tmp/newslab-approved-home.html -w '%{http_code}\n' http://localhost:3000
curl -sS -o /tmp/newslab-approved-detail.html -w '%{http_code}\n' http://localhost:3000/topics/7
curl -sS -o /tmp/newslab-approved-not-found.html -w '%{http_code}\n' http://localhost:3000/topics/not-a-number
```

결과: development server가 실행되었고 세 route 요청이 모두 `200`을 반환했다. Not-found 응답에는 기존과 같이 `noindex` marker가 포함되었다.

```bash
rg -o 'NewsLab|뉴스를 한눈에|뉴스 검색|뉴스 카테고리|전체|정치|경제|기술|세계|사회|AI' /tmp/newslab-approved-home.html
rg -o 'NewsLab|뉴스를 한눈에|뉴스 검색|뉴스 카테고리|전체|정치|경제|기술|세계|사회|AI|SpaceX IPO로 머스크 세계 최초 트릴리어네어 등극|핵심 포인트|관련 기사|DW English|Wired|Al Jazeera' /tmp/newslab-approved-detail.html
rg -o 'NewsLab|뉴스를 한눈에|뉴스 검색|뉴스 카테고리|해당 주요 이슈를 찾을 수 없습니다|주요 이슈 목록으로 돌아가기|noindex' /tmp/newslab-approved-not-found.html
rg -n 'console\.error\("Topic detail page error", error\)|useEffect\(\(\) =>|<SiteHeader />' app/topics/[id]/error.tsx components/topics/TopicDetail.tsx components/topics/TopicDetailState.tsx app/page.tsx
```

결과: 홈, 상세 success, 상세 not-found HTML에서 공용 header/search/category navigation marker를 확인했다. 상세 success에서 본문과 관련 기사 marker가 유지되었고, error boundary의 `useEffect`와 식별 가능한 `console.error` 코드 존재를 확인했다.

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

결과: 승인 수정 적용 후 재실행했다. 문서와 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.

```bash
curl -sS -o /tmp/newslab-approved-home-final.html -w '%{http_code}\n' http://localhost:3000
curl -sS -o /tmp/newslab-approved-detail-final.html -w '%{http_code}\n' http://localhost:3000/topics/7
curl -sS -o /tmp/newslab-approved-not-found-final.html -w '%{http_code}\n' http://localhost:3000/topics/not-a-number
rg -o 'aria-current="page"' /tmp/newslab-approved-home-final.html | wc -l
rg -o 'aria-current="page"' /tmp/newslab-approved-detail-final.html | wc -l
```

결과: 최종 코드 기준 세 route가 모두 `200`을 반환했다. 홈 HTML에는 `aria-current="page"`가 1개 있었고 상세 HTML에는 없어, 상세 route에서 잘못된 현재 category 표시를 하지 않는 것을 확인했다. 상세 본문/관련 기사와 not-found/header marker도 유지되었다.

## 결과

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- Shell syntax와 `git diff --check`: 통과.
- 실제 Topic Detail API response contract: runtime validation과 일치.
- 홈 상세 link와 상세 success/not-found HTML marker: 확인.
- 홈/상세 공용 header/search/category navigation HTML marker: 확인.
- 홈/상세 category navigation `aria-current` 구분: 확인.
- Error 상태 시각/재시도/console 로깅 동작: 코드 존재만 확인.
- Package test script: `package.json`에 없음.

## 수동 브라우저 검증

수행하지 않음. 로컬 development server와 HTML marker는 확인했지만 실제 브라우저 viewport, 클릭 interaction, 새 탭 동작, console 검증 완료를 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 홈 topic card 클릭과 상세 route 이동 확인
- 실제 브라우저에서 desktop/mobile responsive layout 확인
- 실제 브라우저에서 외부 기사 링크 새 탭 동작 확인
- 실제 브라우저에서 loading/error/not-found 상태 시각 및 재시도 확인
- 브라우저 console에서 Topic detail error 로깅 확인
- GitHub Actions
- PR 생성 또는 merge
- Deployment 및 production verification

## 근거 메모

- Production API는 response contract 확인을 위한 read-only 요청만 수행했다.
- `.env`, `.env.*`, backend, DB, K3s, Supabase, production infrastructure를 수정하지 않았다.
