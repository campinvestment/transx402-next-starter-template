import { createHmac, timingSafeEqual } from "node:crypto";

export const DEFAULT_ACCESS_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AccessTokenPayload = {
  resourceId: string;
  payer: string;
  txHash: string | null;
  exp: number;
};

export type IssueAccessTokenOptions = {
  resourceId: string;
  payer: string;
  txHash: string | null;
  secret: string;
  ttlSeconds?: number;
  now?: number;
};

function base64urlEncode(data: string): string {
  return Buffer.from(data, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(data: string): string | null {
  const remainder = data.length % 4;
  const padded = remainder > 0 ? data + "=".repeat(4 - remainder) : data;
  try {
    return Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
  } catch {
    return null;
  }
}

export function cookieName(resourceId: string): string {
  return `tx402_access_${resourceId}`;
}

export function issueAccessToken(options: IssueAccessTokenOptions): string {
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const ttl = options.ttlSeconds ?? DEFAULT_ACCESS_TTL_SECONDS;
  const payload: AccessTokenPayload = {
    resourceId: options.resourceId,
    payer: options.payer.toLowerCase(),
    txHash: options.txHash,
    exp: now + ttl,
  };
  const body = base64urlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", options.secret)
    .update(`v1.${body}`)
    .digest("hex");
  return `v1.${body}.${sig}`;
}

export function verifyAccessToken(
  token: string,
  options: { resourceId: string; secret: string; now?: number }
): AccessTokenPayload | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || !parts[1] || !parts[2]) {
    return null;
  }

  const expected = createHmac("sha256", options.secret)
    .update(`v1.${parts[1]}`)
    .digest("hex");
  const actualBuf = Buffer.from(parts[2], "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (
    actualBuf.length !== expectedBuf.length ||
    !timingSafeEqual(actualBuf, expectedBuf)
  ) {
    return null;
  }

  const json = base64urlDecode(parts[1]);
  if (!json) return null;

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;

  const rec = data as Record<string, unknown>;
  const resourceId = typeof rec.resourceId === "string" ? rec.resourceId : "";
  const payer = typeof rec.payer === "string" ? rec.payer : "";
  const txHash =
    rec.txHash === null || typeof rec.txHash === "string" ? rec.txHash : null;
  const exp = typeof rec.exp === "number" ? rec.exp : 0;
  const now = options.now ?? Math.floor(Date.now() / 1000);

  if (resourceId !== options.resourceId || payer.length === 0 || exp < now) {
    return null;
  }

  return { resourceId, payer, txHash, exp };
}
