# Lecturia - Agent Instructions

## Cursor Cloud specific instructions

### Overview

Lecturia is an educational RAG platform (Next.js 16 + Supabase + OpenAI). Lecturers upload course materials; students chat with an AI assistant that answers from those materials.

### Services

| Service | How to run | Port |
|---------|-----------|------|
| Next.js dev server | `npm run dev` | 3000 |
| Supabase (local) | `sudo supabase start` (from repo root) | 54321 (API), 54322 (DB), 54323 (Studio), 54324 (Mailpit) |

### Key gotchas

- **Docker required**: Supabase local dev requires Docker. Docker must be started with `sudo dockerd` before `sudo supabase start`. The Docker daemon uses `fuse-overlayfs` storage driver in this environment.
- **sudo for Supabase CLI**: Both `supabase start` and `supabase status` require `sudo` because Docker runs as root.
- **ESLint not in package.json**: `eslint` and `eslint-config-next` must be installed separately (`npm install --save-dev eslint eslint-config-next`) as they are not listed in the repo's `package.json`.
- **Email confirmation disabled locally**: The Supabase local config has `enable_confirmations = false`, so signup works immediately without email verification.
- **Auth middleware disabled**: The middleware at `src/middleware.ts` has authentication/role checks commented out for development.
- **`.env.local` required**: Must contain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Get values from `sudo supabase status -o env` after starting Supabase. `OPENAI_API_KEY` is needed for embedding/chat features but the app starts without it.

### Common commands

See `package.json` scripts: `npm run dev`, `npm run build`, `npm run lint`.
