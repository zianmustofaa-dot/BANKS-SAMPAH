-- ============================================================
-- 02_dml_insert.sql - Pengisian data awal Bank Sampah Digital
-- Jalankan SETELAH 01_ddl.sql. Urutan INSERT tidak boleh dibalik
-- (tabel induk dulu, baru tabel anak - karena foreign key).
-- ============================================================
USE bank_sampah_digital;

INSERT INTO kategori_sampah (id_kategori, nama_kategori, deskripsi) VALUES
(1, 'Plastik',    'Botol, gelas, dan kemasan plastik'),
(2, 'Kertas',     'Kardus, HVS, koran'),
(3, 'Logam',      'Kaleng dan besi bekas'),
(4, 'Kaca',       'Botol dan pecahan kaca'),
(5, 'Elektronik', 'Kabel dan komponen bekas');

INSERT INTO jenis_sampah (id_jenis, id_kategori, nama_jenis, harga_per_kg) VALUES
(1, 1, 'Botol PET',        3500),
(2, 1, 'Gelas plastik',    2500),
(3, 2, 'Kardus',           2000),
(4, 2, 'Kertas HVS',       2500),
(5, 3, 'Kaleng aluminium', 9000),
(6, 3, 'Besi tua',         4000),
(7, 4, 'Botol kaca',        500),
(8, 5, 'Kabel bekas',      6000);

INSERT INTO nasabah (id_nasabah, nama, alamat, no_hp, tgl_daftar) VALUES
(1, 'Siti Aminah',   'Jl. Melati No. 5, Semarang',   '081234560001', '2026-09-01'),
(2, 'Budi Santoso',  'Jl. Kenanga No. 12, Semarang', '081234560002', '2026-09-03'),
(3, 'Dewi Lestari',  'Jl. Mawar No. 8, Semarang',    '081234560003', '2026-09-05'),
(4, 'Rizky Pratama', 'Jl. Anggrek No. 21, Semarang', '081234560004', '2026-09-10'),
(5, 'Nur Hidayah',   'Jl. Cempaka No. 3, Semarang',  '081234560005', '2026-09-12'),
(6, 'Agus Wijaya',   'Jl. Dahlia No. 17, Semarang',  '081234560006', '2026-09-15');

INSERT INTO petugas (id_petugas, nama_petugas, jabatan, no_hp) VALUES
(1, 'Hendra Kusuma',  'Penimbang',   '082111110001'),
(2, 'Lilis Suryani',  'Pencatat',    '082111110002'),
(3, 'Taufik Hidayat', 'Penimbang',   '082111110003'),
(4, 'Mega Putri',     'Kasir',       '082111110004'),
(5, 'Joko Susilo',    'Koordinator', '082111110005');

INSERT INTO setoran (id_setoran, id_nasabah, id_petugas, tgl_setoran, catatan) VALUES
(1, 1, 1, '2026-10-01', 'Setoran rutin'),
(2, 2, 2, '2026-10-03', 'Logam dari bengkel'),
(3, 3, 1, '2026-10-05', 'Kertas kantor'),
(4, 1, 3, '2026-10-08', NULL),
(5, 4, 2, '2026-10-10', 'Elektronik bekas'),
(6, 5, 4, '2026-10-12', 'Kardus toko'),
(7, 2, 1, '2026-10-15', NULL),
(8, 6, 5, '2026-10-18', 'Besi tua proyek');

INSERT INTO detail_setoran (id_detail, id_setoran, id_jenis, berat_kg, harga_satuan) VALUES
(1,  1, 1,  5.00, 3500),
(2,  1, 3,  8.00, 2000),
(3,  2, 5,  2.50, 9000),
(4,  2, 6, 10.00, 4000),
(5,  3, 4,  6.00, 2500),
(6,  3, 3, 12.00, 2000),
(7,  4, 2,  4.00, 2500),
(8,  4, 7, 15.00,  500),
(9,  5, 1,  7.50, 3500),
(10, 5, 8,  3.00, 6000),
(11, 6, 3, 20.00, 2000),
(12, 7, 1,  6.00, 3500),
(13, 7, 5,  1.50, 9000),
(14, 8, 6, 25.00, 4000),
(15, 8, 7, 10.00,  500);

INSERT INTO penarikan_saldo (id_penarikan, id_nasabah, id_petugas, tgl_penarikan, jumlah) VALUES
(1, 1, 1, '2026-10-20', 30000),
(2, 2, 2, '2026-10-22', 50000),
(3, 3, 3, '2026-10-23', 20000),
(4, 4, 4, '2026-10-25', 25000),
(5, 5, 5, '2026-10-26', 20000);
