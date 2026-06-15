# 검증 기록: Article 목록 검색 및 카테고리 페이지 MVP

## 검증 범위

- `/articles` route와 Promise 기반 `searchParams` 처리
- 기존 Articles API의 `keyword`, `category` query parameter와 response validation
- Header 검색 submit 및 category link의 `/articles` 연결 코드
- Article loading, error, 전체 empty, 필터 empty, success 상태
- 홈과 `/articles`가 재사용하는 article 목록 및 외부 원문 link
- 기존 `/`, `/topics`, `/topics/{id}` route 유지
- CI build용 public `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`
- Backend, DB, Supabase, K3s, Docker, secret, `.env*`, production infrastructure 미변경

## 실행한 Command

```bash
curl -sS 'https://api.dev-scj.site/articles?page=1&page_size=10'
curl -sS 'https://api.dev-scj.site/articles?page=1&page_size=10&keyword=Anthropic'
curl -sS 'https://api.dev-scj.site/articles?page=1&page_size=10&category=tech'
```

결과: 첫 sandbox 실행은 DNS 제한으로 실패했다. 네트워크 권한으로 동일 read-only 요청을 재실행해 전체 `total=1355`, Anthropic 검색 `total=31`, tech category `total=685`와 `articles`, `count`, `total`, `has_next` response contract를 확인했다.

```bash
for category in politics economy business society ai world tech; do
  curl -sS "https://api.dev-scj.site/articles?page=1&page_size=1&category=$category"
done
```

결과: 기존 API에서 `ai`, `world`, `tech` category data가 존재하며 각각 `total=1`, `667`, `685`를 반환했다. `politics`, `economy`, `business`, `society`는 현재 `total=0`을 반환했다.

```bash
npm run lint
npm run typecheck
npm run build
bash -n scripts/new_agent_task.sh
bash -n scripts/agent_next_step.sh
git diff --check
```

결과: 모두 통과. Build route 목록에서 `/`, `/articles`, `/topics`, `/topics/[id]`가 dynamic server-rendered route로 확인되었다.

```bash
NEXT_PUBLIC_NEWSLAB_API_BASE_URL=https://api.dev-scj.site npm run build
```

결과: sandbox 실행은 Google Fonts 네트워크 요청 실패로 중단되었다. 네트워크 권한으로 동일 command를 재실행해 통과했으며 `/articles`를 포함한 route build를 확인했다.

```bash
npm run dev
curl -sS -o /tmp/newslab-articles-page.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles'
curl -sS -o /tmp/newslab-articles-query.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?query=Anthropic'
curl -sS -o /tmp/newslab-articles-tech-page.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?category=tech'
curl -sS -o /tmp/newslab-articles-combined.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?query=Anthropic&category=tech'
curl -sS -o /tmp/newslab-articles-empty.html -w '%{http_code}\n' 'http://127.0.0.1:3000/articles?query=NoResultsExpectedForNewsLab12345'
curl -sS -o /tmp/newslab-articles-home.html -w '%{http_code}\n' 'http://127.0.0.1:3000/'
curl -sS -o /tmp/newslab-articles-topics.html -w '%{http_code}\n' 'http://127.0.0.1:3000/topics'
curl -sS -o /tmp/newslab-articles-topic-detail.html -w '%{http_code}\n' 'http://127.0.0.1:3000/topics/7'
```

결과: 모든 route 요청이 `200`을 반환했다.

```bash
rg -o '기사 탐색|기사 목록|검색어: Anthropic|카테고리: 기술|조건에 맞는 기사가 없습니다.|FTX.s former Anthropic stake|Hacker News|href="https?[^" ]+"' /tmp/newslab-articles-*.html
rg -o 'href="/articles"|href="/articles\?category=(politics|economy|tech|world|society|ai)"|aria-current="page"|기사 제목이나 키워드를 검색하세요' /tmp/newslab-articles-tech-page.html
rg -n 'router\.push|searchParams\.set\("query"|searchParams\.set\("category"|target="_blank"|rel="noopener noreferrer"|keyword|category' app/articles components/articles components/layout lib/api/articles.ts
```

결과: 전체/검색/category/결합/empty route marker, Anthropic 결과, tech category active `aria-current` 1개, 모든 header category link, 외부 원문 link와 검색 submit/category 유지 코드가 존재함을 확인했다.

```bash
rg -n 'NEXT_PUBLIC_NEWSLAB_API_BASE_URL|npm run build' .github/workflows/ci.yml
```

결과: CI frontend job에 public API base URL과 build step이 함께 존재함을 확인했다.

```bash
git grep -n -i -E 'API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\.env' -- ':!package-lock.json'
```

결과: 문서, ignore rule, 환경 변수명 reference만 확인했으며 실제 secret 값은 확인되지 않았다.

## 결과

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- CI public API env를 명시한 `npm run build`: 네트워크 권한 재실행 통과
- Shell syntax와 `git diff --check`: 통과
- Articles API 전체/keyword/category response contract: 확인
- `/articles` 전체/검색/category/결합/empty 및 기존 route HTTP `200`: 확인
- Header submit/category 이동과 외부 새 탭 link: 코드 marker 확인
- Package test script: `package.json`에 없음

## 수동 브라우저 검증

수행하지 않음. 로컬 development server와 HTML/code marker는 확인했지만 실제 header 검색 submit, category 클릭, 원문 새 탭, viewport, keyboard, screen reader, console 검증 완료를 주장하지 않는다.

## 대기 중인 검증

- 실제 브라우저에서 header 검색 submit 후 `/articles?query=...` 이동 확인
- 실제 브라우저에서 category 클릭 후 `/articles?category=...` 이동 확인
- 검색어와 category 결합 및 조건 초기화 동작 확인
- Article 원문 link 새 탭 동작 확인
- Loading/error/전체 empty 상태 시각 확인
- Desktop/mobile responsive layout 확인
- Keyboard focus, screen reader, browser console 확인
- GitHub Actions 실제 workflow 실행
- PR 생성 또는 merge
- Deployment 및 production verification

## 근거 메모

- Production API 요청은 기존 contract 확인을 위한 read-only 요청이며 production verification 완료를 의미하지 않는다.
- Header category는 task의 영어 slug mapping을 사용하며 현재 데이터가 없는 category는 empty state로 처리한다.
- Backend API, DB, Supabase SQL, K3s, Docker, production infrastructure, secret, `.env*`를 수정하지 않았다.
- Article 상세 page, backend 검색 API 변경, 이미지, provider/model 정책은 구현하지 않았다.
