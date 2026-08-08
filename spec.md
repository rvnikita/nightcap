# Nightcap — architectural map

> Entry point for Claude. The pitch/why lives in `docs/concept.md`; design in `docs/design.md`; verified Rain API mechanics in `docs/rain-api.md`; event/judging context in `docs/hackathon.md`.

## What it is

**Nightcap — the price tracker that actually buys.** A one-page demo with **two visually distinct panels**:

- **Left — the Store** (a bookshop selling the book *Eothen*). Has an editable **price** the presenter changes live. This simulates a merchant dropping the price (e.g. overnight). Design: inspired by the *Eothen* book cover (warm, literary). Exposes a real endpoint the tracker polls.
- **Right — the Tracker** (Rain-styled). The user sets a **max price** and flips **"Authorize autonomous purchase."** It then **polls the store every X seconds**. The instant `storePrice <= maxPrice`, an autonomous agent **buys via a real Rain scoped card** (capped at the max price, locked to the bookstore MCC, single-use) and shows the receipt — almost immediately.

**Live demo flow:** price starts $50, tracker max $40 + authorized → nothing happens. Presenter changes store price to $35 → within one poll cycle the tracker fires, mints a scoped card, authorizes the purchase, and flips to **"Bought — $35, under your $40 cap."**

## Why it's a Rain project (not just a script)

The scoped card is what makes autonomous buying *safe*: minted at purchase time, capped at the approved amount, locked to `allowedMccs` (book stores = **5942**), single-use and auto-retired. The agent physically cannot overpay or buy the wrong category — Rain enforces it at authorization. See `docs/concept.md`.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**, deployed to **Vercel** (public URL required by contest). Public **GitHub** repo (secrets only in env / Vercel env vars, never committed).
- **Client-authoritative state** (`app/page.tsx`, `"use client"`). The single demo browser is the source of truth for price, cap, authorization, status, purchase, and the activity log. **Why:** Vercel serverless spreads requests across function instances, so server-side in-memory state does NOT survive between requests (an early version broke exactly this way — arm on instance A, tick on instance B saw nothing). Client-authoritative is 100% reliable for a single-browser demo and needs zero external store.
- **The agent = the client poll loop.** Every ~1.8s: if authorized && price ≤ cap && not already bought → call the buy route once (`buyingRef` guards against overlap). Otherwise emit a throttled "still watching" log line. All the human-readable rationale lines are generated here.
- **Rain client** `lib/rain.ts` (ported from proven `scratchpad/prove.mjs`): `Api-Key` auth, RSA-OAEP `sessionid`, AES-GCM decrypt available but unused (we only need `cardId` to authorize). Exposes `ensureCollateral`, `issueScopedCard`, `authorize`, `rainConfigured`.

### API route (stateless)
- `POST /api/buy` `{ priceCents, capCents, mcc, merchant, title }` → the only server endpoint. Funds collateral, mints a scoped card capped at `capCents` and MCC-locked to `mcc`, authorizes at `priceCents`, and returns `{ status: "authorized", purchase } | { status: "declined", declinedReason } | { status: "error", error }`. Holds no state. This is where the real Rain transaction happens.

### Frontend
- Single page `/` split into Store (left, warm bookshop) and Tracker (right, Rain fintech). Presentational panels `components/StorePanel.tsx` / `components/TrackerPanel.tsx` take props + callbacks. Live status feed: watching → price hit → minting scoped card → authorized → bought (last4, txn id, cap). Reset button re-arms for repeat demos.

## Monad (optional bounty, non-blocking — build last)
- viem + minimal Solidity `SpendLedger` receipt contract via Foundry on Monad testnet; write one receipt per purchase. Get RPC/chainId/faucet from the Monad workshop. Make writes non-blocking so a chain hiccup never breaks the Rain demo.

## Build order (always keep something live)
1. Scaffold + deploy to Vercel (lock the live URL). 2. `lib/rain` + `/api/store` + `/api/tracker/tick` real buy. 3. Two-panel UI with polling. 4. Design polish (two aesthetics). 5. README + demo GIF (Sun AM, judged privately). 6. Monad receipts.

## Product for the demo
The book **_Eothen_ by A.W. Kingslake** (public-domain travelogue). Cover art (design reference) at `public/eothen-cover.png`. Starting price **$50.00**; demo drop target **$35.00**; tracker max **$40.00**; MCC **5942** (book stores).
