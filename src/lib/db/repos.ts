/**
 * Typed data access for the Beauty Coach domain.
 * Slot booking uses a capacity-guarded UPDATE inside a transaction — the
 * real locking dengar only had as a type comment.
 */

import crypto from "node:crypto";
import { getDb } from "./index";
import type {
  Advisor,
  AdvisorContext,
  AdvisorRole,
  Appointment,
  CoachingFocus,
  CoachSession,
  CoachTurn,
  LaunchPack,
  Product,
  Scorecard,
  Slot,
} from "@/lib/coach/types";

// ---------- org / auth ----------

export function resolveAccessCode(code: string): AdvisorContext | null {
  const row = getDb()
    .prepare(
      `SELECT d.id AS distributorId, d.name AS distributorName,
              t.id AS territoryId, t.name AS territoryName,
              m.id AS marketId, m.name AS marketName
         FROM access_codes c
         JOIN distributors d ON d.id = c.distributor_id
         JOIN territories t ON t.id = d.territory_id
         JOIN markets m ON m.id = d.market_id
        WHERE c.code = ? AND c.active = 1 AND c.role = 'advisor'`
    )
    .get(code.trim().toUpperCase()) as
    | Omit<AdvisorContext, "advisorId" | "advisorName" | "role">
    | undefined;
  return row ? { ...row, advisorId: "", advisorName: "", role: "agent" } : null;
}

/** Product-team access codes gate the Nexus. */
export function isProductTeamCode(code: string): boolean {
  const row = getDb()
    .prepare(
      "SELECT 1 AS ok FROM access_codes WHERE code = ? AND active = 1 AND role = 'product-team'"
    )
    .get(code.trim().toUpperCase());
  return !!row;
}

