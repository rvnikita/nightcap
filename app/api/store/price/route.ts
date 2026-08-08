import { NextResponse } from "next/server";
import { addLog, getState } from "@/lib/state";
import { usd, clampCents } from "@/lib/format";

export const dynamic = "force-dynamic";

// Merchant control: presenter changes the price live.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const priceCents = clampCents(Number(body?.priceCents));
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    return NextResponse.json({ error: "priceCents must be a positive number" }, { status: 400 });
  }
  const s = getState();
  const prev = s.store.priceCents;
  s.store.priceCents = priceCents;
  if (priceCents !== prev) {
    addLog("info", `${s.store.product.merchant} changed the price: ${usd(prev)} → ${usd(priceCents)}.`);
  }
  return NextResponse.json({ priceCents });
}
