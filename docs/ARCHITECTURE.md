# NewsLab Web 아키텍처

## 개요

NewsLab Web은 NewsLab 콘텐츠를 탐색하는 프론트엔드 애플리케이션이다. 이 저장소에는 브라우저 대상 애플리케이션과 프론트엔드 workflow 문서만 포함한다.

현재 확인된 기술 스택은 다음과 같다.

- Next.js `16.2.7` App Router
- React `19.2.4`
- strict checking을 사용하는 TypeScript
- `@tailwindcss/postcss`를 사용하는 Tailwind CSS `4`
- npm

Backend API, DB, Supabase SQL, K3s resource, production infrastructure는 이 저장소의 작업 범위 밖이다.

## 현재 구조

### 애플리케이션

- `app/layout.tsx`: root layout, metadata, global font 설정, 문서 언어를 관리한다.
- `app/page.tsx`: 현재 `/` route로, 오늘의 주요 이슈와 요약을 중심으로 제공하며 원문 탐색은 Header의 `/articles`와 `/search` 흐름으로 분리한다.
- `app/articles/`: Article 검색/category 목록 route와 route 상태를 포함한다.
- `app/search/`: Header 통합 검색 route와 loading 상태를 포함하며 주요 이슈 결과를 먼저 제공하고, 검색된 상위 Topic의 연결 기사와 직접 기사 검색 결과를 병합한다.
- `app/topics/`: Topic 목록 explorer route와 상세 dynamic route, route 상태를 포함한다.
- `components/articles/`: Article 검색 route와 통합 검색 route가 재사용하는 기사 목록 및 상태 UI를 포함한다.
- `components/layout/`: 서비스 중심 공통 header와 빈 side rail slot을 포함한 `PageShell`을 제공한다.
- `components/topics/`: Topics API 목록과 카드 표시 컴포넌트를 포함한다.
- `lib/api/topics.ts`: Home Topics, Topics archive, Topic detail API response type, runtime validation, fetch 함수를 포함한다.
- `app/globals.css`: Tailwind import와 global style을 포함한다.
- `app/favicon.ico`: 애플리케이션 favicon이다.

현재 `src/`, `pages/`, `hooks/`, 별도 `styles/` 디렉터리는 없다. 범위가 명확한 프론트엔드 작업에 필요하고 검토 가능한 구조를 유지할 수 있을 때만 추가한다.

### 정적 자산

- `public/`: Next.js가 제공하는 정적 파일을 둔다.
- `public/screenshots/`: 프로젝트 문서에 사용하는 tracked screenshot을 둔다.

### 설정

- `next.config.ts`: Next.js 설정 파일이다.
- `Dockerfile`: Next.js standalone output 기반 frontend container image build 정의다.
- `.dockerignore`: Docker build context에서 로컬 build artifact, dependency, env 파일, workflow 문서 산출물을 제외한다.
- `tsconfig.json`: TypeScript 설정과 `@/*` root alias를 정의한다.
- `eslint.config.mjs`: Next.js Core Web Vitals와 TypeScript lint rule을 정의한다.
- `postcss.config.mjs`: Tailwind CSS PostCSS plugin을 설정한다.
- `.github/workflows/ci.yml`: npm install, lint, typecheck, build 검증을 정의한다.
- `.github/workflows/docker-build.yml`: Docker image build와 non-PR event의 Docker Hub push를 위한 workflow 초안이다.
- `k8s/`: frontend K3s Deployment, Service, Ingress manifest 초안을 포함한다. Agent는 이 manifest를 적용하지 않는다.

이 저장소의 Next.js 버전은 이전 convention과 다른 breaking change를 포함하므로 Next.js 동작을 변경하기 전에 `node_modules/next/dist/docs/`의 관련 로컬 가이드를 읽는다.

## Routing과 Rendering

- root-level Next.js App Router `app/` 디렉터리를 사용한다.
- `app/page.tsx`가 `/` route를 제공한다.
- `app/articles/page.tsx`가 `/articles` 검색 및 category 목록 route를 제공한다.
- `app/search/page.tsx`가 `/search?query=...` 통합 검색 route를 제공한다.
- `app/topics/page.tsx`가 `/topics` 목록 explorer route를 제공한다.
- `app/topics/[id]/page.tsx`가 `/topics/{id}` 상세 route를 제공한다.
- `app/layout.tsx`가 모든 route를 감싼다.
- 현재 page는 Server Component이며 기사 목록 loading UI에 `Suspense`를 사용한다.
- 현재 route handler와 Pages Router route는 없다.

## API 연동

현재 Topics API client는 `lib/api/topics.ts`에, Articles API client는 `lib/api/articles.ts`에 분리되어 있다.

향후 공통 request 동작이나 추가 endpoint를 분리할 때는 `lib/api/` 패턴을 우선 검토한다. 이 저장소에 backend API 구현을 추가하지 않는다.

현재 프론트엔드 API 사용 방식은 다음과 같다.

- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`을 읽는다.
- `lib/api/topics.ts`에서 홈 전용 backend `GET /topics/home` endpoint를 호출하고 response shape를 검사한다.
- `lib/api/topics.ts`에서 기존 backend `GET /topics` endpoint를 archive/search용으로 호출하고 response shape를 검사한다.
- `lib/api/topics.ts`에서 기존 backend `GET /topics/{id}` endpoint를 호출하고 상세 response shape와 404를 구분한다.
- `lib/api/articles.ts`에서 기존 backend `GET /articles` endpoint를 호출하고 response shape를 검사하며 `keyword`와 `category` query parameter를 전달한다.
- Article 검색 page는 Server Component의 `searchParams`로 검색 조건을 읽고 Articles API 요청에 사용한다.
- Topic 목록과 article 영역에서 각각 loading, error, empty state를 처리한다.
- Topic 목록 archive는 Server Component에서 topic을 조회하고 전체/현재 표시 개수와 Topic card 목록을 제공한다. 주요 이슈 검색은 `/search` 통합 검색에서 처리한다.
- 홈은 `GET /topics/home` 경량 Topics API만 조회하며 원문 기사 목록과 Articles API 조회는 `/articles`와 `/search`에서 처리한다.
- Topic 상세 route는 route-level loading, error, not-found 상태를 처리한다.
- 공통 header는 `/topics`와 `/articles`를 top-level 탐색으로 제공하고, header 검색은 `/search`에서 주요 이슈와 원문 기사를 함께 검색한다.

## 환경 변수

Tracked 문서에는 환경 변수명을 기록할 수 있지만 실제 값은 포함하지 않는다.

현재 문서화된 환경 변수명:

- `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`: 프론트엔드가 사용하는 public NewsLab API base URL

`.env.example`을 포함한 모든 `.env`, `.env.*` 파일은 agent 수정 범위 밖이다.

## 배포 기반

NewsLab Web frontend는 Next.js standalone output을 사용해 self-hosted Node.js server container로 실행할 수 있도록 구성한다.

- `next.config.ts`는 `output: "standalone"`을 사용한다.
- `Dockerfile`은 dependency install, Next.js build, standalone runtime stage를 분리한다.
- Docker build 시 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` build arg로 public API base URL을 전달한다. `NEXT_PUBLIC_*` 값은 browser bundle에 포함되는 public config이며 secret으로 취급하지 않는다.
- runtime container는 `node server.js`로 Next.js standalone server를 실행하고 `3000` port를 노출한다.
- K3s manifest 초안은 `news-lab-web` Deployment/Service와 `news-lab-web-ingress` Ingress를 정의하며 frontend service를 cluster 내부 port 80에서 container port 3000으로 연결한다.
- Deployment readiness/liveness probe는 frontend process 자체 확인을 위해 외부 API를 호출하지 않는 `/api/health` route를 사용한다.
- Ingress manifest 초안은 현재 K3s IngressClass 기준에 맞춰 `traefik`을 사용한다.
- Ingress TLS는 cert-manager `letsencrypt-prod` ClusterIssuer와 `news-lab-web-tls` Secret을 사용하도록 선언한다.
- 초기 frontend API target은 기존 `https://api.dev-scj.site`를 유지한다.
- `newslab.ai.kr`와 `www.newslab.ai.kr` host는 Ingress manifest 초안에 포함되어 있지만 DNS, certificate 발급, production rollout verification은 별도 수동 단계다.

이 저장소의 배포 파일은 frontend 배포 준비물이다. Agent는 `kubectl apply`, rollout, Docker Hub secret 설정, production deploy, domain/TLS verification을 수행하지 않는다.

## 스타일링

- React markup에서 Tailwind CSS utility를 사용한다.
- Tailwind global import와 작은 global default는 `app/globals.css`에 둔다.
- 현재 별도 component library 또는 design token module은 없다.
- `PageShell`은 홈, 목록, 상세, route 상태 화면에 공통 본문 폭과 비어 있는 좌우 확장 slot을 제공하며 작은 화면에서는 slot을 숨긴다.

프론트엔드 변경은 responsive layout, 읽기 쉬운 상태 UI, keyboard/accessibility behavior, 기존 화면과의 시각적 일관성을 고려해야 한다.

## Agent workflow 문서

Workflow 협업은 파일 기반으로 진행한다.

- `docs/tasks/`: 작업 요구사항의 source of truth
- `docs/reviews/`: review finding만 기록
- `docs/fixes/`: 사람이 승인한 수정과 처리 결과 기록
- `docs/verification/`: 실제 실행한 command, 결과, pending 검증 기록
- `docs/pr/`: verification 기록을 근거로 작성한 PR 초안
- `docs/devlog/`: verification 기록을 근거로 작성한 작업 기록
- `docs/prompts/`: 재사용 가능한 프론트엔드 agent prompt

Helper script는 workflow 문서를 생성하고 handoff prompt를 출력할 뿐 agent, test, git remote operation, deployment를 실행하지 않는다.
