import {
  decodePaymentSignature,
  detectApiKeyFamily,
  getPaymentHeader,
  TransX402,
  type ProcessPaymentGateResult,
} from "@transx402/server";
import {
  readServerFacilitatorOverride,
  resolveClientEnvironment,
  type TransX402Environment,
} from "./environment";

export function getApiKey(): string {
  const key = process.env.TRANSX402_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing TRANSX402_API_KEY in .env.local");
  }
  detectApiKeyFamily(key);
  return key;
}

export function getMerchantWallet(): string {
  const payTo = process.env.MERCHANT_WALLET?.trim();
  if (!payTo) {
    throw new Error("Missing MERCHANT_WALLET in .env.local");
  }
  return payTo;
}

export function getPriceIdr(): string {
  return process.env.PRICE_IDR?.trim() || "5000";
}

export function getTransX402(): TransX402 {
  const apiKey = getApiKey();
  const facilitatorUrl = readServerFacilitatorOverride();
  const environment = resolveClientEnvironment(apiKey, facilitatorUrl);
  return new TransX402(apiKey, {
    environment,
    ...(facilitatorUrl ? { facilitatorUrl } : {}),
  });
}

export function getClientEnvironment(): TransX402Environment {
  return resolveClientEnvironment(
    getApiKey(),
    readServerFacilitatorOverride()
  );
}

export async function gateRequest(
  request: Request,
  options: { priceIdr: string; resourceUrl: string }
): Promise<ProcessPaymentGateResult> {
  const tx402 = getTransX402();
  return tx402.payments.processGate({
    headers: request.headers,
    payTo: getMerchantWallet(),
    priceIdr: options.priceIdr,
    resourceUrl: options.resourceUrl,
  });
}

export function jsonFromUnsettledGate(
  gate: Exclude<ProcessPaymentGateResult, { kind: "settled" }>
): Response {
  if (gate.kind === "paymentRequired") {
    return Response.json(gate.body, { status: 402 });
  }
  return Response.json(
    {
      error: gate.error,
      code: gate.code,
      details: gate.details,
    },
    { status: gate.status }
  );
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function extractPayerFromRequest(request: Request): string {
  const header = getPaymentHeader(request.headers);
  if (!header) return ZERO_ADDRESS;

  try {
    const decoded = decodePaymentSignature(header);
    const permit2 = decoded.payload.permit2Authorization as
      | { from?: string }
      | undefined;
    const eip3009 = decoded.payload.authorization as
      | { from?: string }
      | undefined;
    const from = permit2?.from ?? eip3009?.from;
    if (typeof from === "string" && from.startsWith("0x")) {
      return from;
    }
  } catch {
    return ZERO_ADDRESS;
  }

  return ZERO_ADDRESS;
}
