import { NextResponse } from "next/server";
import { authorize, ensureCollateral, issueScopedCard, rainConfigured } from "@/lib/rain";
import type { Purchase } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Stateless: the browser is the source of truth for the watch. This route just
// executes the autonomous purchase against Rain — mint a scoped card scoped to
// the user's cap + MCC, then authorize the charge at the current price.
export async function POST(req: Request) {
  if (!rainConfigured()) {
    return NextResponse.json(
      { status: "error", error: "Rain API not configured (missing env vars)." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const priceCents = Math.round(Number(body?.priceCents));
  const capCents = Math.round(Number(body?.capCents));
  const mcc = String(body?.mcc ?? "5942");
  const merchant = String(body?.merchant ?? "Meridian Books");

  if (!Number.isFinite(priceCents) || priceCents <= 0 || !Number.isFinite(capCents) || capCents <= 0) {
    return NextResponse.json({ status: "error", error: "invalid priceCents/capCents" }, { status: 400 });
  }
  if (priceCents > capCents) {
    return NextResponse.json({ status: "error", error: "price above cap — agent should not buy" }, { status: 400 });
  }

  try {
    // Fund collateral before each buy — idempotent enough for sandbox and
    // guarantees the handling instance has collateral regardless of cold starts.
    await ensureCollateral();

    const card = await issueScopedCard({ amountUSDCents: capCents, allowedMccs: [mcc] });
    const result = await authorize({
      cardId: card.id,
      amountCents: priceCents,
      merchantName: merchant,
      mcc,
    });

    if (result.status === "authorized") {
      const purchase: Purchase = {
        cardId: card.id,
        last4: card.last4,
        transactionId: result.transactionId ?? "—",
        amountCents: priceCents,
        capCents,
        mcc,
        at: Date.now(),
        onchainTxHash: null,
      };
      return NextResponse.json({ status: "authorized", purchase });
    }

    if (result.status === "declined") {
      return NextResponse.json({ status: "declined", declinedReason: result.declinedReason ?? "declined" });
    }

    return NextResponse.json(
      { status: "error", error: result.declinedReason ?? "authorization error" },
      { status: 502 },
    );
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
