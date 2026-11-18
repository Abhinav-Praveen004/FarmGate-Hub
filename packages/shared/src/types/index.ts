import { z } from 'zod';

export const CropSchema = z.enum(['tomato', 'onion', 'potato', 'banana', 'mango']);
export type Crop = z.infer<typeof CropSchema>;

export const GradeSchema = z.enum(['A', 'B', 'C']);
export type Grade = z.infer<typeof GradeSchema>;

export const LotStatusSchema = z.enum([
  'received',
  'graded',
  'in_pod',
  'dispatched',
  'sold',
  'payout_pending',
  'paid',
  'receipted',
  'routed_to_processor',
]);
export type LotStatus = z.infer<typeof LotStatusSchema>;

export const ActionTypeSchema = z.enum(['SELL', 'HOLD']);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const LanguageSchema = z.enum(['en', 'hi', 'ta']);
export type Language = z.infer<typeof LanguageSchema>;

export const ChannelPreferenceSchema = z.enum(['app', 'whatsapp', 'voice']);
export type ChannelPreference = z.infer<typeof ChannelPreferenceSchema>;

export const PersonaIdSchema = z.enum([
  'farmer_meena',
  'operator_ravi',
  'buyer_annapurna',
  'investor',
]);
export type PersonaId = z.infer<typeof PersonaIdSchema>;

// Core Domain Schemas
export const FarmerSchema = z.object({
  id: z.string(),
  name: z.string(),
  village: z.string(),
  phone: z.string(),
  upiId: z.string(),
  preferredLanguage: LanguageSchema,
  preferredChannel: ChannelPreferenceSchema,
  optInPublicTraceability: z.boolean(),
});
export type Farmer = z.infer<typeof FarmerSchema>;

export const QualityParametersSchema = z.object({
  blemishPercent: z.number().min(0).max(100),
  firmness: z.number().min(1).max(5),
  sizeClass: z.enum(['small', 'medium', 'large']),
  ripeness: z.enum(['green', 'breaker', 'turning', 'pink', 'light_red', 'red']),
});
export type QualityParameters = z.infer<typeof QualityParametersSchema>;

export const LotTimelineEventSchema = z.object({
  timestamp: z.string(),
  status: LotStatusSchema,
  actor: z.string(),
  note: z.string().optional(),
});
export type LotTimelineEvent = z.infer<typeof LotTimelineEventSchema>;

export const LotSchema = z.object({
  id: z.string(),
  lotNumber: z.number(),
  farmerId: z.string(),
  crop: CropSchema,
  weightGrams: z.number().int().nonnegative(),
  grade: GradeSchema,
  status: LotStatusSchema,
  intakePriceEstimatePaise: z.number().int().nonnegative(),
  finalSalePricePaisePerKg: z.number().int().nonnegative().optional(),
  holdingLimitHours: z.number().int().default(72),
  receivedAt: z.string(),
  soldAt: z.string().optional(),
  hoursInPod: z.number().int().default(0),
  qrCode: z.string(),
  quality: QualityParametersSchema,
  timeline: z.array(LotTimelineEventSchema),
  advanceRequested: z.boolean().default(false),
  advanceSettled: z.boolean().default(false),
});
export type Lot = z.infer<typeof LotSchema>;

export const BuyerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['kirana_network', 'restaurant_group', 'institutional_kitchen', 'processor']),
  phone: z.string(),
  reliabilityScore: z.number().min(0).max(100),
});
export type Buyer = z.infer<typeof BuyerSchema>;

export const BuyerOrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  crop: CropSchema,
  grade: GradeSchema,
  quantityGrams: z.number().int().positive(),
  offeredPricePaisePerKg: z.number().int().positive(),
  deliveryWindowHours: z.number().int().positive(),
  depositCleared: z.boolean().default(false),
  status: z.enum(['open', 'matched', 'fulfilled', 'cancelled']),
  createdAt: z.string(),
});
export type BuyerOrder = z.infer<typeof BuyerOrderSchema>;

export const CollectiveLoadSchema = z.object({
  id: z.string(),
  buyerOrderId: z.string(),
  crop: CropSchema,
  grade: GradeSchema,
  totalWeightGrams: z.number().int().positive(),
  pricePaisePerKg: z.number().int().positive(),
  lotIds: z.array(z.string()),
  status: z.enum(['created', 'confirmed', 'dispatched']),
  createdAt: z.string(),
  dispatchedAt: z.string().optional(),
});
export type CollectiveLoad = z.infer<typeof CollectiveLoadSchema>;

export const AdvanceRequestSchema = z.object({
  id: z.string(),
  lotId: z.string(),
  farmerId: z.string(),
  requestedAmountPaise: z.number().int().positive(),
  approvedAmountPaise: z.number().int().nonnegative().optional(),
  status: z.enum(['requested', 'approved', 'declined', 'recovered']),
  requestedAt: z.string(),
  settledAt: z.string().optional(),
});
export type AdvanceRequest = z.infer<typeof AdvanceRequestSchema>;

export const PayoutSchema = z.object({
  id: z.string(),
  lotId: z.string(),
  farmerId: z.string(),
  grossAmountPaise: z.number().int().positive(),
  feeDeductedPaise: z.number().int().nonnegative(),
  advanceRecoveredPaise: z.number().int().nonnegative(),
  netPaidPaise: z.number().int().nonnegative(),
  dueAt: z.string(),
  paidAt: z.string().optional(),
  status: z.enum(['pending', 'settled', 'failed']),
  upiTransactionId: z.string().optional(),
});
export type Payout = z.infer<typeof PayoutSchema>;

export const ReceiptSchema = z.object({
  id: z.string(),
  lotId: z.string(),
  farmerName: z.string(),
  crop: CropSchema,
  weightKg: z.number(),
  consumerReferencePricePaisePerKg: z.number().int(),
  transportCostPaisePerKg: z.number().int(),
  handlingWastagePaisePerKg: z.number().int(),
  intermediaryMarginPaisePerKg: z.number().int(),
  farmerGrossPricePaisePerKg: z.number().int(),
  farmerSharePercent: z.number(),
  hubStorageFeePaisePerKg: z.number().int(),
  hubCommissionPaisePerKg: z.number().int(),
  totalHubFeePaisePerKg: z.number().int(),
  netFarmerPricePaisePerKg: z.number().int(),
  grossSalePaise: z.number().int(),
  totalFeesPaise: z.number().int(),
  advanceDeductedPaise: z.number().int(),
  netPaidPaise: z.number().int(),
  typicalSharePercent: z.number().default(33),
  issuedAt: z.string(),
});
export type Receipt = z.infer<typeof ReceiptSchema>;

export const PodTelemetrySchema = z.object({
  capacityKg: z.number().int().default(10000),
  currentOccupancyKg: z.number(),
  temperatureCelsius: z.number(),
  setpointCelsius: z.number().default(11.5),
  humidityPercent: z.number(),
  solarOutputWatts: z.number(),
  thermalBackupPercent: z.number(),
  gridActive: z.boolean(),
  doorOpen: z.boolean(),
  simulated: z.literal(true).default(true),
  lastUpdated: z.string(),
});
export type PodTelemetry = z.infer<typeof PodTelemetrySchema>;
