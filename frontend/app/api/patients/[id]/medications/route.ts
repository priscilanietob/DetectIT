import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const rows   = getDb().prepare("SELECT * FROM Medicamentos WHERE IdPaciente = ? ORDER BY IdMedicamento").all(parseInt(id))
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[GET /api/patients/[id]/medications]", err)
    return NextResponse.json({ error: "Error al obtener medicamentos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body   = await request.json()
    const result = getDb().prepare(`
      INSERT INTO Medicamentos (IdPaciente, Nombre, Frecuencia, Desde)
      VALUES (?, ?, ?, ?)
    `).run(parseInt(id), body.nombre, body.frecuencia ?? null, body.desde ?? null)
    return NextResponse.json({ idMedicamento: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients/[id]/medications]", err)
    return NextResponse.json({ error: "Error al insertar medicamento" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idMedicamento } = await request.json()
    getDb().prepare("DELETE FROM Medicamentos WHERE IdMedicamento = ?").run(idMedicamento)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/patients/[id]/medications]", err)
    return NextResponse.json({ error: "Error al eliminar medicamento" }, { status: 500 })
  }
}
