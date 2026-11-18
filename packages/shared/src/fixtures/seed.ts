import {
  Farmer,
  Buyer,
  BuyerOrder,
  Lot,
  Receipt,
  PodTelemetry,
} from '../types/index.js';

export const SEED_FARMERS: Farmer[] = [
  {
    id: 'farmer_meena',
    name: 'Meena',
    village: 'Annur',
    phone: '+91 00000 00001',
    upiId: 'meena@demo',
    preferredLanguage: 'ta',
    preferredChannel: 'app',
    optInPublicTraceability: true,
  },
  {
    id: 'farmer_ramesh',
    name: 'Ramesh Kumar',
    village: 'Kariyampalayam',
    phone: '+91 00000 00012',
    upiId: 'ramesh@demo',
    preferredLanguage: 'hi',
    preferredChannel: 'whatsapp',
    optInPublicTraceability: true,
  },
  {
    id: 'farmer_selvam',
    name: 'Selvam P',
    village: 'Myleripalayam',
    phone: '+91 00000 00013',
    upiId: 'selvam@demo',
    preferredLanguage: 'ta',
    preferredChannel: 'voice',
    optInPublicTraceability: false,
  },
];

export const SEED_BUYERS: Buyer[] = [
  {
    id: 'buyer_annapurna',
    name: 'Annapurna Kirana Network',
    type: 'kirana_network',
    phone: '+91 00000 00003',
    reliabilityScore: 92,
  },
  {
    id: 'buyer_freshbite',
    name: 'FreshBite Restaurant Group',
    type: 'restaurant_group',
    phone: '+91 00000 00021',
    reliabilityScore: 88,
  },
  {
    id: 'buyer_sahyadri',
    name: 'Sahyadri Institutional Kitchens',
    type: 'institutional_kitchen',
    phone: '+91 00000 00022',
    reliabilityScore: 95,
  },
  {
    id: 'buyer_kisan_proc',
    name: 'Kisan Agro Foods',
    type: 'processor',
    phone: '+91 00000 00023',
    reliabilityScore: 90,
  },
];

export const SEED_BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'order_kirana_500kg',
    buyerId: 'buyer_annapurna',
    crop: 'tomato',
    grade: 'A',
    quantityGrams: 500_000, // 500 kg
    offeredPricePaisePerKg: 1400, // ₹14.0/kg
    deliveryWindowHours: 24,
    depositCleared: true,
    status: 'open',
    createdAt: '2026-11-18T00:00:00Z',
  },
  {
    id: 'order_freshbite_200kg',
    buyerId: 'buyer_freshbite',
    crop: 'tomato',
    grade: 'B',
    quantityGrams: 200_000,
    offeredPricePaisePerKg: 1150, // ₹11.5/kg
    deliveryWindowHours: 48,
    depositCleared: true,
    status: 'open',
    createdAt: '2026-11-18T02:00:00Z',
  },
];

/**
 * Screen 2 fixture: Lot #214
 * 120 kg, Grade A, in cool pod 14 hours, buyer match 78%.
 */
export const SEED_LOT_214: Lot = {
  id: 'lot_214',
  lotNumber: 214,
  farmerId: 'farmer_meena',
  crop: 'tomato',
  weightGrams: 120_000, // 120.0 kg
  grade: 'A',
  status: 'in_pod',
  intakePriceEstimatePaise: 1400, // ₹14.0/kg estimate
  finalSalePricePaisePerKg: undefined,
  holdingLimitHours: 72,
  receivedAt: '2026-11-17T16:00:00Z', // 14 hours ago relative to T+14h demo time
  hoursInPod: 14,
  qrCode: 'FGH-ANNUR-2026-LOT214',
  quality: {
    blemishPercent: 3,
    firmness: 4,
    sizeClass: 'medium',
    ripeness: 'turning',
  },
  timeline: [
    {
      timestamp: '2026-11-17T16:00:00Z',
      status: 'received',
      actor: 'Ravi (Hub Operator)',
      note: 'Weighed on digital scale: 120.0 kg',
    },
    {
      timestamp: '2026-11-17T16:15:00Z',
      status: 'graded',
      actor: 'Ravi (Hub Operator)',
      note: 'Graded A: blemish 3%, firmness 4/5',
    },
    {
      timestamp: '2026-11-17T16:20:00Z',
      status: 'in_pod',
      actor: 'System',
      note: 'Moved to cool pod bay A-3. Hold decision requested.',
    },
  ],
  advanceRequested: true,
  advanceSettled: false,
};

