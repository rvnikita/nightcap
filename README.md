# Nightcap — the price tracker that actually buys

**Set your max price and go to sleep. The instant a deal drops, an AI agent buys it for you — on a single-use [Rain](https://www.rain.xyz) scoped card capped at exactly what you approved.** No human at checkout — the card is issued for that one purchase, locked to the merchant's category, and retires after a single use.

🔗 **Live demo:** https://nightcap-two.vercel.app · 📊 **[Presentation](https://nightcap-two.vercel.app/deck)** · ▶️ **[Watch the 1-min explainer](https://youtu.be/wKuJl1O6kAo)**

[![Nightcap in action — the price drops and the agent buys on a scoped Rain card, with a receipt written onchain to Monad](media/demo.gif)](https://youtu.be/wKuJl1O6kAo)

*The store drops the price below your limit → the agent mints a single-use Rain scoped card and completes the purchase → a receipt is written onchain to Monad. Real Rain sandbox transactions, real Monad mainnet writes.*

---

## What it does (30 seconds)

Price trackers like Keepa are great at *telling* you a price dropped — but the drop happens at 3am, and by the time you wake up the deal is gone. Nightcap watches for you and, the moment the price falls below your cap, an autonomous agent **completes the purchase** on a freshly-minted Rain scoped virtual card. You wake up owning it, not reading a "sold out" alert.

The demo is one page with two connected systems:
- **Left — a bookstore** selling *Eothen*, with a price you can change live. This stands in for the merchant: in production the agent monitors real listings on the open web, but a controllable storefront lets you trigger the price drop on demand instead of waiting for one at 3am.
- **Right — Nightcap**, the Rain-powered tracker. You set a max price, authorize the agent, and it watches. Drop the price below your cap and it buys within one poll cycle — on a real Rain sandbox transaction, with a real receipt written to Monad.

What is deliberately *real* here is the part that's hard and risky: **issuing bounded spending authority and executing an unattended purchase.** Price discovery is the well-understood half; safe autonomous payment is the half that didn't exist.

## How it maps to the challenge

- **Best use of Rain** — every purchase is a real **Rain scoped virtual card**, minted at buy-time via the sandbox API with the spend cap set at issuance (`amountInUSDCents`) and **MCC-locked** to book stores (`allowedMccs: ["5942"]`). Rain enforces the MCC lock and single-use retirement at authorization — both verified live (a wrong-category charge returns `scoped_card_mcc_not_allowed`; a replay on a used card is refused). Our own policy layer additionally refuses any over-cap request before it reaches Rain.
- **General track (agent transacts autonomously)** — a software agent decides and **completes a card transaction with no human at checkout**, the instant its pre-authorized condition is met.
- Embodies Rain's thesis directly: *the person sets the boundary once; the agent operates inside it; no human at checkout.*

## Why it needs Rain (and isn't just a script with your card)

Nobody lets a bot hold their real credit card — one bug or bad price and it drains the account. Rain's scoped card is the missing primitive: minted per purchase, capped to the approved amount, locked to the right merchant category, and retired after a single use. That's what makes hands-off, machine-speed buying **safe** — the difference between "a script with your card" and "a bounded, one-time mandate."

## How it works

```
Merchant changes price ──► tracker polls the store price every ~2s
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

Scoped-card issuance returns encrypted PAN/CVC (RSA-OAEP session key + AES-GCM); we only need the `cardId` to authorize, so we never decrypt real card numbers. Rain client: [`lib/rain.ts`](lib/rain.ts). Agent decision loop: [`app/page.tsx`](app/page.tsx).

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

Sandbox only (no real money moves through Rain). The guardrails are real and verified: a wrong-MCC charge and a replay on a used card are both declined by Rain at authorization. Note the sandbox does not reliably decline an over-cap authorization, so we enforce the cap in our policy layer too — see [`docs/rain-api.md`](docs/rain-api.md) for exactly what we tested. Architecture map in [`spec.md`](spec.md); verified API mechanics in [`docs/rain-api.md`](docs/rain-api.md).

## Team & contact

Built at the **Raingentic Commerce Hackathon NYC** (Aug 8–9, 2026) — Team 33.

**Nikita Rvachev** — solo build (product, design, full stack, contract)
📧 [nikita@rvachev.org](mailto:nikita@rvachev.org) · 🐙 [github.com/rvnikita](https://github.com/rvnikita) · 🌐 [rvachev.org](https://rvachev.org) · 💬 Discord `rvnikita`

*Open to talking about agentic commerce, payments infrastructure, and what comes next — reach out any time.*
