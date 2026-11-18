---
title: Verify
description: Comprehensive verification workflow running typecheck, lint, unit tests, e2e, and responsive browser validation.
---

1. Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
2. Run `npm run e2e` (it starts the stack on a fresh seed).
3. Start `npm run dev`. In the browser, open /farmer, /hub, /impact and the site at 390 and 1440 wide. Look for horizontal scroll, clipped Tamil or Hindi text, low contrast, and console errors.
4. Report pass or fail for each step with evidence. Fix failures and rerun. If a failure cannot be fixed, log it in docs/BLOCKERS.md.