/**
 * Screen 3 fixture: Lot #198
 * Reproduces Screen 3 exactly:
 * Consumer paid ₹30.00/kg.
 * Farmer received ₹13.50/kg (45%).
 * Hub fee ₹1.9/kg (exact ₹1.905: ₹1.50 + 3% of ₹13.5).
 * Farmer net payout ₹11.6/kg (exact ₹11.595).
 */
export const SEED_LOT_198: Lot = {
  id: 'lot_198',
  lotNumber: 198,
  farmerId: 'farmer_meena',
  crop: 'tomato',
  weightGrams: 100_000, // 100.0 kg
  grade: 'A',
  status: 'receipted',
  intakePriceEstimatePaise: 1350,
  finalSalePricePaisePerKg: 1350, // ₹13.50/kg
  holdingLimitHours: 72,
  receivedAt: '2026-11-15T08:00:00Z',
  soldAt: '2026-11-16T10:00:00Z',
  hoursInPod: 26,
  qrCode: 'FGH-ANNUR-2026-LOT198',
  quality: {
    blemishPercent: 4,
    firmness: 5,
    sizeClass: 'medium',
    ripeness: 'pink',
  },
  timeline: [
    {
      timestamp: '2026-11-15T08:00:00Z',
      status: 'received',
      actor: 'Ravi (Hub Operator)',
      note: 'Weighed on digital scale: 100.0 kg',
    },
    {
      timestamp: '2026-11-15T08:15:00Z',
      status: 'graded',
      actor: 'Ravi (Hub Operator)',
      note: 'Graded A',
    },
    {
      timestamp: '2026-11-15T08:20:00Z',
      status: 'in_pod',
      actor: 'System',
      note: 'Stored at 11.5°C',
    },
    {
      timestamp: '2026-11-16T10:00:00Z',
      status: 'sold',
      actor: 'System',
      note: 'Matched with Annapurna Kirana Network load at ₹13.50/kg',
    },
    {
      timestamp: '2026-11-16T14:30:00Z',
      status: 'paid',
      actor: 'UPI Gateway',
      note: 'Transferred ₹1,159.50 (₹11.6/kg net) to meena@demo',
    },
    {
      timestamp: '2026-11-16T14:35:00Z',
      status: 'receipted',
      actor: 'System',
      note: 'Receipt generated and sent via WhatsApp',
    },
  ],
  advanceRequested: false,
  advanceSettled: true,
};

export const SEED_RECEIPT_198: Receipt = {
  id: 'rec_198',
  lotId: 'lot_198',
  farmerName: 'Meena',
  crop: 'tomato',
  weightKg: 100.0,
  consumerReferencePricePaisePerKg: 3000, // ₹30.00
  transportCostPaisePerKg: 300, // ₹3.00
  handlingWastagePaisePerKg: 350, // ₹3.50
  intermediaryMarginPaisePerKg: 1000, // ₹10.00
  farmerGrossPricePaisePerKg: 1350, // ₹13.50 (45%)
  farmerSharePercent: 45,
  hubStorageFeePaisePerKg: 150, // ₹1.50
  hubCommissionPaisePerKg: 41, // 3% of ₹13.50 = ₹0.405 ≈ 41 paise
  totalHubFeePaisePerKg: 191, // ₹1.905 ≈ ₹1.9/kg
  netFarmerPricePaisePerKg: 1159, // ₹11.595 ≈ ₹11.6/kg
  grossSalePaise: 135_000, // ₹1,350.00
  totalFeesPaise: 19_050, // ₹190.50
  advanceDeductedPaise: 0,
  netPaidPaise: 115_950, // ₹1,159.50
  typicalSharePercent: 33,
  issuedAt: '2026-11-16T14:35:00Z',
};

export const SEED_POD_TELEMETRY: PodTelemetry = {
  capacityKg: 10000,
  currentOccupancyKg: 4200,
  temperatureCelsius: 11.4,
  setpointCelsius: 11.5,
  humidityPercent: 88,
  solarOutputWatts: 4250,
  thermalBackupPercent: 96,
  gridActive: true,
  doorOpen: false,
  simulated: true,
  lastUpdated: '2026-11-18T06:00:00Z',
};
