"use client";

import { useActionState, useMemo, useState } from "react";
import { buatPenarikan } from "@/app/penarikan/actions";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { IconWallet } from "@/components/icons";
import { formatRupiah, todayISO } from "@/lib/format";
import type { Petugas, SaldoRow } from "@/lib/types";

export function PenarikanForm({
  saldo,
  petugas,
}: {
  saldo: SaldoRow[];
  petugas: Petugas[];
}) {
  const [state, action] = useActionState(buatPenarikan, null);
  const [nasabahId, setNasabahId] = useState("");
  const [jumlah, setJumlah] = useState("");

  const saldoMap = useMemo(
    () => new Map(saldo.map((item) => [String(item.id_nasabah), Number(item.saldo)])),
    [saldo],
  );

  const saldoTerpilih = saldoMap.get(nasabahId) ?? 0;
  const nominal = Number(jumlah) || 0;
  const melebihi = nominal > 0 && nominal > saldoTerpilih;

  return (
    <form action={action} className="space-y-4">
      {state?.status === "error" && <Alert tone="error">{state.message}</Alert>}

      <div>
        <label htmlFor="id_nasabah" className="label">
          Nasabah <span className="text-red-500">*</span>
        </label>
        <select
          id="id_nasabah"
          name="id_nasabah"
          required
          className="input"
          value={nasabahId}
          onChange={(event) => {
            setNasabahId(event.target.value);
            setJumlah("");
          }}
        >
          <option value="" disabled>
            Pilih nasabah…
          </option>
          {saldo.map((item) => (
            <option key={item.id_nasabah} value={item.id_nasabah}>
              {item.nama} — saldo {formatRupiah(item.saldo)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-brand-800">
          <IconWallet className="size-4" />
          Saldo tersedia
        </div>
        <p className="num text-[15px] font-extrabold text-brand-900">
          {formatRupiah(saldoTerpilih)}
        </p>
      </div>

      <div>
        <label htmlFor="jumlah" className="label">
          Jumlah penarikan (Rp) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] font-semibold text-muted">
            Rp
          </span>
          <input
            id="jumlah"
            name="jumlah"
            type="number"
            min={1}
            step={1}
            required
            inputMode="numeric"
            placeholder="0"
            value={jumlah}
            onChange={(event) => setJumlah(event.target.value)}
            className="input num pr-3 pl-10 text-right text-[15px] font-bold"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[25_000, 50_000, 100_000].map((nominalCepat) => (
            <button
              key={nominalCepat}
              type="button"
              onClick={() => setJumlah(String(nominalCepat))}
              className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-brand-300 hover:text-brand-800"
            >
              {formatRupiah(nominalCepat)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setJumlah(String(Math.floor(saldoTerpilih)))}
            disabled={saldoTerpilih <= 0}
            className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-brand-300 hover:text-brand-800 disabled:opacity-40"
          >
            Semua saldo
          </button>
        </div>
        {melebihi && (
          <p className="mt-2 text-[11.5px] font-semibold text-red-600">
            Nominal melebihi saldo tersedia ({formatRupiah(saldoTerpilih)}). Server akan
            menolak transaksi ini.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="id_petugas" className="label">
            Petugas kasir <span className="text-red-500">*</span>
          </label>
          <select id="id_petugas" name="id_petugas" required className="input" defaultValue="">
            <option value="" disabled>
              Pilih petugas…
            </option>
            {petugas.map((item) => (
              <option key={item.id_petugas} value={item.id_petugas}>
                {item.nama_petugas}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tgl_penarikan" className="label">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            id="tgl_penarikan"
            name="tgl_penarikan"
            type="date"
            required
            defaultValue={todayISO()}
            className="input"
          />
        </div>
      </div>

      <SubmitButton pendingLabel="Memproses penarikan…" className="btn-primary w-full">
        Proses penarikan
      </SubmitButton>
      <p className="text-center text-[10.5px] leading-relaxed text-muted">
        Penarikan divalidasi dua lapis: aplikasi dan trigger database
        <span className="font-semibold"> trg_penarikan_cek_saldo</span>.
      </p>
    </form>
  );
}
