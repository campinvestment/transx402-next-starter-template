import type { TransX402Environment } from "@transx402/client";

export function txExplorerBaseUrl(environment: TransX402Environment): string {
  if (environment === "base") {
    return "https://basescan.org/tx";
  }
  return "https://testnet-explorer.onchainfolio.com/tx";
}
