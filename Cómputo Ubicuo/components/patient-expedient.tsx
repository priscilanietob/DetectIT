"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Scan, ArrowLeft, FileText, ChevronDown, ChevronUp,
  Download, Printer, Calendar, User, Stethoscope,
  AlertCircle, Pill, Activity, Image as ImageIcon,
  MessageSquare, Plus, Lock, Eye
} from "lucide-react"

const EXPEDIENT_DATA = {
  patient: {
    name: "Carlos Mendoza",
    id: "EXP-2026-00394",
    age: 54,
    gender: "Masculino",
    bloodType: "O+",
    doctor: "Dra. Claudia Ramírez",
    createdAt: "15/06/2019",
    lastUpdate: "09/04/2026",
  },
  entries: [
    {
      id: "e1",
      date: "09/04/2026",
      type: "Estudio radiológico",
      doctor: "Dra. Claudia Ramírez",
      typeColor: "bg-primary/20 text-primary border-primary/30",
      icon: "scan",
      title: "Rx Tórax PA — Seguimiento",
      summary: "Campos pulmonares sin condensaciones. Silueta cardíaca en límites normales. Sin derrame pleural. Hallazgos sin cambios respecto al estudio previo.",
      findings: "No se observan infiltrados ni masas. Costillas simétricas. Tráquea centrada.",
      diagnosis: "Rx de tórax dentro de parámetros normales.",
      recommendations: "Continuar seguimiento anual. Mantener control de presión arterial.",
      hasImage: true,
      aiNote: "IA detectó índice cardiotorácico: 0.48 (normal). Sin opacidades sugestivas de patología aguda.",
    },
    {
      id: "e2",
      date: "14/02/2026",
      type: "Estudio radiológico",
      doctor: "Dra. Claudia Ramírez",
      typeColor: "bg-primary/20 text-primary border-primary/30",
      icon: "scan",
      title: "Rx Columna Lumbosacra",
      summary: "Disminución de espacios intervertebrales en L4-L5 y L5-S1. Osteofitos marginales anteriores. Compatible con espondilosis lumbar.",
      findings: "Pérdida de altura discal L4-L5. Esclerosis subcondral. Lordosis conservada.",
      diagnosis: "Espondilosis lumbar grado leve-moderado.",
      recommendations: "Fisioterapia lumbar. Control con ortopedia. Evitar cargas pesadas.",
      hasImage: true,
      aiNote: "IA identificó reducción del espacio discal L4-L5 con probabilidad 87%.",
    },
    {
      id: "e3",
      date: "10/01/2026",
      type: "Consulta",
      doctor: "Dra. Claudia Ramírez",
      typeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: "stethoscope",
      title: "Consulta de control — Diabetes e HTA",
      summary: "Paciente refiere adherencia al tratamiento. TA: 138/88, glucosa en ayuno 118 mg/dL. Buen control metabólico general.",
      findings: "Exploración física sin alteraciones. Pulsos periféricos conservados.",
      diagnosis: "DM2 en control. HTA moderada.",
      recommendations: "Continuar Metformina y Losartán. Dieta baja en sodio y azúcares. Actividad física 30 min/día.",
      hasImage: false,
      aiNote: null,
    },
    {
      id: "e4",
      date: "05/11/2025",
      type: "Estudio radiológico",
      doctor: "Dr. Martín Torres",
      typeColor: "bg-primary/20 text-primary border-primary/30",
      icon: "scan",
      title: "Rx Abdomen Simple",
      summary: "Distribución gaseosa normal. Sin niveles hidroaéreos. Sin calcificaciones patológicas visibles.",
      findings: "Patrón intestinal normal. Sin datos de obstrucción.",
      diagnosis: "Rx de abdomen sin hallazgos patológicos.",
      recommendations: "Sin indicación de estudios complementarios.",
      hasImage: true,
      aiNote: "IA: Sin hallazgos anormales detectados con 94% de confianza.",
    },
  ]
}

