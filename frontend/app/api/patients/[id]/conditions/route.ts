import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const rows   = getDb().prepare("SELECT * FROM Condiciones WHERE IdPaciente = ? ORDER BY IdCondicion").all(parseInt(id))
    return NextResponse.json(rows)
  } catch (err) {
    console.error("[GET /api/patients/[id]/conditions]", err)
    return NextResponse.json({ error: "Error al obtener condiciones" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id }     = await params
    const { nombre } = await request.json()
    const result     = getDb().prepare(
      "INSERT INTO Condiciones (IdPaciente, Nombre) VALUES (?, ?)"
    ).run(parseInt(id), nombre)
    return NextResponse.json({ idCondicion: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/patients/[id]/conditions]", err)
    return NextResponse.json({ error: "Error al insertar condición" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idCondicion } = await request.json()
    getDb().prepare("DELETE FROM Condiciones WHERE IdCondicion = ?").run(idCondicion)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/patients/[id]/conditions]", err)
    return NextResponse.json({ error: "Error al eliminar condición" }, { status: 500 })
  }
}
