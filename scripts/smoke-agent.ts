/**
 * Smoke: agent (settlement: server) against /api/quote and /api/article/unlock.
 *
 * Usage (Next already running on :3421):
 *   pnpm smoke
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAgentClient } from "@transx402/client/agent";
import {
  agentConfigProxyUrl,
  readFacilitatorUrlOverride,
  resolveClientEnvironment,
} from "../lib/transx402/environment";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.SMOKE_ORIGIN ?? "http://localhost:3421";
const PAID_MARKER =
  "This paid article is served by a Server Component after HMAC cookie verification.";

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    out[t.slice(0, i)] = t.slice(i + 1);
  }
  return out;
}

function accessCookieFromResponse(response: Response): string | null {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  const match = setCookies.find((cookie) =>
    cookie.startsWith("tx402_access_article=")
  );
  if (!match) return null;
  return match.split(";")[0] ?? null;
}

async function main() {
  const local = loadEnv(join(ROOT, ".env.local"));
  const apiKey = local.TRANSX402_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TRANSX402_API_KEY in .env.local");
  }

  const facilitatorBase =
    readFacilitatorUrlOverride(local.FACILITATOR_URL) ??
    "https://api.transx402.com";
  const environment = resolveClientEnvironment(apiKey, local.FACILITATOR_URL);
  const configProxyUrl = agentConfigProxyUrl(ORIGIN);
  const privateKey = (local.AGENT_PRIVATE_KEY ||
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a") as `0x${string}`;

  const agent = createAgentClient({
    environment,
    facilitatorUrl: configProxyUrl,
    privateKey,
    settlement: "server",
  });

  console.log("agent", agent.address);
  console.log("environment", environment);
  console.log("configProxy", configProxyUrl);
  console.log("upstreamFacilitator", facilitatorBase);

  const fund = await fetch(`${facilitatorBase}/sandbox/fund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      address: agent.address,
      amount: "10000",
      token: "IDRX",
    }),
  });
  console.log("fund status", fund.status);

  let facilitateHits = 0;
  let directConfigHits = 0;
  const origFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    );
    if (url.includes("/facilitate")) {
      facilitateHits += 1;
      console.error("FAIL: client called /facilitate:", url);
    }
    if (
      url.includes("api.transx402.com/config") ||
      (facilitatorBase !== "https://api.transx402.com" &&
        url.includes(`${facilitatorBase}/config`) &&
        !url.includes("/api/transx402/config"))
    ) {
      directConfigHits += 1;
      console.error("FAIL: client called upstream /config directly:", url);
    }
    return origFetch(input, init);
  }) as typeof fetch;

  const unpaidQuote = await origFetch(`${ORIGIN}/api/quote`);
  if (unpaidQuote.status !== 402) {
    throw new Error(`Expected GET /api/quote → 402, got ${unpaidQuote.status}`);
  }
  console.log("quote unpaid", unpaidQuote.status);

  const quoteRes = await agent.fetch(`${ORIGIN}/api/quote`);
  const quoteBody = (await quoteRes.json()) as {
    paid?: boolean;
    txHash?: string | null;
    error?: string;
  };
  const quoteCookie = accessCookieFromResponse(quoteRes);
  console.log("quote status", quoteRes.status);
  console.log("quote body", quoteBody);
  console.log("quote set-cookie", quoteCookie);

  if (
    quoteRes.status !== 200 ||
    !quoteBody.paid ||
    quoteCookie !== null
  ) {
    throw new Error("Quote unlock failed or unexpectedly set an access cookie");
  }

  const teaser = await origFetch(`${ORIGIN}/article`);
  const teaserHtml = await teaser.text();
  if (
    !teaserHtml.includes("article-teaser") ||
    teaserHtml.includes('data-testid="article-paid"') ||
    teaserHtml.includes(PAID_MARKER)
  ) {
    throw new Error("GET /article before payment should render the teaser");
  }
  console.log("article teaser ok");

  const unlockRes = await agent.fetch(`${ORIGIN}/api/article/unlock`);
  const unlockBody = (await unlockRes.json()) as {
    paid?: boolean;
    txHash?: string | null;
    error?: string;
  };
  const accessCookie = accessCookieFromResponse(unlockRes);
  console.log("unlock status", unlockRes.status);
  console.log("unlock body", unlockBody);
  console.log("unlock set-cookie", Boolean(accessCookie));

  if (unlockRes.status !== 200 || !unlockBody.paid || !accessCookie) {
    throw new Error("Article unlock failed or missing Set-Cookie");
  }

  const paidPage = await origFetch(`${ORIGIN}/article`, {
    headers: { Cookie: accessCookie },
  });
  const paidHtml = await paidPage.text();
  if (
    !paidHtml.includes('data-testid="article-paid"') ||
    !paidHtml.includes(PAID_MARKER)
  ) {
    throw new Error("GET /article with cookie should render paid HTML");
  }
  console.log("article paid ok");

  console.log("clientFacilitateHits", facilitateHits);
  console.log("directConfigHits", directConfigHits);

  if (facilitateHits !== 0 || directConfigHits !== 0) {
    process.exit(1);
  }
  console.log("OK: quote stays stateless; article cookie persists");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
