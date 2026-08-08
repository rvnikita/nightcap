import type { DemoState, LogKind, LogLine } from "./types";

// Single-user demo state, kept on globalThis so it survives HMR and is shared
// across route invocations within one server instance.

const START_PRICE = 5000; // $50.00
const DEFAULT_MAX = 4000; // $40.00

function freshState(): DemoState {
  return {
    store: {
      product: {
        title: "Eothen",
        author: "A. W. Kingslake",
        cover: "/eothen-cover.png",
        merchant: "Meridian Books",
        mcc: "5942", // Book Stores
      },
      priceCents: START_PRICE,
      currency: "USD",
      sold: 0,
    },
    tracker: {
      maxPriceCents: DEFAULT_MAX,
      authorized: false,
      status: "idle",
      purchase: null,
      error: null,
    },
    log: [],
  };
}

const g = globalThis as unknown as { __nightcap?: DemoState };
if (!g.__nightcap) g.__nightcap = freshState();

export function getState(): DemoState {
  return g.__nightcap!;
}

export function resetState(): DemoState {
  g.__nightcap = freshState();
  return g.__nightcap;
}

let logSeq = 0;
export function addLog(kind: LogKind, msg: string): LogLine {
  const line: LogLine = { id: `l${Date.now()}_${logSeq++}`, ts: Date.now(), kind, msg };
  const s = getState();
  s.log.push(line);
  if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  return line;
}
