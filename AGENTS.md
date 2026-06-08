<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NewsLab Web 프론트엔드 작업 규칙

## 프로젝트 범위

- 이 저장소는 NewsLab Web 프론트엔드만 다룬다.
- 백엔드 저장소, K3s, Supabase, DB, 운영 인프라는 수정하지 않는다.
- 작업 문서에서 명시적으로 요청하지 않으면 Docker, K3s, 운영 배포 설정을 추가하지 않는다.

## 개발 규칙

- 생성된 Next.js App Router, TypeScript, Tailwind CSS 구조를 유지한다.
- 현재 프로젝트 구조에 맞는 작고 검토 가능한 변경을 우선한다.
- 백엔드 API base URL은 `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`로 관리한다.
- 실제 API 연동은 해당 작업 문서가 요청할 때만 구현한다.
- secret, token, credential, private key, 실제 `.env` 파일을 커밋하지 않는다.
- `.env.example`에는 문서용 placeholder 값만 둔다.

## 검증

프론트엔드 변경을 전달하기 전에 관련 검증을 실행한다.

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```
