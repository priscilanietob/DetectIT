import sql from "mssql"

const config: sql.config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.DB_PORT ?? "1433"),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    pool = await new sql.ConnectionPool(config).connect()
  }
  return pool
}

export { sql }
