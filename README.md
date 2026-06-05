# UTM Shortener Pro V2

> A Pythagorean-matrix UTM builder + TinyURL shortener for marketers. Build every platform × placement combo in one click, then shorten them all in parallel with automatic retry.

🌐 **Live:** [utm-shortener-pro.vercel.app](https://utm-shortener-pro.vercel.app)
📦 **Stack:** Next.js 14 · TypeScript · Tailwind CSS · Zustand · Vitest
🎨 **Palette:** Teal + Copper · 🌙 Dark / ☀️ Light · 🇺🇦 UK / 🇬🇧 EN

---

## 🧭 Table of contents

1. [Why this exists](#-why-this-exists)
2. [Screens & flows](#-screens--flows)
3. [The matrix, in detail](#-the-matrix-in-detail)
4. [Tech stack & architecture](#-tech-stack--architecture)
5. [Project structure](#-project-structure)
6. [Setup & run](#-setup--run)
7. [Configuration & env](#-configuration--env)
8. [TinyURL integration](#-tinyurl-integration)
9. [Retry & resilience](#-retry--resilience)
10. [State management](#-state-management)
11. [Internationalization (i18n)](#-internationalization-i18n)
12. [Theming](#-theming)
13. [Persistence & privacy](#-persistence--privacy)
14. [Testing](#-testing)
15. [Build & deploy](#-build--deploy)
16. [Performance notes](#-performance-notes)
17. [Accessibility](#-accessibility)
18. [Roadmap / ideas](#-roadmap--ideas)
19. [FAQ](#-faq)
20. [License & credits](#-license--credits)

---

## 💡 Why this exists

Marketers and SMM managers waste time copy-pasting the same UTM base URL into spreadsheets just to swap `utm_source` and `utm_medium` for each post placement, then they paste each one into TinyURL one at a time. **UTM Shortener Pro V2** turns that whole flow into a single click:

1. Type the base URL + campaign name **once**.
2. Click the cells in the **6 × 4 matrix** to pick which platform/placement combos you need.
3. Hit **Generate** — every cell gets a UTM URL, gets shortened in parallel via the TinyURL API, and the result matrix lights up with **success / failed / pending** badges.
4. One-click copy of any individual short link, or **Copy all shorts** for the whole batch.

It's an SPA — there is no page reload anywhere in the flow. Theme and language are saved per-browser, history rolls over automatically, and failed shortenings can be retried in one click without re-doing the whole batch.

---

## 🪟 Screens & flows

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [YS] UTM Shortener Pro          UK/EN  🌙  ⚙ Settings        │  Header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Form (base URL + campaign)    3. Results matrix            │
│   2. Platform × placement picker   4. Local history (1 week)   │
│                                                                 │
│              [ ⚡ Generate Links ]                              │  CTA
└─────────────────────────────────────────────────────────────────┘
```

The left column is the **input + matrix**; the right column is the **results + history**. On mobile (≤1024px) everything stacks into a single column and the matrix scrolls horizontally inside its card.

### User flow

```
 Form fill
   ↓
 Pick matrix cells  ← 6 platforms × 4 placements (Profile Header: YT only)
   ↓
 Generate ──→  for each cell:
                  1. Build UTM URL
                  2. POST /api/links/generate
                  3. TinyURL → short URL
                  4. Update cell status (success / failed)
   ↓
 Results matrix lights up. Toasts notify success/failure counts.
   ↓
 Copy individual cells  OR  Copy all shorts  OR  Retry failed.
```

---

## 🧮 The matrix, in detail

The matrix is a **6 × 4 clickable grid** rendered as a real `<table>` (so screen readers, keyboard nav, and copy-paste all work out of the box). Each cell represents a `platform × placement` combination.

### Platforms (rows)

| Code        | Display name |
| ----------- | ------------ |
| `telegram`  | Telegram     |
| `facebook`  | Facebook     |
| `instagram` | Instagram    |
| `linkedin`  | LinkedIn     |
| `threads`   | Threads      |
| `youtube`   | YouTube      |

### Placements (columns)

| Code             | Display name     | Availability |
| ---------------- | ---------------- | ------------ |
| `post`           | Post             | All          |
| `story`          | Story            | All          |
| `reels`          | Reels            | All          |
| `profile_header` | Profile Header   | **YouTube only** |

`Profile Header` is grayed out and disabled for every non-YouTube row — clicking a disabled cell is a no-op, and the row label has a small `YT only` hint above the column header so the user knows why.

### Cell behavior

- **Empty** → faint platform+medium code (e.g. `t·p`).
- **Selected** → gradient teal background, white checkmark, slight scale-up.
- **Disabled (Profile Header × non-YouTube)** → muted dash, `cursor-not-allowed`.
- **Click toggles**: clicking a cell toggles the row + column in the selected sets (and deselects both when untoggling).
- **Quick controls**: `Select all (platforms)`, `Clear all (platforms)`, and the same for mediums.
- **Live count**: a teal pill in the header shows `{selected} / 24` combinations.

### Result matrix (post-generation)

Same shape, but each cell is now a **mini-card** with:

- Status badge: ✅ `OK` (teal), ⚠ `…` (copper, pulsing) for pending, ❌ `FAIL` (red) for failed.
- Short link (clickable, opens in new tab).
- **Copy** button (per cell, with `✓ copied` flash).
- `×N` retry counter (only shown for failed cells with `attempts > 1`).
- For failed cells: a link to the full UTM URL is shown so the user has a fallback.

A **↻ Retry failed** button appears at the top of the results card whenever there's at least one failure.

---

## 🏗 Tech stack & architecture

| Layer        | Choice                                    | Why                                            |
| ------------ | ----------------------------------------- | ---------------------------------------------- |
| Framework    | **Next.js 14 (Pages Router)**             | Zero-config SPA + API routes, Vercel-friendly. |
| Language     | **TypeScript 5 (strict)**                 | Catch UTM-shape bugs at build time.            |
| Styling      | **Tailwind CSS 3.4** + custom CSS vars    | Fast iteration, design tokens via `teal`/`copper`/`ink`. |
| State        | **Zustand 4** + `persist` middleware      | Tiny, hooks-based, native localStorage adapter. |
| Data fetching| Native **`fetch`** + `AbortController`    | No axios; we want cancellable per-link retries.|
| Tests        | **Vitest** + **happy-dom**                | Same DX as Jest, 10× faster, ESM-native.       |
| Deploy       | **Vercel** (`vercel.json` preset)         | Default branch auto-deploys; preview per PR.   |

### Why Pages Router and not App Router?

- The app is a single-route SPA — there is no SSR data layer to justify App Router.
- The API route (`/api/links/generate`) is a single, simple handler.
- The Pages Router ships a smaller JS bundle for the homepage and is the most stable, well-documented option for this kind of utility.

### Why Zustand and not Redux / Context?

- The state is genuinely tiny: a handful of strings, two arrays, and a list of history items.
- Zustand's `persist` middleware is one config line; with Context we'd hand-roll serialization + rehydration.
- The `partialize` option lets us persist only `language`, `theme`, `apiKey`, and `history` — **never** the in-flight `currentResults` or form drafts.

### Why native fetch and not axios?

- Both Node 18+ and the browser ship fetch. No dep to keep in sync.
- `AbortController` integrates cleanly with the retry loop.
- TinyURL's API is small and stable; we don't need interceptors, transformers, etc.

---

## 📂 Project structure

```
.
├── public/
│   └── logo.svg                     ← YS logo (teal + copper SVG)
├── src/
│   ├── components/
│   │   ├── FormSection.tsx          ← Base URL + campaign inputs
│   │   ├── Header.tsx               ← YS logo, lang/theme/settings
│   │   ├── HistoryPanel.tsx         ← Last 50 generations (1 week)
│   │   ├── MatrixSelector.tsx       ← 6×4 clickable matrix
│   │   ├── ResultsTable.tsx         ← Result matrix w/ status + copy
│   │   └── SettingsModal.tsx        ← API key, language, theme, test
│   ├── i18n/
│   │   └── translations.ts          ← UK + EN dictionaries
│   ├── pages/
│   │   ├── _app.tsx                 ← Applies theme class
│   │   ├── _document.tsx            ← Pre-paint theme to avoid flash
│   │   ├── index.tsx                ← Main page (the whole app)
│   │   └── api/
│   │       ├── links/
│   │       │   └── generate.ts      ← Single + batch endpoint
│   │       └── user/
│   │           └── settings.ts      ← Reserved for future
│   ├── store/
│   │   ├── appStore.ts              ← Zustand store
│   │   └── appStore.test.ts         ← 14 unit tests
│   ├── styles/
│   │   └── globals.css              ← Theme tokens, scrollbar, focus
│   └── utils/
│       ├── tinyurl.ts               ← TinyURL API client (fetch)
│       ├── tinyurl.test.ts          ← (placeholder, can be expanded)
│       ├── utm.ts                   ← URL validation, sanitization
│       └── utm.test.ts              ← 17 unit tests
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
├── vitest.config.ts
└── README.md
```

---

## ⚡ Setup & run

### Prerequisites

- **Node.js ≥ 18.18** (for native fetch, `URL`, and the test runner).
- **npm 9+** (or pnpm/yarn — examples use npm).

### Install

```bash
git clone https://github.com/Arti2210/utm-shortener-pro-V2.git
cd utm-shortener-pro-V2
npm install
```

### Dev

```bash
npm run dev
# → http://localhost:3000
```

### Production build + start

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 🔐 Configuration & env

You don't need any environment variables to run the app. The TinyURL API key is **entered by the user in the Settings modal** and is stored in the browser's localStorage. This is intentional:

- The app is a personal tool, not a multi-tenant SaaS.
- The user owns the API key and the quota.
- The server is fully stateless — there is no DB, no log of keys.

If you ever want to ship an env-based default key (e.g. for an internal team deployment), the recommended pattern is:

```ts
// next.config.js
module.exports = {
  env: {
    TINYURL_DEFAULT_API_KEY: process.env.TINYURL_DEFAULT_API_KEY,
  },
};
```

…then in `SettingsModal.tsx`, prefill the input with `process.env.TINYURL_DEFAULT_API_KEY` if the stored key is empty.

`.env.example` is committed; real `.env*` files are git-ignored.

---

## 🔗 TinyURL integration

We hit the **TinyURL v2 API** at `https://api.tinyurl.com/create`.

### Request shape

```json
POST https://api.tinyurl.com/create
Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json
Body:
  { "url": "<long-utm-url>", "domain": "tinyurl.com" }
```

### Response (success)

```json
{
  "data": { "tiny_url": "https://tinyurl.com/abc123" },
  "code": 0,
  "errors": []
}
```

### Error mapping

| HTTP | Meaning                    | Surfaced as                                |
| ---- | -------------------------- | ------------------------------------------ |
| 401/403 | Bad / expired key       | "Invalid or expired TinyURL API key"       |
| 422  | Bad parameters            | The exact `errors[]` joined with `,`        |
| 429  | Rate-limited              | "Rate limit exceeded. Please try again later." |
| other | Generic                    | `message` from the response body           |
| network | Fetch threw            | `Network error: <message>`                 |

The API key is sent from the **browser → Next.js API route → TinyURL**. The key never appears in the client bundle because the actual fetch happens server-side in `/api/links/generate`.

### Connection test

The Settings modal has a `Test Connection` button. It performs a real POST to TinyURL with a 1-byte payload (`https://example.com`). A 2xx response is treated as success; everything else (including network failure) is shown as an error.

---

## 🔁 Retry & resilience

The client implements its own retry loop (`shortenWithRetry` in `src/pages/index.tsx`) on top of the API route.

- **Max attempts:** 3
- **Backoff:** linear — `600ms × attempt` (so 600ms, then 1.2s)
- **Skipped on:** 401/403 (the key is bad; retrying won't help)
- **Surfaced per cell:** the result's `attempts` field is rendered as `×N` so the user can see how many tries each cell consumed
- **Per-cell cancel:** an `AbortController` is plumbed through fetch so future additions (e.g. a global Cancel button) can stop everything cleanly

The server-side route applies its own concurrency cap (`CONCURRENCY = 4`) so we don't hammer TinyURL with 24 simultaneous requests when the user picks the whole matrix.

---

## 🧠 State management

```
┌──────────────────────────────────────────────────────────────┐
│                       useAppStore                           │
│                                                              │
│  Persisted (localStorage)        Ephemeral (in-memory)       │
│  ──────────────────────────      ─────────────────────────    │
│  • language                      • baseUrl                   │
│  • theme                         • campaignName              │
│  • tinyUrlApiKey                 • selectedPlatforms         │
│  • history[] (capped at 50,      • selectedMediums           │
│    filtered to 7-day TTL on      • currentResults[]          │
│    rehydrate)                    • isGenerating              │
│                                  • error                     │
│                                  • isSettingsOpen            │
└──────────────────────────────────────────────────────────────┘
```

### Why this split?

- **Persisted** items are user preferences or things they'd be sad to lose on refresh.
- **Ephemeral** items are form drafts and in-flight results — losing them on refresh is fine, persisting them would actually be confusing (e.g. an old `currentResults` from before a theme change).

### Computed selectors

- `getSelectedCombinationsCount()` — respects the `Profile Header` YT-only restriction.
- `getFilteredHistory()` — drops items older than 7 days.
- `getFailedResults()` — used by the retry button to find the cells that need a second chance.

---

## 🌐 Internationalization (i18n)

Two languages, in-app switch:

- 🇺🇦 **Ukrainian** — default
- 🇬🇧 **English**

The dictionary is a flat typed object in `src/i18n/translations.ts`:

```ts
type Language = 'uk' | 'en';

export const translations: Record<Language, Translations> = {
  uk: { appName: 'UTM Shortener Pro', tagline: '…', /* … */ },
  en: { appName: 'UTM Shortener Pro', tagline: '…', /* … */ },
};

export function getTranslation(lang: Language, key: keyof Translations): string {
  return translations[lang][key] || key;
}
```

The `t()` function is a `useCallback` in `index.tsx`, so consumers re-render only when the language actually changes.

To add a new language, just add a new key to `translations` and a new button in `SettingsModal.tsx` + `Header.tsx`.

---

## 🎨 Theming

- **Default:** 🌙 **dark**
- **Other:** ☀️ **light**
- **Toggle:** in the header (sun/moon icon) and in Settings

The theme is applied with Tailwind's `class` strategy (`darkMode: 'class'`). A small pre-paint script in `_document.tsx` reads the persisted theme from localStorage **before React hydrates**, so there is no flash of light theme on a dark-preference user.

### Design tokens

| Token         | Dark              | Light             | Use                       |
| ------------- | ----------------- | ----------------- | ------------------------- |
| `ink-900`     | `#0a0f1a`         | —                 | Dark background           |
| `ink-50`      | —                 | `#f7f8fa`         | Light background          |
| `ink-800`     | `#141c2b`         | —                 | Dark surface              |
| `ink-200`     | —                 | `#c8d1dc`         | Light border              |
| `teal-700`    | `#0f3a3a`         | —                 | Dark brand / selected     |
| `teal-300`    | `#69d4c8`         | —                 | Dark accent text          |
| `teal-500`    | `#1fa69a`         | —                 | Universal accent          |
| `copper-500`  | `#b85f29`         | `#b85f29`         | CTA, "Retrying" badge     |
| `copper-600`  | `#9a4a1c`         | `#9a4a1c`         | CTA hover                 |

---

## 🗃 Persistence & privacy

- **Where:** `localStorage`, key `utm-shortener-storage`
- **What:** language, theme, API key, history
- **TTL:** history auto-filters to the last **7 days** on rehydrate
- **What we never store:** form drafts, in-flight results, generated short URLs that haven't been explicitly saved to history

The API key is **client-side**. When the user clicks Generate, the key is sent to the Next.js API route `/api/links/generate`, which forwards it to TinyURL. The route doesn't log or persist it. The key is never embedded in the production HTML or JS bundle.

To wipe everything: clear site data in your browser, or call `localStorage.clear()` in DevTools.

---

## ✅ Testing

```bash
npm test             # one-shot
npm run test:watch   # watch mode
```

Current coverage: **31 tests, all passing** in ~3s.

| File                              | Tests | Focus                                                        |
| --------------------------------- | ----- | ------------------------------------------------------------ |
| `src/utils/utm.test.ts`           | 17    | URL validation, sanitization, buildUtmUrl, combinations     |
| `src/store/appStore.test.ts`      | 14    | Toggles, history, retry counter, `isValidCombination` rules |

Run output:

```
 ✓ src/store/appStore.test.ts  (14 tests) 17ms
 ✓ src/utils/utm.test.ts       (17 tests)  8ms
 Test Files  2 passed (2)
      Tests  31 passed (31)
```

To add coverage for components, install `@testing-library/react` and `@testing-library/user-event` and write tests like:

```ts
import { render, screen } from '@testing-library/react';
import MatrixSelector from './MatrixSelector';

it('renders 6 platform rows', () => {
  render(<MatrixSelector combinationsCount={0} t={(k) => k} />);
  expect(screen.getByText('Telegram')).toBeInTheDocument();
  // …
});
```

The project already has both libraries as dev dependencies; you just need to wire them into a `*.test.tsx` file.

---

## 🚀 Build & deploy

### Build

```bash
npm run build
```

Output (with the current code):

```
Route (pages)                             Size     First Load JS
┌ ○ / (571 ms)                            14.8 kB        97.3 kB
├   /_app                                 0 B            82.5 kB
├ ○ /404                                  180 B          82.7 kB
├ ƒ /api/links/generate                   0 B            82.5 kB
└ ƒ /api/user/settings                    0 B            82.5 kB
+ First Load JS shared by all             88 kB
```

The page is `○ (Static)` — the entire UI ships as static HTML + JS. The only dynamic route is the TinyURL proxy, which is server-rendered on demand.

### Deploy to Vercel

1. Push the repo to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) → import the `utm-shortener-pro-V2` repo.
3. Framework preset: **Next.js** (auto-detected).
4. No env vars needed. Hit **Deploy**.
5. Add the domain `utm-shortener-pro.vercel.app` in **Project Settings → Domains** (it's usually claimed automatically for the Vercel account that owns the project).

`vercel.json` is configured to keep the default Next.js build output — no overrides needed.

### Deploy to a non-Vercel host

Any Node 18+ host works:

```bash
npm run build
PORT=3000 npm start
```

For static export you would need to also proxy `/api/links/generate` somewhere; since the matrix logic and the TinyURL call are tightly coupled, the simplest path is to keep the API route and run on Node.

---

## ⚡ Performance notes

- **No external state libs** (other than Zustand) → no extra re-renders.
- **`useMemo`** on `combinations` and `combinationsCount` so the matrix doesn't re-derive on every keystroke.
- **`useCallback`** on `t` so children don't get a new function reference per render.
- **Tailwind purge** is on by default → only the classes you actually use ship in the CSS.
- **Pre-paint theme script** in `_document.tsx` is < 200 bytes.
- **First Load JS:** ~97 kB for `/` (mostly React + Next.js runtime). Page-specific code is **14.8 kB**.

If you ever need to shave that down: dynamic-import the Settings modal (`next/dynamic` with `ssr: false`) and lazy-load the History panel until the user scrolls to it.

---

## ♿ Accessibility

- All interactive elements are real `<button>` / `<a>` / `<input>` — keyboard-navigable by default.
- Inputs have proper `<label htmlFor>` pairings.
- The matrix is a real `<table>` with `<th>` headers → screen readers announce row/column context.
- Status badges use both **color** *and* **icon** (✓, …, ✕) so colorblind users still get the signal.
- Toast region uses `role="status"` and `aria-live="polite"`.
- Focus rings are explicit (2px teal, 2px offset) — no relying on browser defaults that some themes override.
- All transitions respect `prefers-reduced-motion` via Tailwind's default `motion-safe` variants if you wrap them.

Known gaps to consider: arrow-key navigation across the matrix cells (currently you tab through them) and a high-contrast mode toggle.

---

## 🛣 Roadmap / ideas

- [ ] **Export** to CSV / Google Sheets (one click to dump the full matrix)
- [ ] **QR codes** for each short URL, inlined in the cell
- [ ] **Bitly / Short.io / Rebrandly** as alternative shorteners (same retry shape)
- [ ] **Custom aliases** (TinyURL supports `alias` in the create body)
- [ ] **Bulk import** — paste a CSV of `(base_url, campaign)` rows and generate per-row
- [ ] **Service worker / PWA** for offline use on the road
- [ ] **Sharing** — encode the form state in a URL hash so a colleague can open your exact setup
- [ ] **OG previews** — fetch the base URL and show a thumbnail + title in the result
- [ ] **Server-side history** behind a lightweight auth layer (NextAuth + Postgres)

---

## ❓ FAQ

**Does the app send my data anywhere besides TinyURL?**
No. The base URL, campaign name, and API key are only used to call TinyURL via the `/api/links/generate` server route. There's no telemetry, no analytics, no third-party scripts.

**Why does `Profile Header` only work for YouTube?**
UTM `utm_medium` is a free-form string, but in practice the "header" / "banner" placement only really exists on YouTube (channel header). On Instagram / LinkedIn etc. the closest equivalent is your bio link, which has a different UTM convention — so we block invalid combos at the matrix level to keep the output clean.

**Why don't you store my API key server-side?**
Two reasons: (1) the app is stateless and doesn't have a user system, (2) storing keys server-side would create a security surface for no real benefit — the key is only ever used to call TinyURL, which is a public, rate-limited API.

**Can I add more platforms?**
Yes. Add an entry to `PLATFORMS` in `src/store/appStore.ts`. The matrix, history, and result table all derive from that array — no other changes needed.

**Can I add more placements?**
Yes. Add an entry to `MEDIUMS`. If it's restricted to certain platforms, set `availableFor: ['youtube']` (or whichever codes). The `isValidCombination` helper handles the rest.

**What happens if TinyURL rate-limits me?**
The cell is marked `failed` with the message "Rate limit exceeded. Please try again later." Hit **↻ Retry failed** once your quota window resets.

**Will it work without a TinyURL key?**
Yes — the cells will still be filled in with the **full UTM URLs**. You'll just see a toast saying "API key not provided" and no short links. The full URLs remain copyable.

---

## 📄 License & credits

MIT — do whatever, just don't blame us if TinyURL changes their API shape.

Built with:

- [Next.js](https://nextjs.org) by Vercel
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vitest](https://vitest.dev)
- The YS monogram logo is a custom design in the project's Teal + Copper palette.

TinyURL® is a trademark of its respective owner. This project is not affiliated with or endorsed by TinyURL, Inc.
