import Link from "next/link";
import { notFound } from "next/navigation";
import { getSetoranDetail } from "@/lib/queries";
import {
  formatKg,
  formatNumber,
  formatRupiah,
  formatTanggal,
  formatTanggalSingkat,
} from "@/lib/format";
import { Alert, PageHeader } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { IconArrowLeft, IconCheck } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SetoranDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const idSetoran = Number(id);
  if (!Number.isInteger(idSetoran) || idSetoran <= 0) notFound();

  const { header, items } = await getSetoranDetail(idSetoran);
  if (!header) notFound();

  const totalBerat = items.reduce((sum, item) => sum + Number(item.berat_kg), 0);
  const totalNilai = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return (
    <>
      <Link
        href="/setoran"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-brand-800"
      >
        <IconArrowLeft className="size-3.5" />
        Kembali ke riwayat setoran
      </Link>

      <PageHeader
        eyebrow={`Setoran #${String(header.id_setoran).padStart(3, "0")}`}
        title="Detail Setoran"
        description={`Dicatat oleh ${header.petugas} pada ${formatTanggal(header.tgl_setoran)}.`}
        actions={<PrintButton />}
      />

      {search.status === "dibuat" && (
        <div className="mb-4">
          <Alert>
            Setoran berhasil disimpan. Saldo nasabah otomatis bertambah sebesar{" "}
            <b>{formatRupiah(totalNilai)}</b>.
          </Alert>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[14.5px] font-bold">Rincian sampah</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {items.length} jenis · {formatKg(totalBerat)} total berat
              </p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              <IconCheck className="size-3.5" />
              Tersimpan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Jenis sampah</th>
                  <th>Kategori</th>
                  <th className="text-right">Berat</th>
                  <th className="text-right">Harga/kg</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_detail}>
                    <td className="text-[13px] font-semibold">{item.nama_jenis}</td>
                    <td>
                      <span className="badge bg-brand-50 text-brand-700">
                        {item.nama_kategori}
                      </span>
                    </td>
                    <td className="num text-right text-[12.5px]">
                      {formatNumber(item.berat_kg)} kg
                    </td>
                    <td className="num text-right text-[12.5px] text-muted">
                      {formatRupiah(item.harga_satuan)}
                    </td>
                    <td className="num text-right text-[13px] font-bold text-brand-800">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8faf5]">
                  <td colSpan={2} className="px-4 py-3 text-[12px] font-semibold text-muted">
                    Total
                  </td>
                  <td className="num px-4 py-3 text-right text-[13px] font-bold">
                    {formatKg(totalBerat)}
                  </td>
                  <td />
                  <td className="num px-4 py-3 text-right text-[15px] font-extrabold text-brand-900">
                    {formatRupiah(totalNilai)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#0c543d,#04271d)] p-5 text-white shadow-[0_18px_40px_-24px_rgba(4,39,29,0.85)]">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-lime-soft uppercase">
              Total dibayar
            </p>
            <p className="num mt-2 text-[26px] leading-none font-extrabold">
              {formatRupiah(totalNilai)}
            </p>
            <div className="my-4 h-px bg-white/15" />
            <dl className="space-y-2.5 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-white/55">Nasabah</dt>
                <dd className="text-right font-semibold">{header.nasabah}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/55">No. HP</dt>
                <dd className="text-right font-medium">{header.no_hp ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/55">Tanggal</dt>
                <dd className="text-right font-medium">
                  {formatTanggalSingkat(header.tgl_setoran)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/55">Petugas</dt>
                <dd className="text-right font-medium">{header.petugas}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/55">Catatan</dt>
                <dd className="text-right font-medium">{header.catatan ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="card px-5 py-4">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
              Catatan sistem
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Harga per kg disimpan sebagai <b>snapshot</b> pada tabel{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-ink">
                detail_setoran
              </code>
              . Perubahan harga master tidak akan mengubah nilai bukti setoran ini.
            </p>
            <Link
              href={`/nasabah/${header.id_nasabah}`}
              className="mt-3 inline-flex text-[12px] font-bold text-brand-700 hover:text-brand-900"
            >
              Lihat profil nasabah →
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
