import {
  getPenarikanList,
  getPetugas,
  getRingkasan,
  getSaldoList,
} from "@/lib/queries";
import { formatRupiah, formatTanggalSingkat } from "@/lib/format";
import { Alert, EmptyState, PageHeader } from "@/components/ui";
import { Avatar } from "@/components/stat-card";
import { PenarikanForm } from "@/components/penarikan-form";
import { IconCoins, IconWallet } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PenarikanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; nominal?: string }>;
}) {
  const search = await searchParams;
  const [saldo, petugas, riwayat, ringkasan] = await Promise.all([
    getSaldoList(),
    getPetugas(),
    getPenarikanList(),
    getRingkasan(),
  ]);

  const totalDitarik = riwayat.reduce((sum, item) => sum + Number(item.jumlah), 0);

  return (
    <>
      <PageHeader
        eyebrow="Transaksi keluar"
        title="Penarikan Saldo"
        description="Proses pencairan saldo nasabah. Sistem menolak nominal yang melebihi saldo tersedia."
      />

      {search.status === "sukses" && (
        <div className="mb-4">
          <Alert>
            Penarikan sebesar <b>{formatRupiah(search.nominal ?? 0)}</b> berhasil
            diproses dan saldo nasabah telah diperbarui.
          </Alert>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
            <IconWallet className="size-3.5" /> Saldo tersimpan
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">
            {formatRupiah(ringkasan?.total_saldo ?? 0)}
          </p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
            <IconCoins className="size-3.5" /> Total ditarik
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">
            {formatRupiah(totalDitarik)}
          </p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Transaksi penarikan
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">{riwayat.length}</p>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[360px_1fr]">
        <section className="card sticky top-6">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14.5px] font-bold">Form penarikan</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              Saldo dihitung real-time dari setoran − penarikan.
            </p>
          </div>
          <div className="px-5 py-4">
            <PenarikanForm saldo={saldo} petugas={petugas} />
          </div>
        </section>

        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[14.5px] font-bold">Riwayat penarikan</h2>
                <p className="mt-0.5 text-[12px] text-muted">Terbaru di atas</p>
              </div>
              <span className="badge border border-line bg-white text-muted">
                {riwayat.length} transaksi
              </span>
            </div>

            {riwayat.length === 0 ? (
              <EmptyState
                title="Belum ada penarikan"
                description="Transaksi penarikan saldo akan tampil di sini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Nasabah</th>
                      <th>Tanggal</th>
                      <th>Petugas kasir</th>
                      <th className="text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayat.map((item) => (
                      <tr key={item.id_penarikan}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={item.nasabah} size="sm" />
                            <p className="text-[13px] font-semibold whitespace-nowrap">
                              {item.nasabah}
                            </p>
                          </div>
                        </td>
                        <td className="text-[12px] whitespace-nowrap text-muted">
                          {formatTanggalSingkat(item.tgl_penarikan)}
                        </td>
                        <td className="text-[12px] whitespace-nowrap text-muted">
                          {item.petugas}
                        </td>
                        <td className="num text-right text-[12.5px] font-bold text-amber-700">
                          {formatRupiah(item.jumlah)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[14.5px] font-bold">Saldo nasabah</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Bersumber dari view <code className="text-[11px]">v_saldo_nasabah</code>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Nasabah</th>
                    <th className="text-right">Total setoran</th>
                    <th className="text-right">Total tarik</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {saldo.map((item) => (
                    <tr key={item.id_nasabah}>
                      <td>
                        <p className="text-[13px] font-semibold">{item.nama}</p>
                        <p className="num text-[11px] text-muted">{item.no_hp ?? "—"}</p>
                      </td>
                      <td className="num text-right text-[12px] text-muted">
                        {formatRupiah(item.total_setor)}
                      </td>
                      <td className="num text-right text-[12px] text-muted">
                        {formatRupiah(item.total_tarik)}
                      </td>
                      <td className="num text-right text-[13px] font-bold text-brand-800">
                        {formatRupiah(item.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
