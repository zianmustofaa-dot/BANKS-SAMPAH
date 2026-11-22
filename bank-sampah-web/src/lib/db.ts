import { Pool, types, type PoolClient, type QueryResultRow } from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Kolom DATE dikembalikan sebagai string "YYYY-MM-DD" agar tidak bergeser
// timezone saat diformat di server (UTC) maupun di browser (WIB).
types.setTypeParser(1082, (value: string) => value);

const globalForDb = globalThis as unknown as { __bankSampahPool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.__bankSampahPool) {
    const connectionString =
      process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL belum dikonfigurasi. Jalankan `vercel env pull` terlebih dahulu.",
      );
    }

    const pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: connectionString.includes("sslmode=disable")
        ? undefined
        : { rejectUnauthorized: false },
    });

    // Menutup koneksi idle sebelum instance Vercel di-suspend.
    attachDatabasePool(pool);
    globalForDb.__bankSampahPool = pool;
  }

  return globalForDb.__bankSampahPool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, values);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
