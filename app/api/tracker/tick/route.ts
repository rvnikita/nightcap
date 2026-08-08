import { NextResponse } from "next/server";
import { getState } from "@/lib/state";
import { runTick } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Polled by the tracker panel every few seconds. Advances the agent one step.
export async function POST() {
  const s = await runTick();
  return NextResponse.json({
    store: {
      product: s.store.product,
      priceCents: s.store.priceCents,
      currency: s.store.currency,
      sold: s.store.sold,
    },
    tracker: s.tracker,
    log: s.log,
  });
}
