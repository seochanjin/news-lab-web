<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NewsLab Web Frontend Agent Rules

## Project scope

- This repository contains the NewsLab Web frontend only.
- Do not modify backend repositories, K3s, Supabase, database, or production infrastructure from this repository.
- Do not add Docker, K3s, or production deployment configuration unless a task explicitly asks for it.

## Development rules

- Keep the generated Next.js App Router, TypeScript, and Tailwind CSS structure intact.
- Prefer small, reviewable changes that match the current project layout.
- Manage the backend API base URL through `NEXT_PUBLIC_NEWSLAB_API_BASE_URL`.
- Do not commit secrets, tokens, credentials, private keys, or real `.env` files.
- Keep `.env.example` limited to documented placeholder values.

## Verification

Run the relevant checks before handing off frontend changes:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```
