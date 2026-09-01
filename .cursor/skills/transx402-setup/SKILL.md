---
name: transx402-setup
description: >-
  Configure TransX402 env, API keys, merchant wallet, HMAC secret, and optional
  local facilitator for this Next.js starter. Use when setting up .env.local,
  sandbox vs live keys, FACILITATOR_URL, ACCESS_TOKEN_SECRET, or clone-and-run.
---

# TransX402 setup

## Env

Copy `.env.local.example` → `.env.local`. Server-only:

| Variable | Required | Purpose |
|----------|----------|---------|
| `TRANSX402_API_KEY` | yes | `ipk_sandbox_*` (sandbox) or `ipk_live_*` (Base, real IDRX) |
| `MERCHANT_WALLET` | yes | `payTo` address |
| `PRICE_IDR` | no | Whole IDR, default `5000` |
| `ACCESS_TOKEN_SECRET` | yes | HMAC secret for page cookies |
| `ACCESS_TTL_SECONDS` | no | Default 7 days |
| `FACILITATOR_URL` | no | e.g. `http://localhost:3402` for local Docker |
| `AGENT_PRIVATE_KEY` | no | Smoke agent key |

Key prefix selects the network. Do not add a CAMP/Base toggle or `X-Demo-Environment`.

```
ipk_sandbox_* + hosted facilitator → environment "camp"
ipk_sandbox_* + localhost FACILITATOR_URL → environment "local"
ipk_live_* → environment "base"
```

Pass `environment` from a Server Component into client unlock UI via `getClientEnvironment()`. Never expose the API key to the browser.

## Run

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev   # http://localhost:3421
```

## Config proxy

Browser settlement `server` requires `GET /api/transx402/config` (`tx402.config.handleRequest`). Do not let the browser fetch `api.transx402.com/config`.

## Local facilitator

Camp maintainers: `FACILITATOR_URL=http://localhost:3402` with a sandbox key. The browser still uses `/api/transx402`.
