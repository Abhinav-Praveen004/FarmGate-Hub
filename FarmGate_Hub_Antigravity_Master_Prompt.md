# FarmGate Hub: master build prompt for Google Antigravity

You are the lead engineer, designer and tester on this project. Read this whole prompt before you act. When you finish reading, go to section 12 and do only what it says.

If instructions conflict, use this order: (1) the ground rules in section 2, (2) the facts in section 4, (3) the acceptance checks in section 9, (4) the design direction in section 8, (5) your own judgment, logged in docs/ASSUMPTIONS.md. For visual decisions on the public site, the taste skill's own rules win over section 8.2, unless they break a ground rule or a fact.

## 1. Mission

Build a working, demo-ready prototype of FarmGate Hub, the solution proposed in a student innovation report (Group 4, "Improving Farmers' Income", course "Creativity and Innovation"). Section 4 holds the report's content and is the source of truth for facts and numbers.

FarmGate Hub puts a solar-assisted cold room (the "cool pod"), a grading shed and a price-transparency service at the farm gate. Each hub serves 300 to 500 farmers and is run by the farmers' own collective (an FPO or a women's self-help group). The company supplies technology, training, buyer links and quality standards.

The report tested the claim "farmers earn less only because intermediaries are involved" and found it partly true but misleading. So FarmGate Hub replaces the middleman's useful functions (storage, aggregation, advance payment, price information). It does not try to remove the person. Every screen, message and line of copy must reflect that. Never blame or caricature intermediaries. The framing is "fix the leaks, not the people".

You are building the software layer and the pitch around it:

1. A public pitch site.
2. A farmer app (mobile first, three languages).
3. A hub operator console.
4. A buyer portal.
5. An impact and investor dashboard.
6. One seeded backend that simulates payments, WhatsApp, voice calls, mandi prices, a weighing scale and cold-room sensors.

The audience is course evaluators, investors and FPO partners watching a five-minute live demo. It should also be a sound base for a real pilot, so build working software, not screenshots.

## 2. Ground rules

1. Facts. Use only the numbers in section 4. Where the report is silent, choose a sensible default, label it "illustrative" in the UI, and log it in docs/ASSUMPTIONS.md. Never invent statistics, quotes, testimonials, partner names or logos. The report asks for short quotes from farmer or FPO interviews: leave an empty, flagged slot and do not write fake ones.
2. Honest simulation. UPI payouts, WhatsApp, voice calls, mandi prices, the scale, the QR printer and the cold-room sensors are simulated behind adapter interfaces. Every simulated surface shows a "Simulated" badge. No real credentials. No runtime calls to third-party APIs. After installation the whole system runs offline from seeded data, including fonts and photographs (download and bundle them locally).
3. Fictional people only. Names, phone numbers (+91 00000 000xx) and UPI IDs (name@demo) are made up. KPI "actuals" in the seed are demo data, not pilot results, and carry a visible "Demo data" badge.
4. One home for every number. Report figures live in packages/shared (evidence and finance modules). Components never hard-code them. The API and the dashboard use the same finance engine.
5. The farmer decides. The app advises and explains in plain words. It never sells, holds or pays out without a tap, except where the farmer ticked an explicit opt-in (section 6.3).
6. Real conditions. Design for low literacy, patchy connectivity, bright sunlight and a mid-range Android phone on slow 4G: icon plus text plus voice, large touch targets, high contrast, small bundles.
7. Scope discipline. Build P0 first. Do not start P1 until P0 passes its gates. Use the stack in section 7. Ask me before adding paid services, deployments, or dependencies that need native builds.
8. Hygiene. Stay inside this project folder. No sudo, no global installs, no destructive git commands. Commit at the end of each milestone with conventional commit messages. Never commit secrets; ship a .env.example only.
9. Getting unstuck. If the same step fails twice, write the blocker to docs/BLOCKERS.md, take the best workaround, continue, and mention it in the walkthrough. Ask me a question only when the answer would change the architecture.

## 3. How to work in Antigravity

Mode and review. Use Planning mode. Your first deliverable is the Implementation Plan artifact: architecture, data model, API list, tasks per milestone, risks, the assumptions you are making, and at most five questions. Then stop and wait for my review. After I approve, produce the Task List artifact and keep it current.

Gates. Stop and wait for me at G1 (after the plan), G2 (end of M6) and G3 (end of M8). Between gates, keep going without asking for approval.

Verify in a browser. For every UI milestone, start the app and use Antigravity's browser to walk the flows. Capture screenshots at 390x844, 820x1180 and 1440x900 and attach them to the Walkthrough artifact. Fix what you find before moving on. At M8, record the golden path (section 10) as a browser recording.

Keep context from drifting. Save section 4 verbatim as docs/BRIEF.md. Keep docs/PROGRESS.md as a running log, one line per finished task. Write the rules and workflows from section 11 into .agents/rules/ and .agents/workflows/ (Antigravity caps each file at 12,000 characters; if the Customizations panel does not list them, mirror them under .agent/). Re-read docs/BRIEF.md and the rules file at the start of every milestone.

Parallel work. After M3 you may use subagents for M4, M5 and M6, but only if each owns a separate directory (section 7). packages/shared and packages/ui belong to the main agent. Subagents propose changes to them and the main agent applies them. No two agents edit the same file.

Terminal. Prefer npm scripts, batch installs, and use non-interactive flags.

Progress notes. After each milestone, post a short note: what is done, the evidence (tests or screenshots), what is next, and any blocker.

## 4. Brief: the report's content (source of truth)

### 4.1 Identity and story

- Name: FarmGate Hub. Tagline: Keep the Harvest, Keep the Value.
- Challenge: how can farmers earn better returns from their agricultural produce?
- Team (credits only): Janhavi J, Lakshmi Shree N, Jananavarshini G, Keshini K S, Keerthana K, Kaavya R. Course: Creativity and Innovation.
- Central image: a farmer's bucket leaks at every step to market (spoilage, distress sales, commissions, missing information). Policy keeps pouring in more water (higher production). FarmGate Hub plugs the holes.
- The line the product gives a farmer: "I will wait, because I can."
- Idea scoring (out of 40; weights: income x3, feasibility x2, then cost, scale, novelty): marketplace app 27, FarmGate Hub 34 (chosen), farmer-owned processing unit 24, price-information SMS service 28. The hub absorbs the app and the price service as modules and routes Grade-C produce to processing partners.

