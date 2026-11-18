import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export function createDatabase(dbPath: string = 'farmgate.sqlite') {
  const sqlite = new Database(dbPath);
  // Enable WAL mode for high concurrency
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // Auto-create tables if they don't exist
  initSchema(sqlite);

  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

export function initSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      village TEXT NOT NULL,
      phone TEXT NOT NULL,
      upi_id TEXT NOT NULL,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      preferred_channel TEXT NOT NULL DEFAULT 'app',
      opt_in_public_traceability INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS buyers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT NOT NULL,
      reliability_score INTEGER NOT NULL DEFAULT 90
    );

    CREATE TABLE IF NOT EXISTS crops (
      name TEXT PRIMARY KEY,
      floor_price_paise_per_kg INTEGER NOT NULL,
      baseline_mandi_price_paise_per_kg INTEGER NOT NULL,
      retail_reference_price_paise_per_kg INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mandi_prices (
      id TEXT PRIMARY KEY,
      crop TEXT NOT NULL,
      date TEXT NOT NULL,
      price_paise_per_kg INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lots (
      id TEXT PRIMARY KEY,
      lot_number INTEGER NOT NULL,
      farmer_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      weight_grams INTEGER NOT NULL,
      grade TEXT NOT NULL,
      status TEXT NOT NULL,
      intake_price_estimate_paise INTEGER NOT NULL,
      final_sale_price_paise_per_kg INTEGER,
      holding_limit_hours INTEGER NOT NULL DEFAULT 72,
      received_at TEXT NOT NULL,
      sold_at TEXT,
      hours_in_pod INTEGER NOT NULL DEFAULT 0,
      qr_code TEXT NOT NULL,
      quality_json TEXT NOT NULL,
      timeline_json TEXT NOT NULL,
      advance_requested INTEGER NOT NULL DEFAULT 0,
      advance_settled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS buyer_orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      grade TEXT NOT NULL,
      quantity_grams INTEGER NOT NULL,
      offered_price_paise_per_kg INTEGER NOT NULL,
      delivery_window_hours INTEGER NOT NULL,
      deposit_cleared INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collective_loads (
      id TEXT PRIMARY KEY,
      buyer_order_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      grade TEXT NOT NULL,
      total_weight_grams INTEGER NOT NULL,
      price_paise_per_kg INTEGER NOT NULL,
      lot_ids_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT NOT NULL,
      dispatched_at TEXT
    );

    CREATE TABLE IF NOT EXISTS advances (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      requested_amount_paise INTEGER NOT NULL,
      approved_amount_paise INTEGER,
      status TEXT NOT NULL DEFAULT 'requested',
      requested_at TEXT NOT NULL,
      settled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL,
      farmer_id TEXT NOT NULL,
      gross_amount_paise INTEGER NOT NULL,
      fee_deducted_paise INTEGER NOT NULL,
      advance_recovered_paise INTEGER NOT NULL DEFAULT 0,
      net_paid_paise INTEGER NOT NULL,
      due_at TEXT NOT NULL,
      paid_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      upi_transaction_id TEXT
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      crop TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      consumer_reference_price_paise_per_kg INTEGER NOT NULL,
      transport_cost_paise_per_kg INTEGER NOT NULL,
      handling_wastage_paise_per_kg INTEGER NOT NULL,
      intermediary_margin_paise_per_kg INTEGER NOT NULL,
      farmer_gross_price_paise_per_kg INTEGER NOT NULL,
      farmer_share_percent REAL NOT NULL,
      hub_storage_fee_paise_per_kg INTEGER NOT NULL,
      hub_commission_paise_per_kg INTEGER NOT NULL,
      total_hub_fee_paise_per_kg INTEGER NOT NULL,
      net_farmer_price_paise_per_kg INTEGER NOT NULL,
      gross_sale_paise INTEGER NOT NULL,
      total_fees_paise INTEGER NOT NULL,
      advance_deducted_paise INTEGER NOT NULL DEFAULT 0,
      net_paid_paise INTEGER NOT NULL,
      typical_share_percent REAL NOT NULL DEFAULT 33,
      issued_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      transaction_type TEXT NOT NULL,
      debit_paise INTEGER NOT NULL DEFAULT 0,
      credit_paise INTEGER NOT NULL DEFAULT 0,
      reference_lot_id TEXT,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pod_telemetry (
      id TEXT PRIMARY KEY,
      capacity_kg INTEGER NOT NULL DEFAULT 10000,
      current_occupancy_kg REAL NOT NULL,
      temperature_celsius REAL NOT NULL,
      setpoint_celsius REAL NOT NULL DEFAULT 11.5,
      humidity_percent REAL NOT NULL,
      solar_output_watts REAL NOT NULL,
      thermal_backup_percent REAL NOT NULL,
      grid_active INTEGER NOT NULL DEFAULT 1,
      door_open INTEGER NOT NULL DEFAULT 0,
      simulated INTEGER NOT NULL DEFAULT 1,
      last_updated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS channel_messages (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      direction TEXT NOT NULL,
      message_text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
}

// Default singleton disk database
export const defaultDb = createDatabase(process.env.DATABASE_URL || 'farmgate.sqlite');
export const db = defaultDb.db;
export const sqlite = defaultDb.sqlite;
