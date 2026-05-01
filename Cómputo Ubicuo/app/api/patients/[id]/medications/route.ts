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
      .execute("ObtenerMedicamentosPorPaciente")
    return NextResponse.json(result.recordset)
  } catch {
    return NextResponse.json({ error: "Error al obtener medicamentos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const body = await request.json()
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente", sql.Int,           parseInt(id))
      .input("Nombre",     sql.NVarChar(200), body.nombre)
      .input("Frecuencia", sql.NVarChar(100), body.frecuencia ?? null)
      .input("Desde",      sql.NVarChar(20),  body.desde ?? null)
      .execute("InsertarMedicamento")
    return NextResponse.json({ idMedicamento: result.recordset[0].IdMedicamento }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al insertar medicamento" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { idMedicamento } = await request.json()
    const pool = await getPool()
    await pool
      .request()
      .input("IdMedicamento", sql.Int, idMedicamento)
      .execute("EliminarMedicamento")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar medicamento" }, { status: 500 })
  }
}
