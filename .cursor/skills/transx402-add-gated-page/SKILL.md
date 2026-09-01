---
name: transx402-add-gated-page
description: >-
  Add a TransX402 pay-once page: gated unlock Route Handler, HMAC access cookie,
  and RSC that renders paid HTML after payment. Use when adding a paywall page,
  gated article, or cookie-backed Server Component content.
---

# Add a gated page

Pay once, then the Server Component renders HTML from an HMAC cookie.

1. Pick a `resourceId` (e.g. `"article"`). Cookie name becomes `tx402_access_<resourceId>`.
2. Unlock route (same 402 `fetch()` pattern as APIs) **sets** the cookie after `processGate` settles.
3. Page RSC calls `getAccess(resourceId)` and branches teaser vs paid HTML.

## Unlock route

Copy `app/api/article/unlock/route.ts`:

```ts
const gate = await gateRequest(request, { priceIdr: getPriceIdr(), resourceUrl: request.url });
const unsettled = jsonFromUnsettledGate(gate);
if (unsettled) return unsettled;

await setAccessCookie({
  resourceId: "your-id",
  payer: extractPayerFromRequest(request),
  txHash: gate.txHash,
});
return Response.json({ paid: true, txHash: gate.txHash });
```

## Page

Copy `app/article/page.tsx`:

```tsx
const access = await getAccess("your-id");
if (access) return <article data-testid="paid">{/* paid HTML */}</article>;
return (
  <UnlockPanel
    environment={getClientEnvironment()}
    endpoint="/api/your-id/unlock"
    mode="cookie"
    cta="Unlock with IDRX"
    lockedCopy="Teaser…"
  />
);
```

`mode="cookie"` calls `router.refresh()` after 200 so the RSC re-reads the cookie.

## Cookie contract

- HMAC `v1.<payload>.<sig>` via `issueAccessToken` / `verifyAccessToken`
- Payload: `{ resourceId, payer, txHash, exp }`
- HttpOnly, Path=`/`, SameSite=Lax, Secure in production
- Secret: `ACCESS_TOKEN_SECRET`

Do not put paid HTML in the JSON unlock response as the source of truth — RSC must gate on the cookie.
