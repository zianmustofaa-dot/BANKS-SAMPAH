-- ============================================================
-- 05_upgrade_prod.sql - Versi SIAP PAKAI (bank_sampah_prod)
-- Dipercantik dari bank_sampah_digital (database tugas tetap utuh):
--   * InnoDB + utf8mb4 eksplisit
--   * UNIQUE constraint (no_hp, nama kategori/jenis)
--   * CHECK constraint (berat, harga, jumlah harus positif)
--   * COMMENT tabel/kolom untuk dokumentasi
--   * View rekap: saldo nasabah, rekap kategori, riwayat lengkap
--   * Trigger: penarikan tidak boleh melebihi saldo tersedia
-- ============================================================

DROP DATABASE IF EXISTS bank_sampah_prod;
CREATE DATABASE bank_sampah_prod
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
USE bank_sampah_prod;

-- ------------------------------------------------------------
-- TABEL MASTER
-- ------------------------------------------------------------
CREATE TABLE kategori_sampah (
    id_kategori   INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK kategori',
    nama_kategori VARCHAR(50)  NOT NULL UNIQUE COMMENT 'contoh: Plastik',
    deskripsi     VARCHAR(150) COMMENT 'penjelasan singkat'
) ENGINE=InnoDB COMMENT='Daftar kategori sampah daur ulang';

