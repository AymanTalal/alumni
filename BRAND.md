# 🎓 IU Alumni — Brand kit

> The brand is decided **once**, here, and every page pulls from it. Back to the [README](README.md).

---

## 1. Name and promise

**Name:** IU Alumni

**Promise:** Every IU graduate, one step away.

IU Alumni is the alumni platform of **Istanbul University (İstanbul Üniversitesi)**. It helps the university keep in touch with its **graduates**, lets **students** reach the people who studied before them, and gives **staff** one place to share news and job postings.

---

## 2. Colour

The colours come from the Istanbul University logo (`public/logo.png`): its deep green and its golden yellow. They are defined as design tokens in the `@theme` block of [`app/globals.css`](app/globals.css), and Tailwind turns each token into classes (`--color-primary` → `bg-primary`, `text-primary`, `border-primary`).

### Brand roles

| Role | Token | Hex | Where it is used |
|---|---|---|---|
| **paper** | `--color-canvas` | `#F5F5F7` | The page background behind everything |
| **ink** | `--color-ink` | `#1D1D1F` | Main text: headings, body text, table cells |
| **action** | `--color-primary` | `#00733E` | The green: primary buttons, links, the keyboard focus ring, the active navigation item |
| **accent** | `--color-accent` | `#FDD525` | The yellow: **small highlights only** — the thin line at the top of the header and of the footer, the short line above the hero title, the "pending" badge, the "New" chip, and the thin strip along the **top edge** of a card on hover (always on for the newest job posting). Never a card's border all round, never a background for text blocks, never a button, never text on the green |
| **danger** | `--color-danger` | `#B42318` | Error messages, Delete / Remove buttons, the "rejected" badge |

### Other tokens

| Token | Hex | Where it is used |
|---|---|---|
| `--color-surface` | `#FFFFFF` | Cards, tables, inputs |
| `--color-subtle` | `#F9FAFB` | Table headers, hovered rows, inline code |
| `--color-border` | `#E5E7EB` | Card, table and header borders |
| `--color-border-strong` | `#D1D5DB` | Input borders, secondary buttons, empty-state outline |
| `--color-muted` | `#5F6368` | Secondary text: descriptions, dates, hints, the header's "İstanbul Üniversitesi" line |
| `--color-primary-hover` | `#005C32` | Hover / pressed green; text on the light green |
| `--color-primary-soft` | `#E6F2EC` | Light green: the "accepted" badge, the active navigation item, success messages |
| `--color-on-primary` | `#FFFFFF` | Text on the green |
| `--color-accent-soft` | `#FFF8D9` | Light yellow: the "pending" badge background |
| `--color-on-accent` | `#4A3C00` | Dark text on yellow |
| `--color-danger-hover` | `#912018` | Hover red for Delete buttons |
| `--color-danger-soft` | `#FEF3F2` | Light red: error message background, Delete button hover |

Pages can use the role names directly: `var(--color-paper)` and `var(--color-action)` are aliases of `--color-canvas` and `--color-primary` in `app/globals.css` (same values), next to `--color-ink`, `--color-accent` and `--color-danger`.

### Contrast rule

- **White text on action** (`#FFFFFF` on `#00733E`, 6.0:1).
- **Dark text on accent** (`#4A3C00` on `#FDD525`, 7.6:1). White on the yellow is only 1.4:1, so it is **never** used.
- Main and secondary text pass WCAG AA (4.5:1) on both paper and surface: ink 15.5:1 or more, muted 5.6:1 or more.
- Pages and components use the tokens only — never a hex value or a Tailwind palette colour (`bg-white`, `text-gray-500`, …).

---

## 3. Type

| Font | Token | Loaded by | Used for |
|---|---|---|---|
| **Geist** | `--font-sans` | `next/font/google` in `app/layout.tsx` | Everything (falls back to `ui-sans-serif, system-ui, sans-serif`) |
| **Geist Mono** | `--font-mono` | `next/font/google` in `app/layout.tsx` | Code, e.g. `POST /api/users` in empty states and the asked-for path on the 404 page |

Two weights only: **semibold** (600) for headings and names, **medium** (500) for buttons, links, labels and badges. Body text is regular.

