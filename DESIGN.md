# 📐 IU Alumni — Design

> How IU Alumni pages are laid out and built. **References: take parts, not a copy.** Colours, fonts and voice come from [BRAND.md](BRAND.md); this file only decides layout, structure and components. Back to the [README](README.md).

---

## 1. References

One part from each reference, nothing else. The files are in [docs/references/](docs/references/README.md).

| Ref | Site | File | Source | The one part we take |
|---|---|---|---|---|
| **ref-1** (primary) | shadcn/ui | [docs/references/shadcn.md](docs/references/shadcn.md) | [styles.refero.design](https://styles.refero.design/style/0fd67ec5-7e9c-4ca9-b368-5d9c7388477a) | **Layout, spacing rhythm and components** (cards, inputs, badges): a compact 4 px base, 8 px element gaps, ~20 px card padding, ~48 px between sections, hairline-bordered cards with a barely visible shadow |
| **ref-2** | Stripe | [docs/references/stripe.md](docs/references/stripe.md) | [styles.refero.design](https://styles.refero.design/style/48e5de76-05d5-4c4e-a269-c7c245b291ec) | **The table**, built from Stripe's 1 px hairline dividers, white canvas and quiet small uppercase labels. (The reference describes no data table itself; we build ours from these three traits.) |
| **ref-3** | Linear | [docs/references/linear.md](docs/references/linear.md) | [styles.refero.design](https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1) | **The empty state**, built from Linear's "the single primary action per view" rule and its calm, restrained style. (The reference describes no empty state itself; we take the rule and the restraint. Not its dark background.) |

---

## 2. Layout, spacing, rhythm (ref-1)

All values are from BRAND.md's shape section: Tailwind's 4 px spacing scale, `--radius-card` (16 px) for containers, `--radius-control` (10 px) for controls, `--shadow-card` for cards.

| Part | Rule | Built with |
|---|---|---|
| **Page width** | Content centred, at most `max-w-5xl` (1024 px) for list pages and the profile / job posting pages; `max-w-2xl` (672 px) for forms, the announcement page and the 404 / 500 pages. Side margin `px-4` (16 px), `sm:px-6` | `PageContainer` (`width="wide"` / `"narrow"`, `pageWidthClasses`) |
| **Header** | One bar on every page: the 4 px accent line on top, then the logo (40 × 40) and "IU Alumni" on the left, the main navigation on the right; same `max-w-5xl` width as the page; `py-3`. The navigation wraps under the name on a phone | `SiteHeader`, `NavLinks` |
| **Page header band** | At the top of every page except the homepage: the compact green band ([§9](#9-richer-layer-v2)) with an optional "← back" link, the title (`<h1>`, the page-title size from BRAND.md), one short line, the count as a chip and **at most one primary button** on the right | `PageBand` |
| **Section spacing** | One rhythm: the content below a band starts `py-10` (`sm:py-12`), and panels are `gap-8` (32 px) apart, like the homepage's sections | `PageContainer`, `Panel` |
| **Element rhythm** | `gap-2` (8 px) between small controls (row actions, badges), `gap-3`–`gap-4` (12–16 px) between cards and form fields, `gap-5` (20 px) between the parts of a form | Tailwind gap classes |
| **List page** | The page band (title, a count like "10 job postings", the one primary action, e.g. "Post a job") → the list as a **card grid** for browsing pages or a **table** (§3) for management lists (see [§9](#9-richer-layer-v2)) → or, when empty, the **empty state** (§4). Creating happens on its own page (`/…/new`), not in a form above the list | `PageContainer` + `PageBand` + card grid or `Table` / `EmptyState` |
| **Detail page** | The page band (back link, eyebrow), then the header card over it: the media, the record's name as the title, chips with the facts, **Edit** (secondary) and **Delete** (danger) — no primary button. Related records below in a `Panel` | `PageBand`, `DetailHeader`, `Panel` |
| **Cards** | White surface, 1 px `--color-border` hairline, `--radius-card`, `--shadow-card` (a light soft shadow), padding `p-5` (20 px), `sm:p-6`. Cards carry **real data only** ([§9](#9-richer-layer-v2)); a whole-card link lifts on hover | `Card` / `cardClasses`, `LinkCard` |

---

## 3. The table (ref-2)

Calm and flat, like a ledger: white rows, thin lines, nothing loud. Since the Richer layer ([§9](#9-richer-layer-v2)), the table is for **management lists** — `/applications` and the applicants on a job posting's page — where rows are compared and changed; browsing pages use card grids.

| Part | Rule |
|---|---|
| **Canvas** | White (`--color-surface`) inside one card (hairline border, `--radius-card`, `--shadow-card`) on the paper background |
| **Header** | **Quiet:** `text-xs`, `font-medium`, uppercase, `tracking-wide`, `--color-muted`; **no fill** (white, like the rows), separated from the body by one hairline. Column names in plain words ("Applied", not "createdAt") |
| **Rows** | About **48 px** high: `text-sm`, `px-4 py-3`, content vertically centred. Hover: `--color-subtle` |
| **Hairlines** | **1 px `--color-border` between rows** and under the header; no vertical lines, no zebra stripes |
| **Alignment** | **Text left**, **numbers right** with tabular figures (`tabular-nums`): ids, ages, counts. Dates left, short ("12 Oct 2026"). Empty cells show "—" in `--color-muted` |
| **Status** | One `StatusBadge` per row (pending = accent, accepted = action, rejected = danger, as in BRAND.md), never coloured text |
| **Row actions** | The **name links to the detail page** (no separate "View" button). The last column, right-aligned, holds at most **Edit** (small secondary) and **Delete** (small danger). **No primary button in a row** |
| **On a phone** | The table keeps its columns and **scrolls sideways inside its card**; the page itself never scrolls sideways. The first column (the name) is the one that matters most, so it comes first |

---

## 4. The empty state (ref-3)

When a list has nothing in it, the page stays calm and offers exactly one way forward.

- **Layout:** in place of the list: a white card with a dashed `--color-border-strong` border and `--radius-card`, centred text, `px-6 py-10`, and a **small, simple inline SVG illustration** above the text (the shared `EmptyIllustration`, drawn with the tokens; [§9](#9-richer-layer-v2)).
- **Text, in our voice (BRAND.md):** a title that says what happened, then one sentence on what to do next. No emoji, no exclamation mark, no API routes.
- **Exactly one action button**, and it is the view's **one primary button**: while the list is empty, the page header shows no primary action, so the empty state's button is the only one.

| Page | Title | Next step | The one button |
|---|---|---|---|
| `/jobs` | No job postings yet. | Be the first to post one. | **New job posting** → `/jobs/new` |
| `/users` | No graduates yet. | Add the first one to start the directory. | **Add a graduate** → the create page |
| `/announcements` | No announcements yet. | Share the first news with our graduates. | **New announcement** → the create page |
| `/applications` | No applications yet. | Applications are added from a job posting's page. | **Browse job postings** → `/jobs` |
| A job posting's applications | No one has applied yet. | Add the first application below. | **Add application** (the section's form) |

---

## 5. Forms

| Part | Rule |
|---|---|
| **Label** | Above its control, `text-sm font-medium`, `--color-ink`; the label wraps the control so clicking it focuses the input. A required field shows a `--color-danger` asterisk |
| **Input** | Full width, white (`--color-surface`), 1 px `--color-border-strong`, `--radius-control`, `px-3 py-2`; on focus a `--color-primary` border and ring. A hint under it in `text-xs`, `--color-muted` |
| **Error next to its field** | Each broken field shows its own message **directly under that field** in `text-sm`, `--color-danger` (e.g. "The title can't be empty."). A short summary at the top only when several fields are wrong |
| **Input kept** | After an error, every field keeps what was typed |
| **One primary button** | One primary submit button at the end ("Save", "Add job posting"), disabled with a "Saving…" label while it runs. Cancel is a secondary button or a text link next to it |
| **Success** | A short `FormMessage` (`--color-primary-soft`), or a redirect to the new record's page |

---

## 6. Components

Six building blocks, plus the Richer layer's pieces ([§9](#9-richer-layer-v2)). Pages use these instead of repeating class lists.

| Component | In `lib/views/ui/` | Status |
|---|---|---|
| **Button** | `Button`, `ButtonLink`, `buttonClasses` in `Button.tsx` (primary, secondary, danger; md and sm) | ✅ Exists |
| **Table** | `Table`, `TableHead`, `Th`, `TableBody`, `Tr`, `Td` in `Table.tsx` | ✅ Exists: white header with quiet labels, hairlines, centred rows; `numeric` (right-aligned, tabular figures) and `align="right"` on `Th` / `Td` |
| **Form field** | `Field`, `Input`, `Textarea`, `Select`, `FormMessage` in `Field.tsx` | ✅ Exists: `Field`'s `error` shows under its control and marks it `aria-invalid` (red border, linked to the message); forms start using it with the validation middleware |
| **Card** | `Card`, `cardClasses` in `Card.tsx` | ✅ Exists |
| **Badge** | `Badge`, `StatusBadge` in `Badge.tsx` | ✅ Exists |
| **Empty state** | `EmptyState` in `EmptyState.tsx` | ✅ Exists: the illustration, `title`, a next-step sentence, and `action` — **one** primary button (a link, or a button with `onClick` in a Client Component), plus an optional `secondary` link (the 500 page's "Go to the home page") |

Also used by every page: `PageContainer` (with `band` / `overlap`, and `pageWidthClasses` for full-width bands), `TextLink`, `SiteHeader`, `NavLinks`, `NotFoundView`, `ServerErrorView`.

**Richer layer pieces** ([§9](#9-richer-layer-v2)):

| Component | In `lib/views/ui/` | What it is |
|---|---|---|
| **Hero** | `Hero.tsx` | The full-width green band (`bg-action`): a short yellow line, eyebrow, title, promise, actions on the left; `aside` on the right (two columns, stacked on a phone); `overlap` leaves room for the stats strip; optional children below |
| **Stats strip** | `StatsStrip.tsx` | One white card over the band's bottom edge: the counts in a row with small icons and thin dividers; `bare` (no own container) and `columns` (3, 4 or 5) |
| **Page band** | `PageBand.tsx` | The compact green header band of every page except the homepage: back link, eyebrow, title, one line, count chip, actions; `overlap` |
| **Detail header** | `DetailHeader.tsx` | The header card of a detail page: media, title, subtitle, chips, actions; optional children (e.g. full text) |
| **Date block** | `DateBlock.tsx` | A date as day + short month in the light green tint (`md`, `lg`) |
| **Job card / Announcement card** | `lib/views/jobs/JobCard.tsx`, `lib/views/announcements/AnnouncementCard.tsx` | The browsing cards, shared by the homepage and the list pages |
| **Bar list** | `BarList.tsx` | A horizontal bar chart in plain HTML/CSS: label, a green bar relative to the largest, the count at its end |
| **Inset** | `Inset.tsx` | A light box inside a Panel for a small form that belongs to the panel's list (e.g. "Add application") |
| **Person card** | `lib/views/users/PersonCard.tsx` | A person as a link card: initials avatar, name, department chip, city chip if it exists |
| **Avatar** | `Avatar.tsx` | Initials (a person: 2 letters; a company: 1, square); the tint is picked from the brand tints by the name, so it never changes |
| **Icon circle** | `IconCircle.tsx` | An icon in a soft tinted circle: `primary`, `accent`, `neutral`, `onAction` |
| **Link card** | `LinkCard.tsx` (`linkCardClasses`) | A card that is one link: hover lift, action-green border, deeper shadow, a yellow top strip, 150 ms; `highlight` keeps the strip on |
| **Chip** | `Chip.tsx` | A small metadata label (department, city, date, count) with an optional icon; quieter than a Badge |
| **Icons** | `icons.tsx` | The inline SVG icon set (users, briefcase, building, clipboard, megaphone, calendar, map pin, arrow, user) and `EmptyIllustration` |
| **Panel** | `Panel.tsx` | A section as a large white panel with a header row: icon circle, title, count chip, "See all →" on the right |
| **Site footer** | `SiteFooter.tsx` (in `app/layout.tsx`) | The green footer: a yellow top line, logo, name, the promise, the main links |
| **Buttons on green** | `Button.tsx` variants `onAction` / `onActionSecondary` | The band's one primary (white, green text) and its secondary (white outline) |

---

## 7. Tokens

The tokens are defined once, in the `@theme` block of [`app/globals.css`](app/globals.css), with the values from BRAND.md. Tailwind 4 also outputs every `@theme` token as a CSS variable on `:root`, so a page can use either the class or the variable:

```css
:root {
  /* BRAND.md role        token (app/globals.css)   Tailwind class */
  --color-canvas: #F5F5F7;          /* paper      bg-canvas            */
  --color-ink: #1D1D1F;             /* ink        text-ink             */
  --color-primary: #00733E;         /* action     bg-primary / text-primary */
  --color-on-primary: #FFFFFF;      /* text on action: text-on-primary */
  --color-accent: #FDD525;          /* accent     bg-accent (small highlights only) */
  --color-on-accent: #4A3C00;       /* text on accent: text-on-accent  */
  --color-danger: #B42318;          /* danger     text-danger / border-danger */
  --color-surface: #FFFFFF;         /* cards, tables, inputs: bg-surface */
  --color-muted: #5F6368;           /* secondary text: text-muted       */
  --color-border: #E5E7EB;          /* hairlines: border-border         */
  --color-border-strong: #D1D5DB;   /* inputs: border-border-strong     */
  --radius-card: 1rem;              /* rounded-card                     */
  --radius-control: 0.625rem;       /* rounded-control                  */
  --shadow-card: 0 1px 2px rgb(16 24 40 / 0.04), 0 2px 8px rgb(16 24 40 / 0.05); /* shadow-card */
  --shadow-card-hover: 0 2px 4px rgb(16 24 40 / 0.05), 0 10px 24px rgb(16 24 40 / 0.09); /* hover:shadow-card-hover */
  --color-action-tint: color-mix(in srgb, var(--color-action) 7%, var(--color-canvas)); /* bg-action-tint: the light band */
}
```

The two BRAND.md role names that aren't token names yet are aliases in `app/globals.css`, with no second hex: `--color-paper` (= `--color-canvas`) and `--color-action` (= `--color-primary`); ink, accent and danger are `--color-ink`, `--color-accent` and `--color-danger`. The `@theme static` block makes Tailwind output every token on `:root`, even one no class uses yet, so `var(--…)` always works. The full list (hover and soft variants too) is in [BRAND.md](BRAND.md#2-colour). Fonts: Geist through `font-sans` (the body default), Geist Mono through `font-mono` and `<code>`.

**Rule:** pages and components use only the tokens — a Tailwind class like `bg-primary` or `var(--color-primary)` — **never a hex value**, and never a Tailwind palette colour (`bg-white`, `text-gray-500`). The hex values live in `app/globals.css` only, and they must match BRAND.md.

---

## 8. What we did NOT take

- **shadcn/ui (ref-1):** not its black filled buttons (#0a0a0a) or grey-filled inputs, not its large radii (18 px pill buttons and inputs, 24 px cards — we keep 10 px and 16 px), not its red accent (#e7000b), its 14 px body text, its sidebar or its ⌘K search.
- **Stripe (ref-2):** not its indigo (#533afd) or violet tints, not its sohne-var font or weight-300 headings, not its 4 px radius everywhere, its 96 px section gaps, its shadow-free cards, or its "always pair a filled button with an outline button" rule.
- **Linear (ref-3):** not its dark background (#08090a) or its acid-lime button (#e4f222), not Inter or Berkeley Mono, not its 0.5 px borders, coloured tag fills or gradient hero.

---

## 9. Richer layer (v2)

The first version was correct but too plain — only text on the screen. The Richer layer makes the app livelier **without leaving the brand**: the same colours, fonts and voice (BRAND.md), the same one-primary-button rule, and still no generic template look. It replaces the rules above where it says so.

**Cards carry real data.** A card is allowed when everything on it is real data from the database. Never decoration with made-up text, never three identical "feature" cards, no purple gradients, no hype words — that is the generic look we avoid.

| Part | Rule | Built with |
|---|---|---|
| **Homepage structure** | Top to bottom: (1) the hero, (2) the stats strip, (3) "Meet our community" — 4 people cards, (4) "Latest job postings" — 3 job cards, the newest with the yellow strip and "New", (5) on the tint band, two columns (5 : 6, stacked on a phone): "People by department" (bars) and "Latest announcements" (2 cards). No "what you can do here" menu: the header navigation and the footer already cover it. Every part is real data; the same person never appears twice (the hero shows the 3 newest users, the people row the next 4). Both people sections show all users — the users table has no graduate field (ddd.md, question 38) | `HomeView`, `HomeController` |
| **Homepage hero band** | Full width, background `var(--color-action)` (our green), white text (`--color-on-primary`), **two columns** on a wide screen (stacked on a phone). Left: the eyebrow, the title, the promise, the view's **one primary button — white with green text** (6.0:1) — and one secondary (a white outline). Right: a **"Recently joined" stack** of the 3 newest users as small white cards (initials avatar, name, department), slightly overlapping and offset, with the soft hover shadow. The yellow accent only as a short line above the title (yellow text on green would fail contrast); the yellow is never a button (BRAND.md) | `Hero` (`aside`, `overlap`), `Avatar`, `ButtonLink variant="onAction"` / `"onActionSecondary"` |
| **Stats strip** | The counts are **one white card** that overlaps the bottom edge of the green band — about half on the green, half on the page — with the counts in a row, each with a small icon in a soft circle, a big tabular number and a small label, and thin dividers between them on a wide screen (two columns without dividers on a phone; labels wrap, never cut). It replaces separate stat boxes inside the band | `StatsStrip` |
| **Department bars** | A simple horizontal bar chart in plain HTML/CSS (no chart library): the top 5 departments by number of users, each bar's width relative to the largest, the bars in the action green on a light track, the count at the end of each bar (tabular). The width is a percentage (a size, not a colour) | `BarList` |
| **Page header band** | Every page except the homepage starts with a compact green band (`--color-action`, white text, a short yellow line): an optional "← back" link, an eyebrow, the title, one short line, the count as a quiet chip, and the view's **one primary button** on the right (white on green, `onAction`). List pages: band, then the card grid (or the empty state, and then no button in the band). Detail pages and forms: the band without a title, and the first card **overlaps** its bottom edge | `PageBand`, `PageContainer` (`band`, `overlap`) |
| **Detail pages** | A header card over the band: on the left the media (a large initials avatar, a company initial, or a date block), the title (`<h1>`), a subtitle and chips with the real facts; on the right Edit (secondary) and Delete (danger, with the same confirmation) — no primary button. Related records follow in a Panel (a person's applications, a posting's applicants with the "Add application" form, which is that page's one primary button) | `DetailHeader`, `DateBlock`, `Avatar`, `Panel` |
| **Forms** | Narrow: the band (back link, title, one line), then one Panel over it with the fields in the shared form look (§5), the one primary button and a secondary Cancel back | `PageBand`, `Panel`, `Field` |
| **Status counts** | A management page may show its counts by status as a small stats strip over the band (`/applications`: pending, accepted, rejected — counted from the list already loaded) | `StatsStrip` (`bare`, `columns`) |
| **Error pages** | The 404 and 500 pages use the same band (title) and a card over it with the empty-state illustration, the reason in our voice and one action: home (404), or Try again plus a link home (500) | `NotFoundView`, `ServerErrorView` |
| **Browsing pages: card grids** | People, job postings and announcements are shown as cards in a grid (1 column on a phone, 2–3 on wider screens), each card one link: **people cards** — initials avatar, name, department chip, city; **job cards** — company-initial avatar, title, company, city / type badges (once those fields exist; until migration 006 only real fields: posted date), applications count; **announcement cards** — a date block (day, month), title, a two-line preview. A whole card is one link, so it holds no buttons: **Edit and Delete live on the detail page** (`/users/{id}`, `/jobs/{id}`, `/announcements/{id}`) | `PersonCard`, `JobCard`, `AnnouncementCard`, `LinkCard`, `Avatar`, `Chip` |
| **Management lists keep the table** | Lists where rows are compared and changed keep the shared table (§3): `/applications` and the applicants on a job posting's page | `Table` |
| **Life** | A clickable card lifts 2 px on hover (and keyboard focus), its border turns the action green, its shadow deepens and a thin **yellow strip** appears along its top edge, in **150 ms**; with `prefers-reduced-motion` it doesn't move (only the colour and shadow change). Cards have a light soft shadow (`--shadow-card`; hover `--shadow-card-hover`, BRAND.md Shape) | `LinkCard` |
| **Section panels** | On the homepage each section is a large white panel (rounded, hairline border, the soft card shadow) with a header row inside it: a small icon in a soft circle, the title, the real count as a quiet chip, and "See all →" aligned right in the same row (it wraps below on a phone). A half-width panel uses `compact` (a slightly smaller title) so the row still fits | `Panel` |
| **Rhythm: a tint band** | One section sits on a full-width band in a very light tint of the action green (`--color-action-tint`, mixed from `--color-action` and the page background — never a second hex), with a hairline above and below, so the page isn't one flat gray area. On the homepage: behind the departments and announcements row. At most one tint band per page | `bg-action-tint` |
| **Yellow as accent, not borders** | The yellow appears only as a thin strip along a card's **top edge** — on hover / focus, and always on the newest job posting, which also gets a small "New" chip (accent tone). Card borders never turn yellow (BRAND.md: yellow is for small highlights); the hover border is the action green | `LinkCard` (`highlight`), `Chip tone="accent"` |
| **No repeated numbers** | A count is shown once per view: the stats strip has the totals; the panels below show their own count only as a quiet chip in the header | — |
| **Site footer** | On every page (in the root layout): **the action green with white text** (6.0:1, links at 90% white), the yellow accent as a thin line along its top, the logo, "IU Alumni · İstanbul Üniversitesi", the promise and the main links (Users, Jobs, Applications, Announcements, About, API docs). Its links get a white focus ring (the green one would vanish on green) | `SiteFooter` |
| **Empty states** | A small, simple inline SVG illustration (drawn with the tokens) above the text in our voice, and one action | `EmptyState` (`illustration` slot), `EmptyIllustration` |
| **Icons** | A small inline SVG icon set in `lib/views/ui/icons.tsx`, drawn with `currentColor` — no icon library | `icons.tsx` |
| **Still** | Colours only from BRAND.md through `var(--…)` / token classes, never a hex; **one primary button per view**; works at phone width with no sideways scroll | — |

### One system (the merge step)

| Rule | What it means |
|---|---|
| **At most one primary button per view** | A view has one primary button or none. Detail pages may have none (Edit is secondary, Delete danger); an empty list's button is then the view's primary |
| **One name for the people** | "Graduates & students" in the navigation, the footer, the 404 links and the page titles; the homepage's people row is "Meet our community" and the chart "People by department" (both show all users) |
| **Page wording for messages** | What the pages show is in the BRAND.md voice: the page controllers translate the Models' messages (`lib/controllers/pageMessages.ts`), e.g. "The name can't be empty.", "We couldn't find that job posting. It may have been deleted.", "We couldn't save your changes. Please try again." The Models and the JSON API keep their exact messages |
| **Empty values** | A missing value is shown as **"Not given"** (with the field's name where nothing else says what it is, e.g. "Email: Not given") |
| **Status labels** | Pages show **Pending / Accepted / Rejected**; the stored values and the API stay lowercase |
| **Focus on green** | On the green bands (hero, page band, footer) the keyboard focus ring is white (`--color-on-primary`); elsewhere it is the action green |
| **Arbitrary values** | Only sizes, never colours: the grid fractions (`lg:grid-cols-[1.1fr_0.9fr]`, `[5fr_6fr]`), the status dropdown's minimum width in tables (`[&_select]:min-w-28`), the bar widths (`style={{ width: "…%" }}`) and the stacking order of the "Recently joined" cards (`zIndex`) |

---

Colours, fonts and voice: BRAND.md only.
