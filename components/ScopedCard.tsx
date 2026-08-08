import type { Purchase } from "@/lib/types";
import { usd } from "@/lib/format";
import { monadTxUrl } from "@/lib/monad-config";

export function ScopedCard({ purchase }: { purchase: Purchase }) {
  return (
    <div className="mint-in relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-rain/20"
      style={{
        background:
          "linear-gradient(135deg, #2a2e45 0%, #3b2740 45%, #d81e5b 130%)",
      }}
    >
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #f5426c, transparent 70%)" }} />

      <div className="flex items-center justify-between">
        <span className="font-grotesk text-xs uppercase tracking-[0.2em] text-white/70">
          Rain · scoped card
        </span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
          single-use · retired
        </span>
      </div>

      <div className="mt-6 font-mono text-lg tracking-[0.25em]">
        ••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;{purchase.last4}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 font-mono text-[11px]">
        <Field label="paid" value={usd(purchase.amountCents)} accent />
        <Field label="cap" value={usd(purchase.capCents)} />
        <Field label="mcc lock" value={purchase.mcc} />
      </div>

      <div className="mt-4 border-t border-white/15 pt-3">
        <div className="font-grotesk text-[10px] uppercase tracking-wider text-white/60">
          Rain transaction
        </div>
        <div className="truncate font-mono text-[11px] text-white/90">{purchase.transactionId}</div>
      </div>

      {purchase.onchainTxHash && (
        <a
          href={monadTxUrl(purchase.onchainTxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 transition hover:bg-white/15"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#836EF9]" />
            <span className="font-grotesk text-[11px] text-white/80">Settled onchain · Monad</span>
          </span>
          <span className="truncate pl-3 font-mono text-[11px] text-white/70">
            {purchase.onchainTxHash.slice(0, 10)}…{purchase.onchainTxHash.slice(-6)} ↗
          </span>
        </a>
      )}
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="font-grotesk text-[9px] uppercase tracking-wider text-white/55">{label}</div>
      <div className={`tabular text-sm ${accent ? "text-white" : "text-white/85"}`}>{value}</div>
    </div>
  );
}
