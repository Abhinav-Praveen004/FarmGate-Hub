import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const farmers = sqliteTable('farmers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  village: text('village').notNull(),
  phone: text('phone').notNull(),
  upiId: text('upi_id').notNull(),
  preferredLanguage: text('preferred_language').notNull().default('en'),
  preferredChannel: text('preferred_channel').notNull().default('app'),
  optInPublicTraceability: integer('opt_in_public_traceability', { mode: 'boolean' }).notNull().default(true),
});

export const buyers = sqliteTable('buyers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  phone: text('phone').notNull(),
  reliabilityScore: integer('reliability_score').notNull().default(90),
});

export const crops = sqliteTable('crops', {
  name: text('name').primaryKey(), // 'tomato', 'onion', 'potato', 'banana', 'mango'
  floorPricePaisePerKg: integer('floor_price_paise_per_kg').notNull(),
  baselineMandiPricePaisePerKg: integer('baseline_mandi_price_paise_per_kg').notNull(),
  retailReferencePricePaisePerKg: integer('retail_reference_price_paise_per_kg').notNull(),
});

export const mandiPrices = sqliteTable('mandi_prices', {
  id: text('id').primaryKey(),
  crop: text('crop').notNull(),
  date: text('date').notNull(),
  pricePaisePerKg: integer('price_paise_per_kg').notNull(),
});

export const lots = sqliteTable('lots', {
  id: text('id').primaryKey(),
  lotNumber: integer('lot_number').notNull(),
  farmerId: text('farmer_id').notNull(),
  crop: text('crop').notNull(),
  weightGrams: integer('weight_grams').notNull(),
  grade: text('grade').notNull(),
  status: text('status').notNull(),
  intakePriceEstimatePaise: integer('intake_price_estimate_paise').notNull(),
  finalSalePricePaisePerKg: integer('final_sale_price_paise_per_kg'),
  holdingLimitHours: integer('holding_limit_hours').notNull().default(72),
  receivedAt: text('received_at').notNull(),
  soldAt: text('sold_at'),
  hoursInPod: integer('hours_in_pod').notNull().default(0),
  qrCode: text('qr_code').notNull(),
  qualityJson: text('quality_json').notNull(),
  timelineJson: text('timeline_json').notNull(),
  advanceRequested: integer('advance_requested', { mode: 'boolean' }).notNull().default(false),
  advanceSettled: integer('advance_settled', { mode: 'boolean' }).notNull().default(false),
});