export function createAdvisor(
  name: string,
  role: AdvisorRole,
  distributorId: string
): Advisor {
  const advisor: Advisor = {
    id: `adv_${crypto.randomBytes(8).toString("hex")}`,
    name: name.trim(),
    role,
    distributorId,
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      "INSERT INTO advisors (id, name, role, distributor_id, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run(advisor.id, advisor.name, advisor.role, advisor.distributorId, advisor.createdAt);
  return advisor;
}

// ---------- catalog ----------

type ProductRow = {
  id: string;
  brand: string;
  category: Product["category"];
  name: string;
  tagline: string;
  launch_label: string | null;
};

export function listProducts(): Product[] {
  const rows = getDb()
    .prepare(
      "SELECT id, brand, category, name, tagline, launch_label FROM products ORDER BY launch_label IS NULL, name"
    )
    .all() as ProductRow[];
  return rows.map((r) => ({
    id: r.id,
    brand: r.brand,
    category: r.category,
    name: r.name,
    tagline: r.tagline,
    launchLabel: r.launch_label,
  }));
}

export function getProduct(id: string): Product | null {
  const r = getDb()
    .prepare(
      "SELECT id, brand, category, name, tagline, launch_label FROM products WHERE id = ?"
    )
    .get(id) as ProductRow | undefined;
  if (!r) return null;
  return {
    id: r.id,
    brand: r.brand,
    category: r.category,
    name: r.name,
    tagline: r.tagline,
    launchLabel: r.launch_label,
  };
}

export interface NexusProductSummary extends Product {
  packVersion: number | null;
  packUpdatedAt: string | null;
  hasImage: boolean;
}

/** Library view: every product with its latest pack version. */
export function listProductsForNexus(): NexusProductSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT p.id, p.brand, p.category, p.name, p.tagline, p.launch_label,
              (p.image_data IS NOT NULL) AS hasImage,
              (SELECT MAX(version) FROM launch_packs lp WHERE lp.product_id = p.id) AS packVersion,
              (SELECT MAX(created_at) FROM launch_packs lp WHERE lp.product_id = p.id) AS packUpdatedAt
         FROM products p ORDER BY p.launch_label IS NULL, p.name`
    )
    .all() as Array<{
    id: string; brand: string; category: Product["category"]; name: string;
    tagline: string; launch_label: string | null; hasImage: number;
    packVersion: number | null; packUpdatedAt: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id, brand: r.brand, category: r.category, name: r.name,
    tagline: r.tagline, launchLabel: r.launch_label,
    packVersion: r.packVersion, packUpdatedAt: r.packUpdatedAt,
    hasImage: !!r.hasImage,
  }));
}

export function getProductImage(
  id: string
): { mime: string; data: Buffer } | null {
  const row = getDb()
    .prepare(
      "SELECT image_mime AS mime, image_data AS data FROM products WHERE id = ? AND image_data IS NOT NULL"
    )
    .get(id) as { mime: string; data: Buffer } | undefined;
  return row ?? null;
}

/**
 * Create or update a product and publish a new immutable pack version.
 * Every save bumps the version — the coach always reads the latest, and
 * history stays auditable (message governance requirement).
 */
export function saveProductWithPack(input: {
  product: Product;
  pack: Omit<LaunchPack, "id" | "version" | "productId">;
  image?: { mime: string; data: Buffer } | null;
}): { version: number } {
  const db = getDb();
  const now = new Date().toISOString();
  let version = 1;
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO products (id, brand, category, name, tagline, launch_label)
       VALUES (@id, @brand, @category, @name, @tagline, @launchLabel)
       ON CONFLICT(id) DO UPDATE SET brand=@brand, category=@category,
         name=@name, tagline=@tagline, launch_label=@launchLabel`
    ).run({
      id: input.product.id, brand: input.product.brand,
      category: input.product.category, name: input.product.name,
      tagline: input.product.tagline, launchLabel: input.product.launchLabel,
    });
    if (input.image) {
      db.prepare(
        "UPDATE products SET image_mime = ?, image_data = ? WHERE id = ?"
      ).run(input.image.mime, input.image.data, input.product.id);
    }
    const maxRow = db
      .prepare(
        "SELECT MAX(version) AS v FROM launch_packs WHERE product_id = ? AND language = ?"
      )
      .get(input.product.id, input.pack.language) as { v: number | null };
    version = (maxRow.v ?? 0) + 1;
    const pack: LaunchPack = {
      ...input.pack,
      id: `pack-${input.product.id}-${input.pack.language.toLowerCase()}-v${version}`,
      productId: input.product.id,
      version,
    };
    db.prepare(
      `INSERT INTO launch_packs (id, product_id, version, language, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(pack.id, pack.productId, version, pack.language, JSON.stringify(pack), now);
  });
  tx();
  return { version };
}

export function getLatestPack(
  productId: string,
  language: string
): LaunchPack | null {
  const row = getDb()
    .prepare(
      `SELECT content FROM launch_packs
        WHERE product_id = ? AND language = ?
        ORDER BY version DESC LIMIT 1`
    )
    .get(productId, language) as { content: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.content) as LaunchPack;
}

// ---------- slots ----------

const SLOT_HOURS = [10, 11, 12, 14, 15, 16];
const SLOT_CAPACITY = 3; // concurrent-session tier for the pilot

/** Rolling 7-day slot inventory, generated idempotently per market. */
export function ensureSlots(marketId: string): void {
  const db = getDb();
  const insert = db.prepare(
    "INSERT OR IGNORE INTO slots (id, market_id, starts_at, capacity, booked) VALUES (?, ?, ?, ?, 0)"
  );
  const tx = db.transaction(() => {
    const base = new Date();
    for (let d = 1; d <= 7; d++) {
      const day = new Date(base);
      day.setDate(base.getDate() + d);
      for (const h of SLOT_HOURS) {
        for (const m of [0, 30]) {
          const at = new Date(day);
          at.setHours(h, m, 0, 0);
          const iso = at.toISOString();
          insert.run(`slot_${marketId}_${iso}`, marketId, iso, SLOT_CAPACITY);
        }
      }
    }
  });
  tx();
}

export function listSlots(marketId: string): Slot[] {
  ensureSlots(marketId);
  const rows = getDb()
    .prepare(
      `SELECT id, market_id AS marketId, starts_at AS startsAt, capacity, booked
         FROM slots
        WHERE market_id = ? AND starts_at > datetime('now')
        ORDER BY starts_at`
    )
    .all(marketId) as Slot[];
  return rows;
}

// ---------- appointments ----------

export class SlotFullError extends Error {
  constructor() {
    super("Slot is fully booked");
  }
}

export function bookAppointment(input: {
  advisorId: string;
  slotId: string;
  productId: string;
  focus: CoachingFocus;
  language: string;
}): Appointment {
  const db = getDb();
  const ref = `LBC-2026-${crypto.randomInt(100000, 999999)}`;
  const appt: Appointment = {
    ref,
    advisorId: input.advisorId,
    slotId: input.slotId,
    productId: input.productId,
    focus: input.focus,
    language: input.language,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  const tx = db.transaction(() => {
    const res = db
      .prepare(
        "UPDATE slots SET booked = booked + 1 WHERE id = ? AND booked < capacity"
      )
      .run(input.slotId);
    if (res.changes === 0) throw new SlotFullError();
    db.prepare(
      `INSERT INTO appointments (ref, advisor_id, slot_id, product_id, focus, language, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      appt.ref,
      appt.advisorId,
      appt.slotId,
      appt.productId,
      appt.focus,
      appt.language,
      appt.status,
      appt.createdAt
    );
  });
  tx();
  return appt;
}

