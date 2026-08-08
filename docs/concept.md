# Concept & problem statement

## One-liner (the 10-second test)

**Nightcap — the price tracker that actually buys.**
Set your max price and go to sleep. When the deal drops at 3am, your agent buys it instantly on a single-use Rain card capped at exactly what you approved — so you wake up owning it, not reading a "sold out" alert.

## The problem (personal, relatable — this is the pitch)

Price trackers like **Keepa** are amazing at *telling* you a price dropped. But the drop often happens at night. You wake up at 6:30am, open the alert — and the deal is already gone. **Alerts notify; they don't act. And a human is too slow (and asleep) to catch a deal that lives for minutes.**

The reason no tracker just *buys* for you: handing an autonomous script your real credit card is terrifying — a bug or a wrong price and it drains the card. So trackers stop at the notification and leave the risky part to you.

## The fix (why this is a Rain project, not just a script)

When the price hits your target, an AI agent mints a **Rain single-use scoped card** capped at exactly your max price and locked to the merchant's category, and completes the checkout — no human present. Rain enforces the boundary at authorization, so the agent **physically cannot overpay or buy the wrong thing**, and the card is **retired after one use**. That's the difference between "a script with your credit card" (scary) and "a bounded, one-time mandate" (safe enough to run while you sleep).

This is exactly Rain's thesis — *the person sets the boundary once, the agent operates inside it, no human at checkout* — expressed as a tool a normal person would actually want.

## Demo (self-evident with no live pitch in round 1)

- A product page with a **Keepa-style price-history chart** (instantly says "price tracker").
- Hit **"Watch it"** and set a max price. **Fast-forward the night**: price dips at 3am → the agent wakes, mints the scoped card, buys → **"Bought while you slept — $X, under your $Y cap."**
- 10-second safety beat: try to trick it (deal in the wrong category / above the cap) → Rain **declines at authorization** (`scoped_card_mcc_not_allowed`). Proves the guardrail is real, not our code.
- Optional bounty beat: each overnight buy gets an **onchain receipt on Monad**.

## Alignment (why judges pass it)

- **Best use of Rain:** every purchase is a real scoped virtual card, minted autonomously — the hero primitive, used for real.
- **General track:** an AI agent *completes a transaction autonomously*, no human at checkout.
- **Monad bounty (optional):** agent purchase settled/receipted onchain on Monad testnet.
- **Fun & instantly legible** (Jarrod / no-pitch round); **real integration** (Siggy/Farhan/Ross); relatable consumer use case Ross can champion.

## Passing an AI prequalification pass (they may Claude-filter 50-70 projects)

The submission is read top-first by a skimming LLM. To pass:
1. **Lead with the one-liner + a "what it does" in the first 3 lines** of the README. No preamble.
2. **Explicitly map to the criteria** in a short section ("Best use of Rain: … / Autonomous agent: … / Live demo: …") — an LLM scoring against the rubric ticks each box.
3. **Prove it's real and live**: working demo URL + a GIF + a real scoped-card id / transaction id in the writeup. LLMs reward verifiable, penalize vague.
4. **Be specific about the Rain API used** (scoped cards, `allowedMccs`, authorization decline) — concreteness reads as "actually built it."
5. **QA step before submit:** run our own draft README through an adversarial Claude "prequalifier" agent against the real challenge text; fix whatever it dings.

### Draft submission blurb (what the prequalifier reads)
> **Nightcap — the price tracker that actually buys.** Keepa tells you a price dropped; by the time you wake up, the deal's gone. Nightcap watches for you and, the instant the price hits your target, an AI agent completes the purchase autonomously on a **Rain single-use scoped card** capped at your max price and locked to the merchant category — so it can't overpay or buy the wrong thing, and the card retires after one use. You set the boundary once; the agent transacts while you sleep. **Live demo:** <url> · **Repo:** <url> · each purchase is receipted onchain on Monad.

## Tech (kept minimal on purpose)

- **Next.js (App Router) + TS on Vercel** (live URL required from hour one), **Tailwind + shadcn/ui**, public GitHub repo, secrets only in env.
- **Rain client** (server-side, already proven in `scratchpad/prove.mjs`): `Api-Key`, RSA-OAEP sessionid + AES-GCM decrypt. Core op `buy(watch)` = mint scoped card (`amountInUSDCents` + `allowedMccs`) → `simulate/authorize` → read back.
- **Claude** for the buy decision + a short human-readable rationale (Vercel AI Gateway or Anthropic SDK). ⚠️ needs an LLM key for the deployed app (else rule-based fallback).
- **Simulated price feed / mock storefront** with a price-history chart + a "fast-forward the night" control. Minimal state (in-memory or Upstash) — single-user, no arena.
- **Monad (optional, non-blocking):** viem + a tiny Solidity receipts contract via Foundry on Monad testnet. ⚠️ get RPC/chainId/faucet from the workshop.

Cut from earlier over-scoped version: multi-agent arena, competing bidders, adversarial marketplace. Personal, single-user, one clear story.
