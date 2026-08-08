import { NextResponse } from "next/server";
import { addLog, getState } from "@/lib/state";
import { usd, clampCents } from "@/lib/format";
import type { DemoState } from "@/lib/types";

export const dynamic = "force-dynamic";

function snapshot(s: DemoState) {
  return {
    store: {
      product: s.store.product,
      priceCents: s.store.priceCents,
      currency: s.store.currency,
      sold: s.store.sold,
    },
    tracker: s.tracker,
    log: s.log,
  };
}

export async function GET() {
  return NextResponse.json(snapshot(getState()));
}

// Configure the watch: max price + authorization toggle.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const s = getState();

  if (body?.maxPriceCents != null) {
    const max = clampCents(Number(body.maxPriceCents));
    if (Number.isFinite(max) && max > 0) s.tracker.maxPriceCents = max;
  }

  if (typeof body?.authorized === "boolean") {
    const was = s.tracker.authorized;
    s.tracker.authorized = body.authorized;
    if (body.authorized && !was) {
      s.tracker.status = "armed";
      s.tracker.error = null;
      addLog(
        "info",
        `Authorized: agent may buy "${s.store.product.title}" autonomously up to ${usd(s.tracker.maxPriceCents)}.`,
      );
    } else if (!body.authorized && was) {
      s.tracker.status = "idle";
      addLog("info", "Authorization revoked — agent will not purchase.");
    }
  }

  return NextResponse.json(snapshot(s));
}
