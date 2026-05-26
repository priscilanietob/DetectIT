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
    return NextResponse.json(await getMockPatient(parseInt(id)))
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerPacientePorId")

    if (!result.recordset.length) {
      const { getMockPatient } = await import("@/lib/mock-store")
      return NextResponse.json(await getMockPatient(parseInt(id)))
    }

    const sets      = result.recordsets as unknown as unknown[][]
    const patient   = result.recordset[0]
    const allergies   = sets[1] ?? []
    const medications = sets[2] ?? []
    const conditions  = sets[3] ?? []
    const vitals      = (sets[4] as Record<string, unknown>[])?.[0] ?? null

    return NextResponse.json({ ...patient, allergies, medications, conditions, vitals })
  } catch {
    const { getMockPatient } = await import("@/lib/mock-store")
    return NextResponse.json(await getMockPatient(parseInt(id)))
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()

  if (!DB_CONFIGURED) {
    const { updateMockPatient } = await import("@/lib/mock-store")
    const patient = await updateMockPatient(parseInt(id), body)
    if (!patient) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    return NextResponse.json(patient)
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    await pool
      .request()
      .input("IdPaciente",         sql.Int,           parseInt(id))
      .input("Nombre",             sql.NVarChar(100), body.nombre)
      .input("Edad",               sql.Int,           body.edad)
      .input("Sexo",               sql.NVarChar(10),  body.sexo)
      .input("FechaNacimiento",    sql.Date,          body.fechaNacimiento)
      .input("TipoSangre",         sql.NVarChar(5),   body.tipoSangre ?? null)
      .input("Email",              sql.NVarChar(100), body.email ?? null)
      .input("Telefono",           sql.NVarChar(20),  body.telefono ?? null)
      .input("Ubicacion",          sql.NVarChar(200), body.ubicacion ?? null)
      .input("Seguro",             sql.NVarChar(100), body.seguro ?? null)
      .input("ContactoEmergencia", sql.NVarChar(100), body.contactoEmergencia ?? null)
      .input("IdDoctor",           sql.Int,           body.idDoctor ?? null)
      .execute("ActualizarPaciente")
    return NextResponse.json({ success: true })
  } catch {
    const { updateMockPatient } = await import("@/lib/mock-store")
    const patient = await updateMockPatient(parseInt(id), body)
    if (!patient) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    return NextResponse.json(patient)
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("EliminarPaciente")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar paciente" }, { status: 500 })
  }
}
