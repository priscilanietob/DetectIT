"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  User, Mail, Phone, MapPin, Calendar, Heart,
  FileText, Activity, ChevronRight, ArrowLeft,
  Scan, Edit2, Camera, AlertCircle, Pill,
  TrendingUp, Loader2, Save, X,
} from "lucide-react"

const PATIENT_ID = 1

interface VitalSigns {
  PresionArterial: string
  FrecuenciaCardiaca: string
  Temperatura: string
  Peso: string
  Talla: string
  IMC: string
}

interface Medication {
  IdMedicamento: number
  Nombre: string
  Frecuencia: string
  Desde: string
}

interface Study {
  IdEstudio: number
  Tipo: string
  Fecha: string
  Doctor: string
  Resultado: string
  Estado: string
}

interface PatientData {
  IdPaciente: number
  IdDoctor: number | null
  Nombre: string
  Edad: number
  Sexo: string
  FechaNacimiento: string
  TipoSangre: string
  Email: string
  Telefono: string
  Ubicacion: string
  Seguro: string
  ContactoEmergencia: string
  NombreDoctor: string
  allergies:   { IdAlergia: number; Nombre: string }[]
  medications: Medication[]
  conditions:  { IdCondicion: number; Nombre: string }[]
  vitals:      VitalSigns | null
  studies:     Study[]
}

interface PatientProfileProps {
  onBack?: () => void
  onViewExpedient?: () => void
}

