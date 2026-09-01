import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        TransX402 fullstack starter
      </h1>
      <p className="mt-3 max-w-xl text-stone-600 leading-relaxed">
        Two merchant patterns on Next.js App Router. The browser signs with
        MetaMask; your Route Handler settles with{" "}
        <code className="rounded bg-stone-200/80 px-1 text-sm">
          @transx402/server
        </code>
        . Secret API keys never leave the server.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/quote"
          className="rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Pure API
          </p>
          <h2 className="mt-2 text-lg font-semibold">Paid JSON</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            <code className="text-xs">GET /api/quote</code> returns 402, then
            200 JSON after payment. No cookie — refresh pays again.
          </p>
        </Link>
        <Link
          href="/article"
          className="rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Fullstack page
          </p>
          <h2 className="mt-2 text-lg font-semibold">Paid article</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Pay once at <code className="text-xs">/api/article/unlock</code>.
            An HMAC cookie lets the Server Component render HTML on refresh.
          </p>
        </Link>
      </div>
    </main>
  );
}