CREATE TABLE jenis_sampah (
    id_jenis     INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK jenis',
    id_kategori  INT NOT NULL COMMENT 'FK ke kategori_sampah',
    nama_jenis   VARCHAR(80) NOT NULL UNIQUE COMMENT 'contoh: Botol PET',
    harga_per_kg DECIMAL(10,2) NOT NULL COMMENT 'harga pasar berjalan' CHECK (harga_per_kg >= 0),
    CONSTRAINT fk_jenis_kategori FOREIGN KEY (id_kategori)
        REFERENCES kategori_sampah(id_kategori)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Jenis sampah dan harga per kg terkini';

CREATE TABLE nasabah (
    id_nasabah INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK nasabah',
    nama       VARCHAR(100) NOT NULL COMMENT 'nama lengkap',
    alamat     VARCHAR(200) COMMENT 'alamat domisili',
    no_hp      VARCHAR(15) UNIQUE COMMENT 'nomor HP unik',
    tgl_daftar DATE NOT NULL COMMENT 'tanggal bergabung'
) ENGINE=InnoDB COMMENT='Nasabah bank sampah';

CREATE TABLE petugas (
    id_petugas   INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK petugas',
    nama_petugas VARCHAR(100) NOT NULL,
    jabatan      VARCHAR(50) COMMENT 'contoh: Penimbang, Kasir',
    no_hp        VARCHAR(15) UNIQUE COMMENT 'nomor HP unik'
) ENGINE=InnoDB COMMENT='Petugas operasional bank sampah';

-- ------------------------------------------------------------
-- TABEL TRANSAKSI
-- ------------------------------------------------------------
CREATE TABLE setoran (
    id_setoran  INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK setoran',
    id_nasabah  INT NOT NULL COMMENT 'FK nasabah',
    id_petugas  INT NOT NULL COMMENT 'FK petugas pencatat',
    tgl_setoran DATE NOT NULL COMMENT 'tanggal transaksi',
    catatan     VARCHAR(150),
    INDEX idx_setoran_tgl (tgl_setoran),
    CONSTRAINT fk_setoran_nasabah FOREIGN KEY (id_nasabah)
        REFERENCES nasabah(id_nasabah) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_setoran_petugas FOREIGN KEY (id_petugas)
        REFERENCES petugas(id_petugas) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Header transaksi setoran';

CREATE TABLE detail_setoran (
    id_detail    INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK detail',
    id_setoran   INT NOT NULL COMMENT 'FK setoran',
    id_jenis     INT NOT NULL COMMENT 'FK jenis_sampah',
    berat_kg     DECIMAL(8,2) NOT NULL COMMENT 'berat setiap jenis' CHECK (berat_kg > 0),
    harga_satuan DECIMAL(10,2) NOT NULL COMMENT 'SNAPSHOT harga saat transaksi' CHECK (harga_satuan > 0),
    INDEX idx_detail_setoran (id_setoran),
    CONSTRAINT fk_detail_setoran FOREIGN KEY (id_setoran)
        REFERENCES setoran(id_setoran) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detail_jenis FOREIGN KEY (id_jenis)
        REFERENCES jenis_sampah(id_jenis) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Rincian jenis sampah per setoran';

CREATE TABLE penarikan_saldo (
    id_penarikan  INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK penarikan',
    id_nasabah    INT NOT NULL COMMENT 'FK nasabah',
    id_petugas    INT NOT NULL COMMENT 'FK petugas kasir',
    tgl_penarikan DATE NOT NULL COMMENT 'tanggal transaksi',
    jumlah        DECIMAL(12,2) NOT NULL COMMENT 'nominal ditarik' CHECK (jumlah > 0),
    INDEX idx_tarik_tgl (tgl_penarikan),
    CONSTRAINT fk_tarik_nasabah FOREIGN KEY (id_nasabah)
        REFERENCES nasabah(id_nasabah) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tarik_petugas FOREIGN KEY (id_petugas)
        REFERENCES petugas(id_petugas) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Transaksi penarikan saldo nasabah';

-- ------------------------------------------------------------
-- TRIGGER PELINDUNG SALDO
-- Penarikan baru hanya boleh jika saldo tersedia >= jumlah
-- saldo = (total setoran) - (total penarikan yang sudah ada)
-- ------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_penarikan_cek_saldo
BEFORE INSERT ON penarikan_saldo
FOR EACH ROW
BEGIN
    DECLARE saldo_ada DECIMAL(12,2);

    SET saldo_ada =
        (SELECT COALESCE(SUM(d.berat_kg * d.harga_satuan), 0)
         FROM setoran st
         JOIN detail_setoran d ON st.id_setoran = d.id_setoran
         WHERE st.id_nasabah = NEW.id_nasabah)
        -
        (SELECT COALESCE(SUM(jumlah), 0)
         FROM penarikan_saldo
         WHERE id_nasabah = NEW.id_nasabah);

    IF NEW.jumlah > saldo_ada THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PENARIKAN DITOLAK: saldo nasabah tidak mencukupi';
    END IF;
END$$

DELIMITER ;

-- ------------------------------------------------------------
-- VIEW SIAP PAKAI
-- ------------------------------------------------------------
--v saldo tiap nasabah (seperti Q9, tinggal SELECT * FROM v_saldo_nasabah)
CREATE VIEW v_saldo_nasabah AS
SELECT n.id_nasabah, n.nama,
       COALESCE(s.total_setor, 0) AS total_setor,
       COALESCE(t.total_tarik, 0) AS total_tarik,
       COALESCE(s.total_setor, 0) - COALESCE(t.total_tarik, 0) AS saldo
FROM nasabah n
LEFT JOIN (
    SELECT st.id_nasabah, SUM(d.berat_kg * d.harga_satuan) AS total_setor
    FROM setoran st
    JOIN detail_setoran d ON st.id_setoran = d.id_setoran
    GROUP BY st.id_nasabah
) s ON n.id_nasabah = s.id_nasabah
LEFT JOIN (
    SELECT id_nasabah, SUM(jumlah) AS total_tarik
    FROM penarikan_saldo
    GROUP BY id_nasabah
) t ON n.id_nasabah = t.id_nasabah;

--v total berat & nilai per kategori
CREATE VIEW v_rekap_kategori AS
SELECT k.nama_kategori, SUM(d.berat_kg) AS total_kg,
       SUM(d.berat_kg * d.harga_satuan) AS total_nilai
FROM detail_setoran d
JOIN jenis_sampah j    ON d.id_jenis    = j.id_jenis
JOIN kategori_sampah k ON j.id_kategori = k.id_kategori
GROUP BY k.nama_kategori, k.id_kategori;

--v riwayat lengkap setoran (seperti Q4)
CREATE VIEW v_riwayat_setoran AS
SELECT s.id_setoran, s.tgl_setoran, n.nama AS nasabah, p.nama_petugas AS petugas,
       k.nama_kategori, j.nama_jenis, d.berat_kg, d.harga_satuan,
       d.berat_kg * d.harga_satuan AS subtotal
FROM detail_setoran d
JOIN setoran s         ON d.id_setoran  = s.id_setoran
JOIN nasabah n         ON s.id_nasabah  = n.id_nasabah
JOIN petugas p         ON s.id_petugas  = p.id_petugas
JOIN jenis_sampah j    ON d.id_jenis    = j.id_jenis
JOIN kategori_sampah k ON j.id_kategori = k.id_kategori;

-- ------------------------------------------------------------
-- MIGRASI DATA dari database tugas
-- ------------------------------------------------------------
INSERT INTO kategori_sampah SELECT * FROM bank_sampah_digital.kategori_sampah;
INSERT INTO jenis_sampah    SELECT * FROM bank_sampah_digital.jenis_sampah;
INSERT INTO nasabah         SELECT * FROM bank_sampah_digital.nasabah;
INSERT INTO petugas         SELECT * FROM bank_sampah_digital.petugas;
INSERT INTO setoran         SELECT * FROM bank_sampah_digital.setoran;
INSERT INTO detail_setoran  SELECT * FROM bank_sampah_digital.detail_setoran;
INSERT INTO penarikan_saldo SELECT * FROM bank_sampah_digital.penarikan_saldo;
