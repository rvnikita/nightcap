# Raingentic Commerce Hackathon NYC — event brief

Encode Club · Sat Aug 8 – Sun Aug 9, 2026 · **Team 33**

> ⚠️ This repo will be made **public** (contest rule). No credentials in any committed file — everything secret lives in `.env` (gitignored). The team API key must never appear in code, docs, screenshots, or commit history.

## Two sponsors, two agendas

| | **Rain** (title sponsor) | **Monad Foundation** (bounty sponsor) |
|---|---|---|
| What they are | Stablecoin payments / card-issuing platform ("software is becoming a buyer") | High-performance EVM-compatible L1 (up to 10,000 TPS) |
| What they want | Agents transacting autonomously through Rain's payments infra | Agent-initiated payments **settled onchain on Monad**, in a build that uses Rain |
| Their judge(s) | Ross Basri (Product), Farhan Khwaja (Eng), Juan Blanco (Data Eng) | Jarrod Watts (AI Engineering Lead) |
| Their prize | Share of $10K pool (+ Michelin dinner via General track) | Mac Mini + 6 months at The Studio by Monad Foundation (NYC) |

Also judging: Siggy Bilstein (Eng Manager, Cursor). Investor speakers: Dragonfly, FirstMark.

## Judges — read on what each rewards (researched)

