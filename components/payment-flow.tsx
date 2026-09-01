"use client";

import type { TransX402Environment } from "@transx402/client";
import { txExplorerBaseUrl } from "@/lib/explorer";
import { statusLabel, type FlowStep } from "@/lib/unlock";

type PaymentFlowProps = {
  flow: FlowStep[];
  busy: boolean;
  environment: TransX402Environment;
  txHash?: string | null;
};

export function PaymentFlow({
  flow,
  busy,
  environment,
  txHash,
}: PaymentFlowProps) {
  if (flow.length === 0) return null;

  const explorerBase = txExplorerBaseUrl(environment);
  const [firstStep, ...restSteps] = flow;

  return (
    <ol className="mt-4 list-none space-y-2 border-t border-stone-200 pt-4 font-mono text-xs">
      <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span>{firstStep.label}</span>
        <StatusCode status={firstStep.status} />
      </li>
      {busy && flow.length === 1 ? (
        <li className="italic text-stone-500">
          MetaMask sign → merchant POST /facilitate → retry…
        </li>
      ) : txHash ? (
        <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <span>merchant POST /facilitate</span>
          <a
            className="max-w-[65%] break-all text-right text-stone-500 underline-offset-2 hover:text-blue-700 hover:underline"
            href={`${explorerBase}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash}
          </a>
        </li>
      ) : null}
      {restSteps.map((step, index) => (
        <li
          key={`${step.label}-${index}`}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
        >
          <span>{step.label}</span>
          <StatusCode status={step.status} />
        </li>
      ))}
    </ol>
  );
}

function StatusCode({ status }: { status: number }) {
  const color =
    status === 200
      ? "text-emerald-700"
      : status === 402
        ? "text-amber-700"
        : "text-red-700";
  return (
    <span className={`font-semibold whitespace-nowrap ${color}`}>
      {status} {statusLabel(status)}
    </span>
  );
}
