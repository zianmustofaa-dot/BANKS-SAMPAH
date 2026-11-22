"use client";

import { useActionState } from "react";
import { simpanNasabah } from "@/app/nasabah/actions";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { todayISO } from "@/lib/format";
import type { Nasabah } from "@/lib/types";

export function NasabahForm({
  nasabah,
  compact = false,
}: {
  nasabah?: Nasabah;
  compact?: boolean;
}) {
  const [state, action] = useActionState(simpanNasabah, null);
  const editing = Boolean(nasabah);

  return (
    <form action={action} className="space-y-4">
      {state?.status === "error" && <Alert tone="error">{state.message}</Alert>}

      {nasabah && (
        <input type="hidden" name="id_nasabah" value={nasabah.id_nasabah} />
      )}

      <div>
        <label htmlFor="nama" className="label">
          Nama lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="nama"
          name="nama"
          required
          minLength={3}
          maxLength={100}
          defaultValue={nasabah?.nama}
          placeholder="Contoh: Siti Aminah"
          className="input"
        />
      </div>

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor="no_hp" className="label">
            Nomor HP
          </label>
          <input
            id="no_hp"
            name="no_hp"
            inputMode="numeric"
            pattern="\d{10,15}"
            maxLength={15}
            defaultValue={nasabah?.no_hp ?? ""}
            placeholder="08xxxxxxxxxx"
            className="input"
          />
          <p className="mt-1 text-[11px] text-muted">
            10–15 digit, harus unik antar nasabah.
          </p>
        </div>
        <div>
          <label htmlFor="tgl_daftar" className="label">
            Tanggal daftar <span className="text-red-500">*</span>
          </label>
          <input
            id="tgl_daftar"
            name="tgl_daftar"
            type="date"
            required
            defaultValue={nasabah?.tgl_daftar ?? todayISO()}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="alamat" className="label">
          Alamat
        </label>
        <textarea
          id="alamat"
          name="alamat"
          rows={compact ? 2 : 3}
          maxLength={200}
          defaultValue={nasabah?.alamat ?? ""}
          placeholder="Jalan, nomor rumah, kelurahan, kota"
          className="input resize-none"
        />
      </div>

      <SubmitButton pendingLabel={editing ? "Menyimpan…" : "Mendaftarkan…"}>
        {editing ? "Simpan perubahan" : "Tambah nasabah"}
      </SubmitButton>
    </form>
  );
}
