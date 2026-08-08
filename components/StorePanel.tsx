"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { usd } from "@/lib/format";

export function StorePanel({
  product,
  priceCents,
  sold,
  onSetPrice,
}: {
  product: Product;
  priceCents: number;
  sold: number;
  onSetPrice: (cents: number) => void;
}) {
  const [draft, setDraft] = useState((priceCents / 100).toFixed(2));

  useEffect(() => {
    setDraft((priceCents / 100).toFixed(2));
  }, [priceCents]);

  function commit(next: number) {
    const cents = Math.max(1, Math.round(next * 100));
    onSetPrice(cents);
  }

  return (
    <section className="paper flex h-full flex-col text-ink">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b border-ink/10 px-8 py-5">
        <div className="font-fraunces text-lg font-semibold tracking-tight text-navy">
          {product.merchant}
        </div>
        <div className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-ink-soft">
          Antiquarian &amp; Rare · Est. 1890
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-8 px-8 py-8 md:grid-cols-[minmax(0,220px)_1fr]">
        {/* Cover */}
        <div className="relative mx-auto w-full max-w-[220px]">
          <div className="sunset absolute -inset-3 rounded-2xl opacity-20 blur-xl" aria-hidden />
          <Image
            src={product.cover}
            alt={`${product.title} cover`}
            width={420}
            height={640}
            priority
            className="relative h-auto w-full rounded-lg shadow-2xl shadow-navy/30 ring-1 ring-ink/10"
          />
          {sold > 0 && (
            <div className="absolute -right-3 -top-3 rotate-12 rounded-full border-2 border-coral bg-paper px-3 py-1 font-fraunces text-xs font-bold uppercase tracking-wide text-coral shadow">
              {sold} sold
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-teal">
            Travel · Public Domain
          </span>
          <h1 className="mt-2 font-fraunces text-5xl font-semibold leading-none tracking-tight text-navy">
            {product.title}
          </h1>
          <p className="mt-2 font-newsreader text-lg italic text-ink-soft">by {product.author}</p>

          <p className="mt-4 max-w-prose font-newsreader text-[15px] leading-relaxed text-ink/80">
            A luminous 1844 account of travel through the Ottoman East — Belgrade to Cairo by
            caravan. Prices at {product.merchant} drift with demand and the small hours.
          </p>

          {/* Price + merchant control */}
          <div className="mt-auto pt-6">
            <div className="flex items-end gap-3">
              <span className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                Price
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4">
              <div className="font-fraunces text-6xl font-semibold tabular text-coral">
                {usd(priceCents)}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-ink/20 bg-paper-2/60 p-4">
              <div className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                Store manager — set price
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center overflow-hidden rounded-lg border border-ink/20 bg-paper">
                  <button
                    onClick={() => commit(priceCents / 100 - 5)}
                    className="px-3 py-2 font-mono text-sm text-ink-soft transition hover:bg-ink/5"
                  >
                    −5
                  </button>
                  <button
                    onClick={() => commit(priceCents / 100 - 1)}
                    className="border-l border-ink/10 px-3 py-2 font-mono text-sm text-ink-soft transition hover:bg-ink/5"
                  >
                    −1
                  </button>
                  <div className="flex items-center border-x border-ink/10 px-2">
                    <span className="font-mono text-sm text-ink-soft">$</span>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => {
                        const n = parseFloat(draft);
                        if (Number.isFinite(n) && n > 0) commit(n);
                        else setDraft((priceCents / 100).toFixed(2));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      inputMode="decimal"
                      className="w-16 bg-transparent py-2 font-mono text-sm text-ink outline-none tabular"
                    />
                  </div>
                  <button
                    onClick={() => commit(priceCents / 100 + 1)}
                    className="border-r border-ink/10 px-3 py-2 font-mono text-sm text-ink-soft transition hover:bg-ink/5"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => commit(priceCents / 100 + 5)}
                    className="px-3 py-2 font-mono text-sm text-ink-soft transition hover:bg-ink/5"
                  >
                    +5
                  </button>
                </div>
                <button
                  onClick={() => commit(35)}
                  className="rounded-lg bg-coral px-4 py-2 font-grotesk text-sm font-medium text-paper shadow-sm transition hover:bg-coral/90"
                >
                  Drop to $35.00
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
