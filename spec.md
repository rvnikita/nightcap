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
- **Shared state**: server-side in-memory module `lib/store.ts` (current price, product, purchase record). Single low-traffic demo instance → reliable. Swap to Upstash (Vercel Marketplace) only if we see instance-split flakiness. As a belt-and-suspenders fallback the client also holds the authoritative price and can pass it to the tick call.
- **Rain client** `lib/rain.ts` (ported from proven `scratchpad/prove.mjs`): `Api-Key` auth, RSA-OAEP `sessionid`, AES-GCM decrypt (decrypt optional — we only need `cardId` to authorize). Core `buy({ amountUSDCents, mccs })` = fund-once → mint scoped card → `simulate/transactions/authorize` → return {cardId, txnId, status, last4}.
- **The agent**: rule-based autonomous decision (`price <= max && authorized && !purchased → buy`) with a short human-readable rationale line. Optional Claude enhancement for the rationale/decision when an LLM key is present (interface `lib/agent.ts` with rule-based default; NOT a blocker).

### API routes
- `GET  /api/store` → `{ product, price, currency }` (what the tracker polls)
- `POST /api/store/price` `{ price }` → merchant sets price
- `GET  /api/tracker` → tracker config + status + purchase
- `POST /api/tracker` `{ maxPriceUSD, authorized }` → configure watch
- `POST /api/tracker/tick` → agent evaluates current price; if triggered, executes Rain buy (idempotent — one purchase per watch); returns full state + any new log lines
- `POST /api/reset` → reset demo (clear purchase, price back to $50) for repeat runs

### Frontend
- Single page `/` split into Store (left) and Tracker (right). Tracker polls `/api/tracker/tick` every ~2–3s while authorized. Live status feed shows: watching → price hit → minting scoped card → authorized → bought (with last4, txn id, cap). A reset button re-arms the demo.

## Monad (optional bounty, non-blocking — build last)
- viem + minimal Solidity `SpendLedger` receipt contract via Foundry on Monad testnet; write one receipt per purchase. Get RPC/chainId/faucet from the Monad workshop. Make writes non-blocking so a chain hiccup never breaks the Rain demo.

## Build order (always keep something live)
1. Scaffold + deploy to Vercel (lock the live URL). 2. `lib/rain` + `/api/store` + `/api/tracker/tick` real buy. 3. Two-panel UI with polling. 4. Design polish (two aesthetics). 5. README + demo GIF (Sun AM, judged privately). 6. Monad receipts.

## Product for the demo
The book **_Eothen_ by A.W. Kingslake** (public-domain travelogue). Cover art (design reference) at `public/eothen-cover.png`. Starting price **$50.00**; demo drop target **$35.00**; tracker max **$40.00**; MCC **5942** (book stores).
