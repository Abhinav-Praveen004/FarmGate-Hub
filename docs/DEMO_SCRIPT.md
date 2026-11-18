# FarmGate Hub Demonstration Script (Judge & Investor Walkthrough) ⏱️

This step-by-step presentation script guides judges and evaluators through a seamless live demo of FarmGate Hub.

---

## ⏱️ 5-Minute Executive Walkthrough

### Minute 0:00 – The Hook: The Post-Harvest Leak
- **URL:** [`http://localhost:4000`](http://localhost:4000) (Pitch Site)
- **Visual:** Scroll to *"The Leak"* interactive simulator.
- **Narrative:** 
  > *"Every harvest season, Indian smallholders lose 25% of their tomatoes to distress sales and lack of storage. Today, farmers realize only 33% of the consumer rupee. FarmGate Hub introduces hyper-local micro-cold storage to lift that share to 45%."*

---

### Minute 1:00 – Farmer Decision: Advice, Not Automation (Ground Rule 5)
- **URL:** [`http://localhost:5173/farmer`](http://localhost:5173/farmer)
- **Visual:** Screen 1 (Today's Price). Select *Hybrid Tomato*.
- **Actions:**
  1. Highlight the three price points: Local Mandi ($₹9/\text{kg}$), Best Buyer Bid ($₹14/\text{kg}$), Collective Floor ($₹11/\text{kg}$).
  2. Click **"Listen"** to demonstrate Web Speech audio playback in Hindi or Tamil.
  3. Click **"HOLD IN POD"** → Select **48 Hours** → Confirm.
- **Narrative:**
  > *"Notice that the app advises, but the farmer decides. Ramesh locks in an ₹11 floor price with 48 hours of safe cool-pod holding."*

---

### Minute 2:00 – Village Hub Intake & Scale Capture
- **URL:** [`http://localhost:5173/hub`](http://localhost:5173/hub)
- **Visual:** Intake Tab.
- **Actions:**
  1. Select arrived farmer *Ramesh Chandra*.
  2. Click **"Capture Scale"** to read $120.40\text{ kg}$ from the simulated RS-232 digital scale.
  3. Run the 30-second grading checklist: Blemish $3\%$, Firmness $4/5 \implies$ **Grade A**.
  4. Inspect the thermal QR sticker preview and click **"Confirm Intake & Move to Pod"**.
- **Narrative:**
  > *"The hub operator verifies tare weight and grade in under 30 seconds. A QR code is generated for complete traceability."*

---

### Minute 3:00 – Cool Pod Telemetry & Collective Wholesale Dispatch
- **Visual:** Switch to **"Cool Pod Board"** tab, then **"Collective Loads"** tab.
- **Actions:**
  1. On Cool Pod Board, click **"Simulate Power Outage"** to demonstrate the phase-change material (PCM) backup maintaining $11.5^\circ\text{C}$. Click **"Restore Grid Power"**.
  2. On Collective Loads tab, select buyer order *ORD-771* (Annapurna Retail Network, $500\text{ kg} @ ₹14.00/\text{kg}$, 100% Escrow Cleared).
  3. Click **"Confirm Sale & Dispatch Load #CL-04"**.
- **Narrative:**
  > *"Instead of selling single crates at distress rates, the hub aggregates lots from multiple smallholders into a 500 kg wholesale load, automatically activating our 24-hour payout SLA."*

---

### Minute 4:00 – Instant Settlement & Double-Entry Ledger Proof
- **Visual:** Switch to **"Advances & Payouts"** tab, then return to Farmer App (`/farmer` → Receipt).
- **Actions:**
  1. On Payouts tab, click **"Settle UPI"** on Ramesh's pending lot payout.
  2. In Farmer App Screen 3 (*Where Your Rupee Went*), highlight the transparent receipt:
     - Consumer Retail: $₹30.00/\text{kg}$
     - Farmer Realisation: $₹13.50/\text{kg}$ ($45\%$ share)
     - Hub Fee: $-₹1.90/\text{kg}$
     - Net Payout: $₹11.60/\text{kg}$
     - Ledger Delta: **$₹0.00$ Balanced**.
- **Narrative:**
  > *"Every single rupee is accounted for. Zero hidden cuts. Money is in the farmer's bank account via UPI in less than 24 hours."*

---

### Minute 5:00 – Impact Scorecards & Seed Investment Ask
- **URL:** [`http://localhost:5173/impact`](http://localhost:5173/impact)
- **Visual:** 5 KPI Scorecards + 4-Year Cohort Model + Funding & Market.
- **Narrative:**
  > *"Across our 4-year model, scaling to 100 micro-hubs generates ₹40.5 Cr in network revenue and lifts smallholder incomes by +27.2%. We are seeking a ₹5.00 Cr seed round to deploy our first 10 hubs in Kolar and Madanapalle."*

---

## 📱 Bonus Deep Dives for Judges

1. **Feature Phone IVR Dialer:** Open [`http://localhost:5173/channels`](http://localhost:5173/channels) → Select *Voice IVR* → Click *Dial Toll-Free (1800-FARMGATE)* → Press `1` for today's price.
2. **Consumer QR Traceability:** Open [`http://localhost:5173/t/LOT-214`](http://localhost:5173/t/LOT-214) to see the consumer-facing provenance certificate verifying Ramesh Chandra's farm gate.
3. **Wholesale Buyer Portal:** Open [`http://localhost:5173/buyer`](http://localhost:5173/buyer) to inspect the 100% escrow-locked order catalog and live refrigerated truck dispatch tracker.
