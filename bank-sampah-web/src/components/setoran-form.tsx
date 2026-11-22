"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { buatSetoran } from "@/app/setoran/actions";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { IconPlus, IconTrash } from "@/components/icons";
import { formatRupiah, todayISO } from "@/lib/format";
import type { JenisSampah, Nasabah, Petugas } from "@/lib/types";

type Row = { key: string; id_jenis: string; berat: string };

export function SetoranForm({
  nasabah,
  petugas,
  jenis,
  defaultNasabahId,
}: {
  nasabah: Pick<Nasabah, "id_nasabah" | "nama">[];
  petugas: Petugas[];
  jenis: JenisSampah[];
  defaultNasabahId?: number;
}) {
  const [state, action] = useActionState(buatSetoran, null);
  const counter = useRef(2);
  const [rows, setRows] = useState<Row[]>([
    { key: "row-1", id_jenis: "", berat: "" },
  ]);

  const hargaMap = useMemo(
    () => new Map(jenis.map((item) => [String(item.id_jenis), Number(item.harga_per_kg)])),
    [jenis],
  );
  const namaMap = useMemo(
    () => new Map(jenis.map((item) => [String(item.id_jenis), item.nama_jenis])),
    [jenis],
  );

  const total = rows.reduce((sum, row) => {
    const harga = hargaMap.get(row.id_jenis) ?? 0;
    const berat = Number(row.berat.replace(",", ".")) || 0;
    return sum + harga * berat;
  }, 0);
  const totalBerat = rows.reduce(
    (sum, row) => sum + (Number(row.berat.replace(",", ".")) || 0),
    0,
  );

  const itemsJson = JSON.stringify(
    rows
      .filter((row) => row.id_jenis && row.berat)
      .map((row) => ({
        id_jenis: Number(row.id_jenis),
        berat_kg: Number(row.berat.replace(",", ".")),
      })),
  );

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const key = `row-${counter.current++}`;
    setRows((prev) => [...prev, { key, id_jenis: "", berat: "" }]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.key !== key)));
  }

  const kategoriGroup = useMemo(() => {
    const groups = new Map<string, JenisSampah[]>();
    for (const item of jenis) {
      const list = groups.get(item.nama_kategori) ?? [];
      list.push(item);
      groups.set(item.nama_kategori, list);
    }
    return [...groups.entries()];
  }, [jenis]);

  return (
    <form action={action} className="grid items-start gap-5 lg:grid-cols-[1fr_330px]">
      <input type="hidden" name="items" value={itemsJson} />

      <div className="space-y-5">
        {state?.status === "error" && <Alert tone="error">{state.message}</Alert>}

        <section className="card p-5">
          <h2 className="text-[15px] font-bold">Informasi transaksi</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            Catat siapa yang menyetor, kapan, dan petugas yang menerima.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="id_nasabah" className="label">
                Nasabah penyetor <span className="text-red-500">*</span>
              </label>
              <select id="id_nasabah" name="id_nasabah" required className="input" defaultValue={defaultNasabahId ?? ""}>
                <option value="" disabled>
                  Pilih nasabah…
                </option>
                {nasabah.map((item) => (
                  <option key={item.id_nasabah} value={item.id_nasabah}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="id_petugas" className="label">
                Petugas penerima <span className="text-red-500">*</span>
              </label>
              <select id="id_petugas" name="id_petugas" required className="input" defaultValue="">
                <option value="" disabled>
                  Pilih petugas…
                </option>
                {petugas.map((item) => (
                  <option key={item.id_petugas} value={item.id_petugas}>
                    {item.nama_petugas} — {item.jabatan ?? "Petugas"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tgl_setoran" className="label">
                Tanggal setoran <span className="text-red-500">*</span>
              </label>
              <input
                id="tgl_setoran"
                name="tgl_setoran"
                type="date"
                required
                defaultValue={todayISO()}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="catatan" className="label">
                Catatan <span className="font-normal text-muted">(opsional)</span>
              </label>
              <input
                id="catatan"
                name="catatan"
                maxLength={150}
                placeholder="Contoh: setoran rutin bulanan"
                className="input"
              />
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold">Rincian sampah</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Harga diambil otomatis dari master harga saat transaksi disimpan.
              </p>
            </div>
            <button type="button" onClick={addRow} className="btn-secondary btn-sm">
              <IconPlus className="size-3.5" />
              Baris
            </button>
          </div>

          <div className="divide-y divide-line/80">
            {rows.map((row, index) => {
              const harga = hargaMap.get(row.id_jenis) ?? 0;
              const berat = Number(row.berat.replace(",", ".")) || 0;
              return (
                <div key={row.key} className="grid gap-3 px-5 py-4 sm:grid-cols-12 sm:items-end">
                  <div className="sm:col-span-5">
                    <label className="label" htmlFor={`jenis-${row.key}`}>
                      Jenis #{index + 1}
                    </label>
                    <select
                      id={`jenis-${row.key}`}
                      className="input py-2"
                      value={row.id_jenis}
                      onChange={(e) => updateRow(row.key, { id_jenis: e.target.value })}
                    >
                      <option value="">Pilih jenis…</option>
                      {kategoriGroup.map(([kategori, list]) => (
                        <optgroup key={kategori} label={kategori}>
                          {list.map((item) => (
                            <option key={item.id_jenis} value={item.id_jenis}>
                              {item.nama_jenis} — {formatRupiah(item.harga_per_kg)}/kg
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="label" htmlFor={`berat-${row.key}`}>
                      Berat (kg)
                    </label>
                    <input
                      id={`berat-${row.key}`}
                      type="number"
                      min={0.01}
                      step={0.01}
                      inputMode="decimal"
                      placeholder="0"
                      value={row.berat}
                      onChange={(e) => updateRow(row.key, { berat: e.target.value })}
                      className="input py-2 text-right num"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <p className="label">Subtotal</p>
                    <p className="num truncate rounded-xl bg-[#f8faf5] px-3 py-2 text-right text-[13px] font-bold text-brand-800">
                      {formatRupiah(harga * berat)}
                    </p>
                  </div>

                  <div className="flex justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length === 1}
                      className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      aria-label={`Hapus baris ${index + 1}`}
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8faf5] px-5 py-3.5">
            <button type="button" onClick={addRow} className="btn-ghost btn-sm">
              <IconPlus className="size-3.5" />
              Tambah baris sampah
            </button>
            <p className="text-[12px] text-muted">
              {namaMap.size} jenis tersedia · maksimal 20 baris per setoran
            </p>
          </div>
        </section>
      </div>

      <aside className="card sticky top-6 overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-bold">Ringkasan setoran</h2>
          <p className="mt-0.5 text-[12px] text-muted">Perhitungan otomatis</p>
        </div>

        <div className="space-y-3 px-5 py-4 text-[13px]">
          <div className="flex justify-between text-muted">
            <span>Jumlah baris</span>
            <span className="num font-semibold text-ink">{rows.length}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Total berat</span>
            <span className="num font-semibold text-ink">
              {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(totalBerat)} kg
            </span>
          </div>
          <div className="flex items-end justify-between border-t border-dashed border-line pt-3">
            <span className="text-[12px] font-semibold text-muted">Total dibayar</span>
            <span className="num text-[22px] leading-none font-extrabold text-brand-800">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 px-5 pb-5">
          <SubmitButton pendingLabel="Menyimpan setoran…" className="btn-primary w-full">
            Simpan setoran
          </SubmitButton>
          <p className="text-center text-[10.5px] leading-relaxed text-muted">
            Harga tersimpan sebagai snapshot, sehingga perubahan harga master
            tidak mengubah nilai transaksi lama.
          </p>
        </div>
      </aside>
    </form>
  );
}
