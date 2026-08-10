/**
 * Idempotent pilot seed: one GCC pilot market (UAE) plus a demo market,
 * distributor access codes, and the sample launch packs.
 *
 * Access codes are demo values for the pilot walkthrough — real codes are
 * issued per distributor during onboarding.
 */

import type Database from "better-sqlite3";
import { SEED_PACKS, SEED_PRODUCTS } from "@/lib/coach/packs";

export function seedIfEmpty(db: Database.Database): void {
  const row = db.prepare("SELECT COUNT(*) AS n FROM markets").get() as {
    n: number;
  };
  if (row.n > 0) return;

  const now = new Date().toISOString();

  const insertMarket = db.prepare(
    "INSERT INTO markets (id, name, region) VALUES (?, ?, ?)"
  );
  const insertTerritory = db.prepare(
    "INSERT INTO territories (id, market_id, name) VALUES (?, ?, ?)"
  );
  const insertDistributor = db.prepare(
    "INSERT INTO distributors (id, market_id, territory_id, name) VALUES (?, ?, ?, ?)"
  );
  const insertCode = db.prepare(
    "INSERT INTO access_codes (code, distributor_id, active, created_at) VALUES (?, ?, 1, ?)"
  );
  const insertProduct = db.prepare(
    "INSERT INTO products (id, brand, category, name, tagline, launch_label) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertPack = db.prepare(
    "INSERT INTO launch_packs (id, product_id, version, language, content, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const seed = db.transaction(() => {
    insertMarket.run("uae", "United Arab Emirates", "GCC");
    insertTerritory.run("uae-dxb", "uae", "Dubai");
    insertTerritory.run("uae-auh", "uae", "Abu Dhabi");
    insertTerritory.run("uae-shj", "uae", "Sharjah");
    insertDistributor.run("gulf-beauty", "uae", "uae-dxb", "Gulf Beauty Trading");
    insertDistributor.run("emerald-dist", "uae", "uae-auh", "Emerald Distribution");

    insertMarket.run("my", "Malaysia", "SAPMENA");
    insertTerritory.run("my-kul", "my", "Kuala Lumpur");
    insertTerritory.run("my-png", "my", "Penang");
    insertDistributor.run("kl-beauty", "my", "my-kul", "KL Beauty Network");

    insertCode.run("GULF-DXB-2026", "gulf-beauty", now);
    insertCode.run("EMERALD-AUH-2026", "emerald-dist", now);
    insertCode.run("KL-BEAUTY-2026", "kl-beauty", now);
    insertCode.run("DEMO-2026", "gulf-beauty", now);

    for (const p of SEED_PRODUCTS) {
      insertProduct.run(
        p.id,
        p.brand,
        p.category,
        p.name,
        p.tagline,
        p.launchLabel
      );
    }
    for (const pack of SEED_PACKS) {
      insertPack.run(
        pack.id,
        pack.productId,
        pack.version,
        pack.language,
        JSON.stringify(pack),
        now
      );
    }
  });
  seed();
}
