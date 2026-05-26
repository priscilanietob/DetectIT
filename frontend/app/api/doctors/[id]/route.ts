import { NextResponse } from "next/server"
import { MOCK_DOCTORS } from "@/lib/mock-data"

const DB_CONFIGURED = !!(
  process.env.DB_SERVER &&
  process.env.DB_DATABASE &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_PASSWORD !== "tu_contraseña_aqui"
)

type RouteContext = { params: Promise<{ id: string }> }

function getMockDoctor(id: number) {
  return MOCK_DOCTORS.find(d => d.IdDoctor === id) ?? MOCK_DOCTORS[0]
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  if (!DB_CONFIGURED) return NextResponse.json(getMockDoctor(parseInt(id)))
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdDoctor", sql.Int, parseInt(id))
      .execute("ObtenerDoctorPorId")

    if (!result.recordset.length) return NextResponse.json(getMockDoctor(parseInt(id)))

    const sets           = result.recordsets as unknown as unknown[][]
    const doctor         = result.recordset[0]
    const education      = sets[1] ?? []
    const certifications = sets[2] ?? []
    const activity       = sets[3] ?? []

    return NextResponse.json({ ...doctor, education, certifications, activity })
  } catch {
    return NextResponse.json(getMockDoctor(parseInt(id)))
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()

  if (!DB_CONFIGURED) {
    const idx = MOCK_DOCTORS.findIndex(d => d.IdDoctor === parseInt(id))
    if (idx !== -1) {
      const d = MOCK_DOCTORS[idx]
      d.Nombre       = body.nombre       ?? d.Nombre
      d.Especialidad = body.especialidad ?? d.Especialidad
      d.Cedula       = body.cedula       ?? d.Cedula
      d.Email        = body.email        ?? d.Email
      d.Telefono     = body.telefono     ?? d.Telefono
      d.Ubicacion    = body.ubicacion    ?? d.Ubicacion
      d.Hospital     = body.hospital     ?? d.Hospital
      d.Experiencia  = body.experiencia  ?? d.Experiencia
      d.Bio          = body.bio          ?? d.Bio
    }
    return NextResponse.json({ success: true })
  }
  try {
    const { getPool, sql } = await import("@/lib/db")
    const pool = await getPool()
    await pool
      .request()
      .input("IdDoctor",     sql.Int,           parseInt(id))
      .input("Nombre",       sql.NVarChar(100), body.nombre)
      .input("Especialidad", sql.NVarChar(100), body.especialidad)
      .input("Cedula",       sql.NVarChar(50),  body.cedula)
      .input("Email",        sql.NVarChar(100), body.email)
      .input("Telefono",     sql.NVarChar(20),  body.telefono ?? null)
      .input("Ubicacion",    sql.NVarChar(200), body.ubicacion ?? null)
      .input("Hospital",     sql.NVarChar(200), body.hospital ?? null)
      .input("Experiencia",  sql.NVarChar(50),  body.experiencia ?? null)
      .input("Bio",          sql.NVarChar(sql.MAX), body.bio ?? null)
      .execute("ActualizarDoctor")
    return NextResponse.json({ success: true })
  } catch {
    // Fallback: update in-memory mock
    const idx = MOCK_DOCTORS.findIndex(d => d.IdDoctor === parseInt(id))
    if (idx !== -1) {
      const d = MOCK_DOCTORS[idx]
      d.Nombre       = body.nombre       ?? d.Nombre
      d.Especialidad = body.especialidad ?? d.Especialidad
      d.Cedula       = body.cedula       ?? d.Cedula
      d.Email        = body.email        ?? d.Email
      d.Telefono     = body.telefono     ?? d.Telefono
      d.Ubicacion    = body.ubicacion    ?? d.Ubicacion
      d.Hospital     = body.hospital     ?? d.Hospital
      d.Experiencia  = body.experiencia  ?? d.Experiencia
      d.Bio          = body.bio          ?? d.Bio
    }
    return NextResponse.json({ success: true })
  }
}