export function getAppointment(ref: string): Appointment | null {
  const row = getDb()
    .prepare(
      `SELECT ref, advisor_id AS advisorId, slot_id AS slotId, product_id AS productId,
              focus, language, status, created_at AS createdAt
         FROM appointments WHERE ref = ?`
    )
    .get(ref) as Appointment | undefined;
  return row ?? null;
}

// ---------- sessions ----------

export function createSession(input: {
  appointmentRef: string;
  advisorId: string;
  productId: string;
  focus: CoachingFocus;
  language: string;
  engine: string;
}): CoachSession {
  const session: CoachSession = {
    id: `ses_${crypto.randomBytes(8).toString("hex")}`,
    appointmentRef: input.appointmentRef,
    advisorId: input.advisorId,
    productId: input.productId,
    focus: input.focus,
    language: input.language,
    startedAt: new Date().toISOString(),
    endedAt: null,
    engine: input.engine,
  };
  getDb()
    .prepare(
      `INSERT INTO sessions (id, appointment_ref, advisor_id, product_id, focus, language, started_at, ended_at, engine)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
    )
    .run(
      session.id,
      session.appointmentRef,
      session.advisorId,
      session.productId,
      session.focus,
      session.language,
      session.startedAt,
      session.engine
    );
  return session;
}

export function getSession(id: string): CoachSession | null {
  const row = getDb()
    .prepare(
      `SELECT id, appointment_ref AS appointmentRef, advisor_id AS advisorId,
              product_id AS productId, focus, language,
              started_at AS startedAt, ended_at AS endedAt, engine
         FROM sessions WHERE id = ?`
    )
    .get(id) as CoachSession | undefined;
  return row ?? null;
}

export function addTurn(sessionId: string, turn: CoachTurn): void {
  getDb()
    .prepare(
      "INSERT INTO turns (session_id, speaker, text, at) VALUES (?, ?, ?, ?)"
    )
    .run(sessionId, turn.speaker, turn.text, turn.at);
}

export function listTurns(sessionId: string): CoachTurn[] {
  return getDb()
    .prepare(
      "SELECT speaker, text, at FROM turns WHERE session_id = ? ORDER BY id"
    )
    .all(sessionId) as CoachTurn[];
}

export function endSession(sessionId: string): void {
  getDb()
    .prepare("UPDATE sessions SET ended_at = ? WHERE id = ? AND ended_at IS NULL")
    .run(new Date().toISOString(), sessionId);
  getDb()
    .prepare(
      "UPDATE appointments SET status = 'completed' WHERE ref = (SELECT appointment_ref FROM sessions WHERE id = ?)"
    )
    .run(sessionId);
}

// ---------- scorecards ----------

export function saveScorecard(card: Scorecard): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO scorecards
         (session_id, advisor_id, product_id, overall, dimensions, certified, practice_next, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      card.sessionId,
      card.advisorId,
      card.productId,
      card.overall,
      JSON.stringify(card.dimensions),
      card.certified ? 1 : 0,
      JSON.stringify(card.practiceNext),
      card.createdAt
    );
}
