import { NextResponse } from "next/server";
import { resetState, addLog } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = resetState();
  addLog("info", "Demo reset. Price back to $50.00, watch disarmed.");
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
