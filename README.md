# TransX402 Next.js fullstack starter

Clone-and-run Next.js 16 App Router template for **TransX402** gated resources:

| Surface | Route | After payment | Refresh |
|---------|-------|---------------|---------|
| Pure API | `GET /api/quote` | JSON only, **no cookie** | Pay again |
| Fullstack page | `GET /article` + `GET /api/article/unlock` | HMAC cookie | RSC renders paid HTML |

The canonical minimal recipe (no cookies, no Tailwind) lives in the TransX402 monorepo at `examples/next-paid-content`. This starter is the opinionated product template.

## Requirements

- Node.js 20.19+
- pnpm
- A TransX402 API key (`ipk_sandbox_*` or `ipk_live_*`)
- MetaMask for the browser path (smoke uses an agent key)

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# edit TRANSX402_API_KEY, MERCHANT_WALLET, ACCESS_TOKEN_SECRET
pnpm dev
```

Open [http://localhost:3421](http://localhost:3421).

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `TRANSX402_API_KEY` | Server | `ipk_sandbox_*` or `ipk_live_*` |
| `MERCHANT_WALLET` | Server | `payTo` |
| `PRICE_IDR` | Server | Whole IDR (default `5000`) |
| `ACCESS_TOKEN_SECRET` | Server | HMAC secret for page cookies |
| `ACCESS_TTL_SECONDS` | Server | Optional; default 7 days |
| `FACILITATOR_URL` | Server | Optional local Docker (`http://localhost:3402`) |
| `AGENT_PRIVATE_KEY` | Smoke | Optional; Anvil account #2 default |

Key family selects the network. There is no CAMP/Base toggle.

- `ipk_sandbox_*` → sandbox config (CAMP testnet, or local chain if `FACILITATOR_URL` is localhost)
- `ipk_live_*` → production config (Base mainnet, real IDRX)

Chain id, IDRX, and Permit2 come from facilitator `GET /config` via the same-origin proxy `GET /api/transx402/config`.

`@transx402/client` pulls `@x402/*`. This starter pins `@x402/core` (and siblings) to **2.18.0** so IDRX payments are not rejected by later `spendControls` defaults.

## Architecture

Settlement is always **`server`**: MetaMask signs; the Route Handler calls `payments.processGate` (which `POST`s `/facilitate`). The browser never talks to `/facilitate`.

```
Browser                         Next                              Facilitator
  GET /api/transx402/config ──► proxy GET /config ───────────────►
  GET /api/quote ─────────────► 402 PaymentRequired
  MetaMask sign
  GET + PAYMENT-SIGNATURE ─────► processGate → POST /facilitate
  ◄── 200 JSON ───────────────
```

Paid pages add `Set-Cookie: tx402_access_<resourceId>` after unlock. The Server Component reads the HMAC cookie and renders HTML. Quote never sets that cookie.

## Scripts

```bash
pnpm dev          # :3421
pnpm test         # HMAC access-token unit tests
pnpm type-check
pnpm smoke        # agent e2e (dev server must be running)
```

## Extending

Cursor skills in `.cursor/skills/` (see `AGENTS.md`):

- `transx402-setup` — env and keys
- `transx402-add-gated-api` — new JSON endpoint
- `transx402-add-gated-page` — new cookie-backed page
- `transx402-smoke-test` — payment smoke
