import Link from "next/link";
import { getSetoranList } from "@/lib/queries";
import { formatKg, formatRupiah, formatTanggalSingkat } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { SearchBar } from "@/components/forms";
import { Avatar } from "@/components/stat-card";
import { IconArrowRight, IconPlus, IconScale } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SetoranPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const list = await getSetoranList(q);

  const totalKg = list.reduce((sum, item) => sum + Number(item.total_kg), 0);
  const totalNilai = list.reduce((sum, item) => sum + Number(item.total_nilai), 0);

  return (
    <>
      <PageHeader
        eyebrow="Transaksi masuk"
        title="Setoran Sampah"
        description="Setiap setoran mencatat nasabah, petugas, jenis sampah, berat, dan harga saat transaksi."
        actions={
          <Link href="/setoran/baru" className="btn-primary">
            <IconPlus className="size-4" />
            Catat setoran
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Transaksi
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">{list.length}</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Total berat
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">
            {formatKg(totalKg)}
          </p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Total nilai
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold text-brand-800">
            {formatRupiah(totalNilai)}
          </p>
        </div>
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[14.5px] font-bold">Riwayat setoran</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              Urut dari transaksi terbaru
            </p>
          </div>
          <SearchBar
            basePath="/setoran"
            defaultValue={q}
            placeholder="Cari nasabah, petugas, catatan…"
          />
        </div>

        {list.length === 0 ? (
          <EmptyState
            title={q ? "Setoran tidak ditemukan" : "Belum ada setoran"}
            description={
              q
                ? `Tidak ada transaksi yang cocok dengan “${q}”.`
                : "Mulai catat setoran pertama nasabah bank sampah."
            }
            action={
              q ? (
                <Link href="/setoran" className="btn-secondary btn-sm">
                  Reset pencarian
                </Link>
              ) : (
                <Link href="/setoran/baru" className="btn-primary btn-sm">
                  <IconScale className="size-3.5" />
                  Catat setoran
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nasabah</th>
                  <th>Tanggal</th>
                  <th>Petugas</th>
                  <th className="text-right">Jenis</th>
                  <th className="text-right">Berat</th>
                  <th className="text-right">Nilai</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id_setoran}>
                    <td className="num text-[12px] font-bold text-muted">
                      #{String(item.id_setoran).padStart(3, "0")}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={item.nasabah} size="sm" />
                        <div>
                          <p className="text-[13px] font-semibold whitespace-nowrap">
                            {item.nasabah}
                          </p>
                          <p className="max-w-[190px] truncate text-[11px] text-muted">
                            {item.catatan ?? "Tanpa catatan"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[12px] whitespace-nowrap text-muted">
                      {formatTanggalSingkat(item.tgl_setoran)}
                    </td>
                    <td className="text-[12px] whitespace-nowrap text-muted">
                      {item.petugas}
                    </td>
                    <td className="num text-right text-[12px]">{item.jumlah_item}</td>
                    <td className="num text-right text-[12.5px] font-semibold">
                      {formatKg(item.total_kg)}
                    </td>
                    <td className="num text-right text-[12.5px] font-bold text-brand-800">
                      {formatRupiah(item.total_nilai)}
                    </td>
                    <td className="w-10">
                      <Link
                        href={`/setoran/${item.id_setoran}`}
                        aria-label={`Detail setoran ${item.id_setoran}`}
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
    </>
  );
}
