import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const db     = getDb()
    const doctor = db.prepare("SELECT * FROM Doctores WHERE IdDoctor = ?").get(parseInt(id))
    if (!doctor) return NextResponse.json({ error: "Doctor no encontrado" }, { status: 404 })

    const education      = db.prepare("SELECT * FROM EducacionDoctor      WHERE IdDoctor = ? ORDER BY IdEducacion").all(parseInt(id))
    const certifications = db.prepare("SELECT * FROM CertificacionesDoctor WHERE IdDoctor = ? ORDER BY IdCertificacion").all(parseInt(id))
    const activity       = db.prepare("SELECT * FROM ActividadDoctor       WHERE IdDoctor = ? ORDER BY IdActividad DESC").all(parseInt(id))

    return NextResponse.json({ ...doctor, education, certifications, activity })
  } catch (err) {
    console.error("[GET /api/doctors/[id]]", err)
    return NextResponse.json({ error: "Error al obtener doctor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const db     = getDb()
    const body   = await request.json()

    db.prepare(`
      UPDATE Doctores
      SET Nombre = @nombre, Especialidad = @especialidad, Cedula = @cedula,
          Email  = @email,  Telefono     = @telefono,     Ubicacion   = @ubicacion,
          Hospital = @hospital, Experiencia = @experiencia, Bio = @bio,
          FechaActualizacion = strftime('%Y-%m-%dT%H:%M:%SZ','now')
      WHERE IdDoctor = @id
    `).run({
      id:           parseInt(id),
      nombre:       body.nombre,
      especialidad: body.especialidad ?? "",
      cedula:       body.cedula       ?? "",
      email:        body.email        ?? "",
      telefono:     body.telefono     ?? null,
      ubicacion:    body.ubicacion    ?? null,
      hospital:     body.hospital     ?? null,
      experiencia:  body.experiencia  ?? null,
      bio:          body.bio          ?? null,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PUT /api/doctors/[id]]", err)
    return NextResponse.json({ error: "Error al actualizar doctor" }, { status: 500 })
  }
}