### 4.2 Problem evidence

| Indicator | Evidence | Source |
|---|---|---|
| Farm household income | ₹10,218 per month (2018-19); ₹3,798 from crops; ₹4,063 (about 40%) from wages | NSS 77th Round (NSO/MoSPI) |
| Small holdings | 70.4% of agricultural households own less than one hectare | NSS 77th Round |
| Farmer share of consumer price | Tomato 33%, onion 36%, potato 37%, banana 31%, mango 43%; dairy about 70% | RBI Working Paper 08/2024 and related RBI studies, 2024 |
| Debt | 50.2% of agricultural households are indebted; average loan ₹74,121; about 30% from non-institutional sources | NSS 77th Round |
| Post-harvest loss, volume | About 19.3 million tonnes of fruit and vegetables lost (7.36 + 11.97 Mt); tomato loss about 11.6% | NABCONS 2022; Lok Sabha reply, Dec 2025 |
| Post-harvest loss, value | About ₹1.52 lakh crore a year across commodities | NABCONS 2022 (MoFPI) |
| Cold storage access | Only about 10% of perishables reach cold storage, mostly potatoes | IIM Calcutta study, via The Tribune |
| Trader margins | 69 to 94% of the farm-to-consumer price gap in Ahmedabad | IIM Ahmedabad working paper (Gandhi and Namboodiri) |
| Direct selling | A Chennai direct-selling market gave farmers 85 to 95% of the consumer price (older study, indicative) | IIM Ahmedabad working paper |
| e-NAM | 1,656 mandis linked; ₹4.84 lakh crore of trade (March 2026); in Hingoli, 10,437 of 28,197 registered farmers had traded | Lok Sabha replies (2025); Vision IAS (March 2026) |
| FPOs | All 10,000 targeted FPOs are registered; many lack infrastructure and working capital | SFAC and agriculture ministry releases |
| Cold-chain results | A Gates Foundation-sponsored low-cost storage pilot cut losses about 60%; an NCCD mandarin cold-chain study found 76% | The Tribune; Outlook India |

### 4.3 The assumption test

Assumption: "Farmers earn less only because intermediaries are involved." Verdict: partially true, and misleading as a full explanation.

| Evidence | What it tells us |
|---|---|
| Tomato farmers get 33%, dairy farmers about 70% | Chain structure matters. Dairy still has intermediaries (cooperatives, processors, retailers). |
| Direct markets in Chennai gave 85 to 95% | Cutting layers helps where volumes are small and local. |
| 5 to 15% of fruit and vegetables is lost before sale | Part of the gap is physical loss, not anyone's profit. |
| Intermediaries lend, transport and absorb risk | Removing them without replacing those functions can leave farmers worse off. |
| e-NAM adoption is partial | Technology alone does not fix storage, logistics and trust. |

### 4.4 How a hub works

- Physical hub: a 10-tonne solar-assisted cool pod with thermal backup, a digital scale, a grading table and crate racks. Serves 300 to 500 farmers in a cluster of 8 to 15 villages. Run by a local FPO or women's SHG. Starts with one crop cluster.
- Flow: (1) Bring: farmers deliver in the morning; each lot is weighed digitally, QR-tagged and graded A, B or C. (2) Cool: the lot goes into the cool pod, or straight to a buyer if an order is confirmed. (3) Decide: the farmer sees nearby market prices and buyer bids on the app, WhatsApp or a voice call, and can hold for 24 to 72 hours if the mandi price is below a floor. (4) Sell together: lots are combined into larger graded loads for pre-committed buyers. (5) Get paid and see the truth: UPI payment within 24 hours and a "Where Your Rupee Went" receipt.
- Branch in the service flow: if a buyer order is confirmed, dispatch directly and pay within 24 hours. If not, hold in the pod (24 to 72 hours), send a price alert, sell collectively, then pay. Grade-C produce goes to a processing partner (waste-to-value).
- Features: solar-assisted cool pod with thermal backup; digital weighing, grading and QR traceability; Hold-or-Sell alerts (app, WhatsApp, voice); produce-backed advance of 50 to 70% of lot value; waste-to-value channel for Grade-C.
- Users: small and marginal fruit and vegetable farmers (primary); FPOs and women's SHGs as operators; buyers (kirana networks, restaurants, institutional kitchens, processors); banks and insurers that want reliable farmer data.

### 4.5 Money rules

- Storage and grading fee: ₹1.50 per kg, paid by the farmer.
- Collective-selling commission: 5% (3% farmer side, 2% buyer side).
- Other income: bank, insurance and input referrals; Grade-C sales; from Year 3 a hub-as-a-service licence for FPOs.
- Operators share the hub's surplus (the split is not in the report).
- Produce-backed advance: 50 to 70% of lot value (its cost is not in the report).
- Payout: UPI within 24 hours of the sale.
- Hub capital: about ₹25 lakh. Average realised price: ₹25/kg. Revenue per kg: ₹1.50 + 5% of ₹25 = ₹2.75.
- Fee check on the sample receipt: ₹1.50 + 3% of ₹13.5 = ₹1.905, shown as ₹1.9.

### 4.6 One hub over time (₹ lakh)

| Hub year | Farmers | Tonnes | Revenue | Operating cost | Surplus |
|---|---|---|---|---|---|
| Year 1 | 200 | 600 | 17.5 | 26 | -8.5 |
| Year 2 | 350 | 1,200 | 36.0 | 28 | +8.0 |
| Year 3 | 500 | 2,000 | 61.0 | 32 | +29.0 |

Cumulative surplus after Year 3 is ₹28.5 lakh against ₹25 lakh of capital: payback in about three years. MIDH cold-chain subsidy and Agriculture Infrastructure Fund loans can shorten it (verify current norms before claiming anything). Engineering assumption: Year 4 for a hub repeats Year 3. The network table below only reconciles under that assumption.

### 4.7 Network model (₹ crore)

