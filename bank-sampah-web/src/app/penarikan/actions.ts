"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { queryOne, withTransaction } from "@/lib/db";
import { fail, type ActionState } from "@/lib/action-state";
import { formatRupiah } from "@/lib/format";

export async function buatPenarikan(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idNasabah = Number(formData.get("id_nasabah") ?? 0);
  const idPetugas = Number(formData.get("id_petugas") ?? 0);
  const tanggal = String(formData.get("tgl_penarikan") ?? "").trim();
  const nominal = Number(
    String(formData.get("jumlah") ?? "0").replace(/\./g, "").replace(",", "."),
  );

  if (!idNasabah) return fail("Pilih nasabah yang akan menarik saldo.");
  if (!idPetugas) return fail("Pilih petugas kasir yang melayani.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))
    return fail("Tanggal penarikan tidak valid.");
  if (!Number.isFinite(nominal) || nominal <= 0)
    return fail("Jumlah penarikan harus lebih besar dari Rp 0.");
  if (nominal > 100_000_000)
    return fail("Jumlah penarikan melebihi batas transaksi (Rp 100.000.000).");

  const saldo = await queryOne<{ saldo: string }>(
    `SELECT saldo::text FROM v_saldo_nasabah WHERE id_nasabah = $1`,
    [idNasabah],
  );
  if (!saldo) return fail("Nasabah tidak ditemukan.");

  const saldoTersedia = Number(saldo.saldo);
  if (nominal > saldoTersedia) {
    return fail(
      `Penarikan ditolak. Saldo tersedia hanya ${formatRupiah(saldoTersedia)}, sedangkan nominal yang diminta ${formatRupiah(nominal)}.`,
    );
  }

  try {
    await withTransaction(async (client) => {
      // Kunci baris nasabah agar dua penarikan bersamaan tidak lolos validasi saldo.
      await client.query(`SELECT id_nasabah FROM nasabah WHERE id_nasabah = $1 FOR UPDATE`, [
        idNasabah,
      ]);
      await client.query(
        `INSERT INTO penarikan_saldo (id_nasabah, id_petugas, tgl_penarikan, jumlah)
         VALUES ($1, $2, $3, $4)`,
        [idNasabah, idPetugas, tanggal, nominal],
      );
    });
  } catch (error) {
    const dbMessage = (error as { message?: string }).message ?? "";
    if (dbMessage.includes("PENARIKAN DITOLAK")) {
      return fail(
        "Penarikan ditolak oleh aturan database: saldo nasabah tidak mencukupi.",
      );
    }
    console.error("buatPenarikan", error);
    return fail("Penarikan gagal disimpan. Silakan coba lagi.");
  }

  revalidatePath("/");
  revalidatePath("/penarikan");
  revalidatePath("/nasabah");
  revalidatePath("/laporan");
  redirect(`/penarikan?status=sukses&nominal=${Math.round(nominal)}`);
}
