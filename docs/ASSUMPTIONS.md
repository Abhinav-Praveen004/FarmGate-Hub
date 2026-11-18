# FarmGate Hub: Assumptions and Defaults Log

This document records all engineering defaults, illustrative numbers, and working assumptions not explicitly provided in the original student innovation report (Group 4, "Improving Farmers' Income").

All values listed here must be displayed with an **"Illustrative"** badge or explanatory note in the UI.

---

## 1. Source Document Status
- `docs/source/CIN_CO2_Team_4.docx` was not present in the workspace at initialization.
- Section 4 of `FarmGate_Hub_Antigravity_Master_Prompt.md` (saved verbatim in `docs/BRIEF.md`) serves as the single source of truth for all facts, historical data, and model specifications.

---

## 2. Financial & Economics Model
1. **Network Hub-Year Cohort Curve**:
   - Hub Year 4 repeats Hub Year 3 metrics (500 farmers, 2,000 tonnes, ₹61.0 lakh revenue, ₹32.0 lakh operating cost, ₹29.0 lakh surplus).
   - This assumption is required to reconcile the Network Model (Section 4.7) exactly against the Cohort Progression (Section 4.6).
2. **Hub Operating Cost**:
   - Fixed per hub-year regardless of intra-year volume variations.
3. **Other Income in Network Model**:
   - Fixed at ₹1.0 lakh (Year 1), ₹3.0 lakh (Year 2), ₹6.0 lakh (Year 3), and ₹6.0 lakh (Year 4) per hub. Derived as: `Total Hub Revenue - (Tonnes × ₹0.0275 lakh)`. Kept constant in sensitivity analysis unless explicitly altered.
4. **Indicator 1 Definition (Net Price Realisation)**:
   - Defined as net income per kg delivered (after accounting for losses and fees paid) compared against the baseline realization without a hub.
5. **Operator Surplus Sharing**:
   - The student report notes that operators share in the hub's surplus, but omits the exact ratio.
   - **Default:** 50% retained by FPO/SHG operator collective, 50% retained by FarmGate Hub central network. Labelled: "Assumption, not in report".
6. **Produce-Backed Advance Cost / Fee**:
   - The student report specifies 50–70% advance on lot value, but does not define an interest or service fee.
   - **Default:** 0% interest / fee for the short holding period (advance repaid immediately at sale). Labelled: "Illustrative default".
7. **Screen 3 Receipt Reconciliation (Lot #198 & General)**:
   - Consumer paid ₹30.00/kg.
   - Farmer sale price: ₹13.50/kg (45.0% gross share).
   - Non-farmer share (₹16.50/kg) illustrative breakdown:
     - Transport: ₹3.00/kg
     - Handling & wastage: ₹3.50/kg
     - Retailer & wholesaler margin: ₹10.00/kg
   - Hub fee: ₹1.50 flat + 3% of ₹13.50 (₹0.405) = ₹1.905/kg (displayed as ₹1.9/kg).
   - Net farmer payout: ₹13.50 - ₹1.905 = ₹11.595/kg (displayed as ₹11.6/kg).
   - For other crops/prices, the non-farmer share is scaled proportionally.

---

## 3. Operations, Grading & Quality
1. **Grading Thresholds (Tomato)**:
   - **Grade A**: Blemish $\le 5\%$, Firmness $\ge 4/5$. Price factor: 100% of best bid.
   - **Grade B**: Blemish $\le 15\%$, Firmness $\ge 3/5$. Price factor: 85% of best bid.
   - **Grade C**: All others. Routed to food processing partner at flat rate of ₹4.00/kg.
   - All thresholds and price factors are configurable per crop.
2. **Floor Price**:
   - FPO floor price for Tomato default: ₹11.00/kg.
3. **Cool Pod Specifications**:
   - Physical capacity: 10,000 kg (10 tonnes).
   - Ideal temperature band for tomato: 10°C to 13°C.
   - Humidity band: 85% to 90% RH.
   - Telemetry drift on power cut: thermal reserve drains over 8 hours; temperature drifts toward ambient at +0.8°C/hr.

---

## 4. UI, Languages & Personas
1. **Localization**:
   - Languages: English (`en`), Hindi (`hi`), Tamil (`ta`).
   - All machine-generated translations must be reviewed by native speakers prior to real-world agricultural deployment.
2. **Demo Personas**:
   - All farmer and buyer profiles are fictional composites for demo purposes:
     - Farmer: Meena (+91 00000 00001, `meena@demo`)
     - Hub Operator: Ravi (+91 00000 00002, `ravi@demo`)
     - Buyer: Annapurna Kirana Network (`buyer1@demo`)
     - Investor: Demo Evaluator (`investor@demo`)
3. **Simulated Badging**:
   - All simulated subsystems (UPI payouts, WhatsApp threads, voice IVR synthesis, weighing scale readings, cool-room sensors) display a prominent **"Simulated"** badge.
   - All KPI actuals in demo mode display a **"Demo data"** badge.