export const buyerOrders = sqliteTable('buyer_orders', {
  id: text('id').primaryKey(),
  buyerId: text('buyer_id').notNull(),
  crop: text('crop').notNull(),
  grade: text('grade').notNull(),
  quantityGrams: integer('quantity_grams').notNull(),
  offeredPricePaisePerKg: integer('offered_price_paise_per_kg').notNull(),
  deliveryWindowHours: integer('delivery_window_hours').notNull(),
  depositCleared: integer('deposit_cleared', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('open'),
  createdAt: text('created_at').notNull(),
});

export const collectiveLoads = sqliteTable('collective_loads', {
  id: text('id').primaryKey(),
  buyerOrderId: text('buyer_order_id').notNull(),
  crop: text('crop').notNull(),
  grade: text('grade').notNull(),
  totalWeightGrams: integer('total_weight_grams').notNull(),
  pricePaisePerKg: integer('price_paise_per_kg').notNull(),
  lotIdsJson: text('lot_ids_json').notNull(),
  status: text('status').notNull().default('created'),
  createdAt: text('created_at').notNull(),
  dispatchedAt: text('dispatched_at'),
});

export const advances = sqliteTable('advances', {
  id: text('id').primaryKey(),
  lotId: text('lot_id').notNull(),
  farmerId: text('farmer_id').notNull(),
  requestedAmountPaise: integer('requested_amount_paise').notNull(),
  approvedAmountPaise: integer('approved_amount_paise'),
  status: text('status').notNull().default('requested'),
  requestedAt: text('requested_at').notNull(),
  settledAt: text('settled_at'),
});

export const payouts = sqliteTable('payouts', {
  id: text('id').primaryKey(),
  lotId: text('lot_id').notNull(),
  farmerId: text('farmer_id').notNull(),
  grossAmountPaise: integer('gross_amount_paise').notNull(),
  feeDeductedPaise: integer('fee_deducted_paise').notNull(),
  advanceRecoveredPaise: integer('advance_recovered_paise').notNull().default(0),
  netPaidPaise: integer('net_paid_paise').notNull(),
  dueAt: text('due_at').notNull(), // 24h SLA
  paidAt: text('paid_at'),
  status: text('status').notNull().default('pending'),
  upiTransactionId: text('upi_transaction_id'),
});

export const receipts = sqliteTable('receipts', {
  id: text('id').primaryKey(),
  lotId: text('lot_id').notNull(),
  farmerName: text('farmer_name').notNull(),
  crop: text('crop').notNull(),
  weightKg: real('weight_kg').notNull(),
  consumerReferencePricePaisePerKg: integer('consumer_reference_price_paise_per_kg').notNull(),
  transportCostPaisePerKg: integer('transport_cost_paise_per_kg').notNull(),
  handlingWastagePaisePerKg: integer('handling_wastage_paise_per_kg').notNull(),
  intermediaryMarginPaisePerKg: integer('intermediary_margin_paise_per_kg').notNull(),
  farmerGrossPricePaisePerKg: integer('farmer_gross_price_paise_per_kg').notNull(),
  farmerSharePercent: real('farmer_share_percent').notNull(),
  hubStorageFeePaisePerKg: integer('hub_storage_fee_paise_per_kg').notNull(),
  hubCommissionPaisePerKg: integer('hub_commission_paise_per_kg').notNull(),
  totalHubFeePaisePerKg: integer('total_hub_fee_paise_per_kg').notNull(),
  netFarmerPricePaisePerKg: integer('net_farmer_price_paise_per_kg').notNull(),
  grossSalePaise: integer('gross_sale_paise').notNull(),
  totalFeesPaise: integer('total_fees_paise').notNull(),
  advanceDeductedPaise: integer('advance_deducted_paise').notNull().default(0),
  netPaidPaise: integer('net_paid_paise').notNull(),
  typicalSharePercent: real('typical_share_percent').notNull().default(33),
  issuedAt: text('issued_at').notNull(),
});

export const ledgerEntries = sqliteTable('ledger_entries', {
  id: text('id').primaryKey(),
  transactionType: text('transaction_type').notNull(), // buyer_payment, farmer_payable, hub_fee, commission, advance
  debitPaise: integer('debit_paise').notNull().default(0),
  creditPaise: integer('credit_paise').notNull().default(0),
  referenceLotId: text('reference_lot_id'),
  note: text('note'),
  createdAt: text('created_at').notNull(),
});

export const podTelemetry = sqliteTable('pod_telemetry', {
  id: text('id').primaryKey(),
  capacityKg: integer('capacity_kg').notNull().default(10000),
  currentOccupancyKg: real('current_occupancy_kg').notNull(),
  temperatureCelsius: real('temperature_celsius').notNull(),
  setpointCelsius: real('setpoint_celsius').notNull().default(11.5),
  humidityPercent: real('humidity_percent').notNull(),
  solarOutputWatts: real('solar_output_watts').notNull(),
  thermalBackupPercent: real('thermal_backup_percent').notNull(),
  gridActive: integer('grid_active', { mode: 'boolean' }).notNull().default(true),
  doorOpen: integer('door_open', { mode: 'boolean' }).notNull().default(false),
  simulated: integer('simulated', { mode: 'boolean' }).notNull().default(true),
  lastUpdated: text('last_updated').notNull(),
});

export const channelMessages = sqliteTable('channel_messages', {
  id: text('id').primaryKey(),
  farmerId: text('farmer_id').notNull(),
  channel: text('channel').notNull(), // 'whatsapp' | 'voice' | 'app'
  direction: text('direction').notNull(), // 'inbound' | 'outbound'
  messageText: text('message_text').notNull(),
  timestamp: text('timestamp').notNull(),
});
