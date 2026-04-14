"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface AuthContextType {
  isVerified: boolean
  userEmail: string
  verifyUser: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const verifyUser = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    if (email && password.length >= 6) {
      setIsVerified(true)
      setUserEmail(email)
      return true
    }
    return false
  }

  const logout = () => {
    setIsVerified(false)
    setUserEmail("")
  }

  return (
    <AuthContext.Provider value={{ isVerified, userEmail, verifyUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
