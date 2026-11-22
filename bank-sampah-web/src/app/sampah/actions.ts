"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { fail, type ActionState } from "@/lib/action-state";

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function tambahJenis(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nama = clean(formData.get("nama_jenis"));
  const idKategori = Number(formData.get("id_kategori") ?? 0);
  const harga = Number(
    String(formData.get("harga_per_kg") ?? "").replace(/\./g, "").replace(",", "."),
  );

  if (nama.length < 2) return fail("Nama jenis sampah minimal 2 karakter.");
  if (nama.length > 80) return fail("Nama jenis sampah maksimal 80 karakter.");
  if (!idKategori) return fail("Pilih kategori sampah.");
  if (!Number.isFinite(harga) || harga < 0)
    return fail("Harga per kg harus bernilai 0 atau lebih.");
  if (harga > 1_000_000) return fail("Harga per kg tidak wajar (maksimal Rp 1.000.000).");

  let errorCode: string | undefined;
  try {
    await query(
      `INSERT INTO jenis_sampah (id_kategori, nama_jenis, harga_per_kg)
       VALUES ($1, $2, $3)`,
      [idKategori, nama, harga],
    );
  } catch (error) {
    errorCode = (error as { code?: string }).code;
    if (!errorCode) console.error("tambahJenis", error);
  }

  if (errorCode === "23505")
    return fail("Nama jenis sampah sudah ada. Gunakan nama lain.");
  if (errorCode === "23503") return fail("Kategori sampah tidak ditemukan.");
  if (errorCode) return fail("Jenis sampah gagal ditambahkan.");

  revalidatePath("/sampah");
  redirect(`/sampah?status=jenis-baru&nama=${encodeURIComponent(nama)}`);
}

export async function ubahHarga(formData: FormData) {
  const id = Number(formData.get("id_jenis") ?? 0);
  const harga = Number(
    String(formData.get("harga_per_kg") ?? "").replace(/\./g, "").replace(",", "."),
  );

  if (!id || !Number.isFinite(harga) || harga < 0) {
    redirect("/sampah?error=Harga+tidak+valid.");
  }

  let error = false;
  try {
    await query(`UPDATE jenis_sampah SET harga_per_kg = $1 WHERE id_jenis = $2`, [
      harga,
      id,
    ]);
  } catch (err) {
    console.error("ubahHarga", err);
    error = true;
  }

  revalidatePath("/sampah");
  revalidatePath("/setoran/baru");
  if (error) redirect("/sampah?error=Harga+gagal+diperbarui.");
  redirect(`/sampah?status=harga&harga=${encodeURIComponent(String(harga))}`);
}

export async function hapusJenis(formData: FormData) {
  const id = Number(formData.get("id_jenis") ?? 0);
  if (!id) redirect("/sampah?error=Data+tidak+ditemukan.");

  let errorCode: string | undefined;
  try {
    await query(`DELETE FROM jenis_sampah WHERE id_jenis = $1`, [id]);
  } catch (err) {
    errorCode = (err as { code?: string }).code;
    if (!errorCode) console.error("hapusJenis", err);
  }

  revalidatePath("/sampah");
  if (errorCode === "23503" || errorCode === "23001") {
    redirect(
      "/sampah?error=Jenis+sampah+sudah+dipakai+pada+transaksi+setoran,+sehingga+tidak+dapat+dihapus.",
    );
  }
  if (errorCode) redirect("/sampah?error=Jenis+sampah+gagal+dihapus.");
  redirect("/sampah?status=jenis-dihapus");
}

export async function tambahKategori(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nama = clean(formData.get("nama_kategori"));
  const deskripsi = clean(formData.get("deskripsi"));

  if (nama.length < 3) return fail("Nama kategori minimal 3 karakter.");
  if (nama.length > 50) return fail("Nama kategori maksimal 50 karakter.");
  if (deskripsi.length > 150) return fail("Deskripsi maksimal 150 karakter.");

  let errorCode: string | undefined;
  try {
    await query(
      `INSERT INTO kategori_sampah (nama_kategori, deskripsi) VALUES ($1, $2)`,
      [nama, deskripsi || null],
    );
  } catch (error) {
    errorCode = (error as { code?: string }).code;
    if (!errorCode) console.error("tambahKategori", error);
  }

  if (errorCode === "23505") return fail("Nama kategori sudah ada.");
  if (errorCode) return fail("Kategori gagal ditambahkan.");

  revalidatePath("/sampah");
  redirect(`/sampah?status=kategori-baru&nama=${encodeURIComponent(nama)}`);
}

export async function hapusKategori(formData: FormData) {
  const id = Number(formData.get("id_kategori") ?? 0);
  if (!id) redirect("/sampah?error=Data+tidak+ditemukan.");

  let errorCode: string | undefined;
  try {
    await query(`DELETE FROM kategori_sampah WHERE id_kategori = $1`, [id]);
  } catch (err) {
    errorCode = (err as { code?: string }).code;
    if (!errorCode) console.error("hapusKategori", err);
  }

  revalidatePath("/sampah");
  if (errorCode === "23503" || errorCode === "23001") {
    redirect(
      "/sampah?error=Kategori+masih+memiliki+jenis+sampah,+hapus+jenisnya+terlebih+dahulu.",
    );
  }
  if (errorCode) redirect("/sampah?error=Kategori+gagal+dihapus.");
  redirect("/sampah?status=kategori-dihapus");
}