| Level | Classes | Where |
|---|---|---|
| Hero title | `text-4xl` → `sm:text-5xl`, semibold, `tracking-tight` | The home page title |
| Page title | `text-3xl` → `sm:text-4xl`, semibold, `tracking-tight` | The page band's title (`PageBand`) on every page except the homepage |
| Record title | `text-2xl` → `sm:text-3xl`, semibold, `tracking-tight` | The header card of a profile, job posting or announcement (`DetailHeader`) |
| Section title | `text-xl` (half-width panels `text-lg`), semibold, `tracking-tight` | A `Panel`'s title (e.g. "Applicants") |
| Card / form title | `text-lg`, semibold | Form titles ("Add a user"), job posting cards, home page cards |
| Body | default `text-base` (16 px); `leading-relaxed` for long text | Paragraphs, announcement content |
| Small | `text-sm` | Descriptions, buttons, navigation, inputs, table cells, messages |
| Smallest | `text-xs` | Badges, field hints, the header's university line, table headers (uppercase, `tracking-wide`) |

---

## 4. Shape

| What | Token / value | Where |
|---|---|---|
| Card radius | `--radius-card`: `1rem` (16 px) → `rounded-card` | Cards, tables, empty states |
| Control radius | `--radius-control`: `0.625rem` (10 px) → `rounded-control` | Buttons, inputs, navigation items, form messages, inline code |
| Pill | `rounded-full` | Badges |
| Shadow | `--shadow-card`: `0 1px 2px rgb(16 24 40 / 0.04), 0 2px 8px rgb(16 24 40 / 0.05)` → `shadow-card` | Cards, tables and stat cards — a light, soft lift, never a heavy drop shadow |
| Hover shadow | `--shadow-card-hover`: `0 2px 4px rgb(16 24 40 / 0.05), 0 10px 24px rgb(16 24 40 / 0.09)` → `hover:shadow-card-hover` | A clickable card under the pointer (with a 2 px lift and an action-green border, 150 ms; no lift with reduced motion — DESIGN.md §9) |
| Borders | 1 px, `--color-border` (inputs: `--color-border-strong`) | Cards, tables, inputs, the header |

**Spacing** uses Tailwind's 4 px scale (`1` = 4 px). The steps in use: `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `4`, `5`, `6`, `8`, `10`, `12`.

- Inside controls: `px-3 py-2` (inputs), `px-4 py-2` (buttons), `px-2.5 py-1` (small buttons).
- Cards: `p-5`, `sm:p-6`. Gaps between cards and fields: `gap-3` to `gap-4`.
- Between sections: `mt-12`.
- The page: centred, at most `max-w-5xl` (`max-w-2xl` for narrow pages like the 404), with a `px-4` side margin (`sm:px-6`) and `py-8` (`sm:py-12`) top and bottom.

---

## 5. Voice

IU Alumni talks like a helpful person at the alumni office: calm, clear and brief.

- **Plain English.** Everyday words; no jargon, no internal names (ids, error codes) unless the reader needs them.
- **Short sentences.** One idea per sentence.
- **Say what happened, then what to do next.** An empty list or an error always points to the next step.
- **No emojis** in the interface.
- **No hype.** No exclamation marks, no marketing promises.
- **One name for the people:** "Graduates & students" (the navigation, the footer, the page titles); "Meet our community" and "People by department" on the homepage.
- **Missing values** are shown as "Not given" — never "—", "N/A" or "null".
- **Statuses** are written Pending, Accepted, Rejected.
- **No field names in quotes, no ids, no database words** in what people read: the pages put every message in this voice (the API keeps its own technical messages).

| We say | We never say |
|---|---|
| Find a graduate | Unlock your potential |
| No job postings yet. Be the first to post one. | Oops! Nothing here |
| We couldn't find that page. | Something went wrong :( |
| We couldn't save your changes. Please try again. | Uh-oh, an error occurred! |
| This user hasn't applied to any job postings yet. | Looks like this user is a bit shy 🙈 |
| Delete this announcement? This can't be undone. | Are you SURE?! |
| Application added. | Woohoo, you're all set! 🎉 |
| The title can't be empty. | Invalid input detected |
| We couldn't find that job posting. It may have been deleted. | Job posting with id "21" not found |
| Email: Not given | — / N/A / null |
| Job posting saved. | Awesome! Your amazing job posting is live! |

---

## 6. Mark

The mark is the **Istanbul University logo**, [`public/logo.png`](public/logo.png) (a 300 × 300 PNG with a transparent background), used as it is.

- **In the header** (`lib/views/ui/SiteHeader.tsx`), shown with `next/image` at **40 × 40 px**, to the left of the product name and the "İstanbul Üniversitesi" line; it links to the home page.
- **Never stretched** (always square, width = height), **recoloured**, **redrawn**, cropped, or given effects (shadows, outlines, filters).
- **Always with its alt text:** `alt="İstanbul Üniversitesi logo"`.
- The brand colours come from the logo; the logo itself is never changed to match the page.

---

Colours, fonts and voice come from this file only. app/globals.css must match it.
