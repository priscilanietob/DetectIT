import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "FormData inválido" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
  }

  const cnnUrl = process.env.CNN_SERVER_URL ?? "http://localhost:8000"

  try {
    const upstream = new FormData()
    upstream.append("file", file)

    const res = await fetch(`${cnnUrl}/predict`, {
      method: "POST",
      body: upstream,
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json({ error: text || "Error del servidor CNN" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    // Python server not running — return a graceful error; chat still works without CNN
    console.warn("[/api/predict] CNN server unreachable:", err)
    return NextResponse.json(
      { error: "Servidor CNN no disponible. El chat funcionará sin resultados del modelo." },
      { status: 503 },
    )
  }
}
