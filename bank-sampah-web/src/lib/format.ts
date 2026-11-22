const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatRupiah(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return rupiah.format(Number.isFinite(n) ? n : 0).replace(/\u00a0/g, " ");
}

export function formatNumber(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return decimal.format(Number.isFinite(n) ? n : 0);
}

export function formatKg(value: number | string | null | undefined) {
  return `${formatNumber(value)} kg`;
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Menerima "YYYY-MM-DD" (atau Date) dan mengembalikan "1 Oktober 2026". */
export function formatTanggal(value: string | Date | null | undefined) {
  if (!value) return "—";
  const iso =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : String(value).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return String(value);
  return `${d} ${BULAN[m - 1]} ${y}`;
}

/** Format ringkas untuk tabel: "01 Okt 2026". */
export function formatTanggalSingkat(value: string | Date | null | undefined) {
  if (!value) return "—";
  const iso =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : String(value).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return String(value);
  return `${String(d).padStart(2, "0")} ${BULAN[m - 1].slice(0, 3)} ${y}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
