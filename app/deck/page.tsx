import type { Metadata } from "next";
import { DeckNav } from "./DeckNav";

export const metadata: Metadata = {
  title: "Nightcap — deck",
  description:
    "The price tracker that actually buys. Agentic commerce on Rain scoped cards, settled onchain on Monad.",
};

const LIVE = "https://nightcap-two.vercel.app";
const REPO = "https://github.com/rvnikita/nightcap";
const LEDGER = "0xd435ecb4258b86cf36b0184bdef46cde27077efd";
const LEDGER_URL = `https://monadscan.com/address/${LEDGER}`;

function Slide({
  n,
  children,
  tint,
}: {
  n: number;
  children: React.ReactNode;
  tint?: string;
}) {
  return (
    <section
      id={`s${n}`}
      className="relative flex min-h-screen w-full snap-start flex-col justify-center px-8 py-20 md:px-20"
      style={tint ? { background: tint } : undefined}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
      <div className="pointer-events-none absolute bottom-6 right-8 font-mono text-xs text-paper/30">
        {String(n).padStart(2, "0")} / 08
      </div>
    </section>
  );
}

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5 font-grotesk text-[11px] uppercase tracking-[0.3em] text-rain">{children}</div>
);

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-fraunces text-4xl font-semibold leading-[1.12] tracking-tight text-paper md:text-6xl">
    {children}
  </h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-6 max-w-3xl font-grotesk text-lg leading-relaxed text-paper/75 md:text-2xl">{children}</p>
);

