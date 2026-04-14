"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { VerificationScreen } from "@/components/verification-screen"
import { Dashboard } from "@/components/dashboard"

function AppContent() {
  const { isVerified } = useAuth()

  if (!isVerified) {
    return <VerificationScreen />
  }

  return <Dashboard />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
