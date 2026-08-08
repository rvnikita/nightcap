"use client";

import { useEffect, useState } from "react";
import type { LogLine, TrackerState } from "@/lib/types";
import { usd } from "@/lib/format";
import { ScopedCard } from "./ScopedCard";
import { StatusFeed } from "./StatusFeed";

const STATUS: Record<TrackerState["status"], { label: string; className: string }> = {
  idle: { label: "Disarmed", className: "bg-lav text-slate-soft" },
  armed: { label: "Watching", className: "bg-rain/10 text-rain-deep" },
  buying: { label: "Buying…", className: "bg-amber/20 text-coral" },
  bought: { label: "Purchased", className: "bg-teal/15 text-teal" },
  error: { label: "Error", className: "bg-rain-deep/10 text-rain-deep" },
};

export function TrackerPanel({
  tracker,
  storePriceCents,
  productTitle,
  log,
  polling,
  onSetMax,
  onToggleAuth,
  onReset,
}: {
  tracker: TrackerState;
  storePriceCents: number;
  productTitle: string;
  log: LogLine[];
  polling: boolean;
  onSetMax: (cents: number) => void;
  onToggleAuth: (v: boolean) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState((tracker.maxPriceCents / 100).toFixed(2));
  useEffect(() => {
    setDraft((tracker.maxPriceCents / 100).toFixed(2));
  }, [tracker.maxPriceCents]);

  const status = STATUS[tracker.status];
  const belowCap = storePriceCents <= tracker.maxPriceCents;
  const isBought = tracker.status === "bought" && tracker.purchase;

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

      <div className="flex flex-1 flex-col gap-5 px-8 py-7">
        {/* Watch config */}
        <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-slate-soft">
                Watching
              </div>
              <div className="mt-1 font-grotesk text-base font-semibold text-slate">
                {productTitle}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 font-grotesk text-[11px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          {/* live prices */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-lav-2/70 p-3">
              <div className="font-grotesk text-[10px] uppercase tracking-wider text-slate-soft">
                Store price now
              </div>
              <div
                className={`tabular font-mono text-2xl ${belowCap ? "text-teal" : "text-slate"}`}
              >
                {usd(storePriceCents)}
              </div>
            </div>
            <div className="rounded-xl bg-lav-2/70 p-3">
              <div className="font-grotesk text-[10px] uppercase tracking-wider text-slate-soft">
                Your max price
              </div>
              <div className="mt-0.5 flex items-center font-mono text-2xl text-slate">
                <span className="text-slate-soft">$</span>
                <input
                  value={draft}
                  disabled={tracker.authorized}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    const n = parseFloat(draft);
                    if (Number.isFinite(n) && n > 0) onSetMax(Math.round(n * 100));
                    else setDraft((tracker.maxPriceCents / 100).toFixed(2));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                  inputMode="decimal"
                  className="w-full bg-transparent tabular outline-none disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Authorize toggle */}
          <button
            onClick={() => onToggleAuth(!tracker.authorized)}
            disabled={tracker.status === "bought"}
            className={`mt-4 flex w-full items-center justify-between rounded-xl px-4 py-3 font-grotesk text-sm font-medium transition disabled:opacity-50 ${
              tracker.authorized
                ? "bg-rain text-white shadow-sm shadow-rain/30 hover:bg-rain-deep"
                : "border border-rain/40 bg-white text-rain-deep hover:bg-rain/5"
            }`}
          >
            <span>
              {tracker.authorized
                ? "Authorized — agent may buy autonomously"
                : "Authorize autonomous purchase"}
            </span>
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                tracker.authorized ? "bg-white/30" : "bg-lav"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  tracker.authorized ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Purchase result OR live feed */}
        {isBought && tracker.purchase ? (
          <div className="space-y-4">
            <div className="mint-in rounded-2xl border border-teal/30 bg-teal/5 p-4">
              <div className="font-grotesk text-sm font-semibold text-teal">
                Bought while you slept.
              </div>
              <p className="mt-1 font-grotesk text-[13px] text-slate/80">
                Paid {usd(tracker.purchase.amountCents)} — {usd(tracker.purchase.capCents - tracker.purchase.amountCents)}{" "}
                under your cap. No human at checkout.
              </p>
            </div>
            <ScopedCard purchase={tracker.purchase} />
          </div>
        ) : (
          <div className="flex-1 rounded-2xl border border-line bg-white/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-slate-soft">
                Agent activity
              </div>
              {polling && tracker.authorized && (
                <div className="flex items-center gap-2 font-grotesk text-[11px] text-rain-deep">
                  <span className="relative inline-flex h-2 w-2 text-rain">
                    <span className="ping-soft absolute inline-flex h-2 w-2 rounded-full" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rain" />
                  </span>
                  polling store…
                </div>
              )}
            </div>
            <StatusFeed log={log} />
          </div>
        )}

        {tracker.error && (
          <p className="font-mono text-xs text-rain-deep">{tracker.error}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="font-grotesk text-[11px] text-slate-soft">
            Scoped card is minted per purchase, capped to your max, MCC-locked, single-use.
          </p>
          <button
            onClick={onReset}
            className="rounded-lg border border-line px-3 py-1.5 font-grotesk text-xs text-slate-soft transition hover:bg-lav"
          >
            Reset demo
          </button>
        </div>
      </div>
    </section>
  );
}
