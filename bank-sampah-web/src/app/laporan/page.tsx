import Link from "next/link";
import {
  getKinerjaPetugas,
  getRekapKategori,
  getRentangData,
  getRingkasan,
  getSetoranRentang,
  getTopNasabah,
} from "@/lib/queries";
import {
  formatKg,
  formatNumber,
  formatRupiah,
  formatTanggal,
  formatTanggalSingkat,
  todayISO,
} from "@/lib/format";
import { Alert, EmptyState, PageHeader, SectionTitle } from "@/components/ui";
import { Avatar, Meter, StatCard } from "@/components/stat-card";
import { RangeFilter } from "@/components/forms";
import {
  IconArrowRight,
  IconBox,
  IconCoins,
  IconDownload,
  IconScale,
  IconUsers,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const rentang = await getRentangData();
  const from = params.from ?? rentang?.awal ?? "2026-09-01";
  const to = params.to ?? todayISO();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to);
  const periodeValid = valid && from <= to;

  if (!periodeValid) {
    return (
      <>
        <PageHeader eyebrow="Analisis" title="Laporan" />
        <Alert tone="error">
          Rentang tanggal tidak valid. Pastikan tanggal “dari” lebih awal daripada
          tanggal “sampai”.
        </Alert>
      </>
    );
  }

  const [ringkasan, kategori, topNasabah, petugas, setoran] = await Promise.all([
    getRingkasan(from, to, true),
    getRekapKategori(from, to),
    getTopNasabah(from, to, 5),
    getKinerjaPetugas(from, to),
    getSetoranRentang(from, to),
  ]);

  const totalKategoriKg = kategori.reduce((sum, item) => sum + Number(item.total_kg), 0);
  const totalKategoriNilai = kategori.reduce(
    (sum, item) => sum + Number(item.total_nilai),
    0,
  );
  const maxKategori = Math.max(...kategori.map((item) => Number(item.total_kg)), 1);
  const maxNasabah = Math.max(...topNasabah.map((item) => Number(item.total_setor)), 1);
  const totalPenarikan = Number(ringkasan?.total_penarikan_nilai ?? 0);
  const petugasAktif = petugas.filter((item) => item.jumlah_setoran > 0);

  const csvHref = `/api/laporan/csv?from=${from}&to=${to}`;

  return (
    <>
      <PageHeader
        eyebrow="Analisis & rekapitulasi"
        title="Laporan Bank Sampah"
        description="Rekap setoran, komposisi kategori, nasabah teraktif, dan kinerja petugas pada periode terpilih."
        actions={
          <a href={csvHref} className="btn-secondary" download>
            <IconDownload className="size-4" />
            Unduh CSV
          </a>
        }
      />

      <section className="card mb-5 flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
            Periode laporan
          </p>
          <p className="mt-1 text-[15px] font-bold">
            {formatTanggal(from)} — {formatTanggal(to)}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Data tersedia: {formatTanggal(rentang?.awal)} s.d. {formatTanggal(rentang?.akhir)}
          </p>
        </div>
        <RangeFilter from={from} to={to} action="/laporan" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Transaksi setoran"
          value={formatNumber(ringkasan?.total_setoran ?? 0)}
          unit="transaksi"
          hint={`${ringkasan?.total_nasabah ?? 0} nasabah aktif pada periode ini`}
          icon={<IconScale className="size-4.5" />}
        />
        <StatCard
          label="Berat sampah"
          value={formatNumber(ringkasan?.total_kg ?? 0)}
          unit="kg"
          hint="Akumulasi seluruh rincian setoran"
          icon={<IconBox className="size-4.5" />}
          tone="lime"
        />
        <StatCard
          label="Nilai setoran"
          value={formatRupiah(ringkasan?.total_nilai ?? 0)}
          hint="Kewajiban bayar kepada nasabah"
          icon={<IconCoins className="size-4.5" />}
          tone="amber"
        />
        <StatCard
          label="Penarikan saldo"
          value={formatRupiah(totalPenarikan)}
          hint={`${ringkasan?.total_penarikan ?? 0} transaksi penarikan`}
          icon={<IconUsers className="size-4.5" />}
          tone="blue"
        />
      </div>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <SectionTitle
            title="Rekap per kategori"
            description="Total berat dan nilai setoran pada periode"
            action={
              <span className="badge bg-brand-50 text-brand-700">
                {formatKg(totalKategoriKg)}
              </span>
            }
          />
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th className="text-right">Berat</th>
                  <th className="w-[34%]">Proporsi</th>
                  <th className="text-right">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {kategori.map((item) => (
                  <tr key={item.id_kategori}>
                    <td className="text-[12.5px] font-semibold">{item.nama_kategori}</td>
                    <td className="num text-right text-[12px]">{formatKg(item.total_kg)}</td>
                    <td>
                      <Meter value={Number(item.total_kg)} max={maxKategori} />
                    </td>
                    <td className="num text-right text-[12px] font-bold text-brand-800">
                      {formatRupiah(item.total_nilai)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8faf5]">
                  <td className="px-4 py-3 text-[12px] font-bold">Total</td>
                  <td className="num px-4 py-3 text-right text-[12px] font-bold">
                    {formatKg(totalKategoriKg)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted">
                    {totalKategoriKg > 0
                      ? `${kategori.filter((k) => Number(k.total_kg) > 0).length} kategori terisi`
                      : "Belum ada data"}
                  </td>
                  <td className="num px-4 py-3 text-right text-[12px] font-extrabold text-brand-900">
                    {formatRupiah(totalKategoriNilai)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="card overflow-hidden">
          <SectionTitle
            title="Nasabah teraktif"
            description="Peringkat berdasarkan nilai setoran"
          />
          {topNasabah.length === 0 ? (
            <EmptyState
              title="Belum ada setoran"
              description="Tidak ada transaksi pada periode yang dipilih."
            />
          ) : (
            <ul className="divide-y divide-line/70 px-5">
              {topNasabah.map((item, index) => (
                <li key={item.id_nasabah} className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`num grid size-6 place-items-center rounded-lg text-[11px] font-bold ${
                        index === 0
                          ? "bg-lime-soft text-brand-950"
                          : "bg-[#f2f5ef] text-muted"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Avatar name={item.nama} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold">{item.nama}</p>
                      <p className="num text-[11px] text-muted">
                        {formatKg(item.total_kg)} · saldo {formatRupiah(item.saldo)}
                      </p>
                    </div>
                    <span className="num text-[12px] font-bold text-brand-800">
                      {formatRupiah(item.total_setor)}
                    </span>
                  </div>
                  <div className="mt-2 pl-[34px]">
                    <Meter
                      value={Number(item.total_setor)}
                      max={maxNasabah}
                      tone={index === 0 ? "lime" : "brand"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[340px_1fr]">
        <section className="card overflow-hidden">
          <SectionTitle
            title="Kinerja petugas"
            description={`${petugasAktif.length} petugas mencatat setoran`}
          />
          <ul className="divide-y divide-line/70 px-5">
            {petugas.map((item) => (
              <li key={item.id_petugas} className="flex items-center gap-2.5 py-3">
                <Avatar name={item.nama_petugas} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold">{item.nama_petugas}</p>
                  <p className="text-[11px] text-muted">{item.jabatan ?? "Petugas"}</p>
                </div>
                <div className="text-right">
                  <p className="num text-[12px] font-bold">{item.jumlah_setoran}×</p>
                  <p className="num text-[10.5px] text-muted">
                    {formatNumber(item.total_kg)} kg
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <SectionTitle
            title="Transaksi setoran periode"
            description={`${setoran.length} transaksi · unduh CSV untuk data lengkap`}
            action={
              <a
                href={csvHref}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-700 hover:text-brand-900"
              >
                <IconDownload className="size-3.5" />
                CSV
              </a>
            }
          />
          {setoran.length === 0 ? (
            <EmptyState
              title="Tidak ada transaksi"
              description="Ubah rentang tanggal untuk melihat transaksi lain."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanggal</th>
                    <th>Nasabah</th>
                    <th className="text-right">Berat</th>
                    <th className="text-right">Nilai</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {setoran.slice(0, 12).map((item) => (
                    <tr key={item.id_setoran}>
                      <td className="num text-[11.5px] font-bold text-muted">
                        #{String(item.id_setoran).padStart(3, "0")}
                      </td>
                      <td className="text-[12px] whitespace-nowrap text-muted">
                        {formatTanggalSingkat(item.tgl_setoran)}
                      </td>
                      <td className="text-[12.5px] font-semibold">{item.nasabah}</td>
                      <td className="num text-right text-[12px]">
                        {formatNumber(item.total_kg)} kg
                      </td>
                      <td className="num text-right text-[12px] font-bold text-brand-800">
                        {formatRupiah(item.total_nilai)}
                      </td>
                      <td className="w-10">
                        <Link
                          href={`/setoran/${item.id_setoran}`}
                          className="grid size-7 place-items-center rounded-lg text-muted hover:bg-brand-50 hover:text-brand-800"
                          aria-label={`Detail setoran ${item.id_setoran}`}
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
      </div>
    </>
  );
}
