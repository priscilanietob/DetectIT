import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

export async function GET() {
  try {
    const db = getDb()
    const patients = db.prepare(`
      SELECT p.*, d.Nombre AS NombreDoctor
      FROM Pacientes p
      LEFT JOIN Doctores d ON p.IdDoctor = d.IdDoctor
      ORDER BY p.IdPaciente
    `).all()
    return NextResponse.json(patients)
  } catch (err) {
    console.error("[GET /api/patients]", err)
    return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db   = getDb()
    const body = await request.json()
    const result = db.prepare(`
      INSERT INTO Pacientes (Nombre, Edad, Sexo, FechaNacimiento, TipoSangre, Email, Telefono, Ubicacion, Seguro, ContactoEmergencia, IdDoctor)
      VALUES (@nombre, @edad, @sexo, @fechaNacimiento, @tipoSangre, @email, @telefono, @ubicacion, @seguro, @contactoEmergencia, @idDoctor)
    `).run({
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
    return NextResponse.json({ idPaciente: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients]", err)
    return NextResponse.json({ error: "Error al insertar paciente" }, { status: 500 })
  }
}
