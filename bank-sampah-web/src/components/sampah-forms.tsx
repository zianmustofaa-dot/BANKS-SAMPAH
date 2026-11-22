"use client";

import { useActionState } from "react";
import { tambahJenis, tambahKategori } from "@/app/sampah/actions";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { JenisSampah } from "@/lib/types";

type Kategori = { id_kategori: number; nama_kategori: string; deskripsi: string | null };

export function JenisForm({ kategori }: { kategori: Kategori[] }) {
  const [state, action] = useActionState(tambahJenis, null);

  return (
    <form action={action} className="space-y-4">
      {state?.status === "error" && <Alert tone="error">{state.message}</Alert>}

      <div>
        <label htmlFor="nama_jenis" className="label">
          Nama jenis sampah <span className="text-red-500">*</span>
        </label>
        <input
          id="nama_jenis"
          name="nama_jenis"
          required
          minLength={2}
          maxLength={80}
          placeholder="Contoh: Botol PET"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="id_kategori" className="label">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select id="id_kategori" name="id_kategori" required className="input" defaultValue="">
          <option value="" disabled>
            Pilih kategori…
          </option>
          {kategori.map((item) => (
            <option key={item.id_kategori} value={item.id_kategori}>
              {item.nama_kategori}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="harga_per_kg" className="label">
          Harga per kg (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          id="harga_per_kg"
          name="harga_per_kg"
          required
          type="number"
          min={0}
          max={1_000_000}
          step={50}
          placeholder="3500"
          className="input"
        />
      </div>

      <SubmitButton pendingLabel="Menambahkan…">Tambah jenis sampah</SubmitButton>
    </form>
  );
}

export function KategoriForm() {
  const [state, action] = useActionState(tambahKategori, null);

  return (
    <form action={action} className="space-y-3">
      {state?.status === "error" && <Alert tone="error">{state.message}</Alert>}
      <div>
        <label htmlFor="nama_kategori" className="label">
          Nama kategori
        </label>
        <input
          id="nama_kategori"
          name="nama_kategori"
          required
          minLength={3}
          maxLength={50}
          placeholder="Contoh: Tekstil"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="deskripsi" className="label">
          Deskripsi singkat
        </label>
        <input
          id="deskripsi"
          name="deskripsi"
          maxLength={150}
          placeholder="Opsional"
          className="input"
        />
      </div>
      <SubmitButton pendingLabel="Menambahkan…" className="btn-secondary w-full">
        Tambah kategori
      </SubmitButton>
    </form>
  );
}

export type { JenisSampah };
