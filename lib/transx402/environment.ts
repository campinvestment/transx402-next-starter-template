import { DEFAULT_CONFIG_PROXY_PATH } from "@transx402/client";
import {
  detectApiKeyFamily,
  type TransX402Environment,
} from "@transx402/server";

export type { TransX402Environment };

export const CONFIG_PROXY_PATH = DEFAULT_CONFIG_PROXY_PATH;
export const DEFAULT_ORIGIN = "http://localhost:3421";
const DEFAULT_UPSTREAM_FACILITATOR = "https://api.transx402.com";

export function readFacilitatorUrlOverride(
  value: string | undefined
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return trimmed.replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

export function readServerFacilitatorOverride(): string | undefined {
  return readFacilitatorUrlOverride(process.env.FACILITATOR_URL);
}

export function resolveUpstreamFacilitatorUrl(): string {
  return readServerFacilitatorOverride() ?? DEFAULT_UPSTREAM_FACILITATOR;
}

export function resolveClientEnvironment(
  apiKey: string,
  facilitatorUrl?: string
): TransX402Environment {
  const family = detectApiKeyFamily(apiKey);
  if (family === "production") return "base";
  const host = facilitatorUrl ?? "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "local";
  }
  return "camp";
}

export function agentConfigProxyUrl(origin: string = DEFAULT_ORIGIN): string {
  return `${origin.replace(/\/+$/, "")}${CONFIG_PROXY_PATH}`;
}