| | Year 1 | Year 2 | Year 3 | Year 4 |
|---|---|---|---|---|
| Hubs live | 3 | 10 | 25 | 25 |
| Farmers served | 600 | 2,450 | 6,950 | 10,250 |
| Produce handled (tonnes) | 1,800 | 7,800 | 23,400 | 38,000 |
| Revenue | 0.53 | 2.31 | 6.98 | 11.50 |
| Hub operating cost | 0.78 | 2.66 | 6.82 | 7.40 |
| Central team, technology, training | 0.60 | 1.00 | 1.60 | 2.00 |
| EBITDA | -0.86 | -1.36 | -1.45 | +2.10 (18%) |
| Hub capital spend | 0.75 | 1.75 | 3.75 | 0 |
| Extra farmer income created | 0.68 | 2.79 | 7.92 | 11.69 |

Reconciliation identities. Use them as tests.

- Cohorts: 3 hubs start in Year 1, 7 in Year 2, 15 in Year 3. Each cohort follows the hub-year curve in 4.6, with hub Year 4 equal to Year 3. Network values are the sum over cohorts.
- Hub revenue in ₹ lakh = tonnes x 0.0275 + other income, where other income is 1.0, 3.0, 6.0 and 6.0 lakh in hub years 1 to 4 (derived: the report's hub revenue minus fee-and-commission revenue). Keep other income fixed in sensitivity runs unless the user changes it.
- Hub capital spend = new hubs x ₹25 lakh.
- Extra farmer income = farmers served x ₹11,400.
- EBITDA = revenue - hub operating cost - central cost. Treat hub operating cost as fixed per hub-year (state this as an assumption).
- Do all arithmetic in integer paise (or a decimal library). Round half away from zero for display. Example: Year 1 EBITDA is -0.855 crore and prints as -0.86.
- By Year 4 the company creates about ₹1 of extra farmer income per ₹1 of its revenue (11.69 against 11.50).

### 4.8 Farmer economics, one tonne of tomatoes (illustrative, retail price ₹30/kg)

| | Today | With a hub |
|---|---|---|
| Loss | 11.6% | 4% |
| Kg sold | 884 | 960 |
| Farmer share of ₹30 | 33% = ₹9.9/kg | 45% = ₹13.5/kg |
| Fees | none | about ₹1.9/kg |
| Farmer income per tonne | about ₹8,750 | about ₹11,100 |

Gain: about 27%. The engine computes the fee from the rules (₹1.50 + 3% of the farmer price), so expect ₹8,751.6 and ₹11,131.2 (uplift 27.2%). Tests accept ₹11,100 plus or minus ₹50.

Household view: crop income ₹3,798 a month x about 25% is about ₹950 a month, or about ₹11,400 a year, if the hub handles most of the household's marketed produce. The calculator shows the computed value (about ₹11,394); the network model uses the report's ₹11,400. At maturity, 25 hubs x 500 farmers = 12,500 farmers, about ₹14 crore a year.

### 4.9 Funding, market, targets

- Ask: ₹5 crore seed. Use of funds: first 10 hubs ₹2.5 crore; technology ₹0.7 crore; team and operations ₹1.3 crore; advance-payment float ₹0.5 crore. The rest of the capital comes from subsidy, AIF-backed loans, FPO co-investment and a follow-on round.
- TAM about ₹39,000 crore a year (19.3 Mt lost x an assumed ₹20/kg farm-gate value; the engine gives ₹38,600 crore). SAM about ₹610 crore a year (10% of 10,000 FPOs = 1,000 hubs x ₹0.61 crore at maturity). SOM about ₹7 crore a year (25 hubs by Year 3; the model gives ₹6.98 crore).
- Most sensitive assumptions: hub volume, average price per kg, speed of farmer adoption.
- All figures are illustrative student estimates to be tested in a pilot. Say so wherever they appear.

### 4.10 Phases and indicators

| Phase | Timing | Actions | Success gate |
|---|---|---|---|
| 0. Learn | Months 0 to 3 | Interview 30 farmers and 10 buyers; map one crop cluster; collect baselines | Baselines set; 100 farmers sign up |
| 1. Pilot | Months 3 to 9 | One hub with an FPO for a full season on 1 to 2 crops | Loss at hub 4% or less; net realisation up 20% or more |
| 2. Prove | Months 9 to 24 | Grow to 3, then 10 hubs; launch app, voice service, advances | 3 hubs at operating breakeven by month 18 to 24 |
| 3. Scale | Months 24 to 36 | 25 hubs; licence model for partner FPOs | Positive EBITDA in Year 4 |

Five indicators: (1) net price realisation per kg, +20 to 25% over baseline; (2) post-harvest loss at the hub, 4% or lower; (3) farmer share of consumer price, 45% or higher; (4) payment within 24 hours; (5) hub operating breakeven within 18 to 24 months. Define indicator 1 as net income per kg delivered (after losses and fees) and note that choice in docs/ASSUMPTIONS.md.

### 4.11 Competition

| | Mandi | e-NAM | Ninjacart / DeHaat | FarmGate Hub |
|---|---|---|---|---|
| Farmer-owned | No | No | No | Yes |
| Storage at farm gate | No | No | Partial | Yes |
| Fixes the cause of loss | No | No | Partly | Yes |
| Works for low-literacy users | Yes | Limited | App-led | App, WhatsApp, voice, in person |
| Farmer sees price breakdown | No | Partly | Rarely | Yes, on every receipt |

### 4.12 Risks and mitigations

- Farmers keep selling to the agent who gave credit: produce-backed advance, same-day payment, start with farmers who want an alternative.
- Buyers do not honour orders: pre-commitment, small deposits, a multi-buyer pool.
- Cool pod underused: multi-crop use, rent space to nearby traders.
- Unreliable power: solar plus thermal backup.
- Capital intensity: asset-light model, the collective co-invests, subsidy and AIF-backed loans.

### 4.13 The three prototype screens (exact content)

- Screen 1, Today's price: Tomato, mandi ₹9/kg, buyer bid ₹14/kg. Hold 1 day: expected ₹13 to 15. Buttons: SELL and HOLD.
- Screen 2, My lots: Lot #214, 120 kg, Grade A, in cool pod 14 hours, buyer match 78%.
- Screen 3, Where your rupee went: Consumer paid ₹30/kg. Farmer received ₹13.5 (45%). Hub fee ₹1.9. Transport, handling and retailer margin shown.

The report is slightly loose on Screen 3 (it says "received ₹13.5" but the economics deduct a ₹1.9 fee). Resolve it this way: sale price ₹13.5 (45%), minus hub fee ₹1.9, equals ₹11.6/kg paid to the farmer. This matches the ₹11,100 per tonne maths. Seed a sold lot, Lot #198, that reproduces Screen 3 exactly.

### 4.14 Impact and calls to action

- Economic: about ₹11,400 more crop income per household a year; about ₹14 crore a year across 12,500 farmers at 25 hubs.
- Social: jobs for rural youth and women, farmer-owned assets, less distress selling.
- Environmental: less food, water, land and fuel wasted; solar-powered cooling.
- Consumer: fresher produce and steadier prices. National goals: farm-income agenda, UN SDGs 1, 2 and 12.
- Calls to action: investors, join the ₹5 crore seed round. FPOs and SHGs, be the first hub partner. Buyers, pre-commit to graded produce from the pilot. Banks and funders, support AIF-linked loans for hub assets. Mentors, help measure pilot results rigorously.

### 4.15 Sources (for the sources page)

NSO/MoSPI NSS 77th Round (2018-19), via PIB and Down To Earth. RBI Working Paper 08/2024 (tomato, onion, potato), via RBI, Scroll and Business Standard. NABCONS (2022) and ICAR-CIPHET (2015) loss studies. Lok Sabha reply of 11 Dec 2025. IndiaSpend. The Tribune (Gates pilot, IIM Calcutta study). IIM Ahmedabad working paper by Gandhi and Namboodiri. Lok Sabha replies on e-NAM (July 2025). SFAC and agriculture ministry releases on FPOs. Vision IAS (March 2026). YourStory, Entrepreneur and The Better India (company-reported figures). Outlook India (NCCD study). Business Today, 2018 (quote). Assumptions: retail tomato ₹30/kg; average realised price ₹25/kg; farmer share rising to 45%; loss falling to 4%; hub capital ₹25 lakh; subsidy and loan terms to be checked against current guidelines. The farmer character in the pitch is a composite for storytelling.

## 5. Scope

P0 must ship. P1 starts only after G2. P2 only if time remains.

### 5.1 Farmer app (route /farmer, mobile first)

P0:
- Today's price (Screen 1): one card per crop with mandi price, best buyer bid, the hold-1-day range, the hub's floor price, an advice sentence, and large SELL and HOLD buttons.
- My lots (Screen 2): list and lot detail with a timeline (received, graded, in pod, alert, sold, paid), grade, weight, hours in pod, temperature summary, buyer match percentage with its breakdown, and the lot's QR code.
- Where your rupee went (Screen 3): the receipt with the waterfall component (section 8.3).
- Money tab: payout status with a 24-hour clock, history, and the advance flow (request an advance on a lot, see it repaid at sale).
- WhatsApp-style thread: shows the alerts the system sends and answers three commands (price, lots, receipt) in all three languages.
- Language switch: English, Hindi, Tamil for every farmer-facing string, remembered per device.
- Listen button on advice and on the receipt (browser speech synthesis; if the voice for a language is missing, say so in text).

P1: installable PWA with offline shell and last-known data; queue SELL and HOLD taps offline and replay them; share the receipt as an image.

### 5.2 Hub console (route /hub, tablet first)

P0:
- Intake wizard: pick or add a farmer, choose the crop, weigh with the simulated scale (live readout, then Capture), enter quality checks, get a suggested grade (override needs a reason), print the QR label (print stylesheet), create the lot.
- Cool pod board: capacity (10,000 kg), occupancy, lots with hours in pod and hold-limit countdown, temperature, humidity, solar output, backup state, and buttons that simulate a power cut or an open door.
- Orders and collective loads: list buyer orders, build a load from graded lots, see buyer match, confirm the sale, dispatch.
- Advances: approve or decline requests.
- Payouts queue: 24-hour SLA clocks, mark paid through the simulated UPI provider.

P1: Grade-C routing to the processing partner; farmer directory; end-of-day report; payout failures and retries.
P2: hub P&L against the hub-year curve, with an operator surplus-share slider (default 50%, labelled "assumption, not in report").

### 5.3 Buyer portal (route /buyer), P1

Standing orders (crop, grade, quantity, price per kg, delivery window); available graded stock aggregated by crop and grade with no farmer personal details; pre-commit with a small simulated deposit; public QR traceability page at /t/:code showing crop, grade, intake time, hub, hours in pod, temperature range, and the farmer's first name and village only if the farmer opted in.

### 5.4 Impact and investor dashboard (route /impact)

P0:
- KPI scorecard: the five indicators against targets, with seeded demo values (show a mix of on target and slightly off target, so it reads honestly), and the "Demo data" badge.
- Farmer economics calculator (per tonne): inputs for retail price, loss before and after, farmer share before and after, fee per kg. Shows ₹8,750 against ₹11,100 and the percentage gain, plus the household view.
- Network model: cohort and hub-year inputs, chart of revenue, EBITDA and extra farmer income for Years 1 to 4, and a table that reproduces 4.7. A "matches the report" badge appears when inputs equal the report's defaults.
- Funding and market: use of funds, TAM, SAM, SOM.
- Sensitivity: sliders for hub volume, average price per kg and adoption speed, with live effect on Year 4 EBITDA and payback.

P1: sources and assumptions page (from 4.15 and docs/ASSUMPTIONS.md); risk register (4.12); phase-gate tracker (4.10); tornado chart for the sensitivities.

### 5.5 Public pitch site (apps/site), P0

One long page, built with the taste skill (section 8). Content outline in 8.5.

### 5.6 Channels (route /channels), P1

Standalone WhatsApp-style chat simulator with button replies, and a voice menu simulator (press 1 for price, 2 for lots, 3 to hold or sell) spoken with speech synthesis. Both call the same API as the app, through a ChannelAdapter interface that a real provider could replace later.

### 5.7 Demo mode (route /demo), P0

Persona switcher (farmer, hub operator, buyer, investor), time warp (+1h, +6h, +14h, +24h) that moves every clock in the system, reset to seed, scenario loader (golden path at step N). P1: a guided pitch overlay with seven or eight steps that names the next click.

## 6. Domain rules

### 6.1 Lot states

received -> graded -> (dispatched | in_pod) -> sold -> payout_pending -> paid -> receipted.
A Grade-C lot goes graded -> routed_to_processor -> paid. Any state can raise an exception flag for the operator. Every transition writes an event with time, actor and reason.

### 6.2 Grading

Rule-based and configurable per crop. Tomato inputs: blemish percent, firmness (1 to 5), size class, ripeness. Illustrative thresholds: A if blemish is 5% or less and firmness is 4 or more; B if blemish is 15% or less and firmness is 3 or more; otherwise C. Grade price factors (illustrative): A 100%, B 85%, C a flat processing price of ₹4/kg. The operator may override with a required reason, written to the audit log.

### 6.3 Prices, floor and advice

- Each crop has a seeded daily mandi price series (14 days of history, a few intraday points). Best bid comes from open buyer orders. The hub (FPO) sets a floor price per crop; tomato default ₹11/kg (illustrative).
- Forecast for a horizon is a low, mid and high range built from the recent trend and volatility. Tune the seed so the Screen 1 state reads exactly mandi ₹9, bid ₹14, hold 1 day ₹13 to 15.
- Advice is rule-based and explained in one sentence. Recommend SELL if the best bid is at or above the floor and at or above the forecast mid. Recommend HOLD if the best bid is below the floor, the forecast high reaches the floor, and the pod's remaining hold time covers the horizon. Otherwise present a "close call" with both options and no recommendation. Always show mandi price, best bid, hold range, floor and hold time left.
- HOLD lets the farmer pick 24, 48 or 72 hours and tick an optional box: "sell automatically at the best bid when the time is up". The box is off by default. If it is off, the operator calls the farmer before the hold limit.
- Holding costs no extra fee within the hold limit (the ₹1.50/kg fee is flat).

### 6.4 Buyer match

A score from 0 to 100 between a lot and an order. Crop must match (hard filter). Weights: grade fit 30, quantity fit 25, price fit 20, delivery window 15, buyer reliability 10. Show the breakdown on tap. Tune the seed so Lot #214 against the kirana network's order scores 78.

### 6.5 Collective loads and fees

A load combines graded lots of one crop and grade to meet a buyer's order. Every lot in a load gets the same price per kg for its grade. The farmer pays ₹1.50/kg plus 3% of sale value. The buyer pays the price plus 2%. Fee lines appear on the receipt and in the ledger.

### 6.6 Advances

The farmer may request 50 to 70% of the estimated lot value (default 60%; estimate = weight x best bid, or the mandi price if there is no bid, x the grade factor). The operator approves within the hub's advance float. Repayment is deducted from sale proceeds automatically. The advance fee is not in the report: default 0, configurable, labelled illustrative.

### 6.6b Payouts and ledger

Payout is due within 24 hours of the sale and shows an SLA clock. The simulated UPI provider succeeds by default and can be told to fail for a demo. Keep a double-entry ledger (buyer payment, farmer payable, hub fee income, commission income, advance recovery). Ledger totals must always balance; add a test.

### 6.7 The receipt ("Where Your Rupee Went")

Waterfall for one kg: consumer paid (reference retail price, tomato ₹30/kg, labelled "reference price from market surveys, not observed at the hub"), then transport, handling and wastage, retailer and wholesaler margin, then the farmer's sale price with its percentage, then the hub fee, then what the farmer receives. Lot #198 must show ₹30, ₹13.5 (45%), ₹1.9 and ₹11.6. Illustrative split of the non-farmer ₹16.5 at that price: transport ₹3.0, handling and wastage ₹3.5, retailer and wholesaler margin ₹10.0; scale proportionally for other prices and label the split "illustrative". Add a marker for the typical tomato farmer share of 33% (RBI, 2024). Below the waterfall, show the rupee ledger for the lot (sale, fees, advance repaid, paid to you).

### 6.8 Cool pod simulation

Capacity 10,000 kg. Per-crop setpoint and humidity bands are configurable and illustrative. Telemetry: temperature, humidity, door state, solar output (a daily curve with cloud noise), thermal backup reserve, grid status. A power cut makes the thermal reserve drain and the temperature drift. An excursion above setpoint for a set period raises an alert to the operator and to affected farmers. Label everything "Simulated".

### 6.9 Simulation engine and clock

One injectable Clock. Pod hours, hold limits and payout SLA clocks all derive from it. The demo's time warp calls advance(hours), which processes scheduled events in order and deterministically (seeded random numbers, so every run gives the same numbers).

### 6.10 Channels

Each farmer has a language and a preferred channel (app, WhatsApp, voice). Events (lot received, price alert, sale confirmed, payout sent, pod excursion) create messages through the ChannelAdapter. The simulators display them.

## 7. Architecture and stack

```
farmgate-hub/
  apps/
    site/     static pitch site, built with the taste skill (port 4000)
    web/      React SPA: surfaces farmer, hub, buyer, impact, channels, demo (port 5173)
    api/      Hono API, SQLite, server-sent events (port 8787)
  packages/
    shared/   schemas, domain logic, finance engine, evidence data, i18n, seed fixtures
    ui/       design tokens, Tailwind theme, base and signature components
  e2e/        Playwright tests
  docs/       BRIEF, ASSUMPTIONS, PROGRESS, BLOCKERS, ARCHITECTURE, DEMO_SCRIPT, SIMULATIONS, pitch/
  .agents/    rules, workflows, skills
```

Stack (use current stable versions, pinned; check with `npm view <pkg> version` instead of guessing):
- Node 22+, npm workspaces, TypeScript strict everywhere, ESLint, Prettier.
- apps/web: React, Vite, React Router, TanStack Query, Zod, Tailwind CSS, Radix primitives (restyled completely from tokens), Motion for animation, a charting library styled from tokens, vite-plugin-pwa, qrcode.
- apps/api: Hono on Node, Zod validation, SQLite through better-sqlite3 and Drizzle ORM with migrations, server-sent events at /api/events.
- apps/site: the static pipeline of the taste skill (plain HTML, CSS and a little JavaScript).
- Tests: Vitest for unit and API tests, Playwright for end-to-end and axe accessibility checks.
- Scripts at the repo root: dev (starts site, web and api), seed, test, e2e, typecheck, lint, build, start (one process serving site at /, app at /app and API at /api), verify (runs everything).

Data rules: money in integer paise; weight in integer grams; timestamps in UTC ISO from the Clock; ids as ULIDs; formatting only at the edge. Seeds are idempotent and deterministic.

Adapters, each with a simulator and an interface: PaymentProvider (simulated UPI), ChannelProvider (WhatsApp and voice), PriceFeed (seeded), ScaleDevice, SensorFeed, LabelPrinter (browser print). Document how a real provider would replace each in docs/SIMULATIONS.md. Real UPI, WhatsApp Business and telephony need regulated providers and approvals, so say that plainly and build none of it now.

Auth: demo personas chosen on /demo (one hub operator, three farmers, one buyer, one investor viewer), with role checks in the API (a farmer sees only their own lots; a buyer sees aggregated stock only; an operator sees their hub). Keep the middleware shaped so phone-number OTP login could replace it later. Design for consent and data minimisation (India's DPDP Act) and store no personal data beyond what a screen needs.

Seed data: one hub and pod; 12 farmers; 4 buyers (a kirana network, a restaurant group, an institutional kitchen, a processor) and one processing partner; five crops (tomato, onion, potato, banana, mango) with 14 days of prices; about 40 lots across all states, including Lot #214 and Lot #198; open orders; payouts; receipts; demo KPI values.

Core endpoints (add what you need):

```
POST /api/demo/login {personaId}            GET /api/me
GET  /api/prices/:crop                      prices, best bid, floor, forecast, advice
GET  /api/farmers/me/lots                   GET /api/lots/:id
POST /api/lots/:id/decision                 {action: SELL|HOLD, holdHours?, autoSell?}
POST /api/advances                          POST /api/advances/:id/approve
POST /api/hub/intake                        GET /api/hub/pod
GET  /api/hub/orders                        POST /api/hub/loads, POST /api/hub/loads/:id/confirm
GET  /api/hub/payouts                       POST /api/hub/payouts/:id/settle
POST /api/buyer/orders                      GET /api/buyer/stock
GET  /api/receipts/:lotId
GET  /api/impact/kpis | economics | network | funding | sensitivity
POST /api/channels/whatsapp/inbound         GET /api/channels/threads
GET  /api/events                            server-sent events
POST /api/demo/advance {hours} | reset | scenario/:name | pod/:event
GET  /t/:code                               public traceability page
```

Directory ownership for parallel work: backend is apps/api; farmer, buyer, channels and demo surfaces are apps/web/src/surfaces/{farmer,buyer,channels,demo}; hub is apps/web/src/surfaces/hub; impact is apps/web/src/surfaces/impact; the site is apps/site.

## 8. Design direction and the taste skill

### 8.1 Using the taste skill (Leonxlnx/taste-skill)

The skill's install name is design-taste-frontend. As of its 2.5 line it is built to make coding agents produce a professional company website: it classifies the business, deals a palette and font pairing and a hero layout, enforces one design system, plain copy, one section per screen at desktop, equal left and right edges, real photographs and real product UI, and checks the page in headless Chrome at several widths with a finish gate. It needs Node 22+ and Chrome, Edge or Chromium. Read its SKILL.md for the current commands and follow its own procedure. Run the finish gate yourself; do not rely on hooks.

Make sure the skill is installed before M3. If it is missing, run this in the project folder and handle any prompts: `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" -a antigravity`. Then confirm it appears in the Customizations panel under Skills (workspace path .agents/skills/). If the CLI wrote it to .agent/skills/ and the panel does not list it, copy the folder to .agents/skills/.

How to apply it here:
- Public site (apps/site): run the skill's full pipeline. Use page kind "service": this is farm-gate infrastructure and software for a farmer-trust brand, so keep it calm, photo and type led, with no shaders or WebGL. For example, the first run is `node scripts/start.mjs deal --page service` from the skill's folder, but trust the skill's SKILL.md over this line. Do not hand-pick a palette; if the dealt palette fails contrast, re-deal.
- Shared tokens: after the deal, copy the palette and font pairing into packages/ui as CSS variables and a Tailwind theme, so the site and the app share one identity. Add Noto Sans Tamil and Noto Sans Devanagari to the font stack and test long Tamil and Hindi strings for line height and clipping.
- App surfaces (farmer, hub, buyer, impact): the skill's landing-page machinery (hero deals, one section per screen, scroll scenes, shaders) does not apply. Apply its principles: one system from tokens, real content (no lorem), equal edges, no generic card grids or decorative gradients, plain copy, quiet micro-interactions, and checks in a real browser at 390, 820 and 1440 wide.
- If your installed version exposes dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY), set them to: site 5/3/3, farmer app 3/2/3, hub console 3/2/7, impact dashboard 4/3/7. If it has no dials, ignore this line.

### 8.2 Art direction (give this to the skill as the brief)

- Positioning line: a cold room, a grading shed and an honest price at the farm gate, owned by the farmers' collective.
- Audience: investors, FPO leaders, buyers, evaluators. In the app: farmers and hub operators.
- Brand idea: the farm gate, the point where the field ends and the market begins. Signature drawing: the leaking bucket with four holes (spoilage, distress sales, commissions, missing information) that the hub plugs. Draw it as clean SVG. Use it on the site and, sparingly, in empty states.
- Tone: plain, respectful, concrete, short sentences. Say "cold room", not "cold-chain solution". No hype and no claims beyond section 4. No farmer-as-victim imagery, no cartoon farmers, no stock handshakes, no leaf logos, no sunrise-over-field clichés. The logo is a simple wordmark.
- Palette: warm and trustworthy, readable outdoors, not generic leaf green. Grade A/B/C and SELL/HOLD must work without hue alone (icon, label and shape too).
- Type: the dealt pairing, with tabular numerals for money and weights.
- Imagery: only photographs from the skill's library or supplied by me, with the skill's credit line, bundled locally. If the library has nothing fitting (farm gates, tomato crates, cold rooms), use typography, flat colour and drawn SVG. Never present stand-in photos as FarmGate's own hubs or farmers.
- Motion: on the site, one hero entrance and one or two moments as the skill deals them. In the app, motion only explains change (a lot moving through states, a price updating, the waterfall drawing in). Respect prefers-reduced-motion everywhere.
- Numbers: ₹ symbol, Indian grouping (en-IN), lakh and crore for large amounts, "/kg" suffix for rates, weights in kg with one decimal.
- No emoji as icons. Real icons only. Every string is real copy.

### 8.3 Signature components (build these with extra care)

1. RupeeWaterfall: the "Where Your Rupee Went" graphic from 6.7. Horizontal stacked bar plus ledger lines, a 33% typical-share marker, a data-table alternative for screen readers, an entrance animation that respects reduced motion.
2. SellHoldCard: three price tiles (mandi, bid, hold range), a range bar with the floor marked, one advice sentence, a Listen button, and SELL and HOLD buttons at least 56px tall with icon and label.
3. LotTimeline: states with times, hours-in-pod counter, QR code.
4. PodGauge: temperature, solar output, backup state, occupancy, with the "Simulated" tag.
5. LeakyBucket: the site illustration.
6. FinanceTable: with a "matches the report" reconciliation badge and "Illustrative" tags on estimates.

### 8.4 Accessibility and languages

WCAG 2.2 AA. Touch targets at least 48px in the farmer app. Visible focus. Text scales to 200% without clipping. Labels, not placeholders. Error messages in plain words. English, Hindi and Tamil for every farmer-facing string and the receipt, in typed dictionaries, using everyday words. Translations are machine-drafted: log "needs native-speaker review before field use" in docs/ASSUMPTIONS.md. The language choice persists.

### 8.5 Public site outline (one long page, one idea per screen)

1. Hero: "Keep the harvest, keep the value." One line on what a hub is. Buttons: open the live demo; read the numbers.
2. The leak: the bucket and its four holes, plus four evidence numbers (tomato farmers get 33%; 5 to 15% lost before sale; 70.4% of farm households own under one hectare; about 10% of perishables reach cold storage).
3. The assumption we tested: "Is it just the middleman?" Verdict: partly true. Compress 4.3. Close with "replace the functions, not the person".
4. How a hub works: the five steps and the sell-or-hold branch.
5. The product: the three farmer screens in phone frames, rendered from the real app components.
6. The numbers: ₹8,750 against ₹11,100 per tonne (about 27% more), about ₹11,400 a year per household, a Year 1 to 4 chart, payback in about three years. Label "illustrative estimates to be tested in a pilot".
7. Why this idea: four ideas scored, why the hub won, and the comparison with mandi, e-NAM and Ninjacart / DeHaat (4.11).
8. The roadmap: four phases with their success gates.
9. The ask: ₹5 crore and its split, plus the four other calls to action. Each opens a short interest form that posts to the demo API and shows a thank-you. Do not invent an email address.
10. Team and sources: names and course, sources and assumptions in an expandable block, the skill's photo credit line.

## 9. Milestones and acceptance checks

M0. Setup and plan (stop at G1)
- Check Node 22 or newer, npm, git, and Chrome, Edge or Chromium. Initialise git.
- Check the taste skill is installed (section 8.1).
- If docs/source/CIN_CO2_Team_4.docx exists, read it and compare with section 4. The report wins on facts, this prompt wins on engineering choices. Log differences.
- Create the folder structure, docs/BRIEF.md, docs/ASSUMPTIONS.md, docs/PROGRESS.md, and the rules and workflows from section 11.
- Produce the Implementation Plan artifact (section 3). Write no application code before G1. Stop.

M1. Shared core
- packages/shared with: Zod schemas and types; money and weight utilities; INR, lakh and crore formatters; evidence data from section 4 with sources and a status of reported, calculated or illustrative; the finance engine (per-tonne economics, hub curve, cohort network model, funding, market sizing, sensitivity, payback); advisor; buyer matcher; grading; i18n dictionaries (en, hi, ta); seed fixtures.
- Golden tests reproduce 4.6 to 4.9: per tonne ₹8,751.6 and about ₹11,131 (+27.2%); the hub table; every row of the network table including EBITDA signs and rounding; ₹11,400 per farmer; payback ₹28.5 lakh against ₹25 lakh; use of funds sums to ₹5.0 crore; TAM 38,600, SAM 610, SOM about 7; the Lot #198 receipt maths (13.5 - 1.905 = 11.595).
- Done when `npm test -w packages/shared` passes with at least 90% coverage on the finance engine and advisor.

M2. API and data
- Drizzle schema and migrations, deterministic idempotent seed, endpoints from section 7, role checks, Clock and time warp, simulators (payments, pod telemetry, scale, channels), server-sent events.
- Vitest tests for lot lifecycle, ledger balance, fee maths, payout SLA, advance repayment and role access, using an in-memory database.
- Done when the tests pass, the seed returns the exact Screen 1, 2 and 3 values through the API, and GET /api/impact/network equals 4.7.

M3. Design foundations
- Run the taste skill's first step for kind "service" in apps/site. Extract tokens into packages/ui and a Tailwind theme. Bundle fonts locally with Tamil and Devanagari fallbacks. Build the base components and the signature components from 8.3 with sample data.
- Add a dev-only /styleguide route in apps/web that shows tokens and components.
- Verify in the browser and attach 390 and 1440 screenshots to the Walkthrough.

M4. Farmer app (P0)
- Implement 5.1 P0. Live updates through server-sent events.
- Done when, at the seed state "golden path, 14 hours in": Screen 1 shows mandi ₹9/kg, buyer bid ₹14/kg and hold 1 day ₹13 to 15; Screen 2 shows Lot #214, 120 kg, Grade A, in cool pod 14 hours, buyer match 78%; Screen 3 for Lot #198 shows ₹30/kg, ₹13.5 (45%), hub fee ₹1.9 and ₹11.6 paid. All three work in English, Hindi and Tamil at 360px width with no clipping.

M5. Hub console and impact dashboard (P0)
- Implement 5.2 P0 and 5.4 P0.
- Done when golden path steps 1 to 6 (section 10) run end to end in the browser, the network table on /impact equals 4.7, sliders recompute instantly, and the "matches the report" badge shows at default inputs.

M6. Public site (stop at G2)
- Build with the taste skill's full pipeline following 8.5, using real app components in the phone frames and numbers from the evidence module.
- Run the skill's checker at 1440, 1024, 820, 768 and 390 and its finish gate (at most three rounds). Attach the reports and screenshots.
- Stop for review. Post a contact sheet: the site at 1440 and 390, the three farmer screens, hub intake, the impact dashboard, and any remaining checker warnings.

M7. P1 features (after G2 approval)
In this order, and say plainly what you skipped if time is short: buyer portal; QR traceability page; channels simulators; Grade-C routing; sources and assumptions page; PWA offline and queued taps; receipt share as image; risk register and phase-gate tracker; guided pitch overlay; tornado chart.

M8. Hardening and delivery (stop at G3)
- Playwright test of the golden path; axe checks on every surface; performance budget (farmer route first load at most 180 KB of gzipped JavaScript, code-split surfaces).
- Docs: README, ARCHITECTURE (with a Mermaid diagram), DEMO_SCRIPT, SIMULATIONS, ASSUMPTIONS.
- Export pitch assets into docs/pitch/: PNGs of the three farmer screens (390x844 at 2x), the receipt, the impact charts and the site hero.
- `npm run verify` passes from a clean clone (clone, `npm install`, `npm run seed`, `npm run dev`). `npm run build && npm start` serves everything from one process.
- Walkthrough artifact with screenshots and the golden-path recording, plus a list of known gaps. Stop.

Definition of done for the whole project: all P0 acceptance checks pass; `npm run verify` is green; no hard-coded report numbers in components; every simulated surface is badged; every estimate is tagged illustrative; the three languages are complete for the farmer app; the golden path runs without a hiccup three times in a row from a reset.

## 10. Golden path (demo script and end-to-end test)

Characters are fictional: Meena (a farmer, a composite for storytelling), Ravi (hub operator), and the Annapurna Kirana Network (a buyer).

1. T+0. Ravi opens the hub console and runs intake for Meena: tomatoes, scale reads 120.0 kg, blemish 3%, firmness 4, size M, ripeness turning. Suggested grade A. The QR label prints. Lot #214 is created. Meena's WhatsApp thread shows "Lot 214 received: 120 kg, Grade A".
2. T+0. The pod board shows 120 kg added, temperature in range, solar running.
3. T+0. Meena's app shows Today's price: mandi ₹9/kg, best bid ₹10/kg (below the ₹11 floor), advice HOLD with its reason. She taps HOLD for 48 hours with auto-sell off.
4. T+0. Meena needs cash today. She requests an advance of 60% on the lot (about ₹720 at the ₹10 bid). Ravi approves. Her Money tab shows it.
5. T+14h (time warp). The Annapurna Kirana Network posts an order for 500 kg of Grade A tomatoes at ₹14/kg. Meena gets an alert (app and WhatsApp thread). Today's price now reads mandi ₹9, bid ₹14, hold 1 day ₹13 to 15, advice SELL. My lots shows Lot #214 in the pod 14 hours with buyer match 78%. She taps SELL.
6. T+14h+. Ravi builds a collective load from Meena's lot and other Grade A lots to reach 500 kg, the buyer's simulated deposit clears, the sale is confirmed, the load is dispatched. A payout is created with a 24-hour clock. It is settled through the simulated UPI provider (paid well inside 24 hours). The advance is repaid from the proceeds.
7. Meena opens her receipt for Lot #214: the same waterfall with her real numbers (sale ₹14/kg, fee about ₹1.92/kg, payout about ₹12.08/kg before the advance repayment line). She taps Listen in Tamil.
8. Switch to the investor persona on /impact: ₹8,750 against ₹11,100 per tonne, the Year 1 to 4 chart, the ₹5 crore ask. End on the site's closing section.

The Playwright test automates steps 1 to 7 using the time-warp endpoint and checks the key strings and amounts.

## 11. Files to write in M0

### .agents/rules/farmgate.md (always on, under 12,000 characters)

```
# FarmGate Hub project rules
Read docs/BRIEF.md before starting any task. It is the source of truth for facts and numbers.
- Never invent statistics, quotes, partners or testimonials. Mark defaults that are not in the brief as "illustrative" and log them in docs/ASSUMPTIONS.md.
- Report numbers live only in packages/shared (evidence and finance modules). Never hard-code them in components.
- Money is integer paise, weight is integer grams, time comes from the injectable Clock. No floats for money.
- Everything simulated (UPI, WhatsApp, voice, prices, scale, sensors, label printer) sits behind an adapter and shows a "Simulated" badge.
- Fictional people only. No real phone numbers, UPI IDs or credentials. No secrets in git.
- The app advises and the farmer decides. No automatic sell, hold or payout without an explicit tap or an explicit opt-in.
- UI: tokens from packages/ui only; Indian number grouping; tabular numerals; English, Hindi and Tamil strings for every farmer-facing string; WCAG 2.2 AA; touch targets 48px or larger in the farmer app; no default-looking component libraries.
- Public site: use the design-taste-frontend skill and its checks. App surfaces: apply its principles, not its landing-page machinery.
- Verify every UI change in the browser at 390, 820 and 1440 wide before calling it done.
- Run /verify before finishing any task. Keep docs/PROGRESS.md current.
- Commit per milestone with conventional commits. No destructive git commands, no sudo, no global installs.
```

### .agents/workflows/verify.md (invoked as /verify)

Write it in Antigravity's workflow format (title, one-line description, numbered steps):
1. Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
2. Run `npm run e2e` (it starts the stack on a fresh seed).
3. Start `npm run dev`. In the browser, open /farmer, /hub, /impact and the site at 390 and 1440 wide. Look for horizontal scroll, clipped Tamil or Hindi text, low contrast, and console errors.
4. Report pass or fail for each step with evidence. Fix failures and rerun. If a failure cannot be fixed, log it in docs/BLOCKERS.md.

### .agents/workflows/design-check.md (invoked as /design-check)

1. Run the taste skill's consistency checker on the site at 1440, 1024, 820, 768 and 390, then its finish gate.
2. Run the axe checks in Playwright on every app surface.
3. Search apps/web for hard-coded hex colours and pixel font sizes that bypass the tokens. Fix them.
4. Capture a contact sheet of the main screens at 390 and 1440 and attach it to the Walkthrough.

## 12. First actions

1. Do M0 only.
2. Produce the Implementation Plan artifact. In it, list any place where you would deviate from this prompt and why, and at most five questions.
3. Stop and wait for my review (G1). Write no application code until I approve.
