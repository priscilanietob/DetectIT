import { NextResponse } from "next/server"
import { getDb } from "@/lib/sqlite"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const row    = getDb().prepare("SELECT * FROM SignosVitales WHERE IdPaciente = ?").get(parseInt(id))
    return NextResponse.json(row ?? null)
  } catch (err) {
    console.error("[GET /api/patients/[id]/vitals]", err)
    return NextResponse.json({ error: "Error al obtener signos vitales" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const pid    = parseInt(id)
    const db     = getDb()
    const body   = await request.json()

    // INSERT si no existe, UPDATE si ya existe (UPSERT)
    db.prepare(`
      INSERT INTO SignosVitales (IdPaciente, PresionArterial, FrecuenciaCardiaca, Temperatura, Peso, Talla, IMC)
      VALUES (@pid, @presionArterial, @frecuenciaCardiaca, @temperatura, @peso, @talla, @imc)
      ON CONFLICT(IdPaciente) DO UPDATE SET
        PresionArterial    = excluded.PresionArterial,
        FrecuenciaCardiaca = excluded.FrecuenciaCardiaca,
        Temperatura        = excluded.Temperatura,
        Peso               = excluded.Peso,
        Talla              = excluded.Talla,
        IMC                = excluded.IMC
    `).run({
      pid,
      presionArterial:    body.presionArterial    ?? null,
      frecuenciaCardiaca: body.frecuenciaCardiaca ?? null,
      temperatura:        body.temperatura        ?? null,
      peso:               body.peso               ?? null,
      talla:              body.talla              ?? null,
      imc:                body.imc                ?? null,
    })

    const updated = db.prepare("SELECT * FROM SignosVitales WHERE IdPaciente = ?").get(pid)
    return NextResponse.json(updated)
  } catch (err) {
    console.error("[PUT /api/patients/[id]/vitals]", err)
    return NextResponse.json({ error: "Error al actualizar signos vitales" }, { status: 500 })
  }
}
