
# NewsLab Web 프론트엔드 MVP 레포 구성

## 작업 목적

NewsLab 백엔드 API를 사용하는 프론트엔드 애플리케이션 개발을 시작할 수 있도록 Next.js 기반 MVP repository baseline을 구성한다.

## 기존 문제

- README가 create-next-app 또는 최소 설명 수준이라 NewsLab Web 기준의 개발, 검증, 범위 안내가 부족했다.
- CI workflow와 `.env.example`이 없어 PR 검증과 API base URL 관리 기준이 없었다.
- 기본 홈 화면이 제품 placeholder가 아니라 generated template 상태였다.
- agent 문서가 Next.js generated warning만 포함하고 있어 프론트엔드 전용 작업 범위와 보안 규칙이 부족했다.

## 변경 내용

- `AGENTS.md`에 프론트엔드 전용 작업 규칙과 검증 명령을 추가했다.
- `.github/workflows/ci.yml`을 추가해 install, lint, typecheck, build를 실행하게 했다.
- `.env.example`을 추가하고 `.gitignore`에서 해당 파일만 commit 가능하도록 예외 처리했다.
- `app/page.tsx`를 NewsLab Web placeholder로 정리했다.
- `app/layout.tsx` metadata와 `lang`을 NewsLab Web 기준으로 수정했다.
- README와 PR, devlog, verification 문서를 baseline 기준으로 정리했다.

## 구현 상세

- Next.js App Router 구조는 유지했다.
- Tailwind CSS v4의 기존 `app/globals.css` import 구조는 변경하지 않았다.
- API 연동 코드는 추가하지 않고, 환경변수 이름만 문서화했다.
- CI는 `.node-version`을 사용해 Node.js 버전을 맞춘다.

## 대안 검토

- 별도 UI 컴포넌트 구조를 미리 만들 수 있었지만, 이번 작업은 repository baseline이 목표라 제외했다.
- Docker/K3s 배포 workflow를 추가할 수 있었지만, task scope에서 명시적으로 제외했다.

## 선택한 접근과 근거

- 현재 Next.js generated 구조를 보존하고 필요한 문서, CI, placeholder만 추가해 리뷰 범위를 작게 유지했다.
- API base URL은 public browser 환경에서 접근 가능한 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`로 문서화했다.

## 트레이드오프

- 실제 API client나 화면 상태 관리는 아직 없다.
- placeholder 화면은 브랜드 시작점만 제공하며 완성형 UI가 아니다.

## 테스트

- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 최초 sandbox 실행은 Google Fonts 네트워크 접근 실패로 실패, network approval 후 통과.
- `git diff --check`: 통과.
- credential pattern scan: 문서의 `.env` 안내만 탐지, secret 값 없음.

## 운영 반영

- 운영 반영 없음.
- production deployment 설정 없음.

## README 업데이트 판단

- 필수. 로컬 setup, env, validation, scope를 새 baseline에 맞춰 정리했다.

## 확인 결과

- Acceptance criteria의 frontend baseline 항목을 충족한다.
- Backend, DB, Supabase, K3s, production infra는 변경하지 않았다.

## 이번 단계의 의미

- NewsLab Web frontend 작업을 PR 단위로 검증할 수 있는 최소 기반을 마련했다.

## 포트폴리오용 요약

- Next.js 16, TypeScript, Tailwind 기반 프론트엔드 MVP repository baseline을 구성하고 CI, env example, agent workflow, verification 문서 체계를 정리했다.

## 다음 단계 후보

- NewsLab backend API schema 확인 후 typed API client 설계.
- 공통 layout, navigation, error/loading state 기준 수립.
- 첫 MVP 화면 단위 task 정의.
