import Link from "next/link";
import { getNasabahList } from "@/lib/queries";
import { formatRupiah, formatTanggalSingkat } from "@/lib/format";
import { Alert, EmptyState, PageHeader } from "@/components/ui";
import { Avatar } from "@/components/stat-card";
import { SearchBar } from "@/components/forms";
import { NasabahForm } from "@/components/nasabah-form";
import { IconArrowRight, IconUsers } from "@/components/icons";

export const dynamic = "force-dynamic";

const STATUS_MESSAGE: Record<string, string> = {
  dibuat: "Nasabah baru berhasil didaftarkan.",
  diperbarui: "Data nasabah berhasil diperbarui.",
  dihapus: "Nasabah berhasil dihapus.",
};

export default async function NasabahPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; error?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const list = await getNasabahList(q);
  const totalSaldo = list.reduce((sum, item) => sum + Number(item.saldo), 0);

  return (
    <>
      <PageHeader
        eyebrow="Data master"
        title="Nasabah"
        description="Kelola data anggota bank sampah, lengkap dengan saldo dan riwayat transaksinya."
        actions={
          <span className="badge border border-line bg-white px-3 py-1.5 text-muted">
            <IconUsers className="size-3.5" />
            {list.length} nasabah
          </span>
        }
      />

      {params.status && STATUS_MESSAGE[params.status] && (
        <div className="mb-4">
          <Alert>{STATUS_MESSAGE[params.status]}</Alert>
        </div>
      )}
      {params.error && (
        <div className="mb-4">
          <Alert tone="error">{params.error}</Alert>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[14.5px] font-bold">Daftar nasabah</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Total saldo seluruh nasabah: <b className="text-brand-800">{formatRupiah(totalSaldo)}</b>
              </p>
            </div>
            <SearchBar
              basePath="/nasabah"
              defaultValue={q}
              placeholder="Cari nama, HP, alamat…"
            />
          </div>

          {list.length === 0 ? (
            <EmptyState
              title={q ? "Nasabah tidak ditemukan" : "Belum ada nasabah"}
              description={
                q
                  ? `Tidak ada hasil untuk “${q}”. Coba kata kunci lain.`
                  : "Daftarkan nasabah pertama melalui formulir di samping."
              }
              action={
                q ? (
                  <Link href="/nasabah" className="btn-secondary btn-sm">
                    Reset pencarian
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Nasabah</th>
                    <th>Alamat</th>
                    <th>Terdaftar</th>
                    <th className="text-right">Setoran</th>
                    <th className="text-right">Saldo</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id_nasabah}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={item.nama} />
                          <div>
                            <p className="text-[13px] font-semibold">{item.nama}</p>
                            <p className="num text-[11px] text-muted">
                              {item.no_hp ?? "Tanpa nomor HP"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[210px] text-[12px] text-muted">
                        <span className="line-clamp-1">{item.alamat ?? "—"}</span>
                      </td>
                      <td className="text-[12px] whitespace-nowrap text-muted">
                        {formatTanggalSingkat(item.tgl_daftar)}
                      </td>
                      <td className="num text-right text-[12.5px] font-semibold">
                        {item.jumlah_setoran}×
                      </td>
                      <td className="num text-right text-[12.5px] font-bold text-brand-800">
                        {formatRupiah(item.saldo)}
                      </td>
                      <td className="w-10">
                        <Link
                          href={`/nasabah/${item.id_nasabah}`}
                          aria-label={`Detail ${item.nama}`}
                          className="grid size-7 place-items-center rounded-lg text-muted hover:bg-brand-50 hover:text-brand-800"
                        >
                          <IconArrowRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="card sticky top-6">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14.5px] font-bold">Daftarkan nasabah</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              Isi data anggota baru bank sampah.
            </p>
          </div>
          <div className="px-5 py-4">
            <NasabahForm compact />
          </div>
        </aside>
      </div>
    </>
  );
}
