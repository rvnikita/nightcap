# Nightcap — the price tracker that actually buys

**Set your max price and go to sleep. The instant a deal drops, an AI agent buys it for you — on a single-use [Rain](https://www.rain.xyz) scoped card capped at exactly what you approved.** No human at checkout, and the card physically can't overpay or buy the wrong thing.

🔗 **Live demo:** _<LIVE_URL>_ · **Repo:** _<REPO_URL>_

---

## What it does (30 seconds)

Price trackers like Keepa are great at *telling* you a price dropped — but the drop happens at 3am, and by the time you wake up the deal is gone. Nightcap watches for you and, the moment the price falls below your cap, an autonomous agent **completes the purchase** on a freshly-minted Rain scoped virtual card. You wake up owning it, not reading a "sold out" alert.

The demo is one page with two connected systems:
- **Left — a bookstore** selling *Eothen*, with a price the merchant changes live.
- **Right — Nightcap**, a Rain-powered tracker. You set a max price, flip **Authorize autonomous purchase**, and it polls the store. Drop the store price below your cap and the agent buys within one poll cycle — on a real Rain sandbox transaction.

## How it maps to the challenge

- **Best use of Rain** — every purchase is a real **Rain scoped virtual card**, minted at buy-time via the sandbox API, **capped** at the user's max price and **MCC-locked** to book stores (5942). Controls are enforced by Rain at authorization; the card is **single-use** and auto-retires after one charge.
- **General track (agent transacts autonomously)** — a software agent decides and **completes a card transaction with no human at checkout**, the instant its pre-authorized condition is met.
- Embodies Rain's thesis directly: *the person sets the boundary once; the agent operates inside it; no human at checkout.*

## Why it needs Rain (and isn't just a script with your card)

Nobody lets a bot hold their real credit card — one bug or bad price and it drains the account. Rain's scoped card is the missing primitive: minted per purchase, capped to the approved amount, locked to the right merchant category, and retired after a single use. That's what makes hands-off, machine-speed buying **safe** — the difference between "a script with your card" and "a bounded, one-time mandate."

## How it works

```
Merchant changes price ──► /api/store (the tracker polls this every ~2s)
                                   │
                     price ≤ your max & authorized?
                                   │  yes
                                   ▼
  Rain: mint scoped card  ──►  POST /issuing/users/{userId}/cards/scoped
        { amountInUSDCents: <cap>, allowedMccs: ["5942"] }   (sessionid: RSA-OAEP)
                                   │
  Rain: authorize charge  ──►  POST /simulate/transactions/authorize
        { cardId, amount: <price>, merchantCategoryCode: "5942" }
                                   │
                          status: authorized  ──►  "Bought while you slept"
```

Scoped-card issuance returns encrypted PAN/CVC (RSA-OAEP session key + AES-GCM); we only need the `cardId` to authorize, so we never decrypt real card numbers. Rain client: [`lib/rain.ts`](lib/rain.ts). Agent loop: [`lib/agent.ts`](lib/agent.ts).

## Real transaction (from the sandbox, not a mock)

A live run mints a card and posts an authorization, e.g. card `••••0118`, Rain transaction `8dbddb48-08ad-4f8f-be18-fbffb6e417bd`, paid $35.00 against a $40.00 cap, MCC-locked to 5942. Everything runs against Rain's sandbox (`api-dev.raincards.xyz`) — no real money moves.

## Try it

1. Open the live demo.
2. On the right (Nightcap), keep max price **$40** and flip **Authorize autonomous purchase**.
3. On the left (the store), click **Drop to $35.00**.
4. Within ~2s the agent mints a scoped card and buys — watch the card materialize and the store stamp "1 sold." Hit **Reset demo** to run it again.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Rain sandbox API · deployed on Vercel. Two intentionally distinct design languages: a warm literary bookshop (Fraunces) and Rain's fintech control panel (Space Grotesk + JetBrains Mono).

## Run locally

```bash
npm install
cp .env.example .env   # fill in your Rain hackathon team credentials
npm run dev
```

Required env (see `.env.example`): `RAIN_API_BASE`, `RAIN_API_KEY`, `RAIN_USER_ID`, `RAIN_COLLATERAL_CONTRACT_ID`.

## Notes

Sandbox only; guardrails are real (wrong-MCC and replay on a used card are declined by Rain at authorization). Architecture map in [`spec.md`](spec.md); concept and problem framing in [`docs/concept.md`](docs/concept.md); verified API mechanics in [`docs/rain-api.md`](docs/rain-api.md).
