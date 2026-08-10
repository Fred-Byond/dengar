/**
 * SQLite data layer (better-sqlite3).
 *
 * Pilot-grade persistence chosen deliberately: file-backed, transactional,
 * zero-ops on the single-container deployment. The schema is written in
 * portable SQL so the move to Postgres is a driver swap, not a redesign.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seedIfEmpty } from "./seed";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS territories (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES markets(id),
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS distributors (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES markets(id),
  territory_id TEXT NOT NULL REFERENCES territories(id),
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS access_codes (
  code TEXT PRIMARY KEY,
  distributor_id TEXT NOT NULL REFERENCES distributors(id),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS advisors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  distributor_id TEXT NOT NULL REFERENCES distributors(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  launch_label TEXT
);
CREATE TABLE IF NOT EXISTS launch_packs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  version INTEGER NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES markets(id),
  starts_at TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  booked INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_slots_market_time
  ON slots(market_id, starts_at);
CREATE TABLE IF NOT EXISTS appointments (
  ref TEXT PRIMARY KEY,
  advisor_id TEXT NOT NULL REFERENCES advisors(id),
  slot_id TEXT NOT NULL REFERENCES slots(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  focus TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  appointment_ref TEXT NOT NULL REFERENCES appointments(ref),
  advisor_id TEXT NOT NULL REFERENCES advisors(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  focus TEXT NOT NULL,
  language TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  engine TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_turns_session ON turns(session_id);
CREATE TABLE IF NOT EXISTS scorecards (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id),
  advisor_id TEXT NOT NULL REFERENCES advisors(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  overall INTEGER NOT NULL,
  dimensions TEXT NOT NULL,
  certified INTEGER NOT NULL,
  practice_next TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

let db: Database.Database | null = null;

/** Additive migrations for databases created before a column existed. */
function migrate(d: Database.Database): void {
  const productCols = (
    d.prepare("PRAGMA table_info(products)").all() as { name: string }[]
  ).map((c) => c.name);
  if (!productCols.includes("image_mime")) {
    d.exec("ALTER TABLE products ADD COLUMN image_mime TEXT");
    d.exec("ALTER TABLE products ADD COLUMN image_data BLOB");
  }
  const codeCols = (
    d.prepare("PRAGMA table_info(access_codes)").all() as { name: string }[]
  ).map((c) => c.name);
  if (!codeCols.includes("role")) {
    d.exec(
      "ALTER TABLE access_codes ADD COLUMN role TEXT NOT NULL DEFAULT 'advisor'"
    );
  }
  // Product-team code for the Nexus (demo value; issued per team in prod).
  d.prepare(
    `INSERT OR IGNORE INTO access_codes (code, distributor_id, active, created_at, role)
     VALUES ('LOREAL-PM-2026', 'gulf-beauty', 1, ?, 'product-team')`
  ).run(new Date().toISOString());
}

export function getDb(): Database.Database {
  if (db) return db;
  const file =
    process.env["COACH_DB_PATH"] || path.join(process.cwd(), "data", "coach.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  migrate(db);
  return db;
}
