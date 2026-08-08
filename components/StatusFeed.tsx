import type { LogLine, LogKind } from "@/lib/types";

const DOT: Record<LogKind, string> = {
  info: "bg-slate-soft",
  poll: "bg-slate-soft/60",
  trigger: "bg-amber",
  mint: "bg-rain",
  approved: "bg-teal",
  declined: "bg-rain-deep",
  error: "bg-rain-deep",
};

function time(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false });
}

export function StatusFeed({ log }: { log: LogLine[] }) {
  const recent = log.slice(-12).reverse();
  return (
    <div className="space-y-2">
      {recent.length === 0 && (
        <p className="font-mono text-xs text-slate-soft">Idle — arm the watch to begin.</p>
      )}
      {recent.map((l) => (
        <div key={l.id} className="rise flex items-start gap-2.5">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[l.kind]}`} />
          <div className="min-w-0">
            <span className="font-mono text-[10px] text-slate-soft">{time(l.ts)}</span>
            <p
              className={`text-[13px] leading-snug ${
                l.kind === "approved"
                  ? "text-teal"
                  : l.kind === "declined" || l.kind === "error"
                    ? "text-rain-deep"
                    : l.kind === "trigger" || l.kind === "mint"
                      ? "text-slate"
                      : "text-slate-soft"
              }`}
            >
              {l.msg}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
