import { NextResponse } from "next/server"

const DB_CONFIGURED = !!(
  process.env.DB_SERVER &&
  process.env.DB_DATABASE &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_PASSWORD !== "tu_contraseña_aqui"
)

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) {
    const { getMockPatient } = await import("@/lib/mock-store")
    const patient = await getMockPatient(parseInt(id))
    return NextResponse.json(patient.vitals ?? null)
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerSignosVitalesPorPaciente")
    return NextResponse.json(result.recordset[0] ?? null)
  } catch {
    const { getMockPatient } = await import("@/lib/mock-store")
    const patient = await getMockPatient(parseInt(id))
    return NextResponse.json(patient.vitals ?? null)
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
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
      .input("IdPaciente",         sql.Int,          parseInt(id))
      .input("PresionArterial",    sql.NVarChar(20), body.presionArterial ?? null)
      .input("FrecuenciaCardiaca", sql.NVarChar(20), body.frecuenciaCardiaca ?? null)
      .input("Temperatura",        sql.NVarChar(20), body.temperatura ?? null)
      .input("Peso",               sql.NVarChar(20), body.peso ?? null)
      .input("Talla",              sql.NVarChar(20), body.talla ?? null)
      .input("IMC",                sql.NVarChar(10), body.imc ?? null)
      .execute("InsertarOActualizarSignosVitales")
    return NextResponse.json(result.recordset[0])
  } catch {
    return NextResponse.json({ error: "Error al actualizar signos vitales" }, { status: 500 })
  }
}
