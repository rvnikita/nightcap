import { NextResponse } from "next/server";
import { getState } from "@/lib/state";

export const dynamic = "force-dynamic";

// What the tracker polls: the store's current price.
export async function GET() {
  const { store } = getState();
  return NextResponse.json({
    product: store.product,
    priceCents: store.priceCents,
    currency: store.currency,
    sold: store.sold,
  });
}
