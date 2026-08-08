export type LogKind = "info" | "poll" | "trigger" | "mint" | "approved" | "declined" | "error";

export interface LogLine {
  id: string;
  ts: number;
  kind: LogKind;
  msg: string;
}

export interface Product {
  title: string;
  author: string;
  cover: string;
  merchant: string;
  mcc: string; // merchant category code
}

export interface Purchase {
  cardId: string;
  last4: string;
  transactionId: string;
  amountCents: number;
  capCents: number;
  mcc: string;
  at: number;
  onchainTxHash?: string | null;
}

export type TrackerStatus = "idle" | "armed" | "buying" | "bought" | "error";

export interface StoreState {
  product: Product;
  priceCents: number;
  currency: "USD";
  sold: number;
}

export interface TrackerState {
  maxPriceCents: number;
  authorized: boolean;
  status: TrackerStatus;
  purchase: Purchase | null;
  error: string | null;
}

export interface DemoState {
  store: StoreState;
  tracker: TrackerState;
  log: LogLine[];
}
