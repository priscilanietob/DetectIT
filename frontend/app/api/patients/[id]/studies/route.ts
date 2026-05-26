import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const rows   = getDb().prepare("SELECT * FROM Estudios WHERE IdPaciente = ? ORDER BY IdEstudio DESC").all(parseInt(id))
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[GET /api/patients/[id]/studies]", err)
    return NextResponse.json({ error: "Error al obtener estudios" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body   = await request.json()
    const result = getDb().prepare(`
      INSERT INTO Estudios (IdPaciente, Tipo, Fecha, Doctor, Resultado, Estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      parseInt(id),
      body.tipo,
      body.fecha       ?? null,
      body.doctor      ?? null,
      body.resultado   ?? null,
      body.estado      ?? "En revisión",
    )
    return NextResponse.json({ idEstudio: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients/[id]/studies]", err)
    return NextResponse.json({ error: "Error al insertar estudio" }, { status: 500 })
  }
}
