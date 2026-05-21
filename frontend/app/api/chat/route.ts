import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

export const dynamic = "force-dynamic"

const SYSTEM_PROMPT = `Eres un asistente médico especializado en radiología y análisis de imágenes diagnósticas para la plataforma DetectIT. Tu función es apoyar a médicos y profesionales de salud en la interpretación de radiografías de tórax.

Sobre el modelo CNN de DetectIT:
- Arquitectura: DenseNet-121 adaptado para radiografías de tórax
- Entrenado con ~18,344 imágenes de tres clases: nódulo (nodule), masa (mass), normal
- Precisión en dataset de prueba: ~72%
- Usa Grad-CAM para identificar las regiones anatómicas que influyeron en la predicción

Cuando tengas el resultado del CNN:
- Explica en términos clínicos qué es un nódulo vs. una masa pulmonar
- Comenta el nivel de confianza: alto >85%, moderado 60–85%, bajo <60%
- Si la confianza es baja, subraya la necesidad de revisión adicional
- Describe las características radiológicas típicas de la clase detectada
- Sugiere consideraciones diagnósticas diferenciales cuando sea pertinente

Cuando el usuario suba una imagen sin resultado CNN:
- Analiza la imagen con tu conocimiento médico
- Comenta hallazgos relevantes: densidades, opacidades, bordes, distribución

Pautas:
- Siempre indica que los resultados son de apoyo diagnóstico y deben ser verificados por un radiólogo certificado
- Usa lenguaje médico preciso pero accesible
- Si no hay imagen ni resultado, guía al usuario a cargar una radiografía
- Responde en el mismo idioma del usuario (español o inglés)
- Respuestas concisas y estructuradas; usa listas cuando convenga`

const MODEL_VISION = "meta-llama/llama-4-scout-17b-16e-instruct"
const MODEL_TEXT   = "llama-3.3-70b-versatile"

interface CnnResult {
  class_name: string
  confidence: number
  probabilities: Record<string, number>
  cnn_summary: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  message: string
  imageData?: string | null
  cnnResult?: CnnResult | null
  history?: ChatMessage[]
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY no configurada. Agrégala a .env.local" },
      { status: 500 },
    )
  }

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const { message, imageData, cnnResult, history = [] } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
  }

  const groq = new Groq({ apiKey })

  const formattedHistory = history.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }))

  const cnnContext = cnnResult
    ? `\n[Resultado del modelo CNN DetectIT]\n${cnnResult.cnn_summary}\n`
    : ""

  const useVision = !!imageData

  let userContent: string | Groq.Chat.ChatCompletionContentPart[]

  if (useVision && imageData) {
    userContent = [
      { type: "image_url" as const, image_url: { url: imageData } },
      { type: "text" as const, text: cnnContext + message },
    ]
  } else {
    userContent = cnnContext + message
  }

  try {
    const completion = await groq.chat.completions.create({
      model: useVision ? MODEL_VISION : MODEL_TEXT,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...formattedHistory,
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const response = completion.choices[0]?.message?.content ?? "Sin respuesta"
    return NextResponse.json({ response })
  } catch (err) {
    console.error("[/api/chat] Groq error:", err)
    return NextResponse.json(
      { error: "Error al contactar el modelo de IA. Intenta de nuevo." },
      { status: 500 },
    )
  }
}
