import { addLog, getState } from "./state";
import { authorize, ensureCollateral, issueScopedCard, rainConfigured } from "./rain";
import { usd } from "./format";
import type { DemoState } from "./types";

// The autonomous purchasing agent. Runs on each tracker "tick".
// Decision rule: authorized && current price <= max && not already bought  ->  buy.
// The buy itself is a REAL Rain scoped-card mint + authorization.

let buying = false; // guard against overlapping ticks triggering a double buy
let pollCount = 0; // throttle "still watching" log lines

export async function runTick(): Promise<DemoState> {
  const s = getState();
  const { store, tracker } = s;

  if (tracker.status === "bought" || tracker.status === "buying") return s;
  if (!tracker.authorized) {
    tracker.status = "idle";
    return s;
  }

  tracker.status = "armed";

  // Not triggered yet — just watching. Throttle the log so it doesn't flood.
  if (store.priceCents > tracker.maxPriceCents) {
    if (pollCount % 3 === 0) {
      addLog(
        "poll",
        `Checked ${store.product.merchant} — ${usd(store.priceCents)} still above your ${usd(tracker.maxPriceCents)} cap.`,
      );
    }
    pollCount++;
    return s;
  }

  // Triggered.
  if (buying) return s;
  buying = true;
  tracker.status = "buying";
  tracker.error = null;

  try {
    addLog(
      "trigger",
      `Price dropped to ${usd(store.priceCents)} — below your ${usd(tracker.maxPriceCents)} cap. Acting now.`,
    );

    if (!rainConfigured()) {
      throw new Error("Rain API not configured (missing env vars).");
    }

    await ensureCollateral();

    addLog(
      "mint",
      `Minting a single-use Rain scoped card · capped at ${usd(tracker.maxPriceCents)} · locked to MCC ${store.product.mcc} (book stores).`,
    );
    const card = await issueScopedCard({
      amountUSDCents: tracker.maxPriceCents,
      allowedMccs: [store.product.mcc],
    });

    const result = await authorize({
      cardId: card.id,
      amountCents: store.priceCents,
      merchantName: store.product.merchant,
      mcc: store.product.mcc,
    });

    if (result.status === "authorized") {
      store.sold += 1;
      tracker.status = "bought";
      tracker.purchase = {
        cardId: card.id,
        last4: card.last4,
        transactionId: result.transactionId ?? "—",
        amountCents: store.priceCents,
        capCents: tracker.maxPriceCents,
        mcc: store.product.mcc,
        at: Date.now(),
        onchainTxHash: null,
      };
      addLog(
        "approved",
        `Bought "${store.product.title}" for ${usd(store.priceCents)} on card ••••${card.last4}. Card retired. You saved ${usd(tracker.maxPriceCents - store.priceCents)} vs your cap.`,
      );
    } else if (result.status === "declined") {
      tracker.status = "armed";
      addLog(
        "declined",
        `Rain declined the charge (${result.declinedReason ?? "declined"}). The guardrail held — nothing was spent.`,
      );
    } else {
      throw new Error(result.declinedReason ?? "authorization error");
    }
  } catch (err) {
    tracker.status = "error";
    tracker.error = err instanceof Error ? err.message : String(err);
    addLog("error", `Purchase failed: ${tracker.error}`);
  } finally {
    buying = false;
  }

  return s;
}
