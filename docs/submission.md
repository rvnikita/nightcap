# Encode submission — ready-to-paste content

Deadline **Sun Aug 9, 12:00 PM ET**. Form: Encode dashboard → **Submit Now**.

## Links (all live and verified)

| Field | Value |
|---|---|
| Link to Code | `https://github.com/rvnikita/nightcap` |
| Link to Presentation | `https://nightcap-two.vercel.app/deck` |
| Link to Demo Video | `https://nightcap-two.vercel.app/nightcap-demo.mp4` *(swap for a YouTube URL if we upload one)* |
| Live Demo Link | `https://nightcap-two.vercel.app` |

---

## Challenge Explanation

> *Describe how you are incorporating the selected challenge(s).*

**Best use of Rain.** Scoped virtual cards are the core of the product, not a garnish. Every purchase Nightcap makes issues a *fresh* card through the Rain sandbox API — `POST /issuing/users/{userId}/cards/scoped` with `amountInUSDCents` set to the user's approved maximum and `allowedMccs` locked to the merchant's category — and then authorizes the charge via `POST /simulate/transactions/authorize`. The card is single-use: after one authorization Rain retires it, so a purchase can never be replayed. The MCC allow-list and single-use retirement are enforced by Rain at authorization — both verified live (a wrong-category charge returns `scoped_card_mcc_not_allowed`, and a second charge on a used card is refused). The spend cap is set on the card at issuance; because the sandbox did not reliably decline an over-cap authorization in our testing, we also refuse over-cap requests in our own policy layer, so the boundary holds at both levels. That is precisely what makes unattended buying safe, and it's the whole reason the product can exist.

**General track — an agent that transacts autonomously.** The user sets a maximum price once and grants authorization. From then on there is no human at checkout: the agent polls the merchant, and the instant the price falls to or below the limit it decides to buy, mints the scoped card, completes the transaction, and reports back with a receipt. The purchase happens in about two seconds, unattended — which is the point, because the deals worth catching appear at 3 a.m. and last minutes.

**Best implementation of Monad.** Every autonomous purchase writes a receipt onchain. We wrote and deployed a small Solidity contract, `SpendLedger`, to **Monad mainnet** at `0xd435ecb4258b86cf36b0184bdef46cde27077efd`. After each Rain authorization the server calls `recordPurchase(...)` with the merchant, amount paid, the approved cap, the MCC, and the Rain transaction id, emitting a `PurchaseRecorded` event. The result is a tamper-proof answer to Rain's own question — who spent what, on whose authority, within which boundary — that neither the user nor we can retroactively edit. The write is best-effort and non-blocking, so chain latency can never break a purchase, and the resulting transaction hash is surfaced in the UI as a link to MonadScan.

---

## Submission Details

> *Provide a detailed explanation of your submission. Describe what you've done, the process, and any relevant context.*

**The problem.** Price trackers like Keepa are excellent at telling you a price dropped. They cannot act on it. The best discounts land in the middle of the night and last minutes, so by the time the alert reaches you, the deal is gone. The notification was never the hard part — buying was.

**Why nobody just automates the buying.** To purchase unattended, software needs real spending power, and nobody wants to hand an autonomous script their credit card. One bug, one hallucination, or one prompt injection and it drains the account. So every tracker stops at the notification and leaves the risky half to a human who is asleep.

**What we built.** Nightcap closes that gap using Rain's scoped cards as the missing primitive. You set a maximum price and authorize the agent once. When the merchant's price drops below your limit, the agent mints a single-use Rain card capped at exactly your approved amount and locked to that merchant's category, completes the purchase, and the card retires itself. The agent is given bounded authority rather than supervision — it can act at machine speed, but it cannot buy in the wrong category and cannot spend twice — Rain refuses both at authorization — and it cannot exceed the cap you approved.

**The demo** is a single page showing both sides of a real transaction. On the left is a bookstore selling *Eothen* with a price you can change live — a stand-in for the merchant, since in production the agent monitors real listings on the open web; a controllable storefront simply lets a reviewer trigger the price drop on demand rather than waiting for a real one at 3 a.m. On the right is Nightcap, which watches that price every couple of seconds. Set a $40 limit, authorize, then drop the store's price to $35 — within one poll cycle the agent mints a card, buys, and shows you the scoped card it used along with a link to the onchain receipt on MonadScan. The half that matters is deliberately real: real Rain sandbox calls (no mocks) and real transactions on Monad mainnet. Price discovery is the well-understood part of this problem; issuing bounded spending authority and completing an unattended purchase is the part that didn't exist before, and that is what we built.

**How it's built.** Next.js 16 (App Router), React 19, TypeScript and Tailwind v4, deployed on Vercel. The Rain client handles the `sessionid` handshake — an RSA-OAEP-encrypted session key — and can decrypt the returned PAN/CVC with AES-GCM, though we deliberately never do, since only the `cardId` is needed to authorize. The Monad integration uses viem against a contract compiled with solc and deployed from a script in the repo. The agent's decision loop drives a live activity feed so you can read its reasoning as it happens.

**What we learned along the way.** Two findings shaped the build. First, scoped cards really are single-use — after one authorization the card's status flips to canceled — so we designed around minting per purchase rather than treating it as a limitation; it turns out to be the feature that makes delegation safe. Second, the MCC allow-list produces a clean, reliable decline (`scoped_card_mcc_not_allowed`) at authorization, which is the guardrail we lean on to demonstrate that Rain, not our code, is enforcing the boundary. We also hit a genuinely instructive bug: our first version kept the watch state in server memory, which silently broke on Vercel because serverless requests land on different function instances. We moved to a client-authoritative design with a stateless purchase endpoint, which is both simpler and correct.

**Live demo:** https://nightcap-two.vercel.app · **Deck:** https://nightcap-two.vercel.app/deck · **Video:** https://nightcap-two.vercel.app/nightcap-demo.mp4 · **Code:** https://github.com/rvnikita/nightcap

**Contact:** Nikita Rvachev — nikita@rvachev.org · github.com/rvnikita · Discord `rvnikita`
