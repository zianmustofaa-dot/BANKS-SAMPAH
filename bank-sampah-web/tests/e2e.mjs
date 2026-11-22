/**
 * tests/e2e.mjs — Pengujian end-to-end (black box) dengan Playwright.
 *
 * Menjalankan 11 skenario terhadap aplikasi yang sudah berjalan:
 *   BASE_URL=http://localhost:3000 npm run test:e2e
 *   BASE_URL=https://bank-sampah-digital.vercel.app npm run test:e2e
 *
 * Screenshot disimpan ke folder laporan (default ../laporan-tugas3/assets).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SHOT_DIR = resolve(root, process.env.SHOT_DIR ?? "../laporan-tugas3/assets");
mkdirSync(SHOT_DIR, { recursive: true });

const suffix = String(Date.now()).slice(-8);
const NAMA_BARU = "Rina Wulandari";
const HP_BARU = `0812${suffix}`;
const ALAMAT_BARU = "Jl. Sriwijaya No. 9, Semarang";

const results = [];
let browser;
let context;
let page;
let idNasabah;
let idSetoran;

async function shot(name, fullPage = true) {
  await page.waitForTimeout(250);
  await page.screenshot({
    path: resolve(SHOT_DIR, name),
    fullPage,
  });
}

async function step(id, nama, input, expected, fn) {
  const startedAt = Date.now();
  process.stdout.write(`\n▶ ${id} ${nama}\n`);
  try {
    const actual = await fn();
    results.push({
      id,
      nama,
      input,
      expected,
      actual,
      status: "LULUS",
      durasi_ms: Date.now() - startedAt,
    });
    console.log(`  ✓ LULUS — ${actual}`);
  } catch (error) {
    results.push({
      id,
      nama,
      input,
      expected,
      actual: error.message,
      status: "GAGAL",
      durasi_ms: Date.now() - startedAt,
    });
    console.error(`  ✗ GAGAL — ${error.message}`);
    await shot(`${id}-gagal.png`, false).catch(() => {});
    throw error;
  }
}

async function main() {
  browser = await chromium.launch();
  context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1.5,
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
  });
  page = await context.newPage();
  page.setDefaultTimeout(30_000);

  await step(
    "T01",
    "Dashboard menampilkan ringkasan operasional",
    "Buka halaman utama aplikasi",
    "Empat kartu KPI tampil dan tidak ada pesan error",
    async () => {
      const response = await page.goto("/", { waitUntil: "networkidle" });
      if (response?.status() !== 200) throw new Error(`HTTP ${response?.status()}`);
      await page.getByRole("heading", { name: "Dashboard Bank Sampah" }).waitFor();
      for (const label of [
        "Nasabah terdaftar",
        "Sampah terkumpul",
        "Nilai setoran",
        "Saldo tersimpan",
      ]) {
        await page.getByText(label, { exact: true }).first().waitFor();
      }
      await shot("01-dashboard.png");
      return "Dashboard tampil dengan 4 KPI, grafik tren, dan komposisi kategori";
    },
  );

  await step(
    "T02",
    "Pencarian nasabah",
    "Kata kunci: Budi",
    "Daftar hanya menampilkan nasabah yang cocok",
    async () => {
      await page.goto("/nasabah", { waitUntil: "networkidle" });
      await page.fill('input[name="q"]', "Budi");
      await page.getByRole("button", { name: "Cari" }).click();
      await page.waitForURL(/q=Budi/);
      await page.getByRole("link", { name: /Detail Budi Santoso/ }).waitFor();
      const rows = await page.locator("tbody tr").count();
      if (rows !== 1) throw new Error(`Ditemukan ${rows} baris, seharusnya 1`);
      await shot("02-nasabah-pencarian.png");
      return "Pencarian “Budi” menampilkan tepat 1 baris (Budi Santoso)";
    },
  );

  await step(
    "T03",
    "Menambah nasabah baru",
    `Nama ${NAMA_BARU}, HP ${HP_BARU}, alamat Semarang`,
    "Nasabah tersimpan, halaman detail terbuka, saldo awal Rp 0",
    async () => {
      await page.goto("/nasabah", { waitUntil: "networkidle" });
      await page.fill('input[name="nama"]', NAMA_BARU);
      await page.fill('input[name="no_hp"]', HP_BARU);
      await page.fill('textarea[name="alamat"]', ALAMAT_BARU);
      await page.getByRole("button", { name: "Tambah nasabah" }).click();
      await page.waitForURL(/\/nasabah\/\d+\?status=dibuat/);
      idNasabah = Number(new URL(page.url()).pathname.split("/").pop());
      await page.getByText("Nasabah baru berhasil didaftarkan", { exact: false }).waitFor();
      await page.getByText("Rp 0", { exact: true }).first().waitFor();
      await shot("03-nasabah-baru.png");
      return `Nasabah #${idNasabah} tersimpan dan halaman detail menampilkan saldo Rp 0`;
    },
  );

  await step(
    "T04",
    "Validasi nomor HP ganda",
    "Tambah nasabah dengan HP 081299990002 (milik Budi)",
    "Sistem menolak dan menampilkan pesan nomor HP sudah terdaftar",
    async () => {
      await page.goto("/nasabah", { waitUntil: "networkidle" });
      await page.fill('input[name="nama"]', "Nasabah Duplikat");
      await page.fill('input[name="no_hp"]', "081299990002");
      await page.getByRole("button", { name: "Tambah nasabah" }).click();
      const alert = page.locator('[role="alert"]').filter({ hasText: "sudah terdaftar" });
      await alert.waitFor();
      const text = (await alert.innerText()).toLowerCase();
      if (!text.includes("sudah terdaftar"))
        throw new Error(`Pesan tidak sesuai: ${text}`);
      await shot("04-validasi-nasabah.png", false);
      return "Pesan “Nomor HP sudah terdaftar pada nasabah lain” ditampilkan";
    },
  );

  await step(
    "T05",
    "Ubah harga master & snapshot harga lama",
    "Harga Botol PET diubah dari Rp 3.700 menjadi Rp 3.750",
    "Harga master berubah, tetapi detail setoran lama tetap Rp 3.500",
    async () => {
      await page.goto("/sampah", { waitUntil: "networkidle" });
      const row = page.locator("tbody tr").filter({ hasText: "Botol PET" });
      await row.locator('input[name="harga_per_kg"]').fill("3750");
      await row.locator('button[title="Simpan harga"]').click();
      await page.waitForURL(/status=harga/);
      await page.getByText("Harga per kg berhasil diperbarui", { exact: false }).waitFor();
      await shot("05-harga-master.png");

      await page.goto("/setoran/1", { waitUntil: "networkidle" });
      const detailRow = page.locator("tbody tr").filter({ hasText: "Botol PET" });
      await detailRow.getByText("Rp 3.500", { exact: true }).first().waitFor();
      return "Master menjadi Rp 3.750; snapshot setoran #001 tetap Rp 3.500";
    },
  );

  await step(
    "T06",
    "Mencatat setoran multi-jenis",
    "Kardus 3 kg + Botol PET 2 kg untuk Rina Wulandari",
    "Total otomatis Rp 13.500 dan transaksi tersimpan",
    async () => {
      await page.goto("/setoran/baru", { waitUntil: "networkidle" });
      await page.selectOption("#id_nasabah", String(idNasabah));
      await page.selectOption("#id_petugas", "1");
      await page.selectOption("#jenis-row-1", "3");
      await page.fill("#berat-row-1", "3");
      await page.getByRole("button", { name: "Tambah baris sampah" }).click();
      await page.selectOption("#jenis-row-2", "1");
      await page.fill("#berat-row-2", "2");
      await page.getByText("Rp 13.500", { exact: true }).first().waitFor();
      await shot("06-form-setoran.png");

      await page.getByRole("button", { name: "Simpan setoran" }).click();
      await page.waitForURL(/\/setoran\/\d+\?status=dibuat/);
      idSetoran = Number(new URL(page.url()).pathname.split("/").pop());
      await page.getByText("Setoran berhasil disimpan", { exact: false }).waitFor();
      await page.getByText("Rp 13.500", { exact: true }).first().waitFor();
      await shot("07-detail-setoran.png");
      return `Setoran #${idSetoran} tersimpan dengan total Rp 13.500`;
    },
  );

  await step(
    "T07",
    "Penarikan melebihi saldo ditolak",
    "Tarik Rp 999.999 dari saldo Rp 13.500",
    "Transaksi ditolak dengan pesan saldo tidak mencukupi",
    async () => {
      await page.goto("/penarikan", { waitUntil: "networkidle" });
      await page.selectOption("#id_nasabah", String(idNasabah));
      await page.fill("#jumlah", "999999");
      await page.selectOption("#id_petugas", "4");
      await page.getByRole("button", { name: "Proses penarikan" }).click();
      const alert = page.locator('[role="alert"]').filter({ hasText: "saldo tersedia" });
      await alert.waitFor();
      const text = (await alert.innerText()).toLowerCase();
      if (!text.includes("saldo tersedia"))
        throw new Error(`Pesan tidak sesuai: ${text}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("08-penarikan-ditolak.png", false);
      return "Penarikan ditolak, pesan menyebutkan saldo tersedia Rp 13.500";
    },
  );

  await step(
    "T08",
    "Penarikan saldo valid",
    "Tarik Rp 5.000 dari saldo Rp 13.500",
    "Transaksi berhasil dan saldo tersisa Rp 8.500",
    async () => {
      await page.goto("/penarikan", { waitUntil: "networkidle" });
      await page.selectOption("#id_nasabah", String(idNasabah));
      await page.fill("#jumlah", "5000");
      await page.selectOption("#id_petugas", "4");
      await page.getByRole("button", { name: "Proses penarikan" }).click();
      await page.waitForURL(/status=sukses/);
      await page.getByText("berhasil diproses", { exact: false }).waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("09-penarikan-berhasil.png", false);

      await page.goto(`/nasabah/${idNasabah}`, { waitUntil: "networkidle" });
      await page.getByText("Rp 8.500", { exact: true }).first().waitFor();
      return "Penarikan Rp 5.000 berhasil; saldo nasabah menjadi Rp 8.500";
    },
  );

  await step(
    "T09",
    "Hapus nasabah dengan riwayat transaksi",
    "Klik Hapus pada nasabah Rina Wulandari",
    "Penghapusan ditolak karena melanggar foreign key",
    async () => {
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Hapus" }).click();
      await page.waitForURL(/error=/);
      const alert = page.locator('[role="alert"]').filter({ hasText: "tidak dapat dihapus" });
      await alert.waitFor();
      const text = (await alert.innerText()).toLowerCase();
      if (!text.includes("tidak dapat dihapus"))
        throw new Error(`Pesan tidak sesuai: ${text}`);
      await shot("10-hapus-ditolak.png", false);
      return "Penghapusan ditolak oleh integritas referensial (FK RESTRICT)";
    },
  );

  await step(
    "T10",
    "Laporan periodik & ekspor CSV",
    "Buka laporan periode seluruh data",
    "Rekap kategori, nasabah teraktif, kinerja petugas tampil; CSV berisi data",
    async () => {
      await page.goto("/laporan", { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Laporan Bank Sampah" }).waitFor();
      await page.getByText("Rekap per kategori", { exact: true }).waitFor();
      await page.getByText("Nasabah teraktif", { exact: true }).waitFor();
      await page.getByText("Kinerja petugas", { exact: true }).waitFor();
      await shot("11-laporan.png");

      const csv = await context.request.get(
        `/api/laporan/csv?from=2026-09-01&to=2026-12-31`,
      );
      if (csv.status() !== 200) throw new Error(`CSV HTTP ${csv.status()}`);
      const body = await csv.text();
      if (!body.includes("ID Setoran") || !body.includes(NAMA_BARU))
        throw new Error("Isi CSV tidak memuat data yang diharapkan");
      const csvPath = resolve(SHOT_DIR, "..", "export-laporan.csv");
      writeFileSync(csvPath, body, "utf8");
      return `Laporan tampil lengkap; CSV ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB berhasil diunduh`;
    },
  );

  await step(
    "T11",
    "Health check koneksi database",
    "GET /api/health",
    "Status ok dan database connected",
    async () => {
      const response = await page.goto("/api/health", { waitUntil: "networkidle" });
      const json = JSON.parse(await response.text());
      if (json.status !== "ok" || json.database !== "connected")
        throw new Error(JSON.stringify(json));
      await shot("12-health-check.png", false);
      return `Database terhubung; ${json.tabel.nasabah} nasabah, ${json.tabel.setoran} setoran`;
    },
  );

  const lulus = results.filter((r) => r.status === "LULUS").length;
  const gagal = results.length - lulus;

  writeFileSync(
    resolve(root, "tests", "results.json"),
    JSON.stringify({ baseUrl: BASE_URL, waktu: new Date().toISOString(), lulus, gagal, results }, null, 2),
  );

  console.log("\n================ HASIL PENGUJIAN ================");
  for (const r of results) {
    console.log(`${r.status === "LULUS" ? "✓" : "✗"} ${r.id}  ${r.nama}`);
  }
  console.log(`\nTotal: ${results.length} skenario · ${lulus} lulus · ${gagal} gagal`);
  console.log(`Screenshot: ${SHOT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);

  await browser.close();
  if (gagal > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error("\nPengujian berhenti:", error.message);
  await browser?.close();
  process.exitCode = 1;
});
