import { FacilitationError, formatFacilitationError } from "@transx402/client";

export type FlowStep = {
  label: string;
  status: number;
};

export type UnlockJson = {
  paid: boolean;
  txHash: string | null;
  quote?: {
    pair: string;
    rate: string;
    note: string;
  };
};

export function statusLabel(status: number): string {
  if (status === 402) return "Payment Required";
  if (status === 200) return "OK";
  return "Error";
}

export function formatUnlockError(err: unknown): string {
  if (err instanceof FacilitationError) {
    const base = formatFacilitationError(err);
    const reason = err.details?.errorReason;
    if (reason && !base.includes(reason)) {
      return `${base} (${reason})`;
    }
    return base;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}
