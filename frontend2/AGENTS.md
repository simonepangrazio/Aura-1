# Frontend2 Agent Rules

This dashboard runs on Next.js 16 with the App Router. Before changing framework-specific behavior, read the matching local docs in `node_modules/next/dist/docs/`; this version may differ from older Next.js knowledge.

Use `src/lib/api.ts` as the shared backend client. Do not add persistent mock data when a backend endpoint exists. Temporary placeholders are acceptable only for loading, error, or empty states.

The dashboard API base URL comes from `NEXT_PUBLIC_API_BASE_URL`, with a local fallback to `http://localhost:8000/api/v1`. Authenticated requests must send the JWT bearer token returned by `/api/v1/auth/login`.

Keep UI state explicit: loading, error, empty, and populated states should all render cleanly. Prefer tenant-scoped backend data over hardcoded IDs in embed snippets, sessions, agents, widgets, and devices.
