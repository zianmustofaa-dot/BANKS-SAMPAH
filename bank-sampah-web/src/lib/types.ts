export type Nasabah = {
  id_nasabah: number;
  nama: string;
  alamat: string | null;
  no_hp: string | null;
  tgl_daftar: string;
};

export type NasabahDenganSaldo = Nasabah & {
  total_setor: string;
  total_tarik: string;
  saldo: string;
  jumlah_setoran: number;
};

export type JenisSampah = {
  id_jenis: number;
  id_kategori: number;
  nama_jenis: string;
  harga_per_kg: string;
  nama_kategori: string;
  jumlah_transaksi: number;
  total_kg: string;
};

export type Petugas = {
  id_petugas: number;
  nama_petugas: string;
  jabatan: string | null;
  no_hp: string | null;
};

export type SaldoRow = {
  id_nasabah: number;
  nama: string;
  no_hp: string | null;
  total_setor: string;
  total_tarik: string;
  saldo: string;
};

export type SetoranRow = {
  id_setoran: number;
  tgl_setoran: string;
  nasabah: string;
  petugas: string;
  jumlah_item: number;
  total_kg: string;
  total_nilai: string;
  catatan: string | null;
};

export type SetoranDetailRow = {
  id_detail: number;
  nama_jenis: string;
  nama_kategori: string;
  berat_kg: string;
  harga_satuan: string;
  subtotal: string;
};

export type PenarikanRow = {
  id_penarikan: number;
  tgl_penarikan: string;
  nasabah: string;
  petugas: string;
  jumlah: string;
};

export type RekapKategori = {
  id_kategori: number;
  nama_kategori: string;
  total_kg: string;
  total_nilai: string;
  jumlah_jenis: number;
};

export type TopNasabah = {
  id_nasabah: number;
  nama: string;
  total_setor: string;
  saldo: string;
  total_kg: string;
};

export type KinerjaPetugas = {
  id_petugas: number;
  nama_petugas: string;
  jabatan: string | null;
  jumlah_setoran: number;
  total_kg: string;
  total_nilai: string;
};

export type Ringkasan = {
  total_nasabah: number;
  total_petugas: number;
  total_setoran: number;
  total_penarikan: number;
  total_kg: string;
  total_nilai: string;
  total_saldo: string;
  total_penarikan_nilai: string;
  total_jenis: number;
};
