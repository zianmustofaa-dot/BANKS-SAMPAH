-- ============================================================
-- 04_queries.sql - Query Pengujian Q1-Q10 Bank Sampah Digital
-- Jalankan SETELAH 02 (insert) dan 03 (update/delete).
-- ============================================================
USE bank_sampah_digital;

-- Q1. Tampilkan semua nasabah
SELECT * FROM nasabah;

-- Q2. Filter: harga di atas 3000, urut harga tertinggi
SELECT nama_jenis, harga_per_kg
FROM jenis_sampah
WHERE harga_per_kg > 3000
ORDER BY harga_per_kg DESC;

-- Q3. JOIN: setoran beserta nama nasabah dan petugas
SELECT s.id_setoran, s.tgl_setoran, n.nama AS nasabah, p.nama_petugas AS petugas
FROM setoran s
JOIN nasabah n ON s.id_nasabah = n.id_nasabah
JOIN petugas p ON s.id_petugas = p.id_petugas
ORDER BY s.tgl_setoran;

-- Q4. JOIN 4 tabel: rincian lengkap tiap setoran
SELECT s.id_setoran, n.nama, k.nama_kategori, j.nama_jenis,
       d.berat_kg, d.harga_satuan,
       d.berat_kg * d.harga_satuan AS subtotal
FROM detail_setoran d
JOIN setoran s         ON d.id_setoran  = s.id_setoran
JOIN nasabah n         ON s.id_nasabah  = n.id_nasabah
JOIN jenis_sampah j    ON d.id_jenis    = j.id_jenis
JOIN kategori_sampah k ON j.id_kategori = k.id_kategori
ORDER BY s.id_setoran;

-- Q5. Rekap: total berat dan nilai per setoran
SELECT id_setoran, SUM(berat_kg) AS total_kg,
       SUM(berat_kg * harga_satuan) AS total_nilai
FROM detail_setoran
GROUP BY id_setoran;

-- Q6. Rekap: total berat per kategori
SELECT k.nama_kategori, SUM(d.berat_kg) AS total_kg
FROM detail_setoran d
JOIN jenis_sampah j    ON d.id_jenis    = j.id_jenis
JOIN kategori_sampah k ON j.id_kategori = k.id_kategori
GROUP BY k.nama_kategori
ORDER BY total_kg DESC;

-- Q7. GROUP BY + HAVING: nasabah dengan total setoran di atas 50.000
SELECT n.nama, SUM(d.berat_kg * d.harga_satuan) AS total_setor
FROM nasabah n
JOIN setoran s        ON n.id_nasabah = s.id_nasabah
JOIN detail_setoran d ON s.id_setoran = d.id_setoran
GROUP BY n.id_nasabah, n.nama
HAVING total_setor > 50000
ORDER BY total_setor DESC;

-- Q8. Jumlah setoran per petugas
SELECT p.nama_petugas, COUNT(s.id_setoran) AS jumlah_setoran
FROM petugas p
LEFT JOIN setoran s ON p.id_petugas = s.id_petugas
GROUP BY p.id_petugas, p.nama_petugas;

-- Q9. Saldo tiap nasabah (setoran dikurangi penarikan)
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

-- Q10. Nasabah yang belum pernah menarik saldo
SELECT n.nama
FROM nasabah n
LEFT JOIN penarikan_saldo ps ON n.id_nasabah = ps.id_nasabah
WHERE ps.id_penarikan IS NULL;
