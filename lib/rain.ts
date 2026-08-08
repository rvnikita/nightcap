import crypto from "crypto";

// Rain sandbox client. Verified mechanics in docs/rain-api.md.
// Auth: `Api-Key` header. Scoped-card issuance needs a `sessionid` header
// (RSA-OAEP of a 32-hex secret). Cards are single-use (auto-canceled after one auth).

const BASE = process.env.RAIN_API_BASE ?? "https://api-dev.raincards.xyz/v1";
const API_KEY = process.env.RAIN_API_KEY ?? "";
const USER_ID = process.env.RAIN_USER_ID ?? "";
const CONTRACT_ID = process.env.RAIN_COLLATERAL_CONTRACT_ID ?? "";

// Public sandbox RSA key (safe to commit — it's Rain's published sandbox key).
const SANDBOX_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCAP192809jZyaw62g/eTzJ3P9H
+RmT88sXUYjQ0K8Bx+rJ83f22+9isKx+lo5UuV8tvOlKwvdDS/pVbzpG7D7NO45c
0zkLOXwDHZkou8fuj8xhDO5Tq3GzcrabNLRLVz3dkx0znfzGOhnY4lkOMIdKxlQb
LuVM/dGDC9UpulF+UwIDAQAB
-----END PUBLIC KEY-----`;

export function rainConfigured(): boolean {
  return Boolean(API_KEY && USER_ID && CONTRACT_ID);
}

function generateSessionId(): string {
  const secret = crypto.randomUUID().replace(/-/g, ""); // 32 hex chars
  const secretB64 = Buffer.from(secret, "hex").toString("base64");
  const encrypted = crypto.publicEncrypt(
    { key: SANDBOX_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha1" },
    Buffer.from(secretB64, "utf-8"),
  );
  return encrypted.toString("base64");
}

async function rainFetch<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; json: T }> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json: json as T };
}

// Fund collateral once per server instance.
let fundedOnce = false;
export async function ensureCollateral(amountCents = 1_000_000): Promise<void> {
  if (fundedOnce) return;
  const r = await rainFetch("POST", "/simulate/collateral/fund", {
    contractId: CONTRACT_ID,
    currency: "rusd",
    amount: amountCents,
  });
  if (r.status >= 200 && r.status < 300) fundedOnce = true;
}

export interface ScopedCard {
  id: string;
  last4: string;
}

export async function issueScopedCard(opts: {
  amountUSDCents: number;
  allowedMccs?: string[];
  expiresAt?: string;
}): Promise<ScopedCard> {
  const sessionid = generateSessionId();
  const body: Record<string, unknown> = { amountInUSDCents: opts.amountUSDCents };
  if (opts.allowedMccs?.length) body.allowedMccs = opts.allowedMccs;
  if (opts.expiresAt) body.expiresAt = opts.expiresAt;

  const r = await rainFetch<{ id?: string; last4?: string; message?: string }>(
    "POST",
    `/issuing/users/${USER_ID}/cards/scoped`,
    body,
    { sessionid },
  );
  if (r.status !== 200 || !r.json?.id) {
    throw new Error(`Rain card issuance failed (${r.status}): ${JSON.stringify(r.json)}`);
  }
  return { id: r.json.id, last4: r.json.last4 ?? "••••" };
}

export interface AuthResult {
  transactionId: string | null;
  status: "authorized" | "declined" | "error";
  declinedReason?: string;
  raw: unknown;
}

export async function authorize(opts: {
  cardId: string;
  amountCents: number;
  merchantName: string;
  mcc: string;
}): Promise<AuthResult> {
  const r = await rainFetch<{
    transactionId?: string;
    status?: string;
    declinedReason?: string;
  }>("POST", "/simulate/transactions/authorize", {
    cardId: opts.cardId,
    amount: opts.amountCents,
    currency: "USD",
    merchantName: opts.merchantName,
    merchantCategoryCode: opts.mcc,
  });

  if (r.status === 200 && r.json?.status === "authorized") {
    return { transactionId: r.json.transactionId ?? null, status: "authorized", raw: r.json };
  }
  if (r.status === 200 && r.json?.status === "declined") {
    return {
      transactionId: r.json.transactionId ?? null,
      status: "declined",
      declinedReason: r.json.declinedReason,
      raw: r.json,
    };
  }
  return {
    transactionId: null,
    status: "error",
    declinedReason: typeof r.json === "object" ? JSON.stringify(r.json) : String(r.json),
    raw: r.json,
  };
}
