import { NextResponse } from "next/server"

const DB_CONFIGURED = !!(
  process.env.DB_SERVER &&
  process.env.DB_DATABASE &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_PASSWORD !== "tu_contraseña_aqui"
)

export async function GET() {
  if (!DB_CONFIGURED) {
    const { getMockPatients } = await import("@/lib/mock-store")
    return NextResponse.json(await getMockPatients())
  }
  try {
    const { getPool } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool.request().execute("ObtenerPacientes")
    return NextResponse.json(result.recordset)
  } catch {
    const { getMockPatients } = await import("@/lib/mock-store")
    return NextResponse.json(await getMockPatients())
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
      .execute("InsertarPaciente")
    return NextResponse.json({ idPaciente: result.recordset[0].IdPaciente }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar paciente" }, { status: 500 })
  }
}
