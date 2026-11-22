-- ============================================================
-- 01_ddl.sql - Sistem Informasi Bank Sampah Digital
-- Jalankan pertama. Aman dijalankan ulang (drop database lama).
-- ============================================================
DROP DATABASE IF EXISTS bank_sampah_digital;
CREATE DATABASE bank_sampah_digital;
USE bank_sampah_digital;

CREATE TABLE kategori_sampah (
    id_kategori   INT PRIMARY KEY AUTO_INCREMENT,
    nama_kategori VARCHAR(50)  NOT NULL,
    deskripsi     VARCHAR(150)
);

CREATE TABLE jenis_sampah (
    id_jenis     INT PRIMARY KEY AUTO_INCREMENT,
    id_kategori  INT NOT NULL,
    nama_jenis   VARCHAR(80) NOT NULL,
    harga_per_kg DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_kategori) REFERENCES kategori_sampah(id_kategori)
);

CREATE TABLE nasabah (
    id_nasabah INT PRIMARY KEY AUTO_INCREMENT,
    nama       VARCHAR(100) NOT NULL,
    alamat     VARCHAR(200),
    no_hp      VARCHAR(15),
    tgl_daftar DATE NOT NULL
);

CREATE TABLE petugas (
    id_petugas   INT PRIMARY KEY AUTO_INCREMENT,
    nama_petugas VARCHAR(100) NOT NULL,
    jabatan      VARCHAR(50),
    no_hp        VARCHAR(15)
);

CREATE TABLE setoran (
    id_setoran  INT PRIMARY KEY AUTO_INCREMENT,
    id_nasabah  INT NOT NULL,
    id_petugas  INT NOT NULL,
    tgl_setoran DATE NOT NULL,
    catatan     VARCHAR(150),
    FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah),
    FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas)
);

CREATE TABLE detail_setoran (
    id_detail    INT PRIMARY KEY AUTO_INCREMENT,
    id_setoran   INT NOT NULL,
    id_jenis     INT NOT NULL,
    berat_kg     DECIMAL(8,2) NOT NULL,
    harga_satuan DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_setoran) REFERENCES setoran(id_setoran),
    FOREIGN KEY (id_jenis)   REFERENCES jenis_sampah(id_jenis)
);

CREATE TABLE penarikan_saldo (
    id_penarikan  INT PRIMARY KEY AUTO_INCREMENT,
    id_nasabah    INT NOT NULL,
    id_petugas    INT NOT NULL,
    tgl_penarikan DATE NOT NULL,
    jumlah        DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah),
    FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas)
);