- **Jarrod Watts** (Monad, AI Engineering Lead; ex-thirdweb & Polygon **DevRel**). Career devrel/educator; his job is literally "autonomous agents that build, transact, operate onchain." Said **fun & interesting > polished**. Loves shareable, clever, self-explanatory demos with a clear "whoa" and an onchain footprint. → optimize the hook and the onchain beat for him.
- **Siggy Bilstein** (Cursor Eng Manager; ex-Graphite, acquired by Cursor; **co-founder/CTO of Maza — fintech, $40M exit**; ex-Slack & LinkedIn platform/**public-API** eng). Deep fintech + developer-platform brain. Will scrutinize whether the Rain API is used *for real* and whether the idea is a genuine product insight. → the integration must actually work, not be faked.
- **Ross Basri** (Rain **Product Lead**; founder of Uptop rewards, acquired by Rain). Product + founder + consumer-rewards angle. Cares about *compelling use cases* that make Rain's product look valuable and open a market he can champion internally. → show a use case that makes them think "people would actually want this."
- **Juan Blanco** (Rain "data engineer" — but actually the creator of **Nethereum** and **Solidity for VSCode**, an EVM developer-tools legend). His soul is onchain/EVM tooling. → doing the **Monad onchain settlement properly** earns his respect specifically.
- **Farhan Khwaja** (Rain Software Engineer). Rain eng; cares about correct, real API usage.

**Panel read**: skews **fintech + developer-tools + onchain**, with two DevRel-minded people who reward fun and clarity. Sweet spot = a *genuinely working* Rain scoped-card integration (Siggy/Farhan/Ross) + a fun, self-evident hook (Jarrod) + a real Monad onchain settlement (Jarrod/Juan).

**Rain's motive**: infra company; prize includes hiring. They want (a) their product shown in a way that looks magical / opens a market, and (b) to meet strong engineers. Selling the product further & discovering use cases is the game — a consumer-delightful autonomous-spend use case is catnip for Ross especially.

## Correcting the "Rain=cards, Monad=negotiation" model

- **Rain**: scoped cards are the flagship primitive they're showing off, but their submission wishlist is broader (autonomous spend, money movement, treasury/payouts, A2A negotiation). Scoped cards = the *safest path to their heart*, not the only one.
- **Monad**: the bounty is literally "agent-initiated payments **settled onchain on Monad**, using Rain." So Monad = the **onchain settlement layer** on top of a Rain build. The prisoner's-dilemma / negotiation framing was **Jarrod's presentation style** (what he finds fun to demo), *not* a bounty requirement. Negotiation is a nice theme, not Monad's ask.

## Tracks & prizes

1. **General track** — solution that enables an agent to initiate/complete transactions (Rain, Monad, or any infra). Prize: Michelin-star dinner with Rain founders + share of $10K pool.
2. **Best use of Rain** — something that uses Rain's payments infrastructure to let an agent transact autonomously. Prize: share of $10K pool.
3. **Best implementation of Monad** (optional bounty) — agentic commerce use-case using Rain, settled onchain on Monad. Prize: Mac Mini + 6 months Monad Studio.

One build can target all three: Rain for the card/payment rails, Monad for onchain settlement/audit.

## Rules of engagement

1. **Start fresh** — all project code written at the event (standard libraries fine).
2. **Ship live** — submission must have a working, publicly accessible deployed demo link. **Locally-hosted = disqualified.** (→ deploy to Vercel early, not at the end.)
3. **Public repo** — code lives in a public GitHub repo.
4. **Be ready to demo** — pitching order = submission order; slides optional, the demo is the point.

## Judging process (matters for strategy)

- Final submissions **Sunday 12:00 PM**; judges review submissions **privately** 12:00–3:00.
- Only **5 finalists** are picked to pitch live at 3:15 finale, where the full panel scores and winners are announced.
- Implication: the README + deployed demo must sell the project **without us presenting**. Budget Sunday morning for README, demo GIF/video, and a clean submission — not for features.

## What Rain says they're looking for in submissions

- **Autonomous spend** — agents that spend, settle, or get paid autonomously.
- **Global money movement** — cross-border / multi-currency flows with FX, swaps, routing.
- **Treasury and payouts** — conditional disbursements, marketplace settlements, rebalancing.
- **Agent negotiation** — agent-to-agent (A2A) price negotiation, autonomous deal-making.

Rain's framing: agentic commerce needs a layer answering **who is spending, on whose authority, within which boundary** (agent identity · delegation & controls · fraud & monitoring). Rain-issued cards work at 175M merchant locations — agents buy where merchants already sell.

## Rain tech: scoped virtual cards

"Our first product built for agents" — a card issued with controls set at creation time, **enforced at authorization**:

- **Total amount** — lifetime spend cap; spend past it is declined.
- **Allowed MCCs** — restrict to merchant categories the task needs.
- **Expiry** — card stops working when the task window closes.

Intended flow (from their slides): onramp fiat→stablecoins → store stablecoins → user authorizes agent → agent sends transaction details to Rain → scoped virtual card issued (milliseconds) → agent completes transaction → scoped card cancelled/retired.

Note: merchant-level locking wasn't on the controls slide — if we need per-merchant allowlists, we enforce them in our own policy layer on top of Rain's amount/MCC/expiry controls (defense in depth).

## Credentials & API (working notes)

- Team 33 credentials (Team ID, User ID, API key, **Collateral contract ID** — suggests cards are issued against a collateral contract) → in `.env`, gitignored.
- Recon so far: `api.rain.xyz` is live; auth header is `api-key`; discovered routes: `GET /v1/cards`, `/v1/transactions`, `/v1/balances` (401 without key). Our team key is **rejected on prod and on `api-dev.rain.xyz`** → hackathon runs on its own base URL.
- **BLOCKER**: need the docs access code for docs.rain.xyz (or the hackathon API base URL) — from Discord pins, workshop slides, or a Rain engineer on site.
- No public Rain SDK on npm/GitHub — we write a thin client from the docs.

## Monad (for the bounty)

- EVM-compatible → standard tooling works (viem/ethers, Foundry). Need from Monad workshop/Discord: **which network to use (testnet vs mainnet), RPC URL, chain ID, faucet** — don't trust memory, verify at the event.
- Cheap, credible integration for our build: settle/record every agent spend decision onchain — e.g. an `AgentSpendLedger` contract on Monad that logs (agent id, policy hash, amount, merchant/MCC, decision, Rain txn ref) per transaction, giving an immutable audit trail to match Rain's "fraud & monitoring" pillar. ~2h of work, doesn't touch the core build.
- Judge is Monad's AI lead — an agent *writing to chain autonomously* plays well.

## Schedule (deadlines)

- **Sat**: hacking begins 1:00 PM · dinner 6:00 PM (Hometown BBQ).
- **Sun**: doors 9:00 AM · **final submissions 12:00 PM** · judging 12:00–3:00 (private) · finale/prizes 3:15 PM · close 4:30 PM.
