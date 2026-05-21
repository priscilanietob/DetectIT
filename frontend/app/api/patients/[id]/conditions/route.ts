import { NextResponse } from "next/server"
import { getPool, sql } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int, parseInt(id))
      .execute("ObtenerCondicionesPorPaciente")
    return NextResponse.json(result.recordset)
  } catch {
    return NextResponse.json({ error: "Error al obtener condiciones" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const { nombre } = await request.json()
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int,           parseInt(id))
      .input("Nombre",     sql.NVarChar(200), nombre)
      .execute("InsertarCondicion")
    return NextResponse.json({ idCondicion: result.recordset[0].IdCondicion }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar condición" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idCondicion } = await request.json()
    const pool = await getPool()
    await pool
      .request()
      .input("IdCondicion", sql.Int, idCondicion)
      .execute("EliminarCondicion")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar condición" }, { status: 500 })
  }
}
