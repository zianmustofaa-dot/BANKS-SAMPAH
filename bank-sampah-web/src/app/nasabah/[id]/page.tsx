import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getNasabah,
  getNasabahRiwayat,
  getSaldoNasabah,
} from "@/lib/queries";
import {
  formatKg,
  formatNumber,
  formatRupiah,
  formatTanggal,
  formatTanggalSingkat,
} from "@/lib/format";
import { Alert, PageHeader, SectionTitle } from "@/components/ui";
import { Avatar } from "@/components/stat-card";
import { NasabahForm } from "@/components/nasabah-form";
import { SubmitButton } from "@/components/forms";
import { hapusNasabah } from "../actions";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCoins,
  IconScale,
  IconTrash,
  IconWallet,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NasabahDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const idNasabah = Number(id);
  if (!Number.isInteger(idNasabah) || idNasabah <= 0) notFound();

  const [nasabah, saldo, riwayat] = await Promise.all([
    getNasabah(idNasabah),
    getSaldoNasabah(idNasabah),
    getNasabahRiwayat(idNasabah),
  ]);

  if (!nasabah || !saldo) notFound();

  const totalSetoran = riwayat
    .filter((item) => item.tipe === "setoran")
    .reduce((sum, item) => sum + Number(item.nilai), 0);
  const totalTarik = riwayat
    .filter((item) => item.tipe === "penarikan")
    .reduce((sum, item) => sum + Number(item.nilai), 0);

  return (
    <>
      <Link
        href="/nasabah"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-brand-800"
      >
        <IconArrowLeft className="size-3.5" />
        Kembali ke daftar nasabah
      </Link>

      <PageHeader
        eyebrow={`Nasabah #${nasabah.id_nasabah}`}
        title={nasabah.nama}
        description={`Bergabung sejak ${formatTanggal(nasabah.tgl_daftar)} · ${nasabah.no_hp ?? "tanpa nomor HP"}`}
        actions={
          <form action={hapusNasabah}>
            <input type="hidden" name="id_nasabah" value={nasabah.id_nasabah} />
            <SubmitButton
              className="btn-danger"
              pendingLabel="Menghapus…"
              confirmMessage="Hapus nasabah ini? Tindakan tidak dapat dibatalkan."
            >
              <IconTrash className="size-4" />
              Hapus
            </SubmitButton>
          </form>
        }
      />

      {search.status === "dibuat" && (
        <div className="mb-4">
          <Alert>Nasabah baru berhasil didaftarkan dan siap menerima setoran.</Alert>
        </div>
      )}
      {search.status === "diperbarui" && (
        <div className="mb-4">
          <Alert>Perubahan data nasabah sudah disimpan.</Alert>
        </div>
      )}
      {search.error && (
        <div className="mb-4">
          <Alert tone="error">{search.error}</Alert>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="flex items-start gap-4 border-b border-line bg-[radial-gradient(500px_120px_at_0%_0%,#eefbf3,transparent)] px-5 py-5">
              <Avatar name={nasabah.nama} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">{nasabah.nama}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  {nasabah.alamat ?? "Alamat belum diisi"}
                </p>
              </div>
              <span className="badge bg-emerald-50 text-emerald-700">Aktif</span>
            </div>

            <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  <IconScale className="size-3.5" /> Total setoran
                </p>
                <p className="num mt-1.5 text-[17px] font-extrabold text-ink">
                  {formatRupiah(totalSetoran)}
                </p>
                <p className="num mt-0.5 text-[11px] text-muted">
                  {riwayat.filter((r) => r.tipe === "setoran").length} transaksi
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  <IconCoins className="size-3.5" /> Total penarikan
                </p>
                <p className="num mt-1.5 text-[17px] font-extrabold text-ink">
                  {formatRupiah(totalTarik)}
                </p>
                <p className="num mt-0.5 text-[11px] text-muted">
                  {riwayat.filter((r) => r.tipe === "penarikan").length} transaksi
                </p>
              </div>
              <div className="bg-brand-50/60 px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-brand-700 uppercase">
                  <IconWallet className="size-3.5" /> Saldo tersedia
                </p>
                <p className="num mt-1.5 text-[17px] font-extrabold text-brand-900">
                  {formatRupiah(saldo.saldo)}
                </p>
                <p className="mt-0.5 text-[11px] text-brand-700/70">
                  Dihitung dari view v_saldo_nasabah
                </p>
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <SectionTitle
              title="Riwayat transaksi"
              description="Gabungan setoran dan penarikan, terbaru di atas"
              action={
                <Link
                  href={`/setoran/baru?nasabah=${nasabah.id_nasabah}`}
                  className="btn-secondary btn-sm"
                >
                  Catat setoran
                </Link>
              }
            />

            {riwayat.length === 0 ? (
              <p className="px-5 py-10 text-center text-[12.5px] text-muted">
                Belum ada transaksi untuk nasabah ini.
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {riwayat.map((item) => (
                  <li key={`${item.tipe}-${item.id}`} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                        item.tipe === "setoran"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.tipe === "setoran" ? (
                        <IconScale className="size-4" />
                      ) : (
                        <IconWallet className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold">
                        {item.tipe === "setoran" ? "Setoran sampah" : "Penarikan saldo"}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {item.keterangan} · {formatTanggalSingkat(item.tanggal)}
                      </p>
                    </div>
                    <span
                      className={`num text-[12.5px] font-bold ${
                        item.tipe === "setoran" ? "text-brand-800" : "text-amber-700"
                      }`}
                    >
                      {item.tipe === "setoran" ? "+" : "−"}
                      {formatRupiah(item.nilai)}
                    </span>
                    {item.tipe === "setoran" ? (
                      <Link
                        href={`/setoran/${item.id}`}
                        className="grid size-7 place-items-center rounded-lg text-muted hover:bg-brand-50"
                        aria-label="Lihat detail setoran"
                      >
                        <IconArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="size-7" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="card sticky top-6">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14.5px] font-bold">Ubah data nasabah</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              Perubahan langsung tersimpan ke database.
            </p>
          </div>
          <div className="px-5 py-4">
            <NasabahForm nasabah={nasabah} compact />
          </div>
        </aside>
      </div>
    </>
  );
}
