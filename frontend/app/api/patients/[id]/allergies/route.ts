import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const rows   = getDb().prepare("SELECT * FROM Alergias WHERE IdPaciente = ? ORDER BY IdAlergia").all(parseInt(id))
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[GET /api/patients/[id]/allergies]", err)
    return NextResponse.json({ error: "Error al obtener alergias" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id }   = await params
    const { nombre } = await request.json()
    const result   = getDb().prepare(
      "INSERT INTO Alergias (IdPaciente, Nombre) VALUES (?, ?)"
    ).run(parseInt(id), nombre)
    return NextResponse.json({ idAlergia: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients/[id]/allergies]", err)
    return NextResponse.json({ error: "Error al insertar alergia" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idAlergia } = await request.json()
    getDb().prepare("DELETE FROM Alergias WHERE IdAlergia = ?").run(idAlergia)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/patients/[id]/allergies]", err)
    return NextResponse.json({ error: "Error al eliminar alergia" }, { status: 500 })
  }
}
