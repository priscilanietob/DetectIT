"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
User, Mail, Phone, MapPin, Award, BookOpen,
Calendar, Stethoscope, Edit2, Camera, Star,
Clock, FileText, TrendingUp, ChevronRight,
Scan, ArrowLeft
} from "lucide-react"

// Datos de ejemplo — reemplazar con datos reales de tu auth/db
const DOCTOR_DATA = {
name: "Dra. Claudia Ramírez",
specialty: "Radiología Diagnóstica",
license: "MX-RAD-2018-04821",
email: "claudia.ramirez@detectit.mx",
phone: "+52 664 210 3847",
location: "Tijuana, Baja California",
hospital: "Hospital Ángeles Tijuana",
experience: "8 años",
bio: "Especialista en radiodiagnóstico con enfoque en detección temprana de enfermedades pulmonares y musculoesqueléticas. Formada en el IMSS con subespecialidad en imagen de tórax.",
education: [
    { degree: "Especialidad en Radiología", school: "IMSS CDMX", year: "2018" },
    { degree: "Médico Cirujano", school: "UABC Tijuana", year: "2014" },
],
certifications: ["FMRI", "ACR Member", "RSNA 2023"],
stats: {
    patientsTotal: 1248,
    studiesThisMonth: 87,
    avgDiagnosticTime: "14 min",
    rating: 4.9,
},
recentActivity: [
    { patient: "Carlos M., 54", study: "Rx Tórax PA", time: "Hace 20 min", status: "Completado" },
    { patient: "Laura G., 38", study: "Rx Columna L-S", time: "Hace 1h", status: "En revisión" },
    { patient: "Jorge P., 61", study: "Rx Mano Izq.", time: "Hace 2h", status: "Completado" },
    { patient: "Ana S., 29", study: "Rx Tórax PA", time: "Ayer", status: "Completado" },
]
}

interface DoctorProfileProps {
onBack?: () => void
}

export function DoctorProfile({ onBack }: DoctorProfileProps) {
const [activeTab, setActiveTab] = useState<"overview" | "activity" | "education">("overview")
const d = DOCTOR_DATA

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
            <p className="text-xs text-muted-foreground">Perfil Médico</p>
        </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
        <Edit2 className="w-4 h-4" />
        Editar perfil
        </Button>
    </header>

    <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Hero Card */}
        <Card className="overflow-hidden border-border bg-card">
          {/* Cover banner */}
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/30 relative">
            <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
        </div>

        <div className="px-6 pb-6">
            {/* Avatar */}
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
                <h2 className="text-2xl font-bold text-foreground">{d.name}</h2>
                <p className="text-primary font-medium">{d.specialty}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cédula: {d.license}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                {d.certifications.map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
                </div>
            </div>

              {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                <StatChip icon={<User className="w-4 h-4" />} label="Pacientes" value={d.stats.patientsTotal.toLocaleString()} />
                <StatChip icon={<FileText className="w-4 h-4" />} label="Este mes" value={d.stats.studiesThisMonth} />
                <StatChip icon={<Clock className="w-4 h-4" />} label="Tiempo prom." value={d.stats.avgDiagnosticTime} />
                <StatChip icon={<Star className="w-4 h-4" />} label="Calificación" value={d.stats.rating} accent />
            </div>
            </div>
        </div>
        </Card>

        {/* Tabs */}
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

        {/* Tab Content */}
        {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Información de contacto
            </h3>
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={d.email} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={d.phone} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Ubicación" value={d.location} />
            <InfoRow icon={<Award className="w-4 h-4" />} label="Hospital" value={d.hospital} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Experiencia" value={d.experience} />
            </Card>

            <Card className="p-5 border-border bg-card space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Acerca del médico
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.bio}</p>
            <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Estudios este mes</span>
                <span>{d.stats.studiesThisMonth} / 100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${d.stats.studiesThisMonth}%` }}
                />
                </div>
            </div>
            </Card>
        </div>
        )}

        {activeTab === "activity" && (
        <Card className="border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Actividad reciente
            </h3>
            <Badge variant="secondary">{d.recentActivity.length} estudios</Badge>
            </div>
            <div className="divide-y divide-border">
            {d.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                <div>
                    <p className="text-sm font-medium text-foreground">{item.patient}</p>
                    <p className="text-xs text-muted-foreground">{item.study}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                    <div>
                    <Badge
                        variant={item.status === "Completado" ? "default" : "secondary"}
                        className="text-xs"
                    >
                        {item.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                </div>
            ))}
            </div>
        </Card>
        )}

        {activeTab === "education" && (
        <div className="space-y-4">
            {d.education.map((e, i) => (
            <Card key={i} className="p-5 border-border bg-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                <p className="font-semibold text-foreground">{e.degree}</p>
                <p className="text-sm text-muted-foreground">{e.school}</p>
                <Badge variant="outline" className="mt-2 text-xs">{e.year}</Badge>
                </div>
            </Card>
            ))}
        </div>
        )}
    </div>
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
        <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
    </div>
)
}
