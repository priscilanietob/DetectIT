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
    return NextResponse.json(patient.medications)
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerMedicamentosPorPaciente")
    return NextResponse.json(result.recordset)
  } catch {
    const { getMockPatient } = await import("@/lib/mock-store")
    const patient = await getMockPatient(parseInt(id))
    return NextResponse.json(patient.medications)
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
      .input("Nombre",     sql.NVarChar(200), body.nombre)
      .input("Frecuencia", sql.NVarChar(100), body.frecuencia ?? null)
      .input("Desde",      sql.NVarChar(20),  body.desde ?? null)
      .execute("InsertarMedicamento")
    return NextResponse.json({ idMedicamento: result.recordset[0].IdMedicamento }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar medicamento" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const { idMedicamento } = await request.json()
    const pool = await getPool()
    await pool
      .request()
      .input("IdMedicamento", sql.Int, idMedicamento)
      .execute("EliminarMedicamento")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar medicamento" }, { status: 500 })
  }
}
