"use client"

import { useState, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { XrayViewerWithMagnifier } from "@/components/xray-viewer"
import { ChatSidebar } from "@/components/chat-sidebar"
import { DoctorProfile } from "@/components/doctor-profile"
import { PatientProfile } from "@/components/patient-profile"
import { PatientExpedient } from "@/components/patient-expedient"
import { Button } from "@/components/ui/button"
import {
  Scan,
  LogOut,
  Settings,
  Bell,
  HelpCircle,
  User,
  Users,
  FileText,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react"

type Page = "dashboard" | "doctor" | "patient" | "expedient"

export function Dashboard() {
  const { userEmail, logout } = useAuth()
  const [hasImage, setHasImage] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [diagnosis, setDiagnosis] = useState<string | null>(null)

  const navItems: { id: Page; label: string; icon: ReactNode }[] = [
    { id: "dashboard", label: "Análisis", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "doctor", label: "Mi perfil", icon: <User className="w-4 h-4" /> },
    { id: "patient", label: "Paciente", icon: <Users className="w-4 h-4" /> },
    { id: "expedient", label: "Expediente", icon: <FileText className="w-4 h-4" /> },
  ]

  if (currentPage === "doctor") {
    return <DoctorProfile onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "patient") {
    return (
      <PatientProfile
        onBack={() => setCurrentPage("dashboard")}
        onViewExpedient={() => setCurrentPage("expedient")}
      />
    )
  }

  if (currentPage === "expedient") {
    return <PatientExpedient onBack={() => setCurrentPage("patient")} />
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">DetectIT</h1>
            <p className="text-xs text-muted-foreground">X-Ray Analysis Platform</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Medical Professional</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 py-3 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id)
                setMobileNavOpen(false)
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <div className="border-t border-border pt-2 mt-1">
            <p className="text-xs text-muted-foreground mb-2">{userEmail}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <XrayViewerWithMagnifier
            onImageUpload={() => setHasImage(true)}
            onPredictionResult={(diagnosisText) => setDiagnosis(diagnosisText)}
          />
        </div>

        <div className="w-[380px] border-l border-border p-4 hidden lg:block">
          <ChatSidebar hasImage={hasImage} diagnosis={diagnosis} />
        </div>
      </main>

      <div className="lg:hidden fixed bottom-4 right-4">
        <MobileChatButton hasImage={hasImage} diagnosis={diagnosis} />
      </div>
    </div>
  )
}

function MobileChatButton({
  hasImage,
  diagnosis,
}: {
  hasImage: boolean
  diagnosis: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button size="lg" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setIsOpen(true)}>
        <Scan className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-4 bottom-4 top-20 z-50">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-10 right-0 text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>

              <ChatSidebar hasImage={hasImage} diagnosis={diagnosis} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}