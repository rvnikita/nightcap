# Nightcap — architectural map

> Entry point. Design in `docs/design.md`; verified Rain API mechanics in `docs/rain-api.md`; submission copy in `docs/submission.md`.
>
> **Live:** https://nightcap-two.vercel.app · **Repo:** https://github.com/rvnikita/nightcap (public) · **Vercel project:** `nightcap` (auto-deploys on push to `master`).

## What it is

**Nightcap — the price tracker that actually buys.** A one-page demo with **two visually distinct panels**:

- **Left — the Store** (a bookshop selling the book *Eothen*). Has an editable **price** the presenter changes live. This simulates a merchant dropping the price (e.g. overnight). Design: inspired by the *Eothen* book cover (warm, literary).
- **Right — the Tracker** (Rain-styled). The user sets a **max price** and flips **"Authorize autonomous purchase."** It then **polls the store every X seconds**. The instant `storePrice <= maxPrice`, an autonomous agent **buys via a real Rain scoped card** (capped at the max price, locked to the bookstore MCC, single-use) and shows the receipt — almost immediately.

**Live demo flow:** price starts $50, tracker max $40 + authorized → nothing happens. Presenter changes store price to $35 → within one poll cycle the tracker fires, mints a scoped card, authorizes the purchase, and flips to **"Bought — $35, under your $40 cap."**

## Why it's a Rain project (not just a script)

The scoped card is what makes autonomous buying *safe*: minted at purchase time, capped at the approved amount, locked to `allowedMccs` (book stores = **5942**), single-use and auto-retired. The card is issued with the cap set at creation; the MCC lock and single-use retirement are enforced by Rain at authorization (both verified — see `docs/rain-api.md`). Our policy layer additionally refuses any over-cap request before it reaches Rain.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**, deployed to **Vercel** (public URL required by contest). Public **GitHub** repo (secrets only in env / Vercel env vars, never committed).
- **Client-authoritative state** (`app/page.tsx`, `"use client"`). The single demo browser is the source of truth for price, cap, authorization, status, purchase, and the activity log. **Why:** Vercel serverless spreads requests across function instances, so server-side in-memory state does NOT survive between requests (an early version broke exactly this way — arm on instance A, tick on instance B saw nothing). Client-authoritative is 100% reliable for a single-browser demo and needs zero external store.
- **The agent = the client poll loop.** Every ~1.8s: if authorized && price ≤ cap && not already bought → call the buy route once (`buyingRef` guards against overlap). Otherwise emit a throttled "still watching" log line. All the human-readable rationale lines are generated here.
- **Rain client** `lib/rain.ts` (ported from proven `scratchpad/prove.mjs`): `Api-Key` auth, RSA-OAEP `sessionid`, AES-GCM decrypt available but unused (we only need `cardId` to authorize). Exposes `ensureCollateral`, `issueScopedCard`, `authorize`, `rainConfigured`.

### API route (stateless)
- `POST /api/buy` `{ priceCents, capCents, mcc, merchant, title }` → the only server endpoint. Funds collateral, mints a scoped card capped at `capCents` and MCC-locked to `mcc`, authorizes at `priceCents`, and returns `{ status: "authorized", purchase } | { status: "declined", declinedReason } | { status: "error", error }`. Holds no state. This is where the real Rain transaction happens.

### Frontend
- Single page `/` split into Store (left, warm bookshop) and Tracker (right, Rain fintech). Presentational panels `components/StorePanel.tsx` / `components/TrackerPanel.tsx` take props + callbacks. Live status feed: watching → price hit → minting scoped card → authorized → bought (last4, txn id, cap). Reset button re-arms for repeat demos.

## Monad (DONE — onchain receipts, mainnet)
- **`SpendLedger` deployed to Monad MAINNET (chain 143)** at **`0xd435ecb4258b86cf36b0184bdef46cde27077efd`** (explorer: https://monadscan.com/address/0xd435ecb4258b86cf36b0184bdef46cde27077efd). Contract source `contracts/SpendLedger.sol`, compiled via `scripts/compile-contract.mjs` → `lib/monad/spendLedger.json`, deployed via `node --env-file=.env scripts/deploy-monad.mjs`.
- After each Rain authorization, `POST /api/buy` calls `recordPurchase(...)` from a server wallet (`lib/monad.ts`, viem) — emits `PurchaseRecorded(agent, merchant, amountCents, capCents, mcc, rainTxnId, ts)`. Best-effort: a chain failure returns `onchainTxHash: null` and never blocks the sale.
- UI: the scoped card renders a "Settled onchain · Monad ↗" link to `monadscan.com/tx/<hash>` (`lib/monad-config.ts` + `components/ScopedCard.tsx`).
- Chain is env-configurable (`MONAD_CHAIN_ID`, `MONAD_RPC_URL`, `MONAD_EXPLORER`); mainnet was chosen because the venue faucet's per-IP cap blocked testnet MON, so we funded a throwaway deployer with ~1 real MON. Deployer/agent wallet `0xB3C26d7DBcbf84b359337466F938Ad79B1b614e7` (key in `.env`/Vercel only, never committed).
- Verified live: e.g. Rain txn `a582d40a…` → Monad tx `0x446ba215…` confirmed in block 94311443.

## Build order (always keep something live)
1. Scaffold + deploy to Vercel (lock the live URL). 2. `lib/rain` + `/api/buy` real purchase. 3. Two-panel UI with polling. 4. Design polish (two aesthetics). 5. README + demo GIF (Sun AM, judged privately). 6. Monad receipts.

## Product for the demo
The book **_Eothen_ by A.W. Kingslake** (public-domain travelogue). Cover art (design reference) at `public/eothen-cover.png`. Starting price **$50.00**; demo drop target **$35.00**; tracker max **$40.00**; MCC **5942** (book stores).
