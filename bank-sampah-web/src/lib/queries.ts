import { query, queryOne } from "./db";
import type {
  JenisSampah,
  KinerjaPetugas,
  Nasabah,
  NasabahDenganSaldo,
  PenarikanRow,
  Petugas,
  RekapKategori,
  Ringkasan,
  SaldoRow,
  SetoranDetailRow,
  SetoranRow,
  TopNasabah,
} from "./types";

/* ------------------------------------------------------------------ */
/* Master                                                              */
/* ------------------------------------------------------------------ */

export function getNasabahList(search = "") {
  const term = `%${search.trim()}%`;
  return query<NasabahDenganSaldo>(
    `SELECT n.id_nasabah, n.nama, n.alamat, n.no_hp, n.tgl_daftar,
            COALESCE(v.total_setor, 0)::text AS total_setor,
            COALESCE(v.total_tarik, 0)::text AS total_tarik,
            COALESCE(v.saldo, 0)::text       AS saldo,
            (SELECT COUNT(*)::int FROM setoran s WHERE s.id_nasabah = n.id_nasabah) AS jumlah_setoran
     FROM nasabah n
     LEFT JOIN v_saldo_nasabah v ON v.id_nasabah = n.id_nasabah
     WHERE ($1 = '%%' OR n.nama ILIKE $1 OR n.no_hp ILIKE $1 OR n.alamat ILIKE $1)
     ORDER BY n.nama`,
    [term],
  );
}

export function getNasabah(id: number) {
  return queryOne<Nasabah>(`SELECT * FROM nasabah WHERE id_nasabah = $1`, [id]);
}

export function getNasabahRiwayat(id: number) {
  return query<{
    tipe: string;
    id: number;
    tanggal: string;
    keterangan: string;
    nilai: string;
  }>(
    `SELECT 'setoran' AS tipe, s.id_setoran AS id, s.tgl_setoran AS tanggal,
            COALESCE(s.catatan, 'Setoran sampah') AS keterangan,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS nilai
     FROM setoran s
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     WHERE s.id_nasabah = $1
     GROUP BY s.id_setoran, s.tgl_setoran, s.catatan
     UNION ALL
     SELECT 'penarikan' AS tipe, p.id_penarikan AS id, p.tgl_penarikan AS tanggal,
            'Penarikan saldo' AS keterangan, p.jumlah::text AS nilai
     FROM penarikan_saldo p
     WHERE p.id_nasabah = $1
     ORDER BY tanggal DESC, id DESC`,
    [id],
  );
}

export function getJenisSampah(search = "") {
  const term = `%${search.trim()}%`;
  return query<JenisSampah>(
    `SELECT j.id_jenis, j.id_kategori, j.nama_jenis, j.harga_per_kg::text,
            k.nama_kategori,
            COUNT(d.id_detail)::int AS jumlah_transaksi,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg
     FROM jenis_sampah j
     JOIN kategori_sampah k ON k.id_kategori = j.id_kategori
     LEFT JOIN detail_setoran d ON d.id_jenis = j.id_jenis
     WHERE ($1 = '%%' OR j.nama_jenis ILIKE $1 OR k.nama_kategori ILIKE $1)
     GROUP BY j.id_jenis, j.id_kategori, j.nama_jenis, j.harga_per_kg, k.nama_kategori
     ORDER BY k.nama_kategori, j.nama_jenis`,
    [term],
  );
}

export function getKategori() {
  return query<{ id_kategori: number; nama_kategori: string; deskripsi: string | null }>(
    `SELECT id_kategori, nama_kategori, deskripsi
     FROM kategori_sampah ORDER BY nama_kategori`,
  );
}

export function getPetugas() {
  return query<Petugas>(`SELECT * FROM petugas ORDER BY nama_petugas`);
}

export function getSaldoNasabah(id: number) {
  return queryOne<SaldoRow>(
    `SELECT id_nasabah, nama, no_hp,
            total_setor::text, total_tarik::text, saldo::text
     FROM v_saldo_nasabah WHERE id_nasabah = $1`,
    [id],
  );
}

export function getSaldoList(search = "") {
  const term = `%${search.trim()}%`;
  return query<SaldoRow>(
    `SELECT id_nasabah, nama, no_hp,
            total_setor::text, total_tarik::text, saldo::text
     FROM v_saldo_nasabah
     WHERE ($1 = '%%' OR nama ILIKE $1 OR no_hp ILIKE $1)
     ORDER BY saldo DESC, nama`,
    [term],
  );
}

/* ------------------------------------------------------------------ */
/* Setoran                                                             */
/* ------------------------------------------------------------------ */

export function getSetoranList(search = "") {
  const term = `%${search.trim()}%`;
  return query<SetoranRow>(
    `SELECT s.id_setoran, s.tgl_setoran, n.nama AS nasabah, p.nama_petugas AS petugas,
            COUNT(d.id_detail)::int AS jumlah_item,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai,
            s.catatan
     FROM setoran s
     JOIN nasabah n ON n.id_nasabah = s.id_nasabah
     JOIN petugas p ON p.id_petugas = s.id_petugas
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     WHERE ($1 = '%%' OR n.nama ILIKE $1 OR p.nama_petugas ILIKE $1 OR s.catatan ILIKE $1)
     GROUP BY s.id_setoran, s.tgl_setoran, n.nama, p.nama_petugas, s.catatan
     ORDER BY s.tgl_setoran DESC, s.id_setoran DESC`,
    [term],
  );
}

