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

    const entries = db.prepare(
      "SELECT * FROM Expediente WHERE IdPaciente = ? ORDER BY IdEntrada DESC"
    ).all(pid)

    return NextResponse.json({ patient, entries })
  } catch (err) {
    console.error("[GET /api/patients/[id]/records]", err)
    return NextResponse.json({ error: "Error al obtener expediente" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body   = await request.json()
    const result = getDb().prepare(`
      INSERT INTO Expediente (IdPaciente, Fecha, Tipo, Doctor, Titulo, Resumen, Hallazgos, Diagnostico, Recomendaciones, TieneImagen, NotaIA)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parseInt(id),
      body.fecha           ?? null,
      body.tipo            ?? null,
      body.doctor          ?? null,
      body.titulo          ?? null,
      body.resumen         ?? null,
      body.hallazgos       ?? null,
      body.diagnostico     ?? null,
      body.recomendaciones ?? null,
      body.tieneImagen     ? 1 : 0,
      body.notaIA          ?? null,
    )
    return NextResponse.json({ idEntrada: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients/[id]/records]", err)
    return NextResponse.json({ error: "Error al insertar entrada" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idEntrada } = await request.json()
    getDb().prepare("DELETE FROM Expediente WHERE IdEntrada = ?").run(idEntrada)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/patients/[id]/records]", err)
    return NextResponse.json({ error: "Error al eliminar entrada" }, { status: 500 })
  }
}