export default function Deck() {
  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-scroll bg-navy">
      <DeckNav />

      {/* 1 — Title */}
      <Slide n={1}>
        <div className="flex items-center gap-4">
          <span className="h-3 w-3 rounded-full bg-rain" />
          <span className="font-grotesk text-sm uppercase tracking-[0.3em] text-paper/60">
            Raingentic Commerce Hackathon NYC · Team 33
          </span>
        </div>
        <h1 className="mt-8 font-fraunces text-6xl font-semibold tracking-tight text-paper md:text-8xl">
          Nightcap
        </h1>
        <p className="mt-4 font-grotesk text-2xl text-paper/70 md:text-4xl">
          the price tracker that <em className="not-italic text-rain">actually buys</em>
        </p>
        <p className="mt-10 max-w-2xl font-grotesk text-lg text-paper/60">
          An AI agent that completes the purchase the moment your price hits — on a single-use{" "}
          <strong className="text-paper">Rain</strong> scoped card, settled onchain on{" "}
          <strong className="text-paper">Monad</strong>.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-grotesk text-sm">
          <a href={LIVE} className="rounded-full bg-rain px-5 py-2.5 font-medium text-white hover:bg-rain-deep">
            Live demo ↗
          </a>
          <a
            href={REPO}
            className="rounded-full border border-paper/25 px-5 py-2.5 text-paper/80 hover:bg-paper/10"
          >
            GitHub ↗
          </a>
          <a
            href={`${LIVE}/nightcap-demo.mp4`}
            className="rounded-full border border-paper/25 px-5 py-2.5 text-paper/80 hover:bg-paper/10"
          >
            1-min video ↗
          </a>
        </div>
      </Slide>

      {/* 2 — Problem */}
      <Slide n={2}>
        <Kicker>The problem</Kicker>
        <H>
          Trackers like Keepa tell you the price dropped.
          <br />
          They can&rsquo;t <span className="text-coral">act</span> on it.
        </H>
        <P>
          The best deals land at 3 a.m. and last minutes. You get the alert when you wake up — and the deal is
          already gone. The notification was never the hard part. <strong className="text-paper">Buying</strong>{" "}
          was.
        </P>
      </Slide>

      {/* 3 — Why nobody solved it */}
      <Slide n={3}>
        <Kicker>Why no tracker just buys for you</Kicker>
        <H>Nobody hands a bot their credit card.</H>
        <P>
          To buy unattended, software needs real spending power. But one bug, one hallucination, one prompt
          injection — and it drains the account. So every tracker stops at the notification and leaves the
          risky part to you.
        </P>
        <P>
          The missing piece was never the agent. It was a way to give it{" "}
          <strong className="text-paper">bounded</strong> authority.
        </P>
      </Slide>

      {/* 4 — Solution */}
      <Slide n={4}>
        <Kicker>The solution</Kicker>
        <H>
          Pre-authorized, <span className="text-rain">not supervised</span>.
        </H>
        <P>
          You set the boundary once. When the price hits, the agent mints a{" "}
          <strong className="text-paper">Rain scoped card</strong> for exactly that purchase and checks out —
          no human present.
        </P>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Capped", "Issued at exactly your max price. It cannot overpay."],
            ["MCC-locked", "Locked to the merchant category. It cannot buy the wrong thing."],
            ["Single-use", "One purchase, then the card auto-retires. No standing liability."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-paper/12 bg-paper/[0.04] p-6">
              <div className="font-grotesk text-lg font-semibold text-rain">{t}</div>
              <div className="mt-2 font-grotesk text-[15px] leading-relaxed text-paper/70">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 font-grotesk text-base text-paper/55">
          Rain enforces all three at authorization — not our code. That&rsquo;s what makes hands-off buying
          safe enough to run while you sleep.
        </p>
      </Slide>

      {/* 5 — How it works */}
      <Slide n={5}>
        <Kicker>How it works</Kicker>
        <H>Four steps, one of them onchain.</H>
        <ol className="mt-10 space-y-4">
          {[
            ["Watch", "The tracker polls the merchant every ~2s for the current price."],
            ["Trigger", "Price ≤ your limit and you've authorized → the agent acts."],
            [
              "Mint & buy",
              "POST /issuing/users/{id}/cards/scoped → a real Rain card capped + MCC-locked, then authorize the charge.",
            ],
            ["Settle", "The receipt is written to our SpendLedger contract on Monad — a tamper-proof record."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-5 rounded-2xl border border-paper/12 bg-paper/[0.04] p-5">
              <span className="font-mono text-2xl text-rain">{i + 1}</span>
              <div>
                <div className="font-grotesk text-lg font-semibold text-paper">{t}</div>
                <div className="mt-1 font-grotesk text-[15px] leading-relaxed text-paper/70">{d}</div>
              </div>
            </li>
          ))}
        </ol>
      </Slide>

      {/* 6 — It's real */}
      <Slide n={6}>
        <Kicker>It&rsquo;s real, not a mock</Kicker>
        <H>Every purchase leaves two receipts.</H>
        <P>
          Live sandbox calls against Rain, and real writes to Monad mainnet. From an actual run in the deployed
          app:
        </P>
        <p className="mt-4 max-w-3xl font-grotesk text-base text-paper/55">
          The storefront in the demo stands in for the merchant — in production the agent monitors real
          listings. Price discovery is the easy half; issuing bounded spending authority and completing an
          unattended purchase is the half that didn&rsquo;t exist, and that&rsquo;s what&rsquo;s real here.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rain/30 bg-rain/[0.07] p-6">
            <div className="font-grotesk text-xs uppercase tracking-[0.2em] text-rain">Rain</div>
            <div className="mt-3 font-mono text-sm leading-relaxed text-paper/85">
              card ••••0118
              <br />
              paid $35.00 / cap $40.00
              <br />
              MCC lock 5942 · single-use
              <br />
              txn 8dbddb48-08ad-4f8f-be18…
            </div>
          </div>
          <div className="rounded-2xl border border-[#9b8cff]/30 bg-[#9b8cff]/[0.07] p-6">
            <div className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#9b8cff]">Monad</div>
            <div className="mt-3 font-mono text-sm leading-relaxed text-paper/85">
              SpendLedger contract
              <br />
              {LEDGER.slice(0, 22)}…
              <br />
              receipts confirmed on mainnet
            </div>
            <a href={LEDGER_URL} className="mt-4 inline-block font-grotesk text-sm text-[#9b8cff] underline">
              Verify on MonadScan ↗
            </a>
          </div>
        </div>
      </Slide>

      {/* 7 — Tracks */}
      <Slide n={7}>
        <Kicker>How it maps to the challenges</Kicker>
        <H>All three, for real.</H>
        <div className="mt-10 space-y-4">
          {[
            [
              "Best use of Rain",
              "Scoped cards are the hero primitive — minted per purchase via the sandbox API, with amount cap, allowedMccs and single-use retirement enforced by Rain at authorization.",
            ],
            [
              "General track",
              "A software agent initiates and completes a card transaction autonomously, the instant its pre-authorized condition is met. No human at checkout.",
            ],
            [
              "Best implementation of Monad",
              "Every agent purchase settles a receipt onchain to a Solidity SpendLedger on Monad — an immutable answer to who spent what, on whose authority.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-paper/12 bg-paper/[0.04] p-6">
              <div className="font-grotesk text-xl font-semibold text-paper">{t}</div>
              <div className="mt-2 max-w-3xl font-grotesk text-[15px] leading-relaxed text-paper/70">{d}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 8 — Close */}
      <Slide n={8}>
        <h2 className="font-fraunces text-5xl font-semibold leading-tight tracking-tight text-paper md:text-7xl">
          Set your price. Go to sleep.
          <br />
          Wake up owning it.
        </h2>
        <p className="mt-8 font-grotesk text-xl text-paper md:text-2xl">
          <span className="font-semibold text-rain">Rain</span> for the payment ·{" "}
          <span className="font-semibold text-[#9b8cff]">Monad</span> for the proof
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-grotesk text-sm">
          <a href={LIVE} className="rounded-full bg-rain px-5 py-2.5 font-medium text-white hover:bg-rain-deep">
            {LIVE.replace("https://", "")} ↗
          </a>
          <a
            href={REPO}
            className="rounded-full border border-paper/25 px-5 py-2.5 text-paper/80 hover:bg-paper/10"
          >
            github.com/rvnikita/nightcap ↗
          </a>
        </div>
        <div className="mt-12 border-t border-paper/12 pt-8 font-grotesk text-paper/70">
          <div className="text-lg font-semibold text-paper">Nikita Rvachev</div>
          <div className="mt-1 text-[15px]">
            <a href="mailto:nikita@rvachev.org" className="underline hover:text-paper">
              nikita@rvachev.org
            </a>{" "}
            · <a href="https://rvachev.org" className="underline hover:text-paper">rvachev.org</a> · Discord{" "}
            <span className="font-mono">rvnikita</span>
          </div>
        </div>
      </Slide>
    </main>
  );
}
