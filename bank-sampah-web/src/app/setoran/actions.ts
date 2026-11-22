"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { fail, type ActionState } from "@/lib/action-state";

type ItemInput = { id_jenis: number; berat_kg: number };

function parseItems(raw: string): ItemInput[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Format rincian tidak valid");

  return parsed.map((item) => {
    const row = item as { id_jenis?: unknown; berat_kg?: unknown };
    return {
      id_jenis: Number(row.id_jenis),
      berat_kg: Number(String(row.berat_kg).replace(",", ".")),
    };
  });
}

export async function buatSetoran(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idNasabah = Number(formData.get("id_nasabah") ?? 0);
  const idPetugas = Number(formData.get("id_petugas") ?? 0);
  const tanggal = String(formData.get("tgl_setoran") ?? "").trim();
  const catatan = String(formData.get("catatan") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "[]");

  if (!idNasabah) return fail("Pilih nasabah yang menyetor.");
  if (!idPetugas) return fail("Pilih petugas yang mencatat.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))
    return fail("Tanggal setoran tidak valid.");
  if (catatan.length > 150) return fail("Catatan maksimal 150 karakter.");

  let items: ItemInput[];
  try {
    items = parseItems(itemsRaw);
  } catch {
    return fail("Rincian sampah tidak valid.");
  }

  if (items.length === 0) return fail("Tambahkan minimal satu jenis sampah.");
  if (items.length > 20) return fail("Maksimal 20 baris jenis sampah per setoran.");

  for (const item of items) {
    if (!Number.isInteger(item.id_jenis) || item.id_jenis <= 0)
      return fail("Jenis sampah pada rincian tidak valid.");
    if (!Number.isFinite(item.berat_kg) || item.berat_kg <= 0)
      return fail("Berat sampah harus lebih besar dari 0 kg.");
    if (item.berat_kg > 10_000)
      return fail("Berat per jenis tidak wajar (maksimal 10.000 kg).");
  }

  // Harga selalu diambil ulang dari master (snapshot), bukan dari input browser.
  const ids = [...new Set(items.map((item) => item.id_jenis))];
  const master = await query<{ id_jenis: number; harga_per_kg: string }>(
    `SELECT id_jenis, harga_per_kg::text FROM jenis_sampah
     WHERE id_jenis = ANY($1::int[])`,
    [ids],
  );
  const hargaMap = new Map(
    master.map((row) => [row.id_jenis, Number(row.harga_per_kg)]),
  );
  if (ids.some((id) => !hargaMap.has(id)))
    return fail("Salah satu jenis sampah tidak ditemukan pada master data.");

  const rincian = items.map((item) => ({
    ...item,
    berat: Math.round(item.berat_kg * 100) / 100,
    harga: hargaMap.get(item.id_jenis)!,
  }));
  const total = rincian.reduce((sum, item) => sum + item.berat * item.harga, 0);

  let idSetoran: number;
  try {
    idSetoran = await withTransaction(async (client) => {
      const header = await client.query<{ id_setoran: number }>(
        `INSERT INTO setoran (id_nasabah, id_petugas, tgl_setoran, catatan)
         VALUES ($1, $2, $3, $4) RETURNING id_setoran`,
        [idNasabah, idPetugas, tanggal, catatan || null],
      );
      const newId = header.rows[0].id_setoran;

      for (const item of rincian) {
        await client.query(
          `INSERT INTO detail_setoran (id_setoran, id_jenis, berat_kg, harga_satuan)
           VALUES ($1, $2, $3, $4)`,
          [newId, item.id_jenis, item.berat, item.harga],
        );
      }
      return newId;
    });
  } catch (error) {
    console.error("buatSetoran", error);
    return fail("Setoran gagal disimpan. Periksa kembali data lalu coba lagi.");
  }

  revalidatePath("/");
  revalidatePath("/setoran");
  revalidatePath("/nasabah");
  revalidatePath("/laporan");
  redirect(`/setoran/${idSetoran}?status=dibuat&total=${Math.round(total)}`);
}
