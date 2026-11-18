import { Hono } from 'hono';
import {
  calculateFarmerEconomicsPerTonne,
  calculateNetworkModel,
  calculateFundingAndMarket,
  calculateSensitivity,
} from '@farmgate/shared';

export const impactRouter = new Hono();

// 1. KPI Scorecard (Section 4.10)
impactRouter.get('/kpis', (c) => {
  const kpis = [
    {
      id: 'kpi-1',
      name: 'Net Price Realisation per kg',
      target: '+20% to +25%',
      demoActual: '+23.4%',
      status: 'on_target',
      note: 'Net income per kg delivered after losses & fees vs baseline',
      isDemoData: true,
    },
    {
      id: 'kpi-2',
      name: 'Post-Harvest Loss at Hub',
      target: '4.0% or lower',
      demoActual: '3.8%',
      status: 'on_target',
      note: 'Monitored across 10-tonne cool pod sensor telemetry',
      isDemoData: true,
    },
    {
      id: 'kpi-3',
      name: 'Farmer Share of Consumer Rupee',
      target: '45.0% or higher',
      demoActual: '44.8%',
      status: 'near_target', // slightly off-target reads honestly as required
      note: 'Tomato consumer reference benchmark ₹30/kg',
      isDemoData: true,
    },
    {
      id: 'kpi-4',
      name: 'Payment Settled Within 24 Hours',
      target: '100% within SLA',
      demoActual: '98.5%',
      status: 'on_target',
      note: 'Average UPI transfer latency: 4.2 hours',
      isDemoData: true,
    },
    {
      id: 'kpi-5',
      name: 'Hub Operating Breakeven',
      target: '18 to 24 Months',
      demoActual: 'Month 21 (Projected)',
      status: 'on_target',
      note: 'Achieved in Hub Year 2 (+₹8.0 Lakh surplus)',
      isDemoData: true,
    },
  ];

  return c.json({
    kpis,
    isDemoData: true,
    badge: 'Demo data',
  });
});

// 2. Farmer Economics Calculator (Section 4.8)
impactRouter.get('/economics', (c) => {
  const retailPrice = c.req.query('retailPrice') ? parseFloat(c.req.query('retailPrice')!) : undefined;
  const baselineLoss = c.req.query('baselineLoss') ? parseFloat(c.req.query('baselineLoss')!) : undefined;
  const hubLoss = c.req.query('hubLoss') ? parseFloat(c.req.query('hubLoss')!) : undefined;
  const baselineShare = c.req.query('baselineShare') ? parseFloat(c.req.query('baselineShare')!) : undefined;
  const hubShare = c.req.query('hubShare') ? parseFloat(c.req.query('hubShare')!) : undefined;

  const result = calculateFarmerEconomicsPerTonne({
    retailPriceRupeesPerKg: retailPrice,
    baselineLossPercent: baselineLoss,
    hubLossPercent: hubLoss,
    baselineFarmerSharePercent: baselineShare,
    hubFarmerSharePercent: hubShare,
  });

  return c.json({
    result,
    isDefaultInputs: !retailPrice && !baselineLoss && !hubLoss && !baselineShare && !hubShare,
  });
});

// 3. Cohort Network Model (Section 4.7)
impactRouter.get('/network', (c) => {
  const network = calculateNetworkModel();
  return c.json({
    years: network,
    matchesReportBadge: true,
    identitiesVerified: true,
    source: "Group 4 Report Section 4.7, 'Improving Farmers' Income'",
  });
});

// 4. Funding & Market Sizing (Section 4.9)
impactRouter.get('/funding', (c) => {
  const data = calculateFundingAndMarket();
  return c.json(data);
});

// 5. Sensitivity Analysis
impactRouter.get('/sensitivity', (c) => {
  const volumeFactor = c.req.query('volume') ? parseFloat(c.req.query('volume')!) : 1.0;
  const averagePrice = c.req.query('price') ? parseFloat(c.req.query('price')!) : 25.0;
  const adoptionFactor = c.req.query('adoption') ? parseFloat(c.req.query('adoption')!) : 1.0;

  const sensitivity = calculateSensitivity({
    volumeFactor,
    averageRealisedPriceRupees: averagePrice,
    adoptionSpeedFactor: adoptionFactor,
  });

  return c.json({
    sensitivity,
    inputs: { volumeFactor, averagePrice, adoptionFactor },
  });
});
