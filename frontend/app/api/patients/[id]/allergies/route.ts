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
      .execute("ObtenerAlergiasPorPaciente")
    return NextResponse.json(result.recordset)
  } catch {
    return NextResponse.json({ error: "Error al obtener alergias" }, { status: 500 })
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
      .input("Nombre",     sql.NVarChar(100), nombre)
      .execute("InsertarAlergia")
    return NextResponse.json({ idAlergia: result.recordset[0].IdAlergia }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar alergia" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idAlergia } = await request.json()
    const pool = await getPool()
    await pool
      .request()
      .input("IdAlergia", sql.Int, idAlergia)
      .execute("EliminarAlergia")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar alergia" }, { status: 500 })
  }
}
