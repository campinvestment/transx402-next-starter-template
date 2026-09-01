"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TransX402Environment } from "@transx402/client";
import { PaymentFlow } from "@/components/payment-flow";
import { unlockEndpoint } from "@/lib/unlock-endpoint";
import {
  formatUnlockError,
  type FlowStep,
  type UnlockJson,
} from "@/lib/unlock";

type UnlockPanelProps = {
  environment: TransX402Environment;
  endpoint: string;
  cta: string;
  lockedCopy: string;
  mode: "json" | "cookie";
};

export function UnlockPanel({
  environment,
  endpoint,
  cta,
  lockedCopy,
  mode,
}: UnlockPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState<UnlockJson | null>(null);
  const [flow, setFlow] = useState<FlowStep[]>([]);

  async function unlock() {
    setBusy(true);
    setError(null);
    setFlow([]);

    try {
      const data = await unlockEndpoint(environment, endpoint, (step) => {
        setFlow((prev) => [...prev, step]);
      });
      setPaid(data);
      if (mode === "cookie") {
        router.refresh();
      }
    } catch (err) {
      setError(formatUnlockError(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "json" && paid?.paid) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <p className="text-sm font-medium text-emerald-700">Unlocked</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-stone-50 p-3 text-sm leading-relaxed">
          {JSON.stringify(paid, null, 2)}
        </pre>
        <PaymentFlow
          flow={flow}
          busy={busy}
          environment={environment}
          txHash={paid.txHash}
        />
        <p className="mt-3 font-sans text-xs text-stone-500">
          Refresh re-locks this JSON API. There is no access cookie.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <p className="select-none text-stone-500 blur-[5px] pointer-events-none leading-relaxed">
        {lockedCopy}
      </p>
      <button
        type="button"
        onClick={unlock}
        disabled={busy}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? "Paying…" : cta}
      </button>
      <PaymentFlow flow={flow} busy={busy} environment={environment} />
      <p className="mt-3 text-xs text-stone-500">
        Uses settlement: &quot;server&quot; — browser does not call /facilitate.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
