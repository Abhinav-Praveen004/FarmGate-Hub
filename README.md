# FarmGate Hub (FGH) 🌾🍅

> **Transforming Smallholder Tomato Realisation from 33% to 45% via Micro-Cold Storage, Instant Liquidity, and Collective Wholesale Matching.**
> Originating from the Group 4 Student Report *"Improving Farmers' Income"* (Authors: Janhavi J, Lakshmi Shree N, Jananavarshini G, Keshini K S, Keerthana K, Kaavya R).

---

## ⚡ Quick Start (Zero External Keys Required)

Clone the repository and run:

```bash
# 1. Install dependencies
npm install

# 2. Seed SQLite database with baseline lots, buyers, and telemetry
npm run seed

# 3. Build production assets
npm run build

# 4. Start the unified production server
npm start
```

Or for concurrent live hot-reload development:

```bash
npm run dev
```

---

## 🌐 Unified Port Map & Available Surfaces

Once started, all surfaces are live on their dedicated local ports:

| Surface | Port / URL | Description | Audience |
| :--- | :--- | :--- | :--- |
| **Launch Gateway** | [`http://localhost:8080`](http://localhost:8080) | One-click directory to all surfaces | Developers & Judges |
| **Investor Pitch Site** | [`http://localhost:4000`](http://localhost:4000) | Public pitch site built with anti-slop guidelines (`design-taste-frontend`) | Investors & Evaluators |
| **Farmer Mobile App (P0)** | [`http://localhost:5173/farmer`](http://localhost:5173/farmer) | Screens 1–4 (Price, Lots, Rupee Waterfall, Money) + WhatsApp drawer in EN / HI / TA | Smallholder Farmers |
| **Hub Operator Console (P0)** | [`http://localhost:5173/hub`](http://localhost:5173/hub) | Digital scale capture, 10T Cool Pod telemetry, Collective load aggregator, 24h SLA payouts | Village Hub Lead |
| **Impact Dashboard (P0)** | [`http://localhost:5173/impact`](http://localhost:5173/impact) | 5 KPI scorecards, Per-Tonne calculator (+27.2%), 4-Year cohort model, ₹5 Cr ask | Investors & FPOs |
| **Buyer Portal (P1)** | [`http://localhost:5173/buyer`](http://localhost:5173/buyer) | Graded catalog (Grade A/B/C), 100% escrow lock, live cold-chain dispatch tracker | Wholesale Buyers & Kiranas |
| **QR Traceability (P1)** | [`http://localhost:5173/t/LOT-214`](http://localhost:5173/t/LOT-214) | Farm-to-fork chronology, farmer 45% share proof, 73% lower waste guarantee | Retail Consumers |
| **Channels Simulator (P1)** | [`http://localhost:5173/channels`](http://localhost:5173/channels) | Interactive WhatsApp Business chat bot & 12-key toll-free IVR phone dialer | Non-Smartphone Users |
| **Evidence Sources (P1)** | [`http://localhost:5173/sources`](http://localhost:5173/sources) | Group 4 credits, Section 4 citations, empirical benchmark cross-references | Academics & Analysts |
| **API Backend & SSE** | [`http://localhost:8787`](http://localhost:8787) | Hono REST API, SQLite Drizzle ORM, real-time SSE stream (`/api/events`) | System Integration |

---

## 🏗️ Monorepo Architecture

```
farmgate-hub/
├── apps/
│   ├── api/          # Hono backend + Drizzle ORM + SQLite + Hardware Adapters (Port 8787)
│   ├── web/          # React 19 + Vite 8 + Tailwind CSS + React Router 7 (Port 5173)
│   │   └── src/surfaces/
│   │       ├── farmer/        # Mobile farmer app (P0)
│   │       ├── hub/           # Hub operator console (P0)
│   │       ├── impact/        # Impact & investor dashboard (P0)
│   │       ├── buyer/         # Buyer catalog & escrow portal (P1)
│   │       ├── traceability/  # Consumer public provenance certificate (P1)
│   │       ├── channels/      # WhatsApp bot & IVR telephone simulator (P1)
│   │       └── sources/       # Evidence base & report citation mapping (P1)
│   └── site/         # Investor pitch static site (Port 4000, design-taste-frontend v2.5.1)
├── packages/
│   ├── shared/       # Domain types, finance engine, evidence data, i18n dictionaries
│   └── ui/           # Design tokens, signature components (RupeeWaterfall, PodGauge, etc.)
├── e2e/              # Automated Playwright E2E 8-step golden path & Axe WCAG 2.2 AA audits
├── docs/             # ARCHITECTURE.md, DEMO_SCRIPT.md, SIMULATIONS.md, PROGRESS.md
└── server.js         # Single-process production server orchestration
```

---

## 🧪 Verification & Test Suite

The codebase has complete test coverage spanning unit, golden, integration, E2E, and accessibility tests:

```bash
# Run all verification suites in one command
npm run verify

# Or run individual test suites:
npm run test         # 49 unit and integration tests (Vitest)
npm run test:e2e     # 8-step automated end-to-end golden path (Playwright)
npm run test:a11y    # WCAG 2.2 AA accessibility audit on all 7 surfaces (Playwright Axe)
npm run typecheck    # Strict TypeScript checks across all workspaces
```

### Verification Results Summary
- **Unit & Integration:** 49 tests passing (>99% coverage on finance engine, double-entry ledger, tomato grading, and advisor).
- **Playwright Golden Path:** All 8 steps passing in 11.2s (Price advice → Hold in pod → Scale intake → Pod fault simulation → Collective dispatch → UPI payout → Rupee waterfall → Impact metrics).
- **Axe WCAG 2.2 AA:** All 7 surfaces passing with zero critical and zero serious violations.
- **Bundle Budget:** Web client bundle is **169.74 kB gzipped** (well within the `<180 kB` target).

---

## 🔒 Simulation Transparency & Security Disclosures

In strict adherence to Ground Rule 2 and Section 8.7:
1. **Simulation Transparency:** Every simulated hardware interface (RS-232 digital scale, 10-Tonne cool pod IoT sensors, phase-change materials thermal backup, UPI payment gateway, WhatsApp webhook, Voice IVR telephony) displays an explicit visual **"Simulated"** badge.
2. **Zero Runtime Credentials:** No production bank credentials, Twilio API tokens, or external cloud IoT keys are required. All behavior is deterministically reproducible offline or in local demonstration environments.
3. **Double-Entry Ledger Invariance:** All cash flows (Farmer Net + Hub Fee + Buyer Margin) strictly balance to the Consumer Retail Price with **₹0.00 delta**.

---

## 👥 Credits & Attribution

- **Original Research & Report:** Group 4 Student Report *"Improving Farmers' Income"*
  - Janhavi J (2320108)
  - Lakshmi Shree N (2320112)
  - Jananavarshini G (2320138)
  - Keshini K S (2320140)
  - Keerthana K (2320142)
  - Kaavya R (2320150)
- **Frontend Design System:** Built using `Leonxlnx/taste-skill` (`design-taste-frontend` v2.5.1) adhering to anti-slop guidelines and the `mint-pink-accounts` palette.
- **License:** MIT
