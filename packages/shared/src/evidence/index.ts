/**
 * FarmGate Hub: Evidence Base
 * Sourced directly from the student innovation report (Group 4, "Improving Farmers' Income")
 * Section 4.2 and 4.3.
 */

export interface EvidenceRecord {
  id: string;
  indicator: string;
  evidence: string;
  source: string;
  status: 'reported' | 'calculated' | 'illustrative';
  numericValue?: number;
  unit?: string;
}

export const PROBLEM_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'household-income',
    indicator: 'Farm household income',
    evidence: '₹10,218 per month (2018-19); ₹3,798 from crops; ₹4,063 (about 40%) from wages',
    source: 'NSS 77th Round (NSO/MoSPI)',
    status: 'reported',
    numericValue: 10218,
    unit: '₹/month',
  },
  {
    id: 'crop-income',
    indicator: 'Monthly crop income',
    evidence: '₹3,798 per month',
    source: 'NSS 77th Round (NSO/MoSPI)',
    status: 'reported',
    numericValue: 3798,
    unit: '₹/month',
  },
  {
    id: 'small-holdings',
    indicator: 'Small holdings',
    evidence: '70.4% of agricultural households own less than one hectare',
    source: 'NSS 77th Round',
    status: 'reported',
    numericValue: 70.4,
    unit: '%',
  },
  {
    id: 'farmer-share-tomato',
    indicator: 'Farmer share of consumer price (Tomato)',
    evidence: 'Tomato 33%, onion 36%, potato 37%, banana 31%, mango 43%; dairy about 70%',
    source: 'RBI Working Paper 08/2024 and related RBI studies, 2024',
    status: 'reported',
    numericValue: 33,
    unit: '%',
  },
  {
    id: 'debt',
    indicator: 'Household debt',
    evidence: '50.2% of agricultural households are indebted; average loan ₹74,121; about 30% from non-institutional sources',
    source: 'NSS 77th Round',
    status: 'reported',
    numericValue: 50.2,
    unit: '%',
  },
  {
    id: 'loss-volume',
    indicator: 'Post-harvest loss, volume',
    evidence: 'About 19.3 million tonnes of fruit and vegetables lost (7.36 + 11.97 Mt); tomato loss about 11.6%',
    source: 'NABCONS 2022; Lok Sabha reply, Dec 2025',
    status: 'reported',
    numericValue: 19.3,
    unit: 'Million Tonnes',
  },
  {
    id: 'loss-value',
    indicator: 'Post-harvest loss, value',
    evidence: 'About ₹1.52 lakh crore a year across commodities',
    source: 'NABCONS 2022 (MoFPI)',
    status: 'reported',
    numericValue: 152000,
    unit: '₹ Crore',
  },
  {
    id: 'cold-storage-access',
    indicator: 'Cold storage access',
    evidence: 'Only about 10% of perishables reach cold storage, mostly potatoes',
    source: 'IIM Calcutta study, via The Tribune',
    status: 'reported',
    numericValue: 10,
    unit: '%',
  },
  {
    id: 'trader-margins',
    indicator: 'Trader margins',
    evidence: '69 to 94% of the farm-to-consumer price gap in Ahmedabad',
    source: 'IIM Ahmedabad working paper (Gandhi and Namboodiri)',
    status: 'reported',
    numericValue: 80,
    unit: '%',
  },
  {
    id: 'direct-selling',
    indicator: 'Direct selling',
    evidence: 'A Chennai direct-selling market gave farmers 85 to 95% of the consumer price (older study, indicative)',
    source: 'IIM Ahmedabad working paper',
    status: 'reported',
    numericValue: 90,
    unit: '%',
  },
  {
    id: 'enam-scale',
    indicator: 'e-NAM scale and adoption',
    evidence: '1,656 mandis linked; ₹4.84 lakh crore of trade (March 2026); in Hingoli, 10,437 of 28,197 registered farmers had traded',
    source: 'Lok Sabha replies (2025); Vision IAS (March 2026)',
    status: 'reported',
    numericValue: 1656,
    unit: 'mandis',
  },
  {
    id: 'fpos-registered',
    indicator: 'FPO progress',
    evidence: 'All 10,000 targeted FPOs are registered; many lack infrastructure and working capital',
    source: 'SFAC and agriculture ministry releases',
    status: 'reported',
    numericValue: 10000,
    unit: 'FPOs',
  },
  {
    id: 'cold-chain-pilot-impact',
    indicator: 'Cold-chain pilot loss reduction',
    evidence: 'A Gates Foundation-sponsored low-cost storage pilot cut losses about 60%; an NCCD mandarin cold-chain study found 76%',
    source: 'The Tribune; Outlook India',
    status: 'reported',
    numericValue: 60,
    unit: '%',
  },
];

export const ASSUMPTION_TEST = [
  {
    claim: 'Farmers earn less only because intermediaries are involved.',
    verdict: 'Partially true, and misleading as a full explanation.',
    reasons: [
      {
        fact: 'Tomato farmers get 33%, dairy farmers about 70%',
        insight: 'Chain structure matters. Dairy still has intermediaries (cooperatives, processors, retailers).',
      },
      {
        fact: 'Direct markets in Chennai gave 85 to 95%',
        insight: 'Cutting layers helps where volumes are small and local.',
      },
      {
        fact: '5 to 15% of fruit and vegetables is lost before sale',
        insight: 'Part of the gap is physical loss, not anyone\'s profit.',
      },
      {
        fact: 'Intermediaries lend, transport and absorb risk',
        insight: 'Removing them without replacing those functions can leave farmers worse off.',
      },
      {
        fact: 'e-NAM adoption is partial',
        insight: 'Technology alone does not fix storage, logistics and trust.',
      },
    ],
  },
];

export const IDEA_SCORING = [
  { name: 'Marketplace App', score: 27, chosen: false },
  { name: 'FarmGate Hub', score: 34, chosen: true },
  { name: 'Farmer-Owned Processing Unit', score: 24, chosen: false },
  { name: 'Price-Information SMS Service', score: 28, chosen: false },
];

export const TEAM_CREDITS = {
  names: ['Janhavi J', 'Lakshmi Shree N', 'Jananavarshini G', 'Keshini K S', 'Keerthana K', 'Kaavya R'],
  course: 'Creativity and Innovation',
  institution: 'Group 4',
};
