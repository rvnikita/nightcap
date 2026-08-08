# Rain sandbox API — verified mechanics

Everything here was tested live against our Team 33 key on Aug 8. This is ground truth, not docs paraphrase.

## Connection

- **Base URL**: `https://api-dev.raincards.xyz/v1` (NOT rain.xyz — that's prod and rejects our key).
- **Docs**: https://rain-sandbox-trial.mintlify.site · machine index `…/llms.txt` · full spec `…/openapi.json` (saved copy in scratchpad).
- **Auth**: header `Api-Key: <key>` on every request. Case-insensitive in practice.
- **Sandbox only** — nothing moves real money. Four provisioned values (in `.env`): `Api-Key`, `userId` (cardholder), `teamId` (scopes list endpoints), `contractId` (collateral to fund).

## The four verified endpoints we care about

1. **Fund collateral** — `POST /simulate/collateral/fund` `{ contractId, currency:"rusd", amount }` (amount = USD cents). → `202 {success:true}`. Cards draw against this; fund generously up front.
2. **Issue scoped card** — `POST /issuing/users/{userId}/cards/scoped` — needs header `sessionid` (see below). Body: `{ amountInUSDCents, allowedMccs?: ["5814"], expiresAt?: ISO8601 }`. → `200` with `id` (= cardId) + **encrypted** PAN/CVC inline.
3. **Simulate authorization** — `POST /simulate/transactions/authorize` `{ cardId, amount, currency:"USD", merchantName, merchantCategoryCode }`. → `200` with `status: "authorized" | "declined"` (+ `declinedReason`).
4. **Read transactions** — `GET /issuing/transactions?limit=N`. Also `/simulate/transactions/{id}/settle|reverse|refund`, and `GET /issuing/cards/{cardId}`.

Payment routes (fiat↔crypto) also exist: `POST /payment-routes`, `POST /simulate/payment-routes`.

## sessionid + encryption (required to issue a card)

Scoped-card issuance returns the card's PAN/CVC **encrypted**; you must send a `sessionid` header so Rain can encrypt to you.

- Fetch the sandbox RSA public key from `/docs/resource-sessionid-keys` (hardcoded in our proof scripts).
- Generate a 32-hex-char secret → base64 → `RSA-OAEP` (`oaepHash: "sha1"`) encrypt with the public key → base64 = the `sessionid` header. Keep the raw secret to decrypt.
- Decrypt returned PAN/CVC with `AES-128-GCM` using the secret (16-byte tag). Working Node code in `scratchpad/prove.mjs`.
- **We usually don't even need to decrypt** — for agent purchases we only need the `cardId` to run authorizations. Decryption only matters if we display/"use" the real PAN.

## ⭐ Behavior that shapes the demo (tested, not documented)

- **Scoped cards are SINGLE-USE.** After one authorization the card flips to `status: "canceled"`. A second auth on the same card → `400 "Card … is not active"`. So **one card = one purchase = auto-retired**. Each agent transaction issues a fresh card. (This is Rain's "card retired once the job is done" story, and it's real.)
- **MCC allowlist decline is the reliable, beautiful guardrail.** Fresh card locked to `allowedMccs:["5814"]`, first auth at MCC 5732 → `200 { status:"declined", declinedReason:"scoped_card_mcc_not_allowed" }`. Clean, instant, visual. **This is our money-shot for any "guardrail catches the bad spend" demo.**
- **Amount cap does NOT reliably decline at authorization in the sandbox.** Card requested at $25 gets `limit.amount = 3000` (1.2× buffer, `frequency:"allTime"`), but a first auth of $40 was still **authorized**. So do NOT build the core demo tension on an over-amount decline — it may not fire at auth time. Lean on **MCC** (and expiry/single-use) for guaranteed declines.
- No MCC restriction → any category authorizes.
- User-level limits (defaults): max 10 active cards/user, max 10 created/24h, max $5,000 approved spend/24h. Plan the demo's card volume around this (issue-and-retire is fine, but don't loop thousands of live cards).

## Implications for architecture

- A "transaction" in our app = { issue fresh scoped card (scoped to task's MCC/amount/expiry) → authorize → optionally settle → read back }. Wrap this as one `spend(task)` function.
- Guardrail failures we can demo on demand: **wrong-MCC decline** and **single-use replay decline** (and expiry if we set `expiresAt` in the past-ish). Amount is unreliable — treat as best-effort.
