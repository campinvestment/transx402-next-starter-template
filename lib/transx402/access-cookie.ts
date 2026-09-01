import { cookies } from "next/headers";
import {
  cookieName,
  DEFAULT_ACCESS_TTL_SECONDS,
  issueAccessToken,
  verifyAccessToken,
  type AccessTokenPayload,
} from "./access-token";

function getSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing ACCESS_TOKEN_SECRET in .env.local");
  }
  return secret;
}

function ttlSeconds(): number {
  const raw = process.env.ACCESS_TTL_SECONDS?.trim();
  if (!raw) return DEFAULT_ACCESS_TTL_SECONDS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ACCESS_TTL_SECONDS;
}

export async function getAccess(
  resourceId: string
): Promise<AccessTokenPayload | null> {
  const jar = await cookies();
  const token = jar.get(cookieName(resourceId))?.value;
  if (!token) return null;
  return verifyAccessToken(token, { resourceId, secret: getSecret() });
}

export async function setAccessCookie(options: {
  resourceId: string;
  payer: string;
  txHash: string | null;
}): Promise<void> {
  const maxAge = ttlSeconds();
  const token = issueAccessToken({
    resourceId: options.resourceId,
    payer: options.payer,
    txHash: options.txHash,
    secret: getSecret(),
    ttlSeconds: maxAge,
  });
  const jar = await cookies();
  jar.set(cookieName(options.resourceId), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  });
}
