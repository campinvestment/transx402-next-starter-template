---
name: transx402-add-gated-api
description: >-
  Add a TransX402 gated JSON API Route Handler using processGate. Use when
  protecting an API, returning 402 Payment Required, or adding a pay-per-request
  JSON endpoint. Do not use for paid HTML pages (see transx402-add-gated-page).
---

# Add a gated JSON API

Stateless: every request pays. **Do not** set or read `tx402_access_*` cookies.

Copy `app/api/quote/route.ts`.

```ts
import {
  gateRequest,
  getPriceIdr,
  jsonFromUnsettledGate,
} from "@/lib/transx402/server";

export async function GET(request: Request) {
  const gate = await gateRequest(request, {
    priceIdr: getPriceIdr(),
    resourceUrl: request.url,
  });
  const unsettled = jsonFromUnsettledGate(gate);
  if (unsettled) return unsettled;

  return Response.json({ paid: true, txHash: gate.txHash, /* resource */ });
}
```

`jsonFromUnsettledGate` returns 402 `{ x402Version, accepts }` or a failed settlement body.

## Browser

```ts
const client = createBrowserClient({
  environment, // from RSC getClientEnvironment()
  configProxyPath: "/api/transx402",
  settlement: "server",
});
const response = await client.fetch("/api/your-route");
```

## Checks

- First GET without `PAYMENT-SIGNATURE` → **402**
- Retry after sign → **200** JSON
- Response has **no** `Set-Cookie` for `tx402_access_*`
- Browser never calls `/facilitate`