export function PatientProfile({ onBack, onViewExpedient }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "clinico" | "estudios">("overview")
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<PatientData>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/patients/${PATIENT_ID}`).then(r => r.json()),
      fetch(`/api/patients/${PATIENT_ID}/studies`).then(r => r.json()),
    ])
      .then(([patientData, studiesData]) => {
        if (patientData.error) throw new Error(patientData.error)
        setPatient(patientData)
        setStudies(studiesData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openEdit() {
    if (patient) setForm({ ...patient })
    setSaveError(null)
    setEditOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/patients/${PATIENT_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:             form.Nombre,
          edad:               form.Edad,
          sexo:               form.Sexo,
          fechaNacimiento:    form.FechaNacimiento,
          tipoSangre:         form.TipoSangre,
          email:              form.Email,
          telefono:           form.Telefono,
          ubicacion:          form.Ubicacion,
          seguro:             form.Seguro,
          contactoEmergencia: form.ContactoEmergencia,
          idDoctor:           form.IdDoctor,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo guardar el paciente")
      }

      setPatient(prev => prev ? { ...prev, ...form, ...data } as PatientData : prev)
      setEditOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar el paciente")
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof PatientData) => ({
    value: (form[key] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  const v = patient?.vitals

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
            <p className="text-xs text-muted-foreground">Perfil del Paciente</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onViewExpedient && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onViewExpedient}>
              <FileText className="w-4 h-4" />
              Ver expediente
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={openEdit} disabled={!patient}>
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </header>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Editar datos del paciente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nombre completo</Label>
                <Input {...field("Nombre")} placeholder="Nombre Apellido" />
              </div>
              <div className="space-y-1">
                <Label>Edad</Label>
                <Input
                  type="number"
                  value={(form.Edad as number) ?? ""}
                  onChange={e => setForm(prev => ({ ...prev, Edad: parseInt(e.target.value) || 0 }))}
                  placeholder="Años"
                />
              </div>
              <div className="space-y-1">
                <Label>Sexo</Label>
                <Select
                  value={form.Sexo ?? ""}
                  onValueChange={val => setForm(prev => ({ ...prev, Sexo: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fecha de nacimiento</Label>
                <Input {...field("FechaNacimiento")} placeholder="AAAA-MM-DD" />
              </div>
              <div className="space-y-1">
                <Label>Tipo de sangre</Label>
                <Select
                  value={form.TipoSangre ?? ""}
                  onValueChange={val => setForm(prev => ({ ...prev, TipoSangre: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input {...field("Email")} type="email" placeholder="paciente@email.com" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input {...field("Telefono")} placeholder="+52 664 XXX XXXX" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Ubicación</Label>
                <Input {...field("Ubicacion")} placeholder="Ciudad, Estado" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Seguro médico</Label>
                <Input {...field("Seguro")} placeholder="IMSS — Afiliado #XXX" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Contacto de emergencia</Label>
                <Input {...field("ContactoEmergencia")} placeholder="Nombre · +52 664 XXX XXXX" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {saveError && (
              <p className="mr-auto text-sm text-destructive">{saveError}</p>
            )}
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

      {!loading && !error && patient && (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <Card className="overflow-hidden border-border bg-card">
            <div className="h-24 bg-gradient-to-r from-blue-600/40 via-blue-500/20 to-transparent relative">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            </div>
            <div className="px-6 pb-6">
              <div className="relative -mt-10 mb-4 w-fit">
                <div className="w-20 h-20 rounded-2xl border-4 border-card bg-secondary flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{patient.Nombre}</h2>
                  <p className="text-muted-foreground text-sm">
                    {patient.Edad} años · {patient.Sexo} · {patient.FechaNacimiento}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {patient.TipoSangre && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">
                        <Heart className="w-3 h-3 mr-1" /> {patient.TipoSangre}
                      </Badge>
                    )}
                    {patient.conditions.map(c => (
                      <Badge key={c.IdCondicion} variant="secondary" className="text-xs">{c.Nombre}</Badge>
                    ))}
                  </div>
                </div>

                {v && (
                  <div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">
                    {[
                      { label: "Presión",     value: v.PresionArterial },
                      { label: "Frec. card.", value: v.FrecuenciaCardiaca },
                      { label: "Temperatura", value: v.Temperatura },
                      { label: "Peso",        value: v.Peso },
                      { label: "Talla",       value: v.Talla },
                      { label: "IMC",         value: v.IMC },
                    ].map(sv => (
                      <div key={sv.label} className="bg-secondary/30 rounded-lg p-2 border border-border">
                        <p className="text-[10px] text-muted-foreground">{sv.label}</p>
                        <p className="text-sm font-semibold text-foreground">{sv.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg w-fit">
            {(["overview", "clinico", "estudios"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {{ overview: "General", clinico: "Clínico", estudios: "Estudios" }[tab]}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Información personal
                </h3>
                <InfoRow icon={<Mail className="w-4 h-4" />}        label="Email"           value={patient.Email} />
                <InfoRow icon={<Phone className="w-4 h-4" />}       label="Teléfono"        value={patient.Telefono} />
                <InfoRow icon={<MapPin className="w-4 h-4" />}      label="Ubicación"       value={patient.Ubicacion} />
                <InfoRow icon={<FileText className="w-4 h-4" />}    label="Seguro"          value={patient.Seguro} />
                <InfoRow icon={<AlertCircle className="w-4 h-4" />} label="Emergencia"      value={patient.ContactoEmergencia} />
                <InfoRow icon={<Calendar className="w-4 h-4" />}    label="Médico tratante" value={patient.NombreDoctor} />
              </Card>

              <Card className="p-5 border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Alergias
                </h3>
                {patient.allergies.length === 0
                  ? <p className="text-sm text-muted-foreground">Sin alergias registradas.</p>
                  : (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map(a => (
                        <Badge key={a.IdAlergia} className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
                          ⚠ {a.Nombre}
                        </Badge>
                      ))}
                    </div>
                  )}
                <div className="pt-2 border-t border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-primary" /> Medicamentos actuales
                  </h3>
                  {patient.medications.length === 0
                    ? <p className="text-sm text-muted-foreground">Sin medicamentos registrados.</p>
                    : (
                      <div className="space-y-2">
                        {patient.medications.map(m => (
                          <div key={m.IdMedicamento} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{m.Nombre}</p>
                              <p className="text-xs text-muted-foreground">{m.Frecuencia}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">Desde {m.Desde}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "clinico" && v && (
            <Card className="p-5 border-border bg-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" /> Signos vitales detallados
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Presión arterial",    value: v.PresionArterial,    icon: <Heart className="w-5 h-5" />,      color: "text-red-400" },
                  { label: "Frecuencia cardíaca", value: v.FrecuenciaCardiaca, icon: <Activity className="w-5 h-5" />,   color: "text-green-400" },
                  { label: "Temperatura",         value: v.Temperatura,        icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-400" },
                  { label: "Peso",                value: v.Peso,               icon: <User className="w-5 h-5" />,       color: "text-purple-400" },
                  { label: "Talla",               value: v.Talla,              icon: <User className="w-5 h-5" />,       color: "text-yellow-400" },
                  { label: "IMC",                 value: v.IMC,                icon: <TrendingUp className="w-5 h-5" />, color: "text-primary" },
                ].map(sv => (
                  <div key={sv.label} className="bg-secondary/30 border border-border rounded-xl p-4">
                    <div className={`mb-2 ${sv.color}`}>{sv.icon}</div>
                    <p className="text-xs text-muted-foreground">{sv.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{sv.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "estudios" && (
            <Card className="border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Historial de estudios
                </h3>
                <Badge variant="secondary">{studies.length} estudios</Badge>
              </div>
              {studies.length === 0
                ? <p className="text-sm text-muted-foreground p-4">Sin estudios registrados.</p>
                : (
                  <div className="divide-y divide-border">
                    {studies.map(s => (
                      <div key={s.IdEstudio} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Scan className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.Tipo}</p>
                            <p className="text-xs text-muted-foreground">{s.Doctor} · {s.Fecha}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{s.Resultado}</p>
                            <Badge variant="default" className="text-xs mt-1">{s.Estado}</Badge>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          )}
        </div>
      )}
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
