"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoState } from "@/lib/types";
import { StorePanel } from "@/components/StorePanel";
import { TrackerPanel } from "@/components/TrackerPanel";

const POLL_MS = 1800;

type Snapshot = {
  store: { product: DemoState["store"]["product"]; priceCents: number; currency: "USD"; sold: number };
  tracker: DemoState["tracker"];
  log: DemoState["log"];
};

export default function Home() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [polling, setPolling] = useState(false);
  const snapRef = useRef<Snapshot | null>(null);
  snapRef.current = snap;

  const load = useCallback(async () => {
    const r = await fetch("/api/tracker", { cache: "no-store" });
    if (r.ok) setSnap(await r.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll the agent tick on an interval.
  useEffect(() => {
    let alive = true;
    const iv = setInterval(async () => {
      const cur = snapRef.current;
      if (cur && cur.tracker.status === "bought") return; // done
      setPolling(true);
      try {
        const r = await fetch("/api/tracker/tick", { method: "POST", cache: "no-store" });
        if (alive && r.ok) setSnap(await r.json());
      } finally {
        if (alive) setTimeout(() => setPolling(false), 350);
      }
    }, POLL_MS);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  const setPrice = useCallback(async (cents: number) => {
    setSnap((s) => (s ? { ...s, store: { ...s.store, priceCents: cents } } : s));
    await fetch("/api/store/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceCents: cents }),
    });
  }, []);

  const setMax = useCallback(async (cents: number) => {
    const r = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxPriceCents: cents }),
    });
    if (r.ok) setSnap(await r.json());
  }, []);

  const toggleAuth = useCallback(async (v: boolean) => {
    const r = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorized: v }),
    });
    if (r.ok) setSnap(await r.json());
  }, []);

  const reset = useCallback(async () => {
    const r = await fetch("/api/reset", { method: "POST" });
    if (r.ok) setSnap(await r.json());
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 text-paper">
        <div className="min-w-0">
          <span className="font-fraunces text-base font-semibold">Nightcap</span>
          <span className="ml-3 font-grotesk text-[13px] text-paper/70">
            the price tracker that actually buys
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-grotesk text-[11px] text-paper/50 sm:inline">
            Drop the store price below the cap → the agent buys on a real Rain scoped card.
          </span>
        </div>
      </header>

      {/* Split stage */}
      <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2 lg:rounded-t-2xl">
        {snap ? (
          <>
            <StorePanel
              product={snap.store.product}
              priceCents={snap.store.priceCents}
              sold={snap.store.sold}
              onSetPrice={setPrice}
            />
            <div className="border-t border-navy/20 lg:border-l lg:border-t-0">
              <TrackerPanel
                tracker={snap.tracker}
                storePriceCents={snap.store.priceCents}
                productTitle={`${snap.store.product.title} — ${snap.store.product.author}`}
                log={snap.log}
                polling={polling}
                onSetMax={setMax}
                onToggleAuth={toggleAuth}
                onReset={reset}
              />
            </div>
          </>
        ) : (
          <div className="col-span-full flex h-[60vh] items-center justify-center text-paper/60">
            <span className="font-grotesk text-sm">Loading…</span>
          </div>
        )}
      </main>
    </div>
  );
}
