-- ============================================================
-- 03_update_delete.sql - UPDATE + DELETE Bank Sampah Digital
-- Jalankan SETELAH 02_dml_insert.sql.
-- ============================================================
USE bank_sampah_digital;

-- UPDATE
UPDATE jenis_sampah SET harga_per_kg = 3700 WHERE id_jenis = 1;
UPDATE nasabah SET no_hp = '081299990002' WHERE id_nasabah = 2;
UPDATE petugas SET jabatan = 'Koordinator Lapangan' WHERE id_petugas = 3;

-- DELETE (pakai data uji supaya tidak melanggar foreign key)
INSERT INTO nasabah VALUES (7, 'Nasabah Uji', 'Jl. Uji No. 1', '080000000000', '2026-10-30');
DELETE FROM nasabah WHERE id_nasabah = 7;
