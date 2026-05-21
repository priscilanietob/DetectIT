"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Scan, ArrowLeft, FileText, ChevronDown, ChevronUp,
  Download, Printer, Calendar, User, Stethoscope,
  Pill, Activity, Image as ImageIcon,
  MessageSquare, Plus, Lock, Eye, Loader2
} from "lucide-react"

const PATIENT_ID = 1

interface Entry {
  IdEntrada: number
  Fecha: string
  Tipo: string
  Doctor: string
  Titulo: string
  Resumen: string | null
  Hallazgos: string | null
  Diagnostico: string | null
  Recomendaciones: string | null
  TieneImagen: boolean
  NotaIA: string | null
}

interface PatientInfo {
  IdPaciente: number
  Nombre: string
  Edad: number
  Sexo: string
  TipoSangre: string
  NombreDoctor: string
  FechaCreacion: string
  FechaActualizacion: string
}

function typeColor(tipo: string): string {
  if (tipo === "Estudio radiológico") return "bg-primary/20 text-primary border-primary/30"
  if (tipo === "Urgencia")            return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-blue-500/20 text-blue-400 border-blue-500/30"
}

interface ExpedientProps {
  onBack?: () => void
}

export function PatientExpedient({ onBack }: ExpedientProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [patient, setPatient]   = useState<PatientInfo | null>(null)
  const [entries, setEntries]   = useState<Entry[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/patients/${PATIENT_ID}/records`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el expediente")
        return res.json()
      })
      .then(data => {
        setPatient(data.patient)
        setEntries(data.entries)
        if (data.entries.length > 0) setExpandedIds([data.entries[0].IdEntrada])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleEntry = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-6 border-destructive bg-destructive/10 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </Card>
        </div>
      )}

      {!loading && !error && patient && (
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
                    <h2 className="font-bold text-foreground">{patient.Nombre}</h2>
                    {patient.TipoSangre && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs hover:bg-red-500/20">
                        {patient.TipoSangre}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.Edad} años · {patient.Sexo} · Médico: {patient.NombreDoctor}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    EXP-{patient.IdPaciente.toString().padStart(4, "0")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Creado</p>
                  <p className="font-medium text-foreground">
                    {new Date(patient.FechaCreacion).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Última actualización</p>
                  <p className="font-medium text-foreground">
                    {new Date(patient.FechaActualizacion).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="font-medium text-foreground">{entries.length}</p>
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
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />

            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground sm:pl-16">Sin entradas en el expediente.</p>
            )}

            {entries.map(entry => {
              const isExpanded = expandedIds.includes(entry.IdEntrada)
              const color = typeColor(entry.Tipo)
              return (
                <div key={entry.IdEntrada} className="sm:pl-16 relative">
                  <div className="hidden sm:flex absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-primary bg-background items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  <Card className={`border-border bg-card overflow-hidden transition-all ${isExpanded ? "shadow-md" : ""}`}>
                    <button
                      className="w-full flex items-start justify-between p-4 text-left hover:bg-secondary/10 transition-colors"
                      onClick={() => toggleEntry(entry.IdEntrada)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                          {entry.Tipo === "Estudio radiológico"
                            ? <Scan className="w-4 h-4 text-primary" />
                            : <Stethoscope className="w-4 h-4 text-blue-400" />
                          }
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge className={`text-xs border ${color} hover:${color}`}>
                              {entry.Tipo}
                            </Badge>
                            {entry.NotaIA && (
                              <Badge variant="outline" className="text-xs gap-1 text-purple-400 border-purple-400/30">
                                <Activity className="w-3 h-3" /> IA
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-foreground">{entry.Titulo}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{entry.Fecha}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />{entry.Doctor}
                            </span>
                            {entry.TieneImagen && (
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

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">
                        {entry.Resumen && (
                          <SectionBlock label="Resumen" icon={<MessageSquare className="w-4 h-4" />}>
                            <p className="text-sm text-muted-foreground">{entry.Resumen}</p>
                          </SectionBlock>
                        )}
                        {entry.Hallazgos && (
                          <SectionBlock label="Hallazgos" icon={<Eye className="w-4 h-4" />}>
                            <p className="text-sm text-muted-foreground">{entry.Hallazgos}</p>
                          </SectionBlock>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                          {entry.Diagnostico && (
                            <SectionBlock label="Diagnóstico" icon={<Stethoscope className="w-4 h-4" />}>
                              <p className="text-sm text-foreground font-medium">{entry.Diagnostico}</p>
                            </SectionBlock>
                          )}
                          {entry.Recomendaciones && (
                            <SectionBlock label="Recomendaciones" icon={<Pill className="w-4 h-4" />}>
                              <p className="text-sm text-muted-foreground">{entry.Recomendaciones}</p>
                            </SectionBlock>
                          )}
                        </div>
                        {entry.NotaIA && (
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <p className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 mb-1">
                              <Activity className="w-3.5 h-3.5" /> Nota de IA — DetectIT
                            </p>
                            <p className="text-sm text-muted-foreground">{entry.NotaIA}</p>
                          </div>
                        )}
                        {entry.TieneImagen && (
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

            <div className="sm:pl-16">
              <div className="border border-dashed border-border rounded-xl p-4 flex items-center gap-3 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <p className="text-sm">
                  Inicio del expediente — {patient ? new Date(patient.FechaCreacion).toLocaleDateString("es-MX") : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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
