# UTM Shortener Pro V2

A professional UTM link builder and shortener with a **Pythagorean-style matrix** for bulk generation across 6 social platforms and 4 placement types. Shortens via the **TinyURL API**, supports **Ukrainian/English** i18n, **dark/light** themes, and runs entirely as a SPA on **Next.js + TypeScript + Tailwind CSS**.

## ✨ Features

- **6 platforms** — Telegram, Facebook, Instagram, LinkedIn, Threads, YouTube
- **4 placements** — Post, Story, Reels, Profile Header (YouTube-only)
- **Pythagorean matrix selector** — click any platform × placement cell to toggle
- **Bulk shorten** — via TinyURL API with built-in retry (3 attempts, exponential backoff)
- **Per-cell status** — `success` / `failed` / `pending` badges in the result matrix
- **Retry failed** — one-click re-run for failed shortenings
- **Bilingual UI** — 🇺🇦 Ukrainian (default) / 🇬🇧 English
- **Dark + Light themes** — Teal + Copper palette
- **YS logo** in the header
- **SPA** — no full page reloads
- **URL validation** — live feedback on the base URL field
- **Clipboard copy** for individual links and "Copy all shorts"
- **Local history** (last 50 generations, 7-day expiry, stored in localStorage)
- **Unit tests** (Vitest) — 31 tests, all green
- **Vercel-ready** — drop-in deploy

## 🚀 Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Open the ⚙️ **Settings** modal to add your TinyURL API key. Get one at [tinyurl.com/app](https://tinyurl.com/app).

## 📦 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint |

## 🧪 Testing

```bash
npm test
```

Coverage includes:
- UTM URL building, sanitization, validation (`src/utils/utm.test.ts`)
- Store, platform/medium matrix logic, history, retry semantics (`src/store/appStore.test.ts`)

## 🎨 Color palette

| Token | Hex | Use |
| --- | --- | --- |
| `teal-700` | `#0f3a3a` | Primary brand / selected cells |
| `copper-500` | `#b85f29` | Accent / CTA buttons |
| `ink-900` | `#0a0f1a` | Dark background |
| `ink-50` | `#f7f8fa` | Light background |

## 🔐 Security notes

- The TinyURL API key is stored **in the user's browser** (localStorage). It is sent to `/api/links/generate` only when generation is triggered. The server does not persist it.
- All shortening requests go through the Next.js API route so the API key is never exposed to the client-side bundle during fetching.

## 🌐 Deployment

Deploy to Vercel in one click. The app is configured for the `utm-shortener-pro.vercel.app` domain (set in `vercel.json`).
