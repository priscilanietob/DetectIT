import { NextResponse } from "next/server"
import { MOCK_DOCTORS } from "@/lib/mock-data"

const DB_CONFIGURED = !!(process.env.DB_SERVER && process.env.DB_DATABASE && process.env.DB_USER && process.env.DB_PASSWORD)

export async function GET() {
  if (!DB_CONFIGURED) {
    return NextResponse.json(MOCK_DOCTORS)
  }
  try {
    const { getPool } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool.request().execute("ObtenerDoctores")
    return NextResponse.json(result.recordset)
  } catch {
    return NextResponse.json({ error: "Error al obtener doctores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const body = await request.json()
    const pool = await getPool()
    const result = await pool
      .request()
      .input("Nombre",       sql.NVarChar(100), body.nombre)
      .input("Especialidad", sql.NVarChar(100), body.especialidad)
      .input("Cedula",       sql.NVarChar(50),  body.cedula)
      .input("Email",        sql.NVarChar(100), body.email)
      .input("Telefono",     sql.NVarChar(20),  body.telefono ?? null)
      .input("Ubicacion",    sql.NVarChar(200), body.ubicacion ?? null)
      .input("Hospital",     sql.NVarChar(200), body.hospital ?? null)
      .input("Experiencia",  sql.NVarChar(50),  body.experiencia ?? null)
      .input("Bio",          sql.NVarChar(sql.MAX), body.bio ?? null)
      .execute("InsertarDoctor")
    return NextResponse.json({ idDoctor: result.recordset[0].IdDoctor }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar doctor" }, { status: 500 })
  }
}
