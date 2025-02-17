import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      await signUp(email, password)
      toast.success("Check your email to confirm your account!")
      navigate("/auth/signin")
    } catch (error) {
      toast.error("Failed to create account.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={signInWithGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate("/auth/signin")}>
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 