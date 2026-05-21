"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User, Mail, Phone, MapPin, Calendar, Heart,
  FileText, Activity, ChevronRight, ArrowLeft,
  Scan, Edit2, Camera, AlertCircle, Pill,
  TrendingUp, Clock
} from "lucide-react"

// Datos de ejemplo — reemplazar con datos reales
const PATIENT_DATA = {
  name: "Carlos Mendoza",
  age: 54,
  birthdate: "12/03/1970",
  gender: "Masculino",
  bloodType: "O+",
  email: "carlos.mendoza@email.com",
  phone: "+52 664 588 2910",
  location: "Tijuana, Baja California",
  insurance: "IMSS — Afiliado #482-91-7034",
  emergencyContact: "María Mendoza · +52 664 991 3322",
  doctor: "Dra. Claudia Ramírez",
  conditions: ["Hipertensión arterial", "Diabetes tipo 2"],
  allergies: ["Penicilina", "Aspirina"],
  medications: [
    { name: "Metformina 850mg", frequency: "2 veces al día", since: "2020" },
    { name: "Losartán 50mg", frequency: "1 vez al día", since: "2019" },
  ],
  vitalSigns: {
    bp: "138/88 mmHg",
    hr: "74 bpm",
    temp: "36.4 °C",
    weight: "82 kg",
    height: "1.72 m",
    bmi: "27.7",
  },
  studies: [
    { type: "Rx Tórax PA", date: "09/04/2026", doctor: "Dra. Ramírez", result: "Normal", status: "Completado" },
    { type: "Rx Columna L-S", date: "14/02/2026", doctor: "Dra. Ramírez", result: "Espondilosis leve", status: "Completado" },
    { type: "Rx Abdomen", date: "05/11/2025", doctor: "Dr. Torres", result: "Sin hallazgos", status: "Completado" },
  ]
}

interface PatientProfileProps {
  onBack?: () => void
  onViewExpedient?: () => void
}

export function PatientProfile({ onBack, onViewExpedient }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "clinico" | "estudios">("overview")
  const p = PATIENT_DATA

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
          <Button variant="outline" size="sm" className="gap-2">
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Hero Card */}
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
                <h2 className="text-2xl font-bold text-foreground">{p.name}</h2>
                <p className="text-muted-foreground text-sm">{p.age} años · {p.gender} · {p.birthdate}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20">
                    <Heart className="w-3 h-3 mr-1" /> {p.bloodType}
                  </Badge>
                  {p.conditions.map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>

              {/* Vital signs quick view */}
              <div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">
                {[
                  { label: "Presión", value: p.vitalSigns.bp },
                  { label: "Frec. card.", value: p.vitalSigns.hr },
                  { label: "Temperatura", value: p.vitalSigns.temp },
                  { label: "Peso", value: p.vitalSigns.weight },
                  { label: "Talla", value: p.vitalSigns.height },
                  { label: "IMC", value: p.vitalSigns.bmi },
                ].map(v => (
                  <div key={v.label} className="bg-secondary/30 rounded-lg p-2 border border-border">
                    <p className="text-[10px] text-muted-foreground">{v.label}</p>
                    <p className="text-sm font-semibold text-foreground">{v.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
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
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={p.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={p.phone} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Ubicación" value={p.location} />
              <InfoRow icon={<FileText className="w-4 h-4" />} label="Seguro" value={p.insurance} />
              <InfoRow icon={<AlertCircle className="w-4 h-4" />} label="Emergencia" value={p.emergencyContact} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Médico tratante" value={p.doctor} />
            </Card>

            <Card className="p-5 border-border bg-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Alergias
              </h3>
              <div className="flex flex-wrap gap-2">
                {p.allergies.map(a => (
                  <Badge key={a} className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
                    ⚠ {a}
                  </Badge>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4 text-primary" /> Medicamentos actuales
                </h3>
                <div className="space-y-2">
                  {p.medications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.frequency}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Desde {m.since}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "clinico" && (
          <Card className="p-5 border-border bg-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" /> Signos vitales detallados
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Presión arterial", value: p.vitalSigns.bp, icon: <Heart className="w-5 h-5" />, color: "text-red-400" },
                { label: "Frecuencia cardíaca", value: p.vitalSigns.hr, icon: <Activity className="w-5 h-5" />, color: "text-green-400" },
                { label: "Temperatura", value: p.vitalSigns.temp, icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-400" },
                { label: "Peso", value: p.vitalSigns.weight, icon: <User className="w-5 h-5" />, color: "text-purple-400" },
                { label: "Talla", value: p.vitalSigns.height, icon: <User className="w-5 h-5" />, color: "text-yellow-400" },
                { label: "IMC", value: p.vitalSigns.bmi, icon: <TrendingUp className="w-5 h-5" />, color: "text-primary" },
              ].map(v => (
                <div key={v.label} className="bg-secondary/30 border border-border rounded-xl p-4">
                  <div className={`mb-2 ${v.color}`}>{v.icon}</div>
                  <p className="text-xs text-muted-foreground">{v.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{v.value}</p>
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
              <Badge variant="secondary">{p.studies.length} estudios</Badge>
            </div>
            <div className="divide-y divide-border">
              {p.studies.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scan className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.type}</p>
                      <p className="text-xs text-muted-foreground">{s.doctor} · {s.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{s.result}</p>
                      <Badge variant="default" className="text-xs mt-1">{s.status}</Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
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
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  )
}
