import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          TransX402 starter
        </Link>
        <nav className="flex gap-4 text-sm text-stone-600">
          <Link href="/quote" className="hover:text-stone-900">
            Paid API
          </Link>
          <Link href="/article" className="hover:text-stone-900">
            Paid page
          </Link>
        </nav>
      </div>
    </header>
  );
}
