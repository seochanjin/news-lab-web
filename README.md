# NewsLab Web

NewsLab Web is the frontend application for the NewsLab project. This repository is the Next.js, TypeScript, and Tailwind CSS baseline for the MVP frontend.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- npm

## Requirements

- Node.js version from `.node-version`
- npm

## Local Setup

Install dependencies:

```bash
npm ci
```

Create a local environment file when API integration work requires it:

```bash
cp .env.example .env.local
```

Update `.env.local` for your local backend if needed. Do not commit real `.env` files.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_NEWSLAB_API_BASE_URL` | Yes for API integration | Base URL for the NewsLab backend API. Use a local placeholder in `.env.example`; keep real values in `.env.local`. |

## Validation

Run these commands before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -n -i -E "API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE KEY|BEGIN|\\.env"
```

The credential scan may match documentation references to `.env`; review matches to confirm they do not contain secret values.

## Scope Notes

- Backend, database, Supabase, K3s, and production infrastructure are outside this repository's scope.
- Docker and production deployment are intentionally not part of this baseline.
