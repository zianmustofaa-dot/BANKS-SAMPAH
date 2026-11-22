import { getRiwayatRentang, getRentangData } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rentang = await getRentangData();
  const from = url.searchParams.get("from") ?? rentang?.awal ?? "2026-01-01";
  const to = url.searchParams.get("to") ?? rentang?.akhir ?? "2026-12-31";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return new Response("Parameter tanggal tidak valid (format YYYY-MM-DD).", {
      status: 400,
    });
  }

  const rows = await getRiwayatRentang(from, to);

  const header = [
    "ID Setoran",
    "Tanggal",
    "Nasabah",
    "Petugas",
    "Kategori",
    "Jenis Sampah",
    "Berat (kg)",
    "Harga per kg",
    "Subtotal",
  ];

  const lines = [
    header.map(cell).join(";"),
    ...rows.map((row) =>
      [
        row.id_setoran,
        row.tgl_setoran,
        row.nasabah,
        row.petugas,
        row.nama_kategori,
        row.nama_jenis,
        Number(row.berat_kg).toFixed(2).replace(".", ","),
        Number(row.harga_satuan).toFixed(2).replace(".", ","),
        Number(row.subtotal).toFixed(2).replace(".", ","),
      ]
        .map(cell)
        .join(";"),
    ),
  ];

  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-setoran-${from}-sd-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
