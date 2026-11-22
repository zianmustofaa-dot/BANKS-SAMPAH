"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { fail, type ActionState } from "@/lib/action-state";

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export async function simpanNasabah(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id_nasabah") ?? 0);
  const nama = clean(formData.get("nama"));
  const alamat = clean(formData.get("alamat"));
  const noHp = clean(formData.get("no_hp"));
  const tglDaftar = clean(formData.get("tgl_daftar"));

  if (nama.length < 3) return fail("Nama nasabah wajib diisi minimal 3 karakter.");
  if (nama.length > 100) return fail("Nama nasabah maksimal 100 karakter.");
  if (alamat.length > 200) return fail("Alamat maksimal 200 karakter.");
  if (noHp && !/^\d{10,15}$/.test(noHp))
    return fail("Nomor HP harus berupa 10–15 digit angka.");
  if (!isDate(tglDaftar)) return fail("Tanggal daftar tidak valid.");

  let targetId = id;

  try {
    if (id > 0) {
      const updated = await queryOne<{ id_nasabah: number }>(
        `UPDATE nasabah
         SET nama = $1, alamat = $2, no_hp = $3, tgl_daftar = $4
         WHERE id_nasabah = $5
         RETURNING id_nasabah`,
        [nama, alamat || null, noHp || null, tglDaftar, id],
      );
      if (!updated) return fail("Data nasabah tidak ditemukan.");
    } else {
      const created = await queryOne<{ id_nasabah: number }>(
        `INSERT INTO nasabah (nama, alamat, no_hp, tgl_daftar)
         VALUES ($1, $2, $3, $4) RETURNING id_nasabah`,
        [nama, alamat || null, noHp || null, tglDaftar],
      );
      targetId = created!.id_nasabah;
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505")
      return fail("Nomor HP sudah terdaftar pada nasabah lain. Gunakan nomor berbeda.");
    console.error("simpanNasabah", error);
    return fail("Data nasabah gagal disimpan. Silakan coba lagi.");
  }

  revalidatePath("/nasabah");
  revalidatePath(`/nasabah/${targetId}`);
  revalidatePath("/");
  redirect(
    `/nasabah/${targetId}?status=${id > 0 ? "diperbarui" : "dibuat"}`,
  );
}

export async function hapusNasabah(formData: FormData) {
  const id = Number(formData.get("id_nasabah") ?? 0);
  if (!id) redirect("/nasabah?error=Data+tidak+ditemukan");

  let errorCode: string | undefined;
  try {
    await query(`DELETE FROM nasabah WHERE id_nasabah = $1`, [id]);
  } catch (error) {
    errorCode = (error as { code?: string }).code;
    if (!errorCode) console.error("hapusNasabah", error);
  }

  if (errorCode === "23503" || errorCode === "23001") {
    redirect(
      `/nasabah/${id}?error=Nasabah+masih+memiliki+riwayat+setoran+atau+penarikan,+sehingga+tidak+dapat+dihapus.`,
    );
  }
  if (errorCode) {
    redirect(`/nasabah/${id}?error=Nasabah+gagal+dihapus.+Silakan+coba+lagi.`);
  }

  revalidatePath("/nasabah");
  revalidatePath("/");
  redirect("/nasabah?status=dihapus");
}