export async function getSetoranDetail(id: number) {
  const header = await queryOne<{
    id_setoran: number;
    tgl_setoran: string;
    catatan: string | null;
    id_nasabah: number;
    nasabah: string;
    alamat: string | null;
    no_hp: string | null;
    petugas: string;
    jabatan: string | null;
  }>(
    `SELECT s.id_setoran, s.tgl_setoran, s.catatan, n.id_nasabah,
            n.nama AS nasabah, n.alamat, n.no_hp,
            p.nama_petugas AS petugas, p.jabatan
     FROM setoran s
     JOIN nasabah n ON n.id_nasabah = s.id_nasabah
     JOIN petugas p ON p.id_petugas = s.id_petugas
     WHERE s.id_setoran = $1`,
    [id],
  );

  const items = await query<SetoranDetailRow>(
    `SELECT d.id_detail, j.nama_jenis, k.nama_kategori,
            d.berat_kg::text, d.harga_satuan::text,
            (d.berat_kg * d.harga_satuan)::text AS subtotal
     FROM detail_setoran d
     JOIN jenis_sampah j ON j.id_jenis = d.id_jenis
     JOIN kategori_sampah k ON k.id_kategori = j.id_kategori
     WHERE d.id_setoran = $1
     ORDER BY d.id_detail`,
    [id],
  );

  return { header, items };
}

/* ------------------------------------------------------------------ */
/* Penarikan                                                           */
/* ------------------------------------------------------------------ */

