# 🔮 LUMINA — Engagement Intelligence Framework

**by [MaLux Data Consulting](https://maluxdata.io)**

LUMINA is a proprietary client engagement intelligence tool built for solo data and business analysts. It tracks every stage, decision, note, and deliverable across a client engagement — and automatically generates a branded PDF leave-behind report at close.

---

## What it does

- **Engagement tracker** — 7-stage framework covering Discovery through Close
- **Live workspace** — notes, sub-stages, decisions, blockers, deliverables per stage
- **Systems map** — document a client's data landscape as you discover it
- **Weekly pulse** — Friday 10-minute health signal with blocker tracking
- **Client view** — shareable read-only link so clients see progress in real time
- **PDF report generator** — branded, structured leave-behind built automatically from your notes
- **Data maturity scoring** — intake vs close delta with visual comparison

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS with MaLux design tokens |
| PDF | jsPDF (client-side) |
| Storage | localStorage (private, exportable as JSON) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Fonts | Syne + DM Mono + DM Sans |

---

## Local development

```bash
git clone https://github.com/yourusername/lumina-app
cd lumina-app
npm install
npm run dev
```

App runs at `http://localhost:5173/lumina-app/`

---

## Deploy to GitHub Pages

1. Push to `main` — GitHub Actions builds and deploys automatically
2. Go to repo **Settings → Pages** → Source: `GitHub Actions`
3. App lives at `https://yourusername.github.io/lumina-app/`

### Custom domain (optional)

In **Cloudflare DNS**, add:
```
CNAME  lumina  →  yourusername.github.io
```

In **GitHub Pages settings**, set custom domain: `lumina.maluxdata.io`

Then update `vite.config.js`:
```js
base: '/'   // when using custom domain
```

---

## Embedding on maluxdata.io

```html
<!-- As a link -->
<a href="https://lumina.maluxdata.io">Try LUMINA →</a>

<!-- As an iframe demo -->
<iframe
  src="https://lumina.maluxdata.io"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius: 12px;"
/>
```

---

## Data & privacy

All engagement data is stored in your browser's `localStorage`. Nothing is sent to any server. Export individual engagements as JSON at any time via Settings → Export JSON.

---

## The LUMINA method

The tool enforces a 4-layer engagement method:

| Layer | Purpose |
|---|---|
| 01 · Intake | Scope, systems inventory, maturity baseline |
| 02 · Workspace | Live notes, decisions, blockers, deliverables |
| 03 · Pulse | Weekly health signal |
| 04 · Report | Auto-assembled leave-behind PDF |

---

## License

Private — MaLux Data Consulting. Not for redistribution.

---

*LUMINA · MaLux Data Consulting · maluxdata.io*
