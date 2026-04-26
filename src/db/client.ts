import { Pool, type QueryResult, type QueryResultRow } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __raspiSignagePgPool: Pool | undefined
}

function buildPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  return new Pool({
    connectionString,
    max: 10,
  })
}

export function getPool(): Pool {
  if (!globalThis.__raspiSignagePgPool) {
    globalThis.__raspiSignagePgPool = buildPool()
  }
  return globalThis.__raspiSignagePgPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as unknown[] | undefined)
}

export async function queryRows<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<T | null> {
  const rows = await queryRows<T>(text, params)
  return rows[0] ?? null
}
