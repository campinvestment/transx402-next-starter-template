import { UnlockPanel } from "@/components/unlock-panel";
import {
  ARTICLE_BODY,
  ARTICLE_RESOURCE_ID,
  ARTICLE_TEASER,
} from "@/lib/article";
import { getAccess } from "@/lib/transx402/access-cookie";
import { getClientEnvironment } from "@/lib/transx402/server";

export default async function ArticlePage() {
  let environment: ReturnType<typeof getClientEnvironment>;
  try {
    environment = getClientEnvironment();
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-semibold">Missing server env</p>
          <p className="mt-2">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </main>
    );
  }

  const access = await getAccess(ARTICLE_RESOURCE_ID);

  if (access) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Fullstack page
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Paid article
        </h1>
        <p className="mt-2 text-sm text-emerald-700">Unlocked</p>
        <article
          data-testid="article-paid"
          className="mt-6 whitespace-pre-wrap rounded-lg border border-stone-200 bg-white p-5 leading-relaxed"
        >
          {ARTICLE_BODY}
        </article>
        <p className="mt-4 break-all font-mono text-xs text-stone-500">
          payer {access.payer}
          {access.txHash ? ` · ${access.txHash}` : ""}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Fullstack page
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Paid article
      </h1>
      <p data-testid="article-teaser" className="mt-3 max-w-xl text-stone-600 leading-relaxed">
        {ARTICLE_TEASER}
      </p>
      <div className="mt-8">
        <UnlockPanel
          environment={environment}
          endpoint="/api/article/unlock"
          cta="Unlock article with IDRX"
          lockedCopy="Premium market brief — blurred until the merchant Route Handler settles and sets an access cookie."
          mode="cookie"
        />
      </div>
    </main>
  );
}
