"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Activity, Shield, Scan } from "lucide-react"

export function VerificationScreen() {
  const { verifyUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await verifyUser(email, password)
    
    if (!success) {
      setError("Invalid credentials. Please check your email and password.")
    }
    setIsLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage: "url('fondoxray.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",}}>

      {/* logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
          <Scan className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white bg-black/60 px-4 py-1 rounded-lg">DetectIT</h1>          
          <p className="text-sm text-white bg-black/60 px-3 py-1 rounded-lg">X-Ray Analysis Platform</p>        
        </div>
      </div>

      {/* verificacion de medico */}
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Medical Professional Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please verify your credentials to access the X-ray analysis system
          </CardDescription>
        </CardHeader>

        {/* correo y contrasenia del usuario */}
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border"
                />
              </Field>
            </FieldGroup>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* boton de inicio de sesion*/}
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Verify & Access
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* mensaje inferior de log in */}
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p className="bg-black/60 text-white px-4 py-2 rounded-lg">For authorized medical professionals only. All access is logged and monitored for compliance.</p>
      </div>
    </div>
  )
}
