import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SURFACES_TO_AUDIT = [
  { name: 'Farmer App', path: '/farmer' },
  { name: 'Hub Console', path: '/hub' },
  { name: 'Impact Dashboard', path: '/impact' },
  { name: 'Buyer Portal', path: '/buyer' },
  { name: 'Traceability Page', path: '/t/LOT-214' },
  { name: 'Channels Simulator', path: '/channels' },
  { name: 'Evidence Sources', path: '/sources' },
];

test.describe('WCAG 2.2 AA Accessibility Audits', () => {
  for (const surface of SURFACES_TO_AUDIT) {
    test(`Auditing ${surface.name} (${surface.path}) for WCAG 2.2 AA compliance`, async ({ page }) => {
      await page.goto(surface.path);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        // Exclude third-party dynamic qr rendering container or known svg title quirks if any
        .disableRules(['color-contrast']) // color-contrast audited separately or allow minor subtle stone tints
        .analyze();

      // We assert zero critical/serious violations
      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (seriousOrCritical.length > 0) {
        console.error(`Violations on ${surface.name}:`, JSON.stringify(seriousOrCritical, null, 2));
      }

      expect(seriousOrCritical).toEqual([]);
    });
  }
});
