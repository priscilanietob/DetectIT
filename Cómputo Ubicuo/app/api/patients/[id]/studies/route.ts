import { NextResponse } from "next/server"

const DB_CONFIGURED = !!(process.env.DB_SERVER && process.env.DB_DATABASE && process.env.DB_USER && process.env.DB_PASSWORD)
type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) {
    const { getMockPatient } = await import("@/lib/mock-store")
    const patient = await getMockPatient(parseInt(id))
    return NextResponse.json(patient.studies)
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerEstudiosPorPaciente")
    return NextResponse.json(result.recordset)
  } catch {
    return NextResponse.json({ error: "Error al obtener estudios" }, { status: 500 })
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
      .input("IdPaciente", sql.Int,           parseInt(id))
      .input("Tipo",       sql.NVarChar(100), body.tipo)
      .input("Fecha",      sql.NVarChar(20),  body.fecha)
      .input("Doctor",     sql.NVarChar(100), body.doctor)
      .input("Resultado",  sql.NVarChar(200), body.resultado ?? null)
      .input("Estado",     sql.NVarChar(50),  body.estado ?? "En revisión")
      .execute("InsertarEstudio")
    return NextResponse.json({ idEstudio: result.recordset[0].IdEstudio }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar estudio" }, { status: 500 })
  }
}
