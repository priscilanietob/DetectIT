"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  User, Mail, Phone, MapPin, Award, BookOpen,
  Calendar, Stethoscope, Edit2, Camera, Star,
  Clock, FileText, TrendingUp, ChevronRight,
  Scan, ArrowLeft, Loader2, Save, X,
} from "lucide-react"

const DOCTOR_ID = 1

interface DoctorData {
  IdDoctor: number
  Nombre: string
  Especialidad: string
  Cedula: string
  Email: string
  Telefono: string
  Ubicacion: string
  Hospital: string
  Experiencia: string
  Bio: string
  education: { IdEducacion: number; Titulo: string; Escuela: string; Anio: string }[]
  certifications: { IdCertificacion: number; Nombre: string }[]
  activity: { IdActividad: number; Paciente: string; Estudio: string; Tiempo: string; Estado: string }[]
}

interface DoctorProfileProps {
  onBack?: () => void
}

export function DoctorProfile({ onBack }: DoctorProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "education">("overview")
  const [doctor, setDoctor] = useState<DoctorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<DoctorData>>({})

  useEffect(() => {
    fetch(`/api/doctors/${DOCTOR_ID}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el perfil")
        return res.json()
      })
      .then(data => { setDoctor(data); setForm(data) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openEdit() {
    if (doctor) setForm({ ...doctor })
    setEditOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/doctors/${DOCTOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:       form.Nombre,
          especialidad: form.Especialidad,
          cedula:       form.Cedula,
          email:        form.Email,
          telefono:     form.Telefono,
          ubicacion:    form.Ubicacion,
          hospital:     form.Hospital,
          experiencia:  form.Experiencia,
          bio:          form.Bio,
        }),
      })
      if (res.ok) {
        setDoctor(prev => prev ? { ...prev, ...form } as DoctorData : prev)
        setEditOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof DoctorData) => ({
    value: (form[key] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

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
            <p className="text-xs text-muted-foreground">Perfil Médico</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={openEdit} disabled={!doctor}>
          <Edit2 className="w-4 h-4" />
          Editar perfil
        </Button>
      </header>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Editar perfil médico
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nombre completo</Label>
                <Input {...field("Nombre")} placeholder="Dra. Nombre Apellido" />
              </div>
              <div className="space-y-1">
                <Label>Especialidad</Label>
                <Input {...field("Especialidad")} placeholder="Radiología Diagnóstica" />
              </div>
              <div className="space-y-1">
                <Label>Cédula profesional</Label>
                <Input {...field("Cedula")} placeholder="MX-RAD-XXXX-XXXXX" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input {...field("Email")} type="email" placeholder="doctor@hospital.mx" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input {...field("Telefono")} placeholder="+52 664 XXX XXXX" />
              </div>
              <div className="space-y-1">
                <Label>Hospital</Label>
                <Input {...field("Hospital")} placeholder="Hospital Ángeles" />
              </div>
              <div className="space-y-1">
                <Label>Ubicación</Label>
                <Input {...field("Ubicacion")} placeholder="Ciudad, Estado" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Experiencia</Label>
                <Input {...field("Experiencia")} placeholder="8 años" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Biografía</Label>
                <Textarea {...field("Bio")} rows={4} placeholder="Descripción profesional..." />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="max-w-5xl mx-auto p-6">
          <Card className="p-6 border-destructive bg-destructive/10 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </Card>
        </div>
      )}

      {!loading && !error && doctor && (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <Card className="overflow-hidden border-border bg-card">
            <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/30 relative">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
            </div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4 w-fit">
                <div className="w-24 h-24 rounded-2xl border-4 border-card bg-secondary flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{doctor.Nombre}</h2>
                  <p className="text-primary font-medium">{doctor.Especialidad}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cédula: {doctor.Cedula}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {doctor.certifications.map(c => (
                      <Badge key={c.IdCertificacion} variant="secondary" className="text-xs">{c.Nombre}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                  <StatChip icon={<User className="w-4 h-4" />}     label="Pacientes"    value="—" />
                  <StatChip icon={<FileText className="w-4 h-4" />} label="Este mes"     value={doctor.activity.length} />
                  <StatChip icon={<Clock className="w-4 h-4" />}    label="Tiempo prom." value="—" />
                  <StatChip icon={<Star className="w-4 h-4" />}     label="Calificación" value="—" accent />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg w-fit">
            {(["overview", "activity", "education"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {{ overview: "General", activity: "Actividad", education: "Formación" }[tab]}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" /> Información de contacto
                </h3>
                <InfoRow icon={<Mail className="w-4 h-4" />}     label="Email"       value={doctor.Email} />
                <InfoRow icon={<Phone className="w-4 h-4" />}    label="Teléfono"    value={doctor.Telefono} />
                <InfoRow icon={<MapPin className="w-4 h-4" />}   label="Ubicación"   value={doctor.Ubicacion} />
                <InfoRow icon={<Award className="w-4 h-4" />}    label="Hospital"    value={doctor.Hospital} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Experiencia" value={doctor.Experiencia} />
              </Card>
              <Card className="p-5 border-border bg-card space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Acerca del médico
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{doctor.Bio}</p>
              </Card>
            </div>
          )}

          {activeTab === "activity" && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Actividad reciente
                </h3>
                <Badge variant="secondary">{doctor.activity.length} estudios</Badge>
              </div>
              {doctor.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">Sin actividad registrada.</p>
              ) : (
                <div className="divide-y divide-border">
                  {doctor.activity.map(item => (
                    <div key={item.IdActividad} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.Paciente}</p>
                        <p className="text-xs text-muted-foreground">{item.Estudio}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <Badge variant={item.Estado === "Completado" ? "default" : "secondary"} className="text-xs">
                            {item.Estado}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{item.Tiempo}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              {doctor.education.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin formación registrada.</p>
              )}
              {doctor.education.map(e => (
                <Card key={e.IdEducacion} className="p-5 border-border bg-card flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{e.Titulo}</p>
                    <p className="text-sm text-muted-foreground">{e.Escuela}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{e.Anio}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 border border-border ${accent ? "bg-primary/10 border-primary/30" : "bg-secondary/30"}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${accent ? "text-primary" : "text-muted-foreground"}`}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}
