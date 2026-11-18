import { test, expect } from '@playwright/test';

test.describe('FarmGate Hub - 8-Step End-to-End Golden Path', () => {

  test('Step 1: Farmer App shows today\'s prices, floor guarantee, and rule-based advice', async ({ page }) => {
    await page.goto('/farmer');

    // Verify header and live sim indicator
    await expect(page.locator('h1')).toContainText("Today's Price");
    await expect(page.locator('text=LIVE SIM').first()).toBeVisible();

    // Verify Mandi, Buyer Bid, and Floor prices
    const mandiPrice = page.locator('text=Mandi Price').locator('..');
    await expect(mandiPrice).toContainText('₹9');

    const buyerBid = page.locator('text=Best Buyer Bid').locator('..');
    await expect(buyerBid).toContainText('₹14');

    await expect(page.locator('text=Floor ₹11/kg')).toBeVisible();

    // Plain language recommendation
    await expect(page.locator('text=Recommendation:')).toBeVisible();

    // Audio listen button
    const listenBtn = page.getByRole('button', { name: /listen/i });
    await expect(listenBtn).toBeVisible();
  });

  test('Step 2: Farmer schedules Hold in Pod with collective floor protection', async ({ page }) => {
    await page.goto('/farmer');

    // Click HOLD IN POD
    const holdBtn = page.getByRole('button', { name: /hold.*pod/i });
    await expect(holdBtn).toBeVisible();
    await holdBtn.click();

    // Verify modal appeared
    await expect(page.locator('text=Hold Lot in Cool Pod')).toBeVisible();
    await expect(page.locator('text=Flat storage fee: ₹1.50/kg total')).toBeVisible();

    // Select 48 Hours
    const durationBtn = page.getByRole('button', { name: '48 Hours' });
    await durationBtn.click();

    // Confirm hold
    const confirmBtn = page.getByRole('button', { name: 'Confirm Hold' });
    await confirmBtn.click();

    // Verify feedback alert
    await expect(
      page.locator('text=scheduled to hold in Cool Pod').or(page.locator('text=Bring harvest to hub intake'))
    ).toBeVisible();
  });

  test('Step 3: Hub Operator runs digital scale capture, grading, and lot intake', async ({ page }) => {
    await page.goto('/hub');

    // Ensure on Intake tab
    await expect(page.locator('text=Intake & Digital Scale Wizard')).toBeVisible();

    // Farmer selection - Ramesh Chandra
    const rameshCard = page.locator('button:has-text("Ramesh Chandra")').first();
    await expect(rameshCard).toBeVisible();
    await rameshCard.click();

    // Step 2: Digital Scale capture
    const captureBtn = page.getByRole('button', { name: /capture scale/i });
    await expect(captureBtn).toBeVisible();
    await captureBtn.click();

    // Check scale weight readout is positive
    await expect(page.locator('text=Live Net Weight').locator('..')).toContainText('KG');

    // Step 3: Grading checklist
    await expect(page.locator('text=Engine Result:')).toBeVisible();
    await expect(page.locator('text=Grade A').first()).toBeVisible();

    // Thermal label preview
    await expect(page.locator('text=FARMGATE HUB #01')).toBeVisible();
    await expect(page.locator('text=₹11.00 / KG GUARANTEED')).toBeVisible();

    // Confirm intake
    const intakeConfirmBtn = page.getByRole('button', { name: /confirm intake & move to pod/i });
    await expect(intakeConfirmBtn).toBeVisible();
    await intakeConfirmBtn.click();

    // Success notification
    await expect(page.locator('text=Successfully Stored in Cool Pod!')).toBeVisible({ timeout: 10_000 });
  });

  test('Step 4: Cool Pod telemetry monitoring and power cut fault simulation', async ({ page }) => {
    await page.goto('/hub');

    // Switch to Cool Pod tab
    await page.getByRole('button', { name: 'Cool Pod Board' }).click();

    // Verify Cool Pod telemetry header
    await expect(page.locator('text=10-Tonne Solar Cool Pod Telemetry')).toBeVisible();
    await expect(page.locator('text=11.5°C').first()).toBeVisible();

    // Trigger power outage simulation
    const outageBtn = page.getByRole('button', { name: /simulate power outage/i });
    await expect(outageBtn).toBeVisible();
    await outageBtn.click();

    // Status warning should update to thermal backup running (match first)
    await expect(
      page.locator('text=THERMAL BACKUP RUNNING').or(page.locator('text=Running on Thermal Backup')).first()
    ).toBeVisible({ timeout: 5_000 });

    // Restore grid power
    const restoreBtn = page.getByRole('button', { name: /restore grid power/i });
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();
    await expect(page.locator('text=Grid Normal')).toBeVisible({ timeout: 5_000 });
  });

  test('Step 5: Collective Loads assembly and dispatch to wholesale buyer', async ({ page }) => {
    await page.goto('/hub');

    // Switch to Collective Loads tab
    await page.getByRole('button', { name: 'Collective Loads' }).click();

    // Verify verified buyer order ORD-771
    await expect(page.locator('text=Annapurna Retail Network')).toBeVisible();
    await expect(page.locator('text=Escrow 100% Cleared').first()).toBeVisible();

    // Auto-fill optimal lots
    const autoFillBtn = page.getByRole('button', { name: /auto-fill optimal/i });
    if (await autoFillBtn.isVisible()) {
      await autoFillBtn.click();
    }

    // Verify target met and dispatch button enabled
    const dispatchBtn = page.getByRole('button', { name: /confirm sale & dispatch load/i });
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();

    // Verify dispatch success banner with 24h SLA activation
    await expect(page.locator('text=Dispatched Successfully!')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=24-Hour Payout SLA Activated')).toBeVisible();
  });

  test('Step 6: Payouts Queue 24h SLA countdown and instant UPI settlement', async ({ page }) => {
    await page.goto('/hub');

    // Switch to Advances & Payouts tab
    await page.getByRole('button', { name: 'Advances & Payouts' }).click();

    // Verify SLA banner
    await expect(page.locator('text=24-Hour SLA Payouts & Advances Queue')).toBeVisible();

    // Settle UPI for pending payout
    const settleBtn = page.getByRole('button', { name: /settle upi/i }).first();
    if (await settleBtn.isVisible()) {
      await settleBtn.click();
      // Should show Paid/Settled badge with UTR
      await expect(page.locator('text=SETTLED').first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('Step 7: Farmer Transparent Rupee Waterfall Receipt and Ledger Reconciliation', async ({ page }) => {
    await page.goto('/farmer');

    // Switch to Receipt / Screen 3 tab
    const receiptTab = page.getByRole('button', { name: /receipt/i });
    await receiptTab.click();

    // Verify transparent receipt breakdown
    await expect(page.locator('text=Screen 3: Transparent Receipt')).toBeVisible();
    await expect(page.locator('text=RECEIPT #RCP-198-SETTLED')).toBeVisible();

    // Check Consumer reference ₹30 and farmer gross share 45%
    await expect(page.locator('text=Consumer Paid').first()).toBeVisible();
    await expect(page.locator('text=45%').first()).toBeVisible();

    // Check Net Paid to Farmer
    await expect(page.locator('text=Net Paid to Farmer').first()).toBeVisible();
    await expect(page.locator('text=₹11.60').first()).toBeVisible();

    // Check Double-Entry Ledger Proof
    await expect(page.locator('text=Delta: ₹0.00 Balanced')).toBeVisible();
    await expect(page.locator('text=TX-198-FARMER-CR')).toBeVisible();
    await expect(page.locator('text=TX-198-HUB-FEE')).toBeVisible();
  });

  test('Step 8: Impact Dashboard displays 5 KPIs, per-tonne economics, and 4-year cohort model', async ({ page }) => {
    await page.goto('/impact');

    // Verify 5 KPI scorecards
    await expect(page.locator('text=5 Core Impact & Performance Scorecards')).toBeVisible();
    await expect(page.locator('text=+23.4%')).toBeVisible(); // Net price realisation
    await expect(page.locator('text=3.8%')).toBeVisible();  // Post-harvest loss
    await expect(page.locator('text=44.8%')).toBeVisible(); // Farmer share
    await expect(page.locator('text=98.5%')).toBeVisible(); // Payment within 24h

    // Switch to Per-Tonne Economics sub-tab
    await page.getByRole('button', { name: 'Per-Tonne Economics' }).click();
    await expect(page.locator('text=Per-Tonne Tomato Economics')).toBeVisible();
    await expect(page.locator('text=+27.2%').first()).toBeVisible();

    // Switch to 4-Year Cohort Model sub-tab
    await page.getByRole('button', { name: '4-Year Cohort Model' }).click();
    await expect(page.locator('text=4-Year Network Projections')).toBeVisible();
    await expect(page.locator('text=Hubs Live (Cumulative)')).toBeVisible();
    await expect(page.locator('text=Total Revenue (₹ Cr)')).toBeVisible();

    // Switch to Funding & Market sub-tab
    await page.getByRole('button', { name: 'Funding & Market' }).click();
    await expect(page.locator('text=TOTAL ADDRESSABLE MARKET').first()).toBeVisible();

    // Switch to Sensitivity Sliders sub-tab
    await page.getByRole('button', { name: 'Sensitivity Sliders' }).click();
    await expect(page.locator('text=Interactive Sensitivity & Stress Testing')).toBeVisible();
  });
});
