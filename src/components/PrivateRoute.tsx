import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  console.log("PrivateRoute state:", { user, loading })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
        <p className="text-gray-500">Please wait while we check your authentication.</p>
      </div>
    </div>
  }

  if (!user) {
    console.log("No user, redirecting to signin")
    return <Navigate to="/auth/signin" />
  }

  return <>{children}</>
} 