---
name: transx402-smoke-test
description: >-
  Run TransX402 agent smoke tests against the Next starter: 402 then 200 on
  /api/quote with no cookie, article unlock Set-Cookie, paid RSC HTML, and zero
  client /facilitate calls. Use when verifying payments, e2e, or smoke.
---

# TransX402 smoke test

Requires Next on `:3421` and `.env.local` with a sandbox key + `MERCHANT_WALLET` + `ACCESS_TOKEN_SECRET`.

```bash
pnpm dev
pnpm smoke
```

`scripts/smoke-agent.ts` must assert:

1. `GET /api/quote` without payment → **402**
2. Agent `fetch /api/quote` → **200** `{ paid: true }`, **no** `tx402_access_*` cookie
3. `GET /article` → teaser (`data-testid="article-teaser"`), no paid marker
4. Agent `fetch /api/article/unlock` → **200** + `Set-Cookie: tx402_access_article=`
5. `GET /article` with that cookie → `data-testid="article-paid"`
6. Agent made **zero** calls to `/facilitate` and **zero** direct facilitator `/config`

Agent client:

```ts
createAgentClient({
  environment: resolveClientEnvironment(apiKey, facilitatorUrl),
  facilitatorUrl: "http://localhost:3421/api/transx402",
  privateKey,
  settlement: "server",
});
```

Fund sandbox wallets with `POST {facilitator}/sandbox/fund` and `X-API-Key`.
