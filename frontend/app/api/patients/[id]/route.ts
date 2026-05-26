import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const pid    = parseInt(id)
    const db     = getDb()

    const patient = db.prepare(`
      SELECT p.*, d.Nombre AS NombreDoctor
      FROM Pacientes p
      LEFT JOIN Doctores d ON p.IdDoctor = d.IdDoctor
      WHERE p.IdPaciente = ?
    `).get(pid)

    if (!patient) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })

    const allergies   = db.prepare("SELECT * FROM Alergias     WHERE IdPaciente = ? ORDER BY IdAlergia").all(pid)
    const medications = db.prepare("SELECT * FROM Medicamentos WHERE IdPaciente = ? ORDER BY IdMedicamento").all(pid)
    const conditions  = db.prepare("SELECT * FROM Condiciones  WHERE IdPaciente = ? ORDER BY IdCondicion").all(pid)
    const vitals      = db.prepare("SELECT * FROM SignosVitales WHERE IdPaciente = ?").get(pid) ?? null

    return NextResponse.json({ ...patient, allergies, medications, conditions, vitals })
  } catch (err) {
    console.error("[GET /api/patients/[id]]", err)
    return NextResponse.json({ error: "Error al obtener paciente" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const db     = getDb()
    const body   = await request.json()

    db.prepare(`
      UPDATE Pacientes
      SET Nombre = @nombre, Edad = @edad, Sexo = @sexo,
          FechaNacimiento    = @fechaNacimiento,
          TipoSangre         = @tipoSangre,
          Email              = @email,
          Telefono           = @telefono,
          Ubicacion          = @ubicacion,
          Seguro             = @seguro,
          ContactoEmergencia = @contactoEmergencia,
          IdDoctor           = @idDoctor,
          FechaActualizacion = strftime('%Y-%m-%dT%H:%M:%SZ','now')
      WHERE IdPaciente = @id
    `).run({
      id:                 parseInt(id),
      nombre:             body.nombre,
      edad:               body.edad,
      sexo:               body.sexo,
      fechaNacimiento:    body.fechaNacimiento,
      tipoSangre:         body.tipoSangre         ?? null,
      email:              body.email              ?? null,
      telefono:           body.telefono           ?? null,
      ubicacion:          body.ubicacion          ?? null,
      seguro:             body.seguro             ?? null,
      contactoEmergencia: body.contactoEmergencia ?? null,
      idDoctor:           body.idDoctor           ?? null,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PUT /api/patients/[id]]", err)
    return NextResponse.json({ error: "Error al actualizar paciente" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const db     = getDb()
    db.prepare("DELETE FROM Pacientes WHERE IdPaciente = ?").run(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/patients/[id]]", err)
    return NextResponse.json({ error: "Error al eliminar paciente" }, { status: 500 })
  }
}
