/**
 * scripts/db-init.mjs
 * Menjalankan db/schema.sql lalu db/seed.sql ke database PostgreSQL
 * yang tertulis pada DATABASE_URL (.env.local atau environment).
 *
 * Pemakaian: npm run db:init
 * PERINGATAN: skrip ini menghapus lalu membuat ulang seluruh tabel.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  const file = resolve(root, ".env.local");
  if (!existsSync(file)) return;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL tidak ditemukan. Jalankan `vercel env pull` dahulu.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: connectionString.includes("sslmode=disable")
    ? undefined
    : { rejectUnauthorized: false },
});

function baca(nama) {
  return readFileSync(resolve(root, "db", nama), "utf8");
}

try {
  await client.connect();
  console.log("→ Terhubung ke database.");

  console.log("→ Menjalankan schema.sql (drop + create 7 tabel, view, trigger)…");
  await client.query(baca("schema.sql"));

  console.log("→ Menjalankan seed.sql (52 baris data awal)…");
  await client.query(baca("seed.sql"));

  const { rows } = await client.query(`
    SELECT 'kategori_sampah' AS tabel, COUNT(*)::int AS baris FROM kategori_sampah
    UNION ALL SELECT 'jenis_sampah', COUNT(*)::int FROM jenis_sampah
    UNION ALL SELECT 'nasabah', COUNT(*)::int FROM nasabah
    UNION ALL SELECT 'petugas', COUNT(*)::int FROM petugas
    UNION ALL SELECT 'setoran', COUNT(*)::int FROM setoran
    UNION ALL SELECT 'detail_setoran', COUNT(*)::int FROM detail_setoran
    UNION ALL SELECT 'penarikan_saldo', COUNT(*)::int FROM penarikan_saldo
    ORDER BY tabel
  `);

  console.table(rows);
  const total = rows.reduce((sum, row) => sum + row.baris, 0);
  console.log(`✓ Selesai. ${total} baris data siap digunakan.`);
} catch (error) {
  console.error("✗ Gagal inisialisasi database:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
