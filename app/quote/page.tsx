import { UnlockPanel } from "@/components/unlock-panel";
import { getClientEnvironment } from "@/lib/transx402/server";

export const dynamic = "force-dynamic";

export default function QuotePage() {
  let environment: ReturnType<typeof getClientEnvironment>;
  try {
    environment = getClientEnvironment();
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
        <SetupError message={error instanceof Error ? error.message : String(error)} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        Pure API
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Paid JSON</h1>
      <p className="mt-3 max-w-xl text-stone-600 leading-relaxed">
        This page calls a gated Route Handler. After settlement you get JSON
        only. There is no access cookie, so a refresh requires another payment.
      </p>
      <div className="mt-8">
        <UnlockPanel
          environment={environment}
          endpoint="/api/quote"
          cta="Unlock quote with IDRX"
          lockedCopy="Premium FX quote — blurred until the merchant Route Handler settles."
          mode="json"
        />
      </div>
    </main>
  );
}

function SetupError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-semibold">Missing server env</p>
      <p className="mt-2">{message}</p>
      <p className="mt-2 text-amber-800">
        Copy <code>.env.local.example</code> to <code>.env.local</code> and set
        your sandbox or live API key.
      </p>
    </div>
  );
}
