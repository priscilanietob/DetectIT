import { NextResponse } from "next/server"
import { MOCK_RECORDS } from "@/lib/mock-data"

const DB_CONFIGURED = !!(
  process.env.DB_SERVER &&
  process.env.DB_DATABASE &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_PASSWORD !== "tu_contraseña_aqui"
)

type RouteContext = { params: Promise<{ id: string }> }

async function getMockRecord(id: number) {
  const { getMockPatient } = await import("@/lib/mock-store")
  const patient = await getMockPatient(id)
  const record = MOCK_RECORDS[id]
  if (record) return { ...record, patient }
  return { patient, entries: [] }
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) return NextResponse.json(await getMockRecord(parseInt(id)))
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerExpedientePorPaciente")

    const sets    = result.recordsets as unknown as unknown[][]
    const patient = (sets[0] as Record<string, unknown>[])?.[0] ?? null
    const entries = sets[1] ?? []
    return NextResponse.json({ patient, entries })
  } catch {
    return NextResponse.json(await getMockRecord(parseInt(id)))
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const body = await request.json()
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente",      sql.Int,               parseInt(id))
      .input("Fecha",           sql.NVarChar(20),      body.fecha)
      .input("Tipo",            sql.NVarChar(100),     body.tipo)
      .input("Doctor",          sql.NVarChar(100),     body.doctor)
      .input("Titulo",          sql.NVarChar(200),     body.titulo)
      .input("Resumen",         sql.NVarChar(sql.MAX), body.resumen ?? null)
      .input("Hallazgos",       sql.NVarChar(sql.MAX), body.hallazgos ?? null)
      .input("Diagnostico",     sql.NVarChar(sql.MAX), body.diagnostico ?? null)
      .input("Recomendaciones", sql.NVarChar(sql.MAX), body.recomendaciones ?? null)
      .input("TieneImagen",     sql.Bit,               body.tieneImagen ? 1 : 0)
      .input("NotaIA",          sql.NVarChar(sql.MAX), body.notaIA ?? null)
      .execute("InsertarEntradaExpediente")
    return NextResponse.json({ idEntrada: result.recordset[0].IdEntrada }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar entrada" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const { idEntrada } = await request.json()
    const pool = await getPool()
    await pool
      .request()
      .input("IdEntrada", sql.Int, idEntrada)
      .execute("EliminarEntradaExpediente")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar entrada" }, { status: 500 })
  }
}
