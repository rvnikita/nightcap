import { createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import artifact from "./monad/spendLedger.json";

// Server-side Monad testnet client. Writes an onchain receipt per autonomous
// purchase to the SpendLedger contract. Best-effort: never blocks the Rain buy.

const RPC = process.env.MONAD_RPC_URL || "https://rpc.monad.xyz";
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const PK = (process.env.MONAD_PRIVATE_KEY || "") as `0x${string}` | "";
const LEDGER = (process.env.MONAD_LEDGER_ADDRESS || "") as `0x${string}` | "";

export const monadChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_ID === 143 ? "Monad" : "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  testnet: CHAIN_ID !== 143,
});

export function monadConfigured(): boolean {
  return Boolean(PK && LEDGER);
}

export interface ReceiptInput {
  merchant: string;
  amountCents: number;
  capCents: number;
  mcc: string;
  rainTxnId: string;
}

/** Record a purchase onchain. Returns the tx hash, or null if unconfigured/failed. */
export async function recordPurchase(r: ReceiptInput): Promise<string | null> {
  if (!monadConfigured()) return null;
  try {
    const account = privateKeyToAccount(PK as `0x${string}`);
    const wallet = createWalletClient({ account, chain: monadChain, transport: http(RPC) });
    const hash = await wallet.writeContract({
      address: LEDGER as `0x${string}`,
      abi: artifact.abi,
      functionName: "recordPurchase",
      args: [r.merchant, r.amountCents, r.capCents, r.mcc, r.rainTxnId],
    });
    return hash;
  } catch (err) {
    console.warn("Monad recordPurchase failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
