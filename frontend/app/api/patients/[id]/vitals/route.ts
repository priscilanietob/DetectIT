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
      .execute("ObtenerSignosVitalesPorPaciente")
    return NextResponse.json(result.recordset[0] ?? null)
  } catch {
    return NextResponse.json({ error: "Error al obtener signos vitales" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const body = await request.json()
    const pool = await getPool()
    const result = await pool
      .request()
      .input("IdPaciente",         sql.Int,          parseInt(id))
      .input("PresionArterial",    sql.NVarChar(20), body.presionArterial ?? null)
      .input("FrecuenciaCardiaca", sql.NVarChar(20), body.frecuenciaCardiaca ?? null)
      .input("Temperatura",        sql.NVarChar(20), body.temperatura ?? null)
      .input("Peso",               sql.NVarChar(20), body.peso ?? null)
      .input("Talla",              sql.NVarChar(20), body.talla ?? null)
      .input("IMC",                sql.NVarChar(10), body.imc ?? null)
      .execute("InsertarOActualizarSignosVitales")
    return NextResponse.json(result.recordset[0])
  } catch {
    return NextResponse.json({ error: "Error al actualizar signos vitales" }, { status: 500 })
  }
}
