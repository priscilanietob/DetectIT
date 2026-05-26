import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

export async function GET() {
  try {
    const db = getDb()
    const doctors = db.prepare("SELECT * FROM Doctores ORDER BY IdDoctor").all()
    return NextResponse.json(doctors)
  } catch (err) {
    console.error("[GET /api/doctors]", err)
    return NextResponse.json({ error: "Error al obtener doctores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db   = getDb()
    const body = await request.json()
    const result = db.prepare(`
      INSERT INTO Doctores (Nombre, Especialidad, Cedula, Email, Telefono, Ubicacion, Hospital, Experiencia, Bio)
      VALUES (@nombre, @especialidad, @cedula, @email, @telefono, @ubicacion, @hospital, @experiencia, @bio)
    `).run({
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
    return NextResponse.json({ idDoctor: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/doctors]", err)
    return NextResponse.json({ error: "Error al insertar doctor" }, { status: 500 })
  }
}
