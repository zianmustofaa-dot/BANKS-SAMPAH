import Link from "next/link";
import {
  getKinerjaPetugas,
  getRekapKategori,
  getRingkasan,
  getSetoranTerbaru,
  getTopNasabah,
  getTrenBulanan,
} from "@/lib/queries";
import {
  formatKg,
  formatNumber,
  formatRupiah,
  formatTanggalSingkat,
} from "@/lib/format";
import { PageHeader, EmptyState } from "@/components/ui";
import { Meter, StatCard } from "@/components/stat-card";
import { Avatar } from "@/components/stat-card";
import {
  IconArrowRight,
  IconBox,
  IconCoins,
  IconLeafSmall,
  IconRecycle,
  IconScale,
  IconUsers,
  IconWallet,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const COLORS = ["#0f855c", "#43bd87", "#a7d96b", "#e5b83c", "#7dd3fc"];

function bulanSingkat(value: string) {
  const bulan = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const m = Number(value.slice(5, 7));
  return bulan[m - 1] ?? value;
}

export default async function DashboardPage() {
  const [ringkasan, kategori, tren, terbaru, topNasabah, petugas] =
    await Promise.all([
      getRingkasan(),
      getRekapKategori(),
      getTrenBulanan(),
      getSetoranTerbaru(5),
      getTopNasabah(undefined, undefined, 5),
      getKinerjaPetugas(),
    ]);

  if (!ringkasan) {
    return <p className="text-sm text-muted">Data belum tersedia.</p>;
  }

  const totalKategoriKg = kategori.reduce(
    (sum, item) => sum + Number(item.total_kg),
    0,
  );

  let cursor = 0;
  const donut = kategori
    .filter((item) => Number(item.total_kg) > 0)
    .map((item, index) => {
      const pct = totalKategoriKg
        ? (Number(item.total_kg) / totalKategoriKg) * 100
        : 0;
      const start = cursor;
      cursor += pct;
      return {
        ...item,
        pct,
        color: COLORS[index % COLORS.length],
        start,
        end: cursor,
      };
    });

  const gradient = donut.length
    ? `conic-gradient(${donut
        .map((d) => `${d.color} ${d.start}% ${d.end}%`)
        .join(", ")})`
    : "conic-gradient(#e2e8dd 0% 100%)";

  const maxTren = Math.max(...tren.map((t) => Number(t.total_nilai)), 1);
  const maxSetor = Math.max(
    ...topNasabah.map((n) => Number(n.total_setor)),
    1,
  );

  const tanggalHariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow="Ringkasan operasional"
        title="Dashboard Bank Sampah"
        description={`Pantau arus sampah, nilai setoran, dan saldo nasabah. Diperbarui ${tanggalHariIni}.`}
        actions={
          <>
            <Link href="/penarikan" className="btn-secondary hidden sm:inline-flex">
              <IconWallet className="size-4" />
              Tarik saldo
            </Link>
            <Link href="/setoran/baru" className="btn-primary">
              <IconScale className="size-4" />
              Catat setoran
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nasabah terdaftar"
          value={formatNumber(ringkasan.total_nasabah)}
          unit="orang"
          hint={`${ringkasan.total_setoran} transaksi setoran tercatat`}
          icon={<IconUsers className="size-4.5" />}
        />
        <StatCard
          label="Sampah terkumpul"
          value={formatNumber(ringkasan.total_kg)}
          unit="kg"
          hint={`Dari ${ringkasan.total_jenis} jenis sampah aktif`}
          icon={<IconRecycle className="size-4.5" />}
          tone="lime"
        />
        <StatCard
          label="Nilai setoran"
          value={formatRupiah(ringkasan.total_nilai)}
          hint="Total pembayaran kepada nasabah"
          icon={<IconCoins className="size-4.5" />}
          tone="amber"
        />
        <StatCard
          label="Saldo tersimpan"
          value={formatRupiah(ringkasan.total_saldo)}
          hint={`${ringkasan.total_penarikan} penarikan sudah diproses`}
          icon={<IconWallet className="size-4.5" />}
          tone="blue"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="card xl:col-span-2">
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[14.5px] font-bold">Tren nilai setoran</h2>
              <p className="mt-0.5 text-[12px] text-muted">Enam bulan terakhir</p>
            </div>
            <span className="badge bg-brand-50 text-brand-700">
              <IconLeafSmall className="size-3.5" />
              Real-time
            </span>
          </div>

          <div className="px-5 pt-6 pb-4">
            <div className="flex h-[190px] items-end gap-3 sm:gap-5">
              {tren.map((item) => {
                const value = Number(item.total_nilai);
                const height = Math.max(value > 0 ? 8 : 2, (value / maxTren) * 100);
                const isLast = item === tren[tren.length - 1];
                return (
                  <div key={item.bulan} className="group flex h-full flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end justify-center">
                      <div
                        className={`w-full max-w-[46px] rounded-t-lg transition-all ${
                          isLast
                            ? "bg-[linear-gradient(180deg,#1fa171,#0c543d)]"
                            : "bg-brand-100 group-hover:bg-brand-200"
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${formatRupiah(item.total_nilai)} · ${formatKg(item.total_kg)}`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        isLast ? "text-brand-800" : "text-muted"
                      }`}
                    >
                      {bulanSingkat(item.bulan)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4 sm:grid-cols-3">
            <div>
              <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">
                Total 6 bulan
              </p>
              <p className="num mt-1 text-[14px] font-bold text-ink">
                {formatRupiah(
                  tren.reduce((sum, item) => sum + Number(item.total_nilai), 0),
                )}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">
                Berat 6 bulan
              </p>
              <p className="num mt-1 text-[14px] font-bold text-ink">
                {formatKg(tren.reduce((sum, item) => sum + Number(item.total_kg), 0))}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">
                Rata-rata / bulan
              </p>
              <p className="num mt-1 text-[14px] font-bold text-ink">
                {formatRupiah(
                  tren.reduce((sum, item) => sum + Number(item.total_nilai), 0) / 6,
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14.5px] font-bold">Komposisi kategori</h2>
            <p className="mt-0.5 text-[12px] text-muted">Berdasarkan berat sampah</p>
          </div>

          <div className="flex flex-col items-center px-5 py-5">
            <div className="relative mb-5 size-[150px]">
              <div
                className="size-full rounded-full"
                style={{ background: gradient }}
                aria-hidden="true"
              />
              <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#eef2ea]">
                <span className="num text-[17px] leading-none font-extrabold">
                  {formatNumber(totalKategoriKg)}
                </span>
                <span className="mt-1 text-[10px] font-semibold text-muted">kg total</span>
              </div>
            </div>

            <ul className="w-full space-y-2.5">
              {donut.map((item) => (
                <li key={item.id_kategori} className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink/80">
                    {item.nama_kategori}
                  </span>
                  <span className="num text-[11.5px] font-semibold text-muted">
                    {item.pct.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[14.5px] font-bold">Setoran terbaru</h2>
              <p className="mt-0.5 text-[12px] text-muted">Transaksi yang baru dicatat</p>
            </div>
            <Link
              href="/setoran"
              className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-700 hover:text-brand-900"
            >
              Lihat semua
              <IconArrowRight className="size-3.5" />
            </Link>
          </div>

          {terbaru.length === 0 ? (
            <EmptyState
              title="Belum ada setoran"
              description="Setoran nasabah akan tampil di sini setelah dicatat."
              action={
                <Link href="/setoran/baru" className="btn-primary btn-sm">
                  Catat setoran
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Nasabah</th>
                    <th>Tanggal</th>
                    <th className="text-right">Berat</th>
                    <th className="text-right">Nilai</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {terbaru.map((item) => (
                    <tr key={item.id_setoran}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={item.nasabah} size="sm" />
                          <div>
                            <p className="text-[13px] font-semibold">{item.nasabah}</p>
                            <p className="text-[11px] text-muted">
                              {item.jumlah_item} jenis · {item.petugas}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[12.5px] whitespace-nowrap text-muted">
                        {formatTanggalSingkat(item.tgl_setoran)}
                      </td>
                      <td className="num text-right text-[12.5px] font-semibold">
                        {formatNumber(item.total_kg)} kg
                      </td>
                      <td className="num text-right text-[12.5px] font-bold text-brand-800">
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

        <section className="card">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14.5px] font-bold">Nasabah teraktif</h2>
            <p className="mt-0.5 text-[12px] text-muted">Berdasarkan total nilai setoran</p>
          </div>

          <ul className="divide-y divide-line/70 px-5 py-1">
            {topNasabah.map((item, index) => (
              <li key={item.id_nasabah} className="py-3">
                <div className="flex items-center gap-2.5">
                  <span className="num w-4 text-[11px] font-bold text-muted">
                    {index + 1}
                  </span>
                  <Avatar name={item.nama} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold">{item.nama}</p>
                    <p className="num text-[11px] text-muted">
                      {formatKg(item.total_kg)} · saldo {formatRupiah(item.saldo)}
                    </p>
                  </div>
                  <span className="num shrink-0 text-[12px] font-bold text-brand-800">
                    {formatRupiah(item.total_setor)}
                  </span>
                </div>
                <div className="mt-2 pl-[46px]">
                  <Meter value={Number(item.total_setor)} max={maxSetor} />
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-line px-5 py-3.5">
            <div className="flex items-center gap-2 text-[11.5px] text-muted">
              <IconUsers className="size-3.5" />
              {petugas.filter((p) => p.jumlah_setoran > 0).length} petugas aktif melayani
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/setoran/baru"
          className="card group flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-brand-300"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <IconBox className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold">Catat setoran baru</p>
            <p className="text-[11.5px] text-muted">Timbang dan hitung otomatis</p>
          </div>
          <IconArrowRight className="ml-auto size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
        </Link>
        <Link
          href="/penarikan"
          className="card group flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-brand-300"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <IconWallet className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold">Proses penarikan saldo</p>
            <p className="text-[11.5px] text-muted">Validasi saldo otomatis</p>
          </div>
          <IconArrowRight className="ml-auto size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
        </Link>
        <Link
          href="/laporan"
          className="card group flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-brand-300"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <IconScale className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold">Lihat laporan periodik</p>
            <p className="text-[11.5px] text-muted">Rekap per kategori &amp; petugas</p>
          </div>
          <IconArrowRight className="ml-auto size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
        </Link>
      </div>
    </>
  );
}
