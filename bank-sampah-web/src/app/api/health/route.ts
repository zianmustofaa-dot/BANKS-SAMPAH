import { queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await queryOne<{
      nasabah: number;
      setoran: number;
      detail: number;
      penarikan: number;
    }>(
      `SELECT
         (SELECT COUNT(*)::int FROM nasabah) AS nasabah,
         (SELECT COUNT(*)::int FROM setoran) AS setoran,
         (SELECT COUNT(*)::int FROM detail_setoran) AS detail,
         (SELECT COUNT(*)::int FROM penarikan_saldo) AS penarikan`,
    );

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      tabel: result,
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