export function getPenarikanList() {
  return query<PenarikanRow>(
    `SELECT p.id_penarikan, p.tgl_penarikan, n.nama AS nasabah,
            pt.nama_petugas AS petugas, p.jumlah::text
     FROM penarikan_saldo p
     JOIN nasabah n ON n.id_nasabah = p.id_nasabah
     JOIN petugas pt ON pt.id_petugas = p.id_petugas
     ORDER BY p.tgl_penarikan DESC, p.id_penarikan DESC`,
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard & laporan                                                 */
/* ------------------------------------------------------------------ */

export function getRingkasan(
  from?: string,
  to?: string,
  filtered = false,
): Promise<Ringkasan | null> {
  if (!filtered) {
    return queryOne<Ringkasan>(
      `SELECT
         (SELECT COUNT(*)::int FROM nasabah)                                  AS total_nasabah,
         (SELECT COUNT(*)::int FROM petugas)                                  AS total_petugas,
         (SELECT COUNT(*)::int FROM setoran)                                  AS total_setoran,
         (SELECT COUNT(*)::int FROM penarikan_saldo)                          AS total_penarikan,
         (SELECT COUNT(*)::int FROM jenis_sampah)                             AS total_jenis,
         (SELECT COALESCE(SUM(berat_kg), 0)::text FROM detail_setoran)        AS total_kg,
         (SELECT COALESCE(SUM(berat_kg * harga_satuan), 0)::text FROM detail_setoran) AS total_nilai,
         (SELECT COALESCE(SUM(saldo), 0)::text FROM v_saldo_nasabah)          AS total_saldo,
         (SELECT COALESCE(SUM(jumlah), 0)::text FROM penarikan_saldo)        AS total_penarikan_nilai`,
    );
  }

  return queryOne<Ringkasan>(
    `SELECT
       COUNT(DISTINCT s.id_nasabah)::int AS total_nasabah,
       (SELECT COUNT(*)::int FROM petugas) AS total_petugas,
       COUNT(DISTINCT s.id_setoran)::int AS total_setoran,
       (SELECT COUNT(*)::int FROM penarikan_saldo p
         WHERE p.tgl_penarikan BETWEEN $1 AND $2) AS total_penarikan,
       (SELECT COUNT(*)::int FROM jenis_sampah) AS total_jenis,
       COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
       COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai,
       (SELECT COALESCE(SUM(jumlah), 0)::text FROM penarikan_saldo p
         WHERE p.tgl_penarikan BETWEEN $1 AND $2) AS total_saldo,
       (SELECT COALESCE(SUM(jumlah), 0)::text FROM penarikan_saldo p
         WHERE p.tgl_penarikan BETWEEN $1 AND $2) AS total_penarikan_nilai
     FROM setoran s
     JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     WHERE s.tgl_setoran BETWEEN $1 AND $2`,
    [from, to],
  );
}

export function getRekapKategori(from?: string, to?: string) {
  const filtered = Boolean(from && to);
  return query<RekapKategori>(
    `SELECT k.id_kategori, k.nama_kategori,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai,
            COUNT(DISTINCT j.id_jenis)::int AS jumlah_jenis
     FROM kategori_sampah k
     JOIN jenis_sampah j ON j.id_kategori = k.id_kategori
     LEFT JOIN detail_setoran d ON d.id_jenis = j.id_jenis
       ${filtered ? "AND d.id_setoran IN (SELECT id_setoran FROM setoran WHERE tgl_setoran BETWEEN $1 AND $2)" : ""}
     GROUP BY k.id_kategori, k.nama_kategori
     ORDER BY SUM(d.berat_kg) DESC NULLS LAST`,
    filtered ? [from, to] : [],
  );
}

export function getTopNasabah(from?: string, to?: string, limit = 6) {
  const filtered = Boolean(from && to);
  return query<TopNasabah>(
    `SELECT n.id_nasabah, n.nama,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_setor,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE((SELECT saldo FROM v_saldo_nasabah v WHERE v.id_nasabah = n.id_nasabah), 0)::text AS saldo
     FROM nasabah n
     JOIN setoran s ON s.id_nasabah = n.id_nasabah
     JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     ${filtered ? "WHERE s.tgl_setoran BETWEEN $1 AND $2" : ""}
     GROUP BY n.id_nasabah, n.nama
     ORDER BY SUM(d.berat_kg * d.harga_satuan) DESC
     LIMIT ${limit}`,
    filtered ? [from, to] : [],
  );
}

export function getKinerjaPetugas(from?: string, to?: string) {
  const filtered = Boolean(from && to);
  return query<KinerjaPetugas>(
    `SELECT p.id_petugas, p.nama_petugas, p.jabatan,
            COUNT(DISTINCT s.id_setoran)::int AS jumlah_setoran,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai
     FROM petugas p
     LEFT JOIN setoran s ON s.id_petugas = p.id_petugas
       ${filtered ? "AND s.tgl_setoran BETWEEN $1 AND $2" : ""}
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     GROUP BY p.id_petugas, p.nama_petugas, p.jabatan
     ORDER BY COUNT(DISTINCT s.id_setoran) DESC, p.nama_petugas`,
    filtered ? [from, to] : [],
  );
}

export function getSetoranTerbaru(limit = 6) {
  return query<SetoranRow>(
    `SELECT s.id_setoran, s.tgl_setoran, n.nama AS nasabah, p.nama_petugas AS petugas,
            COUNT(d.id_detail)::int AS jumlah_item,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai,
            s.catatan
     FROM setoran s
     JOIN nasabah n ON n.id_nasabah = s.id_nasabah
     JOIN petugas p ON p.id_petugas = s.id_petugas
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     GROUP BY s.id_setoran, s.tgl_setoran, n.nama, p.nama_petugas, s.catatan
     ORDER BY s.tgl_setoran DESC, s.id_setoran DESC
     LIMIT ${limit}`,
  );
}

export function getSetoranRentang(from: string, to: string) {
  return query<SetoranRow>(
    `SELECT s.id_setoran, s.tgl_setoran, n.nama AS nasabah, p.nama_petugas AS petugas,
            COUNT(d.id_detail)::int AS jumlah_item,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai,
            s.catatan
     FROM setoran s
     JOIN nasabah n ON n.id_nasabah = s.id_nasabah
     JOIN petugas p ON p.id_petugas = s.id_petugas
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     WHERE s.tgl_setoran BETWEEN $1 AND $2
     GROUP BY s.id_setoran, s.tgl_setoran, n.nama, p.nama_petugas, s.catatan
     ORDER BY s.tgl_setoran DESC, s.id_setoran DESC`,
    [from, to],
  );
}

export function getRentangData() {
  return queryOne<{ awal: string | null; akhir: string | null }>(
    `SELECT MIN(tgl_setoran)::text AS awal, MAX(tgl_setoran)::text AS akhir FROM setoran`,
  );
}

export function getRiwayatRentang(from: string, to: string) {
  return query<{
    id_setoran: number;
    tgl_setoran: string;
    nasabah: string;
    petugas: string;
    nama_kategori: string;
    nama_jenis: string;
    berat_kg: string;
    harga_satuan: string;
    subtotal: string;
  }>(
    `SELECT id_setoran, tgl_setoran, nasabah, petugas, nama_kategori, nama_jenis,
            berat_kg::text, harga_satuan::text, subtotal::text
     FROM v_riwayat_setoran
     WHERE tgl_setoran BETWEEN $1 AND $2
     ORDER BY tgl_setoran, id_setoran, nama_kategori, nama_jenis`,
    [from, to],
  );
}

export function getTrenBulanan() {
  return query<{ bulan: string; total_kg: string; total_nilai: string }>(
    `WITH bulan AS (
       SELECT generate_series(
         date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
         date_trunc('month', CURRENT_DATE),
         INTERVAL '1 month'
       ) AS periode
     )
     SELECT to_char(b.periode, 'YYYY-MM') AS bulan,
            COALESCE(SUM(d.berat_kg), 0)::text AS total_kg,
            COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)::text AS total_nilai
     FROM bulan b
     LEFT JOIN setoran s ON date_trunc('month', s.tgl_setoran) = b.periode
     LEFT JOIN detail_setoran d ON d.id_setoran = s.id_setoran
     GROUP BY b.periode
     ORDER BY b.periode`,
  );
}
