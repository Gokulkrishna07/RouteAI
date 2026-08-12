# RouteAi

One chat API, several LLM providers. You send a prompt, the gateway scores how hard it looks and sends it to a model that fits — a tiny Llama for "what's 2+2", Gemini for "design a schema and explain the tradeoffs". You can always override the model if you'd rather pick yourself.

Comes with a React app on top: chat with saved sessions, a model browser, and per-model usage stats.

## How routing works

Every prompt gets a complexity score out of 100, based on length, keywords like "compare" or "step by step", code blocks, and how many questions you crammed into one message. The score picks a tier:

| Score | Tier | Goes to |
| --- | --- | --- |
| ≤ 20 | simple | Groq · llama-3.1-8b-instant |
| ≤ 40 | fast | Groq · llama-3.3-70b-versatile |
| ≤ 60 | moderate | OpenRouter · auto |
| ≤ 80 | medium | Gemini Flash |
| > 80 | complex | Gemini Flash |

Pass `model` in the request body and the scoring is skipped entirely.

Tiers live in [gateway.config.ts](Backend/src/modules/gateway/gateway.config.ts), scoring in [complexity.heuristic.ts](Backend/src/modules/gateway/complexity.heuristic.ts).

## Stack

**Backend** — Fastify 5, TypeScript, Postgres (raw `pg`, SQL migrations), Zod validation, JWT auth, Vitest.
**Frontend** — React 19, Vite, MUI + Tailwind, Redux Toolkit, React Router, Vitest + Testing Library.

## Running it

Postgres first, then:

```bash
cd Backend
cp .env.example .env      # fill in DB creds, JWT_SECRET, provider keys
npm install
npm run migrate
npm run dev               # http://localhost:3000
```

```bash
cd Frontend
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev
```

You need at least one provider key (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) — requests routed to a provider you haven't configured will fail.

Tests: `npm test` in either folder, `npm run test:coverage` / `npm run coverage` for reports.

## API

Everything is under `/api/v1`. Auth is a JWT bearer token: `Authorization: Bearer <token>`. Rate limit is 20 requests/minute per IP.

| Endpoint | What it does |
| --- | --- |
| `POST /register`, `/login` | Returns user, access token, refresh token |
| `POST /refresh`, `/logout` | Rotate or invalidate the refresh token |
| `GET /me` | Current user |
| `POST /chat` | The router — only `prompt` is required |
| `GET /sessions` | List chat sessions |
| `GET /sessions/:id/messages` | Messages in a session |
| `PATCH`/`DELETE /sessions/:id` | Rename or delete |
| `GET /usage/me` | Tokens and cost per model |
| `GET /health` | Liveness |

Request and response shapes for health and auth are written up in [Docs/api-design.md](Docs/api-design.md).

## Layout

```
Backend/src
  modules/     auth, sessions, usage, gateway, providers
  routes/      chat, usage, health
  plugins/     cors, helmet, rateLimit
  db/          migrations
Frontend/src
  features/    auth
  pages/       Chat, Models, Login, Signup, Home
Docs/          api-design.md, Architecture.md
```

Each backend module is split the same way — `.route` / `.service` / `.repository` / `.schema` / `.types`, with tests in a sibling `test/` folder.
