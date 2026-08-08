"use client";

import { useEffect, useState } from "react";
import type { LogLine, TrackerState } from "@/lib/types";
import { usd } from "@/lib/format";
import { ScopedCard } from "./ScopedCard";
import { StatusFeed } from "./StatusFeed";

export function TrackerPanel({
  tracker,
  storePriceCents,
  productTitle,
  merchant,
  log,
  polling,
  onSetMax,
  onToggleAuth,
  onReset,
}: {
  tracker: TrackerState;
  storePriceCents: number;
  productTitle: string;
  merchant: string;
  log: LogLine[];
  polling: boolean;
  onSetMax: (cents: number) => void;
  onToggleAuth: (v: boolean) => void;
  onReset: () => void;
}) {
  const [configuring, setConfiguring] = useState(false);
  const [draft, setDraft] = useState((tracker.maxPriceCents / 100).toFixed(2));

  useEffect(() => {
    setDraft((tracker.maxPriceCents / 100).toFixed(2));
  }, [tracker.maxPriceCents]);

  const shortTitle = productTitle.split(" — ")[0];
  const draftCents = Math.max(1, Math.round(parseFloat(draft || "0") * 100));

  const step: "intro" | "configure" | "watching" | "bought" =
    tracker.status === "bought"
      ? "bought"
      : tracker.status === "armed" || tracker.status === "buying" || tracker.status === "error"
        ? "watching"
        : configuring
          ? "configure"
          : "intro";

  function startWatching() {
    if (!Number.isFinite(draftCents) || draftCents <= 0) return;
    onSetMax(draftCents);
    onToggleAuth(true);
  }
  function stopWatching() {
    onToggleAuth(false);
    setConfiguring(false);
  }
  function resetAll() {
    setConfiguring(false);
    onReset();
  }

  return (
    <section className="mist flex h-full flex-col text-slate">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line px-8 py-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rain" />
          <span className="font-grotesk text-lg font-semibold tracking-tight text-slate">Nightcap</span>
        </div>
        <div className="flex items-center gap-1.5 font-grotesk text-[10px] uppercase tracking-[0.2em] text-slate-soft">
          powered by
          <span className="font-semibold text-rain">rain</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-8 py-8">
        {step === "intro" && (
          <div className="rise flex flex-1 flex-col items-center justify-center text-center">
            <span className="rounded-full bg-lav px-3 py-1 font-grotesk text-[10px] uppercase tracking-[0.25em] text-slate-soft">
              Price tracker
            </span>
            <h2 className="mt-5 max-w-sm font-grotesk text-2xl font-semibold leading-tight text-slate">
              Track “{shortTitle}” and let an agent buy it for you.
            </h2>
            <p className="mt-3 max-w-sm font-grotesk text-[14px] leading-relaxed text-slate-soft">
              Set your price once. The moment {merchant} drops below it, an AI agent completes the
              purchase on a single-use Rain card — no human at checkout.
            </p>

            <div className="mt-6 rounded-xl bg-white/70 px-5 py-3 shadow-sm">
              <div className="font-grotesk text-[10px] uppercase tracking-wider text-slate-soft">
                Store price now
              </div>
              <div className="tabular font-mono text-3xl text-slate">{usd(storePriceCents)}</div>
            </div>

            <button
              onClick={() => setConfiguring(true)}
              className="mt-7 rounded-xl bg-rain px-6 py-3 font-grotesk text-sm font-semibold text-white shadow-sm shadow-rain/30 transition hover:bg-rain-deep"
            >
              Track this price →
            </button>
          </div>
        )}

        {step === "configure" && (
          <div className="rise flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="font-grotesk text-[11px] font-medium uppercase tracking-[0.2em] text-rain-deep">
                Step 1 — set your limit
              </span>
              <button
                onClick={() => setConfiguring(false)}
                className="font-grotesk text-xs text-slate-soft transition hover:text-slate"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-white/70 p-6 shadow-sm">
              <label className="font-grotesk text-sm text-slate">
                Buy “{shortTitle}” automatically when the price drops to:
              </label>
              <div className="mt-3 flex items-center rounded-xl border border-line bg-mist-2 px-4 py-3">
                <span className="font-mono text-3xl text-slate-soft">$</span>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startWatching();
                  }}
                  inputMode="decimal"
                  className="w-full bg-transparent pl-1 font-mono text-3xl tabular text-slate outline-none"
                />
              </div>
              <p className="mt-2 font-grotesk text-[13px] text-slate-soft">
                Currently {usd(storePriceCents)}
                {draftCents < storePriceCents && (
                  <span className="text-teal"> · you’d save {usd(storePriceCents - draftCents)}</span>
                )}
              </p>

              <div className="mt-5 rounded-xl bg-lav-2/60 p-4">
                <div className="font-grotesk text-[11px] font-semibold text-slate">
                  What the agent gets — and can’t do
                </div>
                <p className="mt-1 font-grotesk text-[12px] leading-relaxed text-slate-soft">
                  A single-use Rain scoped card, capped at {usd(draftCents)} and locked to this
                  store’s category. It physically can’t overpay, can’t buy anything else, and retires
                  after one purchase.
                </p>
              </div>
            </div>

            <button
              onClick={startWatching}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-rain px-6 py-3.5 font-grotesk text-sm font-semibold text-white shadow-sm shadow-rain/30 transition hover:bg-rain-deep"
            >
              Authorize agent &amp; start watching
            </button>
            <p className="mt-2 text-center font-grotesk text-[11px] text-slate-soft">
              You authorize the agent to spend up to {usd(draftCents)} on your behalf.
            </p>
          </div>
        )}

        {step === "watching" && (
          <div className="rise flex flex-1 flex-col">
            {/* Status header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex h-2.5 w-2.5 text-rain">
                    {polling && <span className="ping-soft absolute inline-flex h-2.5 w-2.5 rounded-full" />}
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rain" />
                  </span>
                  <span className="font-grotesk text-base font-semibold text-slate">
                    {tracker.status === "buying" ? "Buying…" : "Watching"}
                  </span>
                </div>
                <p className="mt-1 font-grotesk text-[13px] text-slate-soft">
                  Agent will buy “{shortTitle}” the instant it hits {usd(tracker.maxPriceCents)}.
                </p>
              </div>
              <button
                onClick={stopWatching}
                className="rounded-lg border border-line px-3 py-1.5 font-grotesk text-xs text-slate-soft transition hover:bg-lav"
              >
                Stop
              </button>
            </div>

            {/* live prices */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 p-3 shadow-sm">
                <div className="font-grotesk text-[10px] uppercase tracking-wider text-slate-soft">
                  Store price now
                </div>
                <div
                  className={`tabular font-mono text-2xl ${storePriceCents <= tracker.maxPriceCents ? "text-teal" : "text-slate"}`}
                >
                  {usd(storePriceCents)}
                </div>
              </div>
              <div className="rounded-xl bg-white/70 p-3 shadow-sm">
                <div className="font-grotesk text-[10px] uppercase tracking-wider text-slate-soft">
                  Your limit
                </div>
                <div className="tabular font-mono text-2xl text-slate">{usd(tracker.maxPriceCents)}</div>
              </div>
            </div>

            {/* feed */}
            <div className="mt-4 flex-1 rounded-2xl border border-line bg-white/60 p-5">
              <div className="mb-3 font-grotesk text-[10px] uppercase tracking-[0.25em] text-slate-soft">
                Agent activity
              </div>
              <StatusFeed log={log} />
            </div>

            {tracker.error && <p className="mt-3 font-mono text-xs text-rain-deep">{tracker.error}</p>}
          </div>
        )}

        {step === "bought" && tracker.purchase && (
          <div className="flex flex-1 flex-col">
            <div className="mint-in rounded-2xl border border-teal/30 bg-teal/5 p-4">
              <div className="font-grotesk text-sm font-semibold text-teal">Bought while you slept.</div>
              <p className="mt-1 font-grotesk text-[13px] text-slate/80">
                Paid {usd(tracker.purchase.amountCents)} —{" "}
                {usd(tracker.purchase.capCents - tracker.purchase.amountCents)} under your limit. No human
                at checkout.
              </p>
            </div>
            <div className="mt-4">
              <ScopedCard purchase={tracker.purchase} />
            </div>
            <div className="mt-auto flex items-center justify-between pt-5">
              <p className="font-grotesk text-[11px] text-slate-soft">
                One purchase, one card — minted, used, retired.
              </p>
              <button
                onClick={resetAll}
                className="rounded-lg border border-line px-3 py-1.5 font-grotesk text-xs text-slate-soft transition hover:bg-lav"
              >
                Reset demo
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
