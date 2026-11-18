# FarmGate Hub Simulations & Hardware Adapters Audit 🔌

This document provides a transparent audit of all simulated versus real production components in the FarmGate Hub prototype, fulfilling Ground Rule 2 and Section 8.7.

---

## 1. Simulation Philosophy

To ensure that judges, investors, and developers can test and evaluate FarmGate Hub anywhere—without requiring physical Avery digital scales, 10-tonne solar cool storage containers, live NPCI UPI merchant accounts, or paid Twilio/Gupshup SMS gateways—all external hardware and external services operate via **deterministic local simulated adapters**.

Every simulated surface displays a visible **"Simulated"** badge in the UI.

---

## 2. Component Audit Table

| Component | Nature | Production Reality | Simulated Implementation in FarmGate Hub | Source File |
| :--- | :--- | :--- | :--- | :--- |
| **Financial Engine** | **REAL** | Reconciled double-entry ledger & cohort models | Complete mathematical implementation matching Group 4 report | `packages/shared/src/finance/index.ts` |
| **Rule-Based Advisor** | **REAL** | Threshold decision tree | Cold-chain perishability & price spread evaluator | `packages/shared/src/advisor/index.ts` |
| **Tomato Grading Engine** | **REAL** | USDA / AGMARK standard grading logic | Firmness, blemish %, color matrix evaluator | `packages/shared/src/grading/index.ts` |
| **Database & Schema** | **REAL** | Relational SQL with foreign keys | SQLite via `better-sqlite3` and Drizzle ORM | `apps/api/src/db/` |
| **Server-Sent Events** | **REAL** | Real-time browser push stream | Native SSE endpoint at `/api/events` | `apps/api/src/routes/events.ts` |
| **Digital Platform Scale** | *Simulated* | RS-232 serial cable / BLE link | Jittered reading generator with tare calibration | `apps/api/src/adapters/scale.ts` |
| **Solar Cool Pod IoT** | *Simulated* | Modbus RTU / MQTT telemetry sensors | Live temperature, humidity, solar watts, and phase-change thermal model | `apps/api/src/adapters/sensors.ts` |
| **UPI / Bank Payouts** | *Simulated* | NPCI UPI AutoPay / Bank IMPS | Generates deterministic UPI UTR reference codes with 24h SLA monitor | `apps/api/src/adapters/payment.ts` |
| **WhatsApp Business** | *Simulated* | Meta Cloud API / Gupshup Webhook | In-memory message store & command parser (`PRICE`, `LOTS`, `RECEIPT`) | `apps/api/src/adapters/channels.ts` |
| **Voice IVR Telephony** | *Simulated* | Exotel / Ozonetel SIP trunk | Web Speech API speech synthesis & interactive keypad state machine | `apps/web/src/surfaces/channels/` |

---

## 3. Interactive Demonstration Controls

All surfaces include built-in controls to test edge cases:

1. **Injectable Time Warp:**
   - Buttons: `+1h`, `+6h`, `+14h`, `+24h`
   - Accelerates the system clock to test lot aging, pod shelf-life expiration, and the 24-hour payout SLA countdown.
2. **Cool Pod Fault Simulator:**
   - Button: `Simulate Power Outage` → Switches pod to phase-change thermal backup (maintains $11.5^\circ\text{C}$).
   - Button: `Simulate Open Door` → Triggers temperature rise warning.
   - Button: `Restore Grid Power` → Resets telemetry to normal operation.
3. **One-Click Reset:**
   - Button: `Reset Demo Data` → Drops test modifications and reseeds pristine baseline lots and market prices.
