# Design direction

Hard rule from the user: **do NOT ship the "obvious AI/Claude" look** — no violet→indigo hero gradient, no single centered card on gray, no emoji-as-icons, no default shadcn slate palette, no Inter-everywhere. The two panels must read as **two different products from two different companies** talking to each other.

## Left panel — The Store ("bookshop selling *Eothen*")

Inspired by the *Eothen* book-cover reference (`public/eothen-cover.png`): a warm **sunset gradient** (amber/orange up top → coral → teal → deep navy at the base), a silhouetted Orientalist skyline, a pale winding river, an elegant serif title.

- **Mood:** literary, editorial, warm, indie-bookshop. Print/paper, not app-chrome.
- **Palette:** warm paper/cream base (`#F7F1E6`-ish), ink brown text (`#2B2016`), sunset accents pulled from the cover (amber `#E8A14C`, coral `#D8663F`, teal `#2E6B6B`, deep navy `#22314A`). Use the cover's gradient behind the hero.
- **Type:** a refined serif — **Fraunces** (display) for title/price, a readable serif/humanist for body. Real typographic hierarchy, generous leading, small-caps or letterspaced labels.
- **Layout:** product page of a boutique bookstore — large cover image, title/author in serif, a blurb, and a **prominent, editable price tag** (the merchant control the presenter changes live; style it like a hand-set price sticker, not a form input — click-to-edit or +/- stepper). Give the store a name/wordmark (e.g. *"Wayfarer Books"* / *"Meridian Books"*).
- Avoid: cards-on-gray, neon, techy monospace here.

## Right panel — The Tracker (Rain-styled)

Inspired by Rain's own product/site design (rain.xyz + their slide deck): calm fintech control panel.

- **Mood:** precise, modern, trustworthy, data-forward, lots of whitespace.
- **Palette:** near-white / very light periwinkle base (`#EEF0FF`/`#F5F6FF`), soft lavender panels, **Rain magenta/coral accent** (≈ `#F5426C`, deeper `#E11D6A`) used sparingly for the primary action + live states; muted ink for text. Soft rounded cards, subtle shadows.
- **Type:** a geometric grotesk (**Space Grotesk** or tight Inter) for UI; a **mono** (Geist Mono / JetBrains Mono) for figures, card `last4`, and transaction ids — reinforces "real payment system."
- **Layout:** a "watch" configurator (product being watched, **max price**, an **Authorize autonomous purchase** toggle styled as the primary Rain-pink control), a **live status feed** (watching → price hit → minting scoped card → authorized → bought), and a **scoped-card visual** that materializes on purchase (masked PAN `•••• last4`, cap, MCC lock, "single-use · retired"). Small Rain-style wordmark ("powered by Rain" tasteful, not a logo rip).
- Avoid: warm/serif here (that's the store's world); keep it cool and geometric.

## The seam between them

A thin vertical divider; the tracker's polling is visualized as a subtle pulse/among the two panels (e.g., a faint "polling store…" ping every X seconds) so the audience sees the two systems are connected. When the buy fires, a brief motion moment (card mints on the right; the store shows "1 sold").

## Fonts (via `next/font/google`)
- Store: `Fraunces` (+ optional `Newsreader`/`EB Garamond` body).
- Tracker: `Space_Grotesk` (UI) + `JetBrains_Mono` (figures/ids).

## Motion
- Keep it tasteful: the status feed types out lines; the scoped card mints with a quick scale/opacity; the "Bought" state has a single satisfying confirmation. No gratuitous animation.
