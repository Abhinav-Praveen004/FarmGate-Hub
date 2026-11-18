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
