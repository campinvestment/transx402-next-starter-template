import { createBrowserClient } from "@transx402/client/browser";
import {
  DEFAULT_CONFIG_PROXY_PATH,
  FacilitationError,
  type TransX402Environment,
} from "@transx402/client";
import type { FlowStep, UnlockJson } from "@/lib/unlock";

export async function unlockEndpoint(
  environment: TransX402Environment,
  endpoint: string,
  onFlowStep: (step: FlowStep) => void
): Promise<UnlockJson> {
  let callCount = 0;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes(endpoint)) {
      callCount += 1;
      onFlowStep({
        label:
          callCount === 1
            ? `GET ${endpoint}`
            : `GET ${endpoint} (retry + PAYMENT-SIGNATURE)`,
        status: response.status,
      });
    }

    return response;
  };

  try {
    const client = createBrowserClient({
      environment,
      configProxyPath: DEFAULT_CONFIG_PROXY_PATH,
      settlement: "server",
    });

    const response = await client.fetch(endpoint);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        code?: string;
        details?: Record<string, string>;
      } | null;
      if (body?.code) {
        throw new FacilitationError(
          body.code,
          body.error ?? `Request failed (${response.status})`,
          body.details
        );
      }
      throw new Error(body?.error ?? `Request failed (${response.status})`);
    }

    return (await response.json()) as UnlockJson;
  } finally {
    window.fetch = originalFetch;
  }
}
