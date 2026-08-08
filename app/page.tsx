"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LogKind, LogLine, Product, TrackerState } from "@/lib/types";
import { usd } from "@/lib/format";
import { StorePanel } from "@/components/StorePanel";
import { TrackerPanel } from "@/components/TrackerPanel";

const POLL_MS = 1800;
const START_PRICE = 5000;
const DEFAULT_MAX = 4000;

const PRODUCT: Product = {
  title: "Eothen",
  author: "A. W. Kingslake",
  cover: "/eothen-cover.png",
  merchant: "Meridian Books",
  mcc: "5942", // Book Stores
};

type UIState = {
  store: { priceCents: number; sold: number };
  tracker: TrackerState;
  log: LogLine[];
};

function initialState(): UIState {
  return {
    store: { priceCents: START_PRICE, sold: 0 },
    tracker: { maxPriceCents: DEFAULT_MAX, authorized: false, status: "idle", purchase: null, error: null },
    log: [],
  };
}

export default function Home() {
  const [state, setState] = useState<UIState>(initialState);
  const [polling, setPolling] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const buyingRef = useRef(false);
  const pollSeq = useRef(0);
  const logSeq = useRef(0);

  const log = useCallback((kind: LogKind, msg: string) => {
    setState((s) => {
      const line: LogLine = { id: `l${logSeq.current++}`, ts: Date.now(), kind, msg };
      const next = [...s.log, line];
      if (next.length > 60) next.splice(0, next.length - 60);
      return { ...s, log: next };
    });
  }, []);

  const setPrice = useCallback(
    (cents: number) => {
      const prev = stateRef.current.store.priceCents;
      setState((s) => ({ ...s, store: { ...s.store, priceCents: cents } }));
      if (cents !== prev) {
        log("info", `${PRODUCT.merchant} changed the price: ${usd(prev)} → ${usd(cents)}.`);
      }
    },
    [log],
  );

  const setMax = useCallback((cents: number) => {
    setState((s) => ({ ...s, tracker: { ...s.tracker, maxPriceCents: cents } }));
  }, []);

  const toggleAuth = useCallback(
    (v: boolean) => {
      setState((s) => ({
        ...s,
        tracker: { ...s.tracker, authorized: v, status: v ? "armed" : "idle", error: null },
      }));
      if (v) {
        log(
          "info",
          `Authorized: agent may buy "${PRODUCT.title}" autonomously up to ${usd(stateRef.current.tracker.maxPriceCents)}.`,
        );
      } else {
        log("info", "Authorization revoked — agent will not purchase.");
      }
    },
    [log],
  );

  const reset = useCallback(() => {
    buyingRef.current = false;
    pollSeq.current = 0;
    setState(initialState());
    log("info", "Demo reset. Price back to $50.00, watch disarmed.");
  }, [log]);

  const attemptBuy = useCallback(async () => {
    const s = stateRef.current;
    const price = s.store.priceCents;
    const cap = s.tracker.maxPriceCents;
    buyingRef.current = true;
    setState((st) => ({ ...st, tracker: { ...st.tracker, status: "buying", error: null } }));
    log("trigger", `Price dropped to ${usd(price)} — below your ${usd(cap)} cap. Acting now.`);
    log(
      "mint",
      `Minting a single-use Rain scoped card · capped at ${usd(cap)} · locked to MCC ${PRODUCT.mcc} (book stores).`,
    );

    try {
      const r = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceCents: price, capCents: cap, mcc: PRODUCT.mcc, merchant: PRODUCT.merchant, title: PRODUCT.title }),
      });
      const data = await r.json();

      if (data.status === "authorized" && data.purchase) {
        setState((st) => ({
          ...st,
          store: { ...st.store, sold: st.store.sold + 1 },
          tracker: { ...st.tracker, status: "bought", purchase: data.purchase },
        }));
        log(
          "approved",
          `Bought "${PRODUCT.title}" for ${usd(data.purchase.amountCents)} on card ••••${data.purchase.last4}. Card retired. You saved ${usd(cap - data.purchase.amountCents)} vs your cap.`,
        );
        if (data.purchase.onchainTxHash) {
          log("info", `Receipt settled onchain on Monad · tx ${data.purchase.onchainTxHash.slice(0, 12)}…`);
        }
      } else if (data.status === "declined") {
        setState((st) => ({ ...st, tracker: { ...st.tracker, status: "armed" } }));
        log("declined", `Rain declined the charge (${data.declinedReason}). The guardrail held — nothing was spent.`);
      } else {
        throw new Error(data.error ?? "purchase failed");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState((st) => ({ ...st, tracker: { ...st.tracker, status: "error", error: msg } }));
      log("error", `Purchase failed: ${msg}`);
    } finally {
      buyingRef.current = false;
    }
  }, [log]);

  // Client-driven poll loop: the tracker watches the store.
  useEffect(() => {
    const iv = setInterval(() => {
      const s = stateRef.current;
      if (!s.tracker.authorized) return;
      if (s.tracker.status === "bought" || s.tracker.status === "buying" || buyingRef.current) return;

      setPolling(true);
      setTimeout(() => setPolling(false), 350);

      if (s.store.priceCents > s.tracker.maxPriceCents) {
        if (pollSeq.current % 3 === 0) {
          log(
            "poll",
            `Checked ${PRODUCT.merchant} — ${usd(s.store.priceCents)} still above your ${usd(s.tracker.maxPriceCents)} cap.`,
          );
        }
        pollSeq.current++;
        return;
      }
      void attemptBuy();
    }, POLL_MS);
    return () => clearInterval(iv);
  }, [attemptBuy, log]);

  return (
    <div className="flex min-h-screen flex-col bg-navy lg:h-screen lg:overflow-hidden">
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
          <a
            href="https://github.com/rvnikita/nightcap"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-paper/25 px-3 py-1 font-grotesk text-[11px] text-paper/80 transition hover:bg-paper/10"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Two independently-sized, independently-scrolling columns so the
          store panel never reflows when the tracker's activity grows. */}
      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden lg:rounded-t-2xl">
        <div className="lg:min-h-0 lg:w-1/2 lg:overflow-y-auto">
          <StorePanel
            product={PRODUCT}
            priceCents={state.store.priceCents}
            sold={state.store.sold}
            onSetPrice={setPrice}
          />
        </div>
        <div className="border-t border-navy/20 lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <TrackerPanel
            tracker={state.tracker}
            storePriceCents={state.store.priceCents}
            productTitle={`${PRODUCT.title} — ${PRODUCT.author}`}
            merchant={PRODUCT.merchant}
            log={state.log}
            polling={polling}
            onSetMax={setMax}
            onToggleAuth={toggleAuth}
            onReset={reset}
          />
        </div>
      </main>
    </div>
  );
}
