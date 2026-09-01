<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TransX402 starter — Agent Guide

## Hard rules

- Settlement is always `server`. The browser never calls `POST /facilitate` or the facilitator origin for `GET /config`.
- Secret keys (`ipk_sandbox_*`, `ipk_live_*`, `ACCESS_TOKEN_SECRET`) stay in server env. Never put them in `NEXT_PUBLIC_*`.
- Same-origin config proxy is required: `GET /api/transx402/config`.
- `GET /api/quote` is stateless. Do not read or set access cookies there.
- Paid pages persist via HMAC cookies (`tx402_access_<resourceId>`), not by storing payment headers on the client.
- No CAMP/Base UI toggle. `detectApiKeyFamily(TRANSX402_API_KEY)` selects sandbox vs production. Optional `FACILITATOR_URL` switches sandbox to a local facilitator.
- Chain id, IDRX address, and Permit2 come from facilitator `GET /config`. Do not hardcode them.

## Which skill to use

- **Env, API keys, local facilitator** — `transx402-setup`
- **New gated JSON endpoint** — `transx402-add-gated-api`
- **New paid page with an access cookie** — `transx402-add-gated-page`
- **Smoke / payment e2e** — `transx402-smoke-test`

Keep this file short. Deeper guidance lives in `.cursor/skills/`.
