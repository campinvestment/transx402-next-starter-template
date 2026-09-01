export const ARTICLE_RESOURCE_ID = "article";

export const ARTICLE_TEASER =
  "A locked market brief. Pay once with IDRX; this page then renders the full article from a Server Component using an HMAC access cookie.";

export const ARTICLE_BODY = [
  "This paid article is served by a Server Component after HMAC cookie verification.",
  "",
  "The browser signed a Permit2 payment and retried GET /api/article/unlock with PAYMENT-SIGNATURE.",
  "The Route Handler settled via @transx402/server (POST /facilitate) and set tx402_access_article.",
  "Refresh keeps access — no wallet prompt — until the cookie expires.",
].join("\n");
