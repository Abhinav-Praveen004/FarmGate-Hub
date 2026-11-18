/**
 * Funding, Market Sizing, and Investment Targets (Section 4.9)
 * Figures in ₹ Crore.
 */

export interface UseOfFundsItem {
  category: string;
  amountCrore: number;
  description: string;
}

export interface FundingAndMarketResult {
  seedAskCrore: number;
  useOfFunds: UseOfFundsItem[];
  totalAllocatedCrore: number;
  tam: {
    amountCrore: number;
    description: string;
    calculation: string;
  };
  sam: {
    amountCrore: number;
    description: string;
    calculation: string;
  };
  som: {
    amountCrore: number;
    description: string;
    calculation: string;
  };
}

export function calculateFundingAndMarket(): FundingAndMarketResult {
  const useOfFunds: UseOfFundsItem[] = [
    {
      category: 'First 10 Hubs (Capital)',
      amountCrore: 2.5,
      description: 'Capital expenditure for initial 10 cool pods and grading infrastructure',
    },
    {
      category: 'Technology & Hardware',
      amountCrore: 0.7,
      description: 'Platform development, IoT sensor feeds, and digital weighing scale integrations',
    },
    {
      category: 'Team & Operations',
      amountCrore: 1.3,
      description: 'FPO training, field coordination, and pilot management',
    },
    {
      category: 'Advance-Payment Float',
      amountCrore: 0.5,
      description: 'Working capital reserve to fund 50-70% produce-backed farmer advances',
    },
  ];

  const totalAllocated = useOfFunds.reduce((sum, item) => sum + item.amountCrore, 0);

  return {
    seedAskCrore: 5.0,
    useOfFunds,
    totalAllocatedCrore: totalAllocated,
    tam: {
      amountCrore: 38600,
      description: 'Total Addressable Market across Indian perishable post-harvest losses',
      calculation: '19.3 million tonnes lost × ₹20/kg estimated farm-gate value = ₹38,600 Crore (approx ₹39,000 Cr)',
    },
    sam: {
      amountCrore: 610,
      description: 'Serviceable Addressable Market across target FPO clusters',
      calculation: '10% of 10,000 targeted FPOs = 1,000 hubs × ₹0.61 Crore revenue at maturity = ₹610 Crore',
    },
    som: {
      amountCrore: 6.98,
      description: 'Serviceable Obtainable Market (Year 3 pilot target)',
      calculation: '25 hubs at Year 3 scale = ₹6.98 Crore (approx ₹7 Crore)',
    },
  };
}
