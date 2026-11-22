import Link from "next/link";
import { getJenisSampah, getNasabahList, getPetugas } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { SetoranForm } from "@/components/setoran-form";
import { IconArrowLeft } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SetoranBaruPage({
  searchParams,
}: {
  searchParams: Promise<{ nasabah?: string }>;
}) {
  const { nasabah } = await searchParams;
  const [daftarNasabah, daftarPetugas, daftarJenis] = await Promise.all([
    getNasabahList(),
    getPetugas(),
    getJenisSampah(),
  ]);

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
        eyebrow="Transaksi baru"
        title="Catat Setoran Sampah"
        description="Pilih nasabah dan petugas, lalu masukkan jenis serta berat sampah. Nilai setoran dihitung otomatis dari harga master."
      />

      <SetoranForm
        nasabah={daftarNasabah}
        petugas={daftarPetugas}
        jenis={daftarJenis}
        defaultNasabahId={nasabah ? Number(nasabah) : undefined}
      />
    </>
  );
}
