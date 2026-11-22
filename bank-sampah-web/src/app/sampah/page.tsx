import Link from "next/link";
import { getJenisSampah, getKategori } from "@/lib/queries";
import { formatKg, formatNumber, formatRupiah } from "@/lib/format";
import { Alert, EmptyState, PageHeader, SectionTitle } from "@/components/ui";
import { SearchBar, SubmitButton } from "@/components/forms";
import { JenisForm, KategoriForm } from "@/components/sampah-forms";
import { hapusJenis, hapusKategori, ubahHarga } from "./actions";
import { IconCheck, IconRecycle, IconTrash } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SampahPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    error?: string;
    nama?: string;
    harga?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const [jenis, kategori] = await Promise.all([
    getJenisSampah(q),
    getKategori(),
  ]);

  const totalTransaksi = jenis.reduce((sum, item) => sum + item.jumlah_transaksi, 0);
  const totalKg = jenis.reduce((sum, item) => sum + Number(item.total_kg), 0);

  return (
    <>
      <PageHeader
        eyebrow="Data master"
        title="Jenis Sampah & Harga"
        description="Atur kategori, jenis sampah, dan harga beli per kilogram. Harga baru berlaku untuk transaksi berikutnya."
        actions={
          <span className="badge border border-line bg-white px-3 py-1.5 text-muted">
            <IconRecycle className="size-3.5" />
            {jenis.length} jenis · {kategori.length} kategori
          </span>
        }
      />

      {params.status === "jenis-baru" && (
        <div className="mb-4">
          <Alert>
            Jenis sampah <b>{params.nama}</b> berhasil ditambahkan ke master data.
          </Alert>
        </div>
      )}
      {params.status === "harga" && (
        <div className="mb-4">
          <Alert>
            Harga per kg berhasil diperbarui menjadi{" "}
            <b>{formatRupiah(params.harga ?? 0)}</b>. Transaksi lama tetap memakai harga
            snapshot-nya.
          </Alert>
        </div>
      )}
      {params.status === "kategori-baru" && (
        <div className="mb-4">
          <Alert>
            Kategori <b>{params.nama}</b> berhasil ditambahkan.
          </Alert>
        </div>
      )}
      {params.status === "jenis-dihapus" && (
        <div className="mb-4">
          <Alert>Jenis sampah berhasil dihapus dari master.</Alert>
        </div>
      )}
      {params.status === "kategori-dihapus" && (
        <div className="mb-4">
          <Alert>Kategori berhasil dihapus.</Alert>
        </div>
      )}
      {params.error && (
        <div className="mb-4">
          <Alert tone="error">{params.error}</Alert>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Jenis aktif
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">{jenis.length}</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Volume tercatat
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">
            {formatKg(totalKg)}
          </p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Baris transaksi
          </p>
          <p className="num mt-1 text-[19px] leading-none font-extrabold">
            {formatNumber(totalTransaksi)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_330px]">
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[14.5px] font-bold">Daftar jenis sampah</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Ubah harga langsung pada kolom harga, lalu simpan.
              </p>
            </div>
            <SearchBar
              basePath="/sampah"
              defaultValue={q}
              placeholder="Cari jenis atau kategori…"
            />
          </div>

          {jenis.length === 0 ? (
            <EmptyState
              title="Jenis sampah tidak ditemukan"
              description={`Tidak ada hasil untuk “${q}”.`}
              action={
                <Link href="/sampah" className="btn-secondary btn-sm">
                  Reset pencarian
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Jenis sampah</th>
                    <th>Kategori</th>
                    <th className="text-right">Dipakai</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Harga / kg</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {jenis.map((item) => (
                    <tr key={item.id_jenis}>
                      <td className="text-[13px] font-semibold">{item.nama_jenis}</td>
                      <td>
                        <span className="badge bg-brand-50 text-brand-700">
                          {item.nama_kategori}
                        </span>
                      </td>
                      <td className="num text-right text-[12px] text-muted">
                        {item.jumlah_transaksi}×
                      </td>
                      <td className="num text-right text-[12px] text-muted">
                        {formatKg(item.total_kg)}
                      </td>
                      <td>
                        <form
                          action={ubahHarga}
                          className="flex items-center justify-end gap-1.5"
                        >
                          <input
                            type="hidden"
                            name="id_jenis"
                            value={item.id_jenis}
                          />
                          <input
                            type="number"
                            name="harga_per_kg"
                            min={0}
                            max={1_000_000}
                            step={50}
                            defaultValue={Math.round(Number(item.harga_per_kg))}
                            aria-label={`Harga ${item.nama_jenis}`}
                            className="num w-[104px] rounded-lg border border-line bg-white px-2.5 py-1.5 text-right text-[12.5px] font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                          />
                          <button
                            type="submit"
                            className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700 transition hover:bg-brand-100"
                            aria-label={`Simpan harga ${item.nama_jenis}`}
                            title="Simpan harga"
                          >
                            <IconCheck className="size-3.5" />
                          </button>
                        </form>
                      </td>
                      <td>
                        <form action={hapusJenis} className="flex justify-end">
                          <input type="hidden" name="id_jenis" value={item.id_jenis} />
                          <SubmitButton
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600"
                            pendingLabel=""
                            confirmMessage={`Hapus jenis sampah ${item.nama_jenis}?`}
                          >
                            <IconTrash className="size-3.5" />
                          </SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="card">
            <SectionTitle title="Tambah jenis sampah" />
            <div className="px-5 py-4">
              <JenisForm kategori={kategori} />
            </div>
          </section>

          <section className="card">
            <SectionTitle
              title="Kategori sampah"
              description={`${kategori.length} kategori terdaftar`}
            />
            <ul className="divide-y divide-line/70 px-5">
              {kategori.map((item) => (
                <li key={item.id_kategori} className="flex items-start gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold">{item.nama_kategori}</p>
                    <p className="truncate text-[11px] text-muted">
                      {item.deskripsi ?? "Tanpa deskripsi"}
                    </p>
                  </div>
                  <form action={hapusKategori}>
                    <input type="hidden" name="id_kategori" value={item.id_kategori} />
                    <SubmitButton
                      className="grid size-7 cursor-pointer place-items-center rounded-lg text-muted/70 transition hover:bg-red-50 hover:text-red-600"
                      pendingLabel=""
                      confirmMessage={`Hapus kategori ${item.nama_kategori}?`}
                    >
                      <IconTrash className="size-3.5" />
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-4">
              <KategoriForm />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