interface ExpedientProps {
  onBack?: () => void
}

export function PatientExpedient({ onBack }: ExpedientProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(["e1"])
  const d = EXPEDIENT_DATA

  const toggleEntry = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">DetectIT</h1>
            <p className="text-xs text-muted-foreground">Expediente Clínico</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva nota
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Patient banner */}
        <Card className="p-4 border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground">{d.patient.name}</h2>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs hover:bg-red-500/20">
                    {d.patient.bloodType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {d.patient.age} años · {d.patient.gender} · Médico: {d.patient.doctor}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{d.patient.id}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Creado</p>
                <p className="font-medium text-foreground">{d.patient.createdAt}</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Última actualización</p>
                <p className="font-medium text-foreground">{d.patient.lastUpdate}</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="font-medium text-foreground">{d.entries.length}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          <span>Tipo de nota:</span>
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">Estudio radiológico</Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">Consulta</Badge>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Urgencia</Badge>
        </div>

        {/* Timeline */}
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />

          {d.entries.map((entry, idx) => {
            const isExpanded = expandedIds.includes(entry.id)
            return (
              <div key={entry.id} className="sm:pl-16 relative">
                {/* Timeline dot */}
                <div className="hidden sm:flex absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-primary bg-background items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                <Card className={`border-border bg-card overflow-hidden transition-all ${isExpanded ? "shadow-md" : ""}`}>
                  {/* Entry header */}
                  <button
                    className="w-full flex items-start justify-between p-4 text-left hover:bg-secondary/10 transition-colors"
                    onClick={() => toggleEntry(entry.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        {entry.icon === "scan"
                          ? <Scan className="w-4 h-4 text-primary" />
                          : <Stethoscope className="w-4 h-4 text-blue-400" />
                        }
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge className={`text-xs border ${entry.typeColor} hover:${entry.typeColor}`}>
                            {entry.type}
                          </Badge>
                          {entry.aiNote && (
                            <Badge variant="outline" className="text-xs gap-1 text-purple-400 border-purple-400/30">
                              <Activity className="w-3 h-3" /> IA
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-foreground">{entry.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{entry.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />{entry.doctor}
                          </span>
                          {entry.hasImage && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />Imagen adjunta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    }
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">
                      <SectionBlock label="Resumen" icon={<MessageSquare className="w-4 h-4" />}>
                        <p className="text-sm text-muted-foreground">{entry.summary}</p>
                      </SectionBlock>

                      <SectionBlock label="Hallazgos" icon={<Eye className="w-4 h-4" />}>
                        <p className="text-sm text-muted-foreground">{entry.findings}</p>
                      </SectionBlock>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <SectionBlock label="Diagnóstico" icon={<Stethoscope className="w-4 h-4" />}>
                          <p className="text-sm text-foreground font-medium">{entry.diagnosis}</p>
                        </SectionBlock>
                        <SectionBlock label="Recomendaciones" icon={<Pill className="w-4 h-4" />}>
                          <p className="text-sm text-muted-foreground">{entry.recommendations}</p>
                        </SectionBlock>
                      </div>

                      {entry.aiNote && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <p className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 mb-1">
                            <Activity className="w-3.5 h-3.5" /> Nota de IA — DetectIT
                          </p>
                          <p className="text-sm text-muted-foreground">{entry.aiNote}</p>
                        </div>
                      )}

                      {entry.hasImage && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Ver imagen
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 text-xs">
                            <Download className="w-3.5 h-3.5" />
                            Descargar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )
          })}

          {/* End of timeline */}
          <div className="sm:pl-16">
            <div className="border border-dashed border-border rounded-xl p-4 flex items-center gap-3 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <p className="text-sm">Inicio del expediente — {d.patient.createdAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionBlock({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        {icon}{label}
      </p>
      {children}
    </div>
  )
}
