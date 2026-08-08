export function usd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function clampCents(n: number): number {
  return Math.max(0, Math.round(n));
}
