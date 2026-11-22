# Bank Sampah Digital — Tugas 3

Implementasi sistem informasi bank sampah berbasis web: Next.js 16 (App Router,
TypeScript, Tailwind CSS 4) + PostgreSQL (Neon) dengan driver `pg`.

## Fitur utama

1. **Dashboard** — KPI operasional, tren setoran 6 bulan, komposisi kategori.
2. **Manajemen nasabah** — daftar, pencarian, tambah, ubah, hapus (dilindungi FK).
3. **Master jenis sampah & harga** — kategori, harga per kg, riwayat snapshot.
4. **Setoran sampah** — banyak jenis per transaksi, harga snapshot, total otomatis.
5. **Penarikan saldo** — validasi saldo dua lapis (aplikasi + trigger database).
6. **Laporan** — filter periode, rekap kategori, nasabah teraktif, kinerja petugas, ekspor CSV.

## Menjalankan lokal

```bash
npm install
vercel env pull .env.local     # mengambil DATABASE_URL Neon
npm run db:init                # membuat tabel + data awal
npm run dev                    # http://localhost:3000
```

## Skrip

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run db:init` | Reset schema + seed data |
| `npm run test:e2e` | Uji end-to-end Playwright terhadap URL di `BASE_URL` |

## Struktur database

7 tabel (`kategori_sampah`, `jenis_sampah`, `nasabah`, `petugas`, `setoran`,
`detail_setoran`, `penarikan_saldo`), 3 view rekap, dan 1 trigger pelindung saldo.
DDL lengkap: `db/schema.sql`; data awal: `db/seed.sql`.
